const express = require('express');
const router = express.Router();
const axios = require('axios');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const protect = require('../middleware/protect');
const { sendDebitEmail, sendCreditEmail } = require('../config/email');

const BASE_URL = process.env.BASE_URL;

const getNibbsToken = async () => {
  const res = await axios.post(`${BASE_URL}/api/auth/token`, {
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET
  });
  return res.data.token;
};

router.post('/', protect, async (req, res) => {
  try {
    const { toAccount, amount } = req.body;

    if (!req.customer.accountNumber) {
      return res.status(400).json({ message: 'You do not have an account' });
    }

    if (req.customer.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    if (req.customer.accountNumber === toAccount) {
      return res.status(400).json({ message: 'Cannot transfer to your own account' });
    }

    const nibbsToken = await getNibbsToken();

    const transferRes = await axios.post(
      `${BASE_URL}/api/transfer`,
      { from: req.customer.accountNumber, to: toAccount, amount },
      { headers: { Authorization: `Bearer ${nibbsToken}` } }
    );

    const { reference, status } = transferRes.data;

    await Customer.findByIdAndUpdate(req.customer._id, { $inc: { balance: -amount } });

    const receiver = await Customer.findOneAndUpdate(
      { accountNumber: toAccount },
      { $inc: { balance: amount } },
      { new: true }
    );

    await Transaction.create({
      reference,
      senderAccount: req.customer.accountNumber,
      receiverAccount: toAccount,
      amount,
      status,
      customerId: req.customer._id
    });

    await sendDebitEmail(req.customer.email, req.customer.accountName, amount, toAccount, reference);

    if (receiver) {
      await sendCreditEmail(receiver.email, receiver.accountName, amount, req.customer.accountNumber, reference);
    }

    res.json({ message: 'Transfer successful', reference, amount, from: req.customer.accountNumber, to: toAccount, status });

  } catch (error) {
    console.log('Transfer error:', error.response?.data || error.message);
    res.status(500).json({ message: error.response?.data?.message || 'Transfer failed' });
  }
});

router.get('/:reference', protect, async (req, res) => {
  try {
    const nibbsToken = await getNibbsToken();
    const response = await axios.get(
      `${BASE_URL}/api/transaction/${req.params.reference}`,
      { headers: { Authorization: `Bearer ${nibbsToken}` } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch transaction' });
  }
});

module.exports = router;