const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const Customer = require('../models/Customer');

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

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, kycType, kycID, dob } = req.body;

    
    const existing = await Customer.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Customer already exists' });
    }

    
    const nibbsToken = await getNibbsToken();
    const headers = { Authorization: `Bearer ${nibbsToken}` };

   
    try {
      if (kycType === 'bvn') {
        await axios.post(`${BASE_URL}/api/insertBvn`, {
          bvn: kycID, firstName, lastName, dob, phone
        }, { headers });
      } else if (kycType === 'nin') {
        await axios.post(`${BASE_URL}/api/insertNin`, {
          nin: kycID, firstName, lastName, dob, phone
        }, { headers });
      }
    } catch (insertError) {
      console.log('Insert note:', insertError.response?.data?.message);
    }

   
    let validateRes;
    if (kycType === 'bvn') {
      validateRes = await axios.post(`${BASE_URL}/api/validateBvn`, {
        bvn: kycID
      }, { headers });
    } else {
      validateRes = await axios.post(`${BASE_URL}/api/validateNin`, {
        nin: kycID
      }, { headers });
    }

    if (!validateRes.data.success) {
      return res.status(400).json({ message: 'KYC validation failed' });
    }

    
    const accountRes = await axios.post(`${BASE_URL}/api/account/create`, {
      kycType,
      kycID,
      dob
    }, { headers });

    const { accountNumber, accountName, balance } = accountRes.data.account;

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    
    const customer = await Customer.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      kycType,
      kycID,
      dob,
      isVerified: true,
      accountNumber,
      accountName,
      balance
    });

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


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

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

module.exports = router;