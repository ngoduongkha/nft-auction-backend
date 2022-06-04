const mongoose = require('mongoose');
const { isEmail } = require('validator');
const { isAddress } = require('ethers/lib/utils');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: 'Username address is required',
    trim: true,
    lowercase: true,
  },
  bio: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: 'Email address is required',
    validate: [isEmail, 'Please fill a valid email address'],
  },
  wallet: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: 'Wallet address is required',
    validate: [isAddress, 'Please fill a valid wallet address'],
  },
  image: {
    type: String,
    trim: true,
    required: true,
  },
  banner: {
    type: String,
    trim: true,
    required: true,
  },
});

module.exports = mongoose.model('UserModel', userSchema);
