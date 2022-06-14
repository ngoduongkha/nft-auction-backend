const mongoose = require("mongoose");
const { isEmail } = require("validator");
const { isAddress } = require("ethers/lib/utils");

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    trim: true,
    unique: true,
    required: "Collection address is required",
    validate: [isAddress, "Please fill a valid collection address"],
  },
  isMultiToken: {
    type: Boolean,
    required: true,
  },
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
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
    validate: [isEmail, "Please fill a valid email address"],
    default: "example@gmail.com",
  },
  wallet: {
    type: String,
    trim: true,
    unique: true,
    required: "Wallet address is required",
    validate: [isAddress, "Please fill a valid wallet address"],
  },
  image: {
    type: String,
    trim: true,
  },
  banner: {
    type: String,
    trim: true,
  },
  refreshToken: {
    type: String,
  },
  collections: {
    type: [collectionSchema],
    default: undefined,
  },
});

module.exports = mongoose.model("User", userSchema);
