const express = require('express');
const router = express.Router();
const axios = require('axios');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const protect = require('../middleware/protect');

const BASE_URL = process.env.BASE_URL;

// Get NibssByPhoenix token
const getNibbsToken = async () => {
  const res = await axios.post(`${BASE_URL}/api/auth/token`, {
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET
  });
  return res.data.token;
};

// @route  GET /api/account/balance
// @desc   Get logged in customer's balance
// @access Private
router.get('/balance', protect, async (req, res) => {
  try {
    const nibbsToken = await getNibbsToken();
    const response = await axios.get(
      `${BASE_URL}/api/account/balance/${req.customer.accountNumber}`,
      { headers: { Authorization: `Bearer ${nibbsToken}` } }
    );

    res.json({
      accountName: response.data.accountName,
      accountNumber: response.data.accountNumber,
      balance: response.data.balance
    });

  } catch (error) {
    res.status(500).json({ message: 'Could not fetch balance' });
  }
});

// @route  GET /api/account/name-enquiry/:accountNumber
// @desc   Get account name by account number
// @access Private
router.get('/name-enquiry/:accountNumber', protect, async (req, res) => {
  try {
    const nibbsToken = await getNibbsToken();
    const response = await axios.get(
      `${BASE_URL}/api/account/name-enquiry/${req.params.accountNumber}`,
      { headers: { Authorization: `Bearer ${nibbsToken}` } }
    );

    res.json(response.data);

  } catch (error) {
    res.status(500).json({ message: 'Name enquiry failed' });
  }
});


router.get('/transactions', protect, async (req, res) => {
  try {
   
    const transactions = await Transaction.find({
      customerId: req.customer._id
    }).sort({ createdAt: -1 });

    res.json({
      count: transactions.length,
      transactions
    });

  } catch (error) {
    res.status(500).json({ message: 'Could not fetch transactions' });
  }
});

module.exports = router;