const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  kycType: { type: String, enum: ['bvn', 'nin'] },
  kycID: { type: String },
  dob: { type: String },
  isVerified: { type: Boolean, default: false },
  accountNumber: { type: String, default: null },
  accountName: { type: String, default: null },
  balance: { type: Number, default: 0 },
  loginAttempts: { type: Number, default: 0 },
  isLocked: { type: Boolean, default: false },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
}, { timestamps: true });

customerSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Customer', customerSchema);