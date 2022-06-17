const { NftModel } = require("../models/nft.model");
const MARKET_CONTRACT_ADDRESS = process.env.MARKET_CONTRACT_ADDRESS;

exports.getNft = async function (req, res) {
  try {
    const nft = await NftModel.findOne({ tokenId: req.params.id });

    return res.status(200).json({
      success: true,
      message: "Get nft successfully",
      data: nft,
    });
  } catch (error) {
    console.log("Get nft failed");
    console.log("Message: ", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

exports.getNfts = async function (req, res) {
  const pageNumber = parseInt(req.query.pageNumber) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const bidded = req.query.bidded === "true" || false;
  const sold = req.query.sold === "true" || false;
  const sortBy = req.query.sortBy || "tokenId";
  const sortDirection = req.query.sortDirection || "ASC";
  const name = req.query.name;

  try {
    const query = {
      $and: [
        { name: { $regex: new RegExp(name, "i") } },
        sold === false && bidded === false
          ? { $or: [{ sold: sold }, { bidded: bidded }] }
          : { $and: [{ sold: sold }, { bidded: bidded }] },
      ],
    };
    const sort = sortDirection === "ASC" ? `${sortBy}` : `-${sortBy}`;
    const total = await NftModel.find(query).count();
    const nfts = await NftModel.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "collections",
          localField: "collectionAddress",
          foreignField: "address",
          as: "collectionName",
        },
      },
      {
        $set: {
          collectionName: { $arrayElemAt: ["$collectionName.name", 0] },
        },
      },
    ])
      .sort(sort)
      .skip(pageSize * pageNumber - pageSize)
      .limit(pageSize);

    return res.status(200).json({
      success: true,
      message: "Get listing successfully",
      data: nfts,
      pagination: {
        total: total,
        currentPage: pageNumber,
        pageSize: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.log("Get listing failed");
    console.log("Message: ", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

exports.getListingNfts = async function (req, res) {
  const pageNumber = parseInt(req.query.pageNumber) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  try {
    const query = {
      $or: [{ sold: false }, { bidded: false }],
    };
    const total = await NftModel.find(query).count();
    const nfts = await NftModel.find(query)
      .skip(pageSize * pageNumber - pageSize)
      .limit(pageSize);

    return res.status(200).json({
      success: true,
      message: "Get listing successfully",
      data: nfts,
      pagination: {
        total: total,
        currentPage: pageNumber,
        pageSize: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.log("Get listing failed");
    console.log("Message: ", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

exports.createNft = async function (req, res) {
  const { tokenId, nftContract, name, description, image, isMultiToken } =
    req.body;
  const owner = req.user.wallet;

  try {
    const nft = await NftModel.create({
      tokenId: tokenId,
      collectionAddress: nftContract,
      owner: owner,
      isMultiToken: isMultiToken,
      name: name,
      description: description,
      image: image,
    });

    return res.status(201).json({
      success: true,
      message: "Create market item successfully",
      data: nft,
    });
  } catch (error) {
    console.log("Create nft failed");
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
        price: startingPrice,
        $set: {
          "auctionInfo.startAt": startTime,
          "auctionInfo.endAt": endTime,
          "auctionInfo.startingPrice": startingPrice,
          "auctionInfo.bids": [],
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Create auction successfully",
      data: nft,
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
              price: bid,
              "auctionInfo.highestBid": bid,
              "auctionInfo.highestBidder": bidder,
              "auctionInfo.highestBidTime": bidTime,
            },
            { new: true }
          )
        : await NftModel.findOneAndUpdate(
            { tokenId: tokenId },
            {
              price: bid,
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

    return res.status(200).json({
      success: true,
      message: "Cancel listing successfully",
      data: nft,
    });
  } catch (error) {
    console.log("Cancel listing failed");
    console.log("Message: ", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

exports.endAuction = async function (tokenId) {
  try {
    const old = await NftModel.findOne({
      tokenId: tokenId,
    });

    if (
      old.auctionInfo.highestBidder ===
      "0x0000000000000000000000000000000000000000"
    ) {
      await NftModel.findOneAndUpdate(
        { tokenId: tokenId },
        {
          owner: old.seller,
          seller: "0x0000000000000000000000000000000000000000",
          bidded: true,
        },
        { new: true }
      );
    } else {
      await NftModel.findOneAndUpdate(
        { tokenId: tokenId },
        {
          owner: old.auctionInfo.highestBidder,
          seller: "0x0000000000000000000000000000000000000000",
          bidded: true,
        },
        { new: true }
      );
    }

    console.log(`End auction with tokenId (${tokenId}) successfully`);
  } catch (error) {
    console.log(`End auction with tokenId (${tokenId}) failed`);
    console.log("Message: ", error.message);
  }
};
