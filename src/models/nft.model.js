const mongoose = require("mongoose");
const { isAddress } = require("ethers/lib/utils");

const BidSchema = new mongoose.Schema({
  bidder: {
    type: String,
    validate: [isAddress],
  },
  bid: {
    type: Number,
  },
  bidTime: {
    type: Date,
  },
});

const auctionInfoSchema = new mongoose.Schema({
  startAt: {
    type: Date,
    default: 0,
  },
  endAt: {
    type: Date,
    default: 0,
  },
  highestBidder: {
    type: String,
    validate: [isAddress],
    default: "0x0000000000000000000000000000000000000000",
  },
  highestBid: {
    type: Number,
    default: 0,
  },
  highestBidTime: {
    type: Date,
    default: 0,
  },
  startingPrice: {
    type: Number,
  },
  bids: {
    type: [BidSchema],
    default: undefined,
  },
});

const nftSchema = new mongoose.Schema(
  {
    tokenId: {
      type: Number,
      required: "Token id is required",
      unique: true,
    },
    collectionAddress: {
      type: String,
      trim: true,
      required: "Nft contract address is required",
      validate: [isAddress, "Please fill a valid nft contract address"],
    },
    seller: {
      type: String,
      trim: true,
      default: "0x0000000000000000000000000000000000000000",
      required: "Seller address is required",
      validate: [isAddress, "Please fill a valid seller address"],
    },
    owner: {
      type: String,
      trim: true,
      required: "Owner address is required",
      validate: [isAddress, "Please fill a valid owner address"],
    },
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    sold: {
      type: Boolean,
      default: true,
    },
    bidded: {
      type: Boolean,
      default: true,
    },
    isMultiToken: {
      type: Boolean,
      required: true,
    },
    auctionInfo: {
      type: auctionInfoSchema,
    },
  },
  { timestamps: true }
);

exports.NftModel = mongoose.model("Nft", nftSchema);
