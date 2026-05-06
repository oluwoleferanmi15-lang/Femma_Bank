const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const Customer = require('../models/Customer');
const {
  sendWelcomeEmail,
  sendOTPEmail,
  sendForgotPasswordEmail
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

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Calculate age
const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// @route  POST /api/auth/send-otp
// @desc   Send OTP to email before registration
router.post('/send-otp', async (req, res) => {
  try {
    const { email, firstName } = req.body;

    // Check if email already exists
    const existing = await Customer.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP temporarily — create a temp record or update if exists
    await Customer.findOneAndUpdate(
      { email },
      { email, otp, otpExpiry, firstName },
      { upsert: true, new: true }
    );

    // Send OTP email
    await sendOTPEmail(email, firstName, otp);

    res.json({ message: 'OTP sent to your email' });

  } catch (error) {
    console.log('Send OTP error:', error.message);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// @route  POST /api/auth/verify-otp
// @desc   Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ message: 'Email not found' });
    }

    if (customer.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > customer.otpExpiry) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Clear OTP
    await Customer.findOneAndUpdate({ email }, { otp: null, otpExpiry: null });

    res.json({ message: 'OTP verified successfully' });

  } catch (error) {
    console.log('Verify OTP error:', error.message);
    res.status(500).json({ message: 'OTP verification failed' });
  }
});

// @route  POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, kycType, kycID, dob } = req.body;

    // Validate age — must be 18+
    const age = calculateAge(dob);
    if (age < 18) {
      return res.status(400).json({ message: 'You must be at least 18 years old to open an account' });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters with letters, numbers and special characters'
      });
    }

    // Validate BVN/NIN length
    if (kycID.length !== 11) {
      return res.status(400).json({ message: `${kycType.toUpperCase()} must be exactly 11 digits` });
    }

    // Validate phone number
    if (phone.length !== 10) {
      return res.status(400).json({ message: 'Phone number must be 10 digits after +234' });
    }

    // Check if customer already exists
    const existing = await Customer.findOne({ email, accountNumber: { $ne: null } });
    if (existing) {
      return res.status(400).json({ message: 'Customer already exists' });
    }

    const nibbsToken = await getNibbsToken();
    const headers = { Authorization: `Bearer ${nibbsToken}` };
    const fullPhone = `0${phone}`;

    // Insert BVN or NIN
    try {
      if (kycType === 'bvn') {
        await axios.post(`${BASE_URL}/api/insertBvn`, {
          bvn: kycID, firstName, lastName, dob, phone: fullPhone
        }, { headers });
      } else if (kycType === 'nin') {
        await axios.post(`${BASE_URL}/api/insertNin`, {
          nin: kycID, firstName, lastName, dob, phone: fullPhone
        }, { headers });
      }
    } catch (insertError) {
      console.log('Insert note:', insertError.response?.data?.message);
    }

    // Validate BVN or NIN
    let validateRes;
    if (kycType === 'bvn') {
      validateRes = await axios.post(`${BASE_URL}/api/validateBvn`, { bvn: kycID }, { headers });
    } else {
      validateRes = await axios.post(`${BASE_URL}/api/validateNin`, { nin: kycID }, { headers });
    }

    if (!validateRes.data.success) {
      return res.status(400).json({ message: 'KYC validation failed' });
    }

    // Create account on NibssByPhoenix
    const accountRes = await axios.post(`${BASE_URL}/api/account/create`, {
      kycType, kycID, dob
    }, { headers });

    const { accountNumber, accountName, balance } = accountRes.data.account;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save customer to MongoDB
    const customer = await Customer.findOneAndUpdate(
      { email },
      {
        firstName, lastName, email,
        password: hashedPassword,
        phone: fullPhone, kycType, kycID, dob,
        isVerified: true,
        accountNumber, accountName, balance,
        loginAttempts: 0,
        isLocked: false
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

// @route  POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer || !customer.accountNumber) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (customer.isLocked) {
      return res.status(400).json({
        message: 'Account locked. Please reset your password.',
        isLocked: true
      });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      // Increment login attempts
      const attempts = customer.loginAttempts + 1;
      const isLocked = attempts >= 3;

      await Customer.findByIdAndUpdate(customer._id, {
        loginAttempts: attempts,
        isLocked
      });

      return res.status(400).json({
        message: 'Invalid credentials',
        attemptsLeft: 3 - attempts,
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

// @route  POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ message: 'Email not found' });
    }

    // Generate new password
    const newPassword = Math.random().toString(36).slice(-8) + '!1A';

    // Hash and save
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await Customer.findByIdAndUpdate(customer._id, {
      password: hashedPassword,
      loginAttempts: 0,
      isLocked: false
    });

    // Send email
    await sendForgotPasswordEmail(email, customer.accountName, newPassword);

    res.json({ message: 'New password sent to your email' });

  } catch (error) {
    console.log('Forgot password error:', error.message);
    res.status(500).json({ message: 'Password reset failed' });
  }
});

module.exports = router;