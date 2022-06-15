const { NftModel } = require("../models/nft.model");
const MARKET_CONTRACT_ADDRESS = process.env.MARKET_CONTRACT_ADDRESS;

exports.getNft = async function (req, res) {
  try {
    const nft = await NftModel.findOne({ tokenId: req.params.id });

    return res.status(200).json({
      success: true,
      message: "Get user nft successfully",
      data: nft,
    });
  } catch (error) {
    console.log("Get user nft failed");
    console.log("Message: ", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

exports.listNft = async function (req, res) {
  const { tokenId, price } = req.body;
  const seller = req.user.wallet;

  try {
    const nft = await NftModel.findOneAndUpdate(
      { tokenId: tokenId },
      {
        price: price,
        sold: false,
        seller: seller,
        owner: MARKET_CONTRACT_ADDRESS,
      },
      { new: true }
    );

    console.log("List nft successfully");

    return res.status(200).json({
      success: true,
      message: "List nft successfully",
      data: nft,
    });
  } catch (error) {
    console.log("List nft failed");
    console.log("Message: ", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

exports.createAuction = async function (req, res) {
  const { tokenId, startTime, endTime, startingPrice } = req.body;
  const seller = req.user.wallet;

  try {
    const nft = await NftModel.findOneAndUpdate(
      { tokenId: tokenId },
      {
        seller: seller,
        owner: MARKET_CONTRACT_ADDRESS,
        bidded: false,
        $set: {
          "auctionInfo.startAt": startTime,
          "auctionInfo.startAt": startTime,
          "auctionInfo.endAt": endTime,
          "auctionInfo.startingPrice": startingPrice,
          "auctionInfo.bids": [],
        },
      },
      { new: true }
    );

    console.log("Create auction successfully");

    return res.status(200).json({
      success: true,
      message: "Create auction successfully",
      data: data,
    });
  } catch (error) {
    console.log("Create auction failed");
    console.log("Message: ", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

exports.placeBid = async function (req, res) {
  const { tokenId, bid, bidTime } = req.body;
  const bidder = req.user.wallet;

  try {
    const old = await NftModel.findOne({
      tokenId: tokenId,
    });

    const nft =
      old.auctionInfo.highestBidder ===
      "0x0000000000000000000000000000000000000000"
        ? await NftModel.findOneAndUpdate(
            { tokenId: tokenId },
            {
              "auctionInfo.highestBid": bid,
              "auctionInfo.highestBidder": bidder,
              "auctionInfo.highestBidTime": bidTime,
            },
            { new: true }
          )
        : await NftModel.findOneAndUpdate(
            { tokenId: tokenId },
            {
              "auctionInfo.highestBid": bid,
              "auctionInfo.highestBidder": bidder,
              "auctionInfo.highestBidTime": bidTime,
              $push: {
                "auctionInfo.bids": {
                  bidder: old.auctionInfo.highestBidder,
                  bid: old.auctionInfo.highestBid,
                  bidTime: old.auctionInfo.highestBidTime,
                },
              },
            },
            { new: true }
          );

    console.log("Place bid successfully");

    return res.status(200).json({
      success: true,
      message: "Place bid successfully",
      data: nft,
    });
  } catch (error) {
    console.log("Place bid failed");
    console.log("Message: ", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

exports.withdrawBid = async function (req, res) {
  const { tokenId } = req.body;
  const bidder = req.user.wallet;

  try {
    const nft = await NftModel.findOneAndUpdate(
      {
        tokenId: tokenId,
      },
      {
        $pull: {
          "auctionInfo.bids": { bidder: bidder },
        },
      },
      { new: true }
    );
    console.log("Withdraw bid successfully");

    return res.status(200).json({
      success: true,
      message: "Withdraw bid successfully",
      data: nft,
    });
  } catch (error) {
    console.log("Withdraw bid failed");
    console.log("Message: ", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

exports.buyNft = async function (req, res) {
  const { tokenId } = req.body;
  const buyer = req.user.wallet;

  try {
    const nft = await NftModel.findOneAndUpdate(
      { tokenId: tokenId },
      {
        owner: buyer,
        seller: "0x0000000000000000000000000000000000000000",
        sold: true,
      },
      { new: true }
    );

    console.log("Buy nft successfully");

    return res.status(200).json({
      success: true,
      message: "Buy nft successfully",
      data: nft,
    });
  } catch (error) {
    console.log("Buy nft failed");
    console.log("Message: ", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

exports.cancelListing = async function (req, res) {
  const { tokenId } = req.body;
  const owner = req.user.wallet;

  try {
    const nft = await NftModel.findOneAndUpdate(
      { tokenId: tokenId },
      {
        bidded: true,
        sold: true,
        owner: owner,
        seller: "0x0000000000000000000000000000000000000000",
      }
    );

    console.log("Cancel listing successfully");
    res.status(200).json({
      success: true,
      message: "Cancel listing successfully",
      data: nft,
    });
  } catch (error) {
    console.log("Cancel listing failed");
    console.log("Message: ", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};
