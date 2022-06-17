const { CollectionModel } = require("../models/collection.model");
const { NftModel } = require("../models/nft.model");
const { UserModel } = require("../models/user.model");

exports.getUser = async function (req, res) {
  const wallet = req.params.wallet;

  try {
    const user = await UserModel.findOne({ wallet: wallet });

    return res.status(200).json({
      success: true,
      message: "Get user successfully",
      data: user,
    });
  } catch (error) {
    console.log("Get user failed");
    console.log("Message: ", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

exports.updateUser = async function (req, res) {
  const { username, bio, email, image, banner } = req.body;
  const wallet = req.user.wallet;

  try {
    const user = await UserModel.findOneAndUpdate(
      {
        wallet: wallet,
      },
      {
        username: username,
        bio: bio,
        email: email,
        image: image,
        banner: banner,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Update user successfully",
      data: user,
    });
  } catch (error) {
    console.log("Update user failed");
    console.log("Message: ", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

exports.getCollections = async function (req, res) {
  const pageNumber = parseInt(req.query.pageNumber) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const wallet = req.params.wallet;

  try {
    const query = { owner: wallet };

    const total = await CollectionModel.find(query).count();
    const collections = await CollectionModel.find(query)
      .skip(pageSize * pageNumber - pageSize)
      .limit(pageSize);

    return res.status(200).json({
      success: true,
      message: "Get user collections successfully",
      data: collections,
      pagination: {
        total: total,
        currentPage: pageNumber,
        pageSize: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.log("Get user collections failed");
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
  const wallet = req.params.wallet;

  try {
    const query = { owner: wallet };
    const total = await NftModel.find(query).count();
    const nfts = await NftModel.find(query)
      .skip(pageSize * pageNumber - pageSize)
      .limit(pageSize);

    return res.status(200).json({
      success: true,
      message: "Get user nfts successfully",
      data: nfts,
      pagination: {
        total: total,
        currentPage: pageNumber,
        pageSize: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.log("Get user nfts failed");
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
  const wallet = req.params.wallet;

  try {
    const query = { seller: wallet };
    const total = await NftModel.find(query).count();
    const nfts = await NftModel.find(query)
      .skip(pageSize * pageNumber - pageSize)
      .limit(pageSize);

    return res.status(200).json({
      success: true,
      message: "Get user listing nfts successfully",
      data: nfts,
      pagination: {
        total: total,
        currentPage: pageNumber,
        pageSize: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.log("Get user listing nfts failed");
    console.log("Message: ", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

exports.getBiddingNfts = async function (req, res) {
  const pageNumber = parseInt(req.query.pageNumber) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const wallet = req.params.wallet;

  try {
    const query = {
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
            { "auctionInfo.highestBidder": wallet },
            { "auctionInfo.bids.bidder": wallet },
          ],
        },
      ],
    };
    const total = await NftModel.find(query).count();
    const nfts = await NftModel.find(query)
      .skip(pageSize * pageNumber - pageSize)
      .limit(pageSize);

    return res.status(200).json({
      success: true,
      message: "Get user bidding nft successfully",
      data: nfts,
      pagination: {
        total: total,
        currentPage: pageNumber,
        pageSize: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.log("Get user bidding nfts failed");
    console.log("Message: ", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};
