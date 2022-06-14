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
    default: "Anonymous",
  },
  bio: {
    type: String,
    trim: true,
    default: "Your bio",
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
    default:
      "https://lh3.googleusercontent.com/TALoOqK5sH2mpwGmo_7MvL_TlK4uFDFDoGcdhpWx7x4ETcaSxBCSoYhNFJN-xk5LeUmB-EOsimQ7J4aNi-aVaoBv7E5rPMW5BpD8=w343",
  },
  banner: {
    type: String,
    trim: true,
    default:
      "https://lh3.googleusercontent.com/2v_bGfNzHAhfiDUpK_l7svabJSzbGRGDso72zDGI6Dt8973rXPmaNEUhC8_rc6y-pqW5-x8hqvGMmyE6Kerw0POTafWQsACkLftY7w=h600",
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
