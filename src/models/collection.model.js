const mongoose = require("mongoose");
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
  description: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    required: true,
  },
  banner: {
    type: String,
  },
  isMultiToken: {
    type: Boolean,
    required: true,
  },
  owner: {
    type: String,
    trim: true,
    required: "Owner address is required",
    validate: [isAddress, "Please fill a valid owner address"],
  },
});

exports.CollectionModel = mongoose.model("Collection", collectionSchema);
