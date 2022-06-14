require("dotenv").config();

const express = require("express");
const router = express.Router();
const NftModel = require("../models/nft");

router.get("/id/:id", async (req, res) => {
  try {
    const data = await NftModel.findOne({ tokenId: req.params.id });
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/user/:address", async function (req, res) {
  const { pageNumber = 1, pageSize = 10 } = req.query;

  try {
    const data = await NftModel.find({ owner: req.params.address })
      .skip(pageSize * pageNumber - pageSize)
      .limit(pageSize);

    console.log("Get user nft successfully");
    res.status(200).json({
      success: true,
      message: "Get user nft successfully",
      data: data,
    });
  } catch (error) {
    console.log("Get user nft failed");
    console.log("Message: ", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
});

router.get("/user/:address/listing", async function (req, res) {
  const { pageNumber = 1, pageSize = 10 } = req.query;

  try {
    const data = await NftModel.find({ seller: req.params.address })
      .skip(pageSize * pageNumber - pageSize)
      .limit(pageSize);

    console.log("Get user listing nft successfully");
    res.status(200).json({
      success: true,
      message: "Get user listing nft successfully",
      data: data,
    });
  } catch (error) {
    console.log("Get user listing nft failed");
    console.log("Message: ", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
});

router.get("/user/:address/bidding-auction", async function (req, res) {
  const { pageNumber = 1, pageSize = 10 } = req.query;

  try {
    const data = await NftModel.find({
      $and: [
        { sold: true },
        { bidded: false },
        { "auctionInfo.startAt": { $lt: new Date() } },
        { "auctionInfo.endAt": { $gt: new Date() } },
        {
          "auctionInfo.highestBidder": {
            $ne: "0x0000000000000000000000000000000000000000",
          },
        },
        {
          $or: [
            { "auctionInfo.highestBidder": req.params.address },
            { "auctionInfo.bids.bidder": req.params.address },
          ],
        },
      ],
    })
      .skip(pageSize * pageNumber - pageSize)
      .limit(pageSize);

    console.log("Get user bidding nft successfully");
    res.status(200).json({
      success: true,
      message: "Get user bidding nft successfully",
      data: data,
    });
  } catch (error) {
    console.log("Get user bidding nft failed");
    console.log("Message: ", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
});

router.get("/", async function (req, res) {
  const { pageNumber = 1, pageSize = 10 } = req.query;

  const bidded = req.query.bidded === undefined || req.query.bidded === "true";
  const sold = req.query.sold === undefined || req.query.sold === "true";

  try {
    const data = await NftModel.find({
      $and: [{ sold: sold }, { bidded: bidded }],
    })
      .skip(pageSize * pageNumber - pageSize)
      .limit(pageSize);

    console.log("Get listing successfully");
    res.status(200).json({
      success: true,
      message: "Get listing successfully",
      data: data,
    });
  } catch (error) {
    console.log("Get listing failed");
    console.log("Message: ", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
});

router.get("/listing", async function (req, res) {
  const { pageNumber = 1, pageSize = 10 } = req.query;

  try {
    const data = await NftModel.find({
      $or: [{ sold: false }, { bidded: false }],
    })
      .skip(pageSize * pageNumber - pageSize)
      .limit(pageSize);

    console.log("Get listing successfully");
    res.status(200).json({
      success: true,
      message: "Get listing successfully",
      data: data,
    });
  } catch (error) {
    console.log("Get listing failed");
    console.log("Message: ", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
});

router.post("/", (req, res) => {
  const {
    tokenId,
    nftContract,
    owner,
    name,
    description,
    image,
    isMultiToken,
  } = req.body;

  NftModel.create({
    tokenId: tokenId,
    nftContract: nftContract,
    owner: owner,
    isMultiToken: isMultiToken,
    name: name,
    description: description,
    image: image,
  })
    .then((data) => {
      console.log(`Create market item with id ${tokenId} successfully`);
      res.status(201).json({
        success: true,
        message: "Create market item successfully",
        data: data,
      });
    })
    .catch((error) => {
      console.log("Create market item failed");
      console.log("Message: ", error.message);
      res.status(500).json({
        success: false,
        message: "Server error. Please try again.",
        error: error.message,
      });
    });
});

router.patch("/list", function (req, res) {
  const { tokenId, seller, owner, price } = req.body;

  NftModel.findOneAndUpdate(
    { tokenId: tokenId },
    {
      price: price,
      sold: false,
      seller: seller,
      owner: owner,
    },
    { new: true }
  )
    .then((data) => {
      console.log("List market item successfully");
      res.status(200).json({
        success: true,
        message: "List market item successfully",
        data: data,
      });
    })
    .catch((error) => {
      console.log("List market item failed");
      console.log("Message: ", error.message);
      res.status(500).json({
        success: false,
        message: "Server error. Please try again.",
        error: error.message,
      });
    });
});

router.patch("/auction", (req, res) => {
  const { tokenId, seller, owner, startTime, endTime, startingPrice } =
    req.body;

  NftModel.findOneAndUpdate(
    { tokenId: tokenId },
    {
      seller: seller,
      owner: owner,
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
  )
    .then((data) => {
      console.log("Create auction successfully");
      console.log(data);
      res.status(200).json({
        success: true,
        message: "Create auction successfully",
        data: data,
      });
    })
    .catch((error) => {
      console.log("Create auction failed");
      console.log("Message: ", error.message);
      res.status(500).json({
        success: false,
        message: "Server error. Please try again.",
        error: error.message,
      });
    });
});

router.patch("/bid", async function (req, res) {
  const { tokenId, bid, bidder, bidTime } = req.body;

  try {
    const old = await NftModel.findOne({
      tokenId: tokenId,
    });

    const data =
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
    res.status(200).json({
      success: true,
      message: "Place bid successfully",
      data: data,
    });
  } catch (error) {
    console.log("Place bid failed");
    console.log("Message: ", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
});

router.patch("/withdrawBid", async function (req, res) {
  const { tokenId, bidder } = req.body;

  try {
    const data = await NftModel.findOneAndUpdate(
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
    res.status(200).json({
      success: true,
      message: "Withdraw bid successfully",
      data: data,
    });
  } catch (error) {
    console.log("Withdraw bid failed");
    console.log("Message: ", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
});

router.patch("/buy", async function (req, res) {
  const { tokenId, buyer } = req.body;

  try {
    const data = await NftModel.findOneAndUpdate(
      { tokenId: tokenId },
      {
        owner: buyer,
        seller: "0x0000000000000000000000000000000000000000",
        sold: true,
      },
      { new: true }
    );

    console.log("Buy nft successfully");
    res.status(200).json({
      success: true,
      message: "Buy nft successfully",
      data: data,
    });
  } catch (error) {
    console.log("Buy nft failed");
    console.log("Message: ", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
});

router.patch("/cancelList", async function (req, res) {
  const { tokenId, owner } = req.body;

  try {
    const data = await NftModel.findOneAndUpdate(
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
      data: data,
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
});

module.exports = router;
