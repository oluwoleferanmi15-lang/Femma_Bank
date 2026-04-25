const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  reference: { type: String, required: true },
  senderAccount: { type: String, required: true },
  receiverAccount: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'SUCCESS' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);