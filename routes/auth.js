const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const Customer = require('../models/Customer');
const {
  sendWelcomeEmail,
  sendOTPEmail,
  sendPasswordResetEmail
} = require('../config/email');

const BASE_URL = process.env.BASE_URL;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

const getNibbsToken = async () => {
  const res = await axios.post(`${BASE_URL}/api/auth/token`, {
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET
  });
  return res.data.token;
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

// Format any date to YYYY-MM-DD
const formatDob = (dob) => {
  const date = new Date(dob);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @route POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { email, firstName } = req.body;

    const existing = await Customer.findOne({ email });

    if (existing) {
      if (existing.isRegistered) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Check if blocked
      if (existing.otpBlockedUntil && new Date() < existing.otpBlockedUntil) {
        const hoursLeft = Math.ceil((existing.otpBlockedUntil - new Date()) / (1000 * 60 * 60));
        return res.status(400).json({
          message: `Too many OTP requests. Try again in ${hoursLeft} hour(s).`,
          isBlocked: true
        });
      }

      // Check resend count
      if (existing.otpResendCount >= 3) {
        const blockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await Customer.findOneAndUpdate({ email }, {
          otpBlockedUntil: blockedUntil,
          otpResendCount: 0
        });
        return res.status(400).json({
          message: 'Maximum OTP requests reached. Try again in 24 hours.',
          isBlocked: true
        });
      }
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await Customer.findOneAndUpdate(
      { email },
      {
        email,
        firstName: firstName || existing?.firstName,
        otp,
        otpExpiry,
        $inc: { otpResendCount: 1 }
      },
      { upsert: true, new: true }
    );

    await sendOTPEmail(email, firstName || existing?.firstName || 'User', otp);

    res.json({ message: 'OTP sent to your email' });

  } catch (error) {
    console.log('Send OTP error:', error.message);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// @route POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(400).json({ message: 'Email not found' });
    if (customer.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > customer.otpExpiry) return res.status(400).json({ message: 'OTP has expired' });

    await Customer.findOneAndUpdate({ email }, {
      otp: null,
      otpExpiry: null,
      otpResendCount: 0,
      otpBlockedUntil: null
    });

    res.json({ message: 'OTP verified successfully' });

  } catch (error) {
    console.log('Verify OTP error:', error.message);
    res.status(500).json({ message: 'OTP verification failed' });
  }
});

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, kycType, kycID, dob } = req.body;

    // Format dob properly to YYYY-MM-DD
    const formattedDob = formatDob(dob);
    console.log('Formatted DOB:', formattedDob);

    // Age check
    if (calculateAge(formattedDob) < 18) {
      return res.status(400).json({ 
        message: 'You must be at least 18 years old to open an account' 
      });
    }

    // Password strength
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters with letters, numbers and special characters' 
      });
    }

    // KYC length
    if (kycID.length !== 11) {
      return res.status(400).json({ 
        message: `${kycType.toUpperCase()} must be exactly 11 digits` 
      });
    }

    // Phone length
    if (phone.length !== 10) {
      return res.status(400).json({ 
        message: 'Phone number must be 10 digits after +234' 
      });
    }

    // Check already registered
    const existing = await Customer.findOne({ email, isRegistered: true });
    if (existing) {
      return res.status(400).json({ message: 'Customer already exists' });
    }

    // Get NibssByPhoenix token
    const nibbsToken = await getNibbsToken();
    const headers = { Authorization: `Bearer ${nibbsToken}` };
    const fullPhone = `0${phone}`;

    // Step 1 — Insert BVN or NIN automatically using customer details
    // This registers the BVN/NIN in NibssByPhoenix system
    try {
      if (kycType === 'bvn') {
        await axios.post(`${BASE_URL}/api/insertBvn`, {
          bvn: kycID,
          firstName,
          lastName,
          dob: formattedDob,
          phone: fullPhone
        }, { headers });
        console.log('✅ BVN inserted successfully');
      } else {
        await axios.post(`${BASE_URL}/api/insertNin`, {
          nin: kycID,
          firstName,
          lastName,
          dob: formattedDob,
          phone: fullPhone
        }, { headers });
        console.log('✅ NIN inserted successfully');
      }
    } catch (insertError) {
      // BVN/NIN might already exist in the system — that is fine, we continue
      console.log('Insert note:', insertError.response?.data?.message);
    }

    // Step 2 — Validate the BVN or NIN
    let validateRes;
    try {
      if (kycType === 'bvn') {
        validateRes = await axios.post(`${BASE_URL}/api/validateBvn`, {
          bvn: kycID
        }, { headers });
      } else {
        validateRes = await axios.post(`${BASE_URL}/api/validateNin`, {
          nin: kycID
        }, { headers });
      }
      console.log('✅ KYC validated');
    } catch (validateError) {
      console.log('Validate error:', validateError.response?.data);
      return res.status(400).json({ 
        message: `${kycType.toUpperCase()} validation failed. Please check your details.` 
      });
    }

    if (!validateRes.data.success) {
      return res.status(400).json({ message: 'KYC validation failed' });
    }

    // Get the actual dob stored by NibssByPhoenix after validation
    const storedDob = validateRes.data.data?.dob
      ? formatDob(validateRes.data.data.dob)
      : formattedDob;

    console.log('Stored DOB from NibssByPhoenix:', storedDob);

    // Step 3 — Create bank account using the stored dob
    let accountRes;
    try {
      accountRes = await axios.post(`${BASE_URL}/api/account/create`, {
        kycType,
        kycID,
        dob: storedDob
      }, { headers });
      console.log('✅ Account created');
    } catch (accountError) {
      console.log('Account create error:', accountError.response?.data);
      return res.status(400).json({
        message: accountError.response?.data?.message || 'Account creation failed'
      });
    }

    const { accountNumber, accountName, balance } = accountRes.data.account;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save customer to MongoDB
    const customer = await Customer.findOneAndUpdate(
      { email },
      {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone: fullPhone,
        kycType,
        kycID,
        dob: storedDob,
        isVerified: true,
        isRegistered: true,
        accountNumber,
        accountName,
        balance,
        loginAttempts: 0,
        isLocked: false,
        otp: null,
        otpExpiry: null
      },
      { upsert: true, new: true }
    );

    // Send welcome email
    await sendWelcomeEmail(email, accountName, accountNumber);

    res.status(201).json({
      message: 'Customer registered successfully',
      token: generateToken(customer._id),
      customer: {
        name: accountName,
        email: customer.email,
        accountNumber,
        balance
      }
    });

  } catch (error) {
    console.log('Register error:', error.response?.data || error.message);
    res.status(500).json({
      message: error.response?.data?.message || error.message || 'Registration failed'
    });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email, isRegistered: true });
    if (!customer) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (customer.isLocked) {
      return res.status(400).json({
        message: 'Account locked. Please reset your password.',
        isLocked: true
      });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      const attempts = customer.loginAttempts + 1;
      const isLocked = attempts >= 3;

      await Customer.findByIdAndUpdate(customer._id, {
        loginAttempts: attempts,
        isLocked
      });

      return res.status(400).json({
        message: 'Invalid credentials',
        attemptsLeft: Math.max(0, 3 - attempts),
        isLocked
      });
    }

    // Reset login attempts on success
    await Customer.findByIdAndUpdate(customer._id, {
      loginAttempts: 0,
      isLocked: false
    });

    res.json({
      message: 'Login successful',
      token: generateToken(customer._id),
      customer: {
        name: customer.accountName,
        email: customer.email,
        accountNumber: customer.accountNumber,
        balance: customer.balance
      }
    });

  } catch (error) {
    console.log('Login error:', error.message);
    res.status(500).json({ message: 'Login failed' });
  }
});

// @route POST /api/auth/send-reset-otp
router.post('/send-reset-otp', async (req, res) => {
  try {
    const { email } = req.body;

    const customer = await Customer.findOne({ email, isRegistered: true });
    if (!customer) {
      return res.status(400).json({ message: 'Email not found' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await Customer.findByIdAndUpdate(customer._id, { otp, otpExpiry });

    await sendPasswordResetEmail(
      email,
      customer.accountName || customer.firstName,
      otp
    );

    res.json({ message: 'Reset OTP sent to your email' });

  } catch (error) {
    console.log('Send reset OTP error:', error.message);
    res.status(500).json({ message: 'Failed to send reset OTP' });
  }
});

// @route POST /api/auth/verify-reset-otp
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const customer = await Customer.findOne({ email, isRegistered: true });
    if (!customer) return res.status(400).json({ message: 'Email not found' });
    if (customer.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > customer.otpExpiry) return res.status(400).json({ message: 'OTP has expired' });

    res.json({ message: 'OTP verified' });

  } catch (error) {
    res.status(500).json({ message: 'OTP verification failed' });
  }
});

// @route POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters with letters, numbers and special characters' 
      });
    }

    const customer = await Customer.findOne({ email, isRegistered: true });
    if (!customer) return res.status(400).json({ message: 'Email not found' });
    if (customer.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > customer.otpExpiry) return res.status(400).json({ message: 'OTP has expired' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await Customer.findByIdAndUpdate(customer._id, {
      password: hashedPassword,
      loginAttempts: 0,
      isLocked: false,
      otp: null,
      otpExpiry: null
    });

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.log('Reset password error:', error.message);
    res.status(500).json({ message: 'Password reset failed' });
  }
});

module.exports = router;
