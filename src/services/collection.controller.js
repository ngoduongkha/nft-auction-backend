const { CollectionModel } = require("../models/collection.model");
const { NftModel } = require("../models/nft.model");

exports.getCollection = async function (req, res) {
  try {
    const collection = await CollectionModel.aggregate([
      {
        $match: { address: req.params.collectionAddress },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "wallet",
          as: "ownerName",
        },
      },
      {
        $set: {
          ownerName: { $arrayElemAt: ["$ownerName.username", 0] },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Get collection successfully",
      data: collection[0] ?? null,
    });
  } catch (error) {
    console.log("Get collection failed");
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

  try {
    const total = await CollectionModel.find().count();
    const collections = await CollectionModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "wallet",
          as: "ownerName",
        },
      },
      {
        $set: {
          ownerName: { $arrayElemAt: ["$ownerName.username", 0] },
        },
      },
    ])
      .skip(pageSize * pageNumber - pageSize)
      .limit(pageSize);

    return res.status(200).json({
      success: true,
      message: "Get list collection successfully",
      data: collections,
      pagination: {
        total: total,
        currentPage: pageNumber,
        pageSize: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.log("Get list collection failed");
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
  const collectionAddress = req.params.collectionAddress;

  try {
    const query = { collectionAddress: collectionAddress };
    const total = await NftModel.find(query).count();

    const nfts = await NftModel.find(query)
      .skip(pageSize * pageNumber - pageSize)
      .limit(pageSize);

    return res.status(200).json({
      success: true,
      message: "Get list nft by collection successfully",
      data: nfts,
      pagination: {
        total: total,
        currentPage: pageNumber,
        pageSize: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.log("Get list nft by collection failed");
    console.log("Message: ", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

exports.createCollection = async function (req, res) {
  const { name, address, image, description, banner, isMultiToken } = req.body;
  const owner = req.user.wallet;

  try {
    const collection = await CollectionModel.create({
      owner: owner,
      name: name,
      address: address,
      description: description,
      image: image,
      banner: banner,
      isMultiToken: isMultiToken,
    });

    return res.status(201).json({
      success: true,
      message: "Create collection successfully",
      data: collection,
    });
  } catch (error) {
    console.log("Create collection failed");
    console.log("Message: ", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

exports.updateCollection = async function (req, res) {
  const { name, image, description, banner } = req.body;
  const address = req.params.collectionAddress;
  const owner = req.user.wallet;

  try {
    const collection = await CollectionModel.findOneAndUpdate(
      { address: address, owner: owner },
      {
        name: name,
        description: description,
        image: image,
        banner: banner,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Update collection successfully",
      data: collection,
    });
  } catch (error) {
    console.log("Update collection failed");
    console.log("Message: ", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};
