const { CollectionModel } = require("../models/collection.model");
const { NftModel } = require("../models/nft.model");

exports.getCollections = async function (req, res) {
  const pageNumber = parseInt(req.query.pageNumber) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  try {
    const total = await CollectionModel.find().count();
    const collections = await CollectionModel.find()
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
  const { name, address, image, banner, isMultiToken } = req.body;
  const owner = req.user.wallet;

  try {
    const collection = await CollectionModel.create({
      owner: owner,
      name: name,
      address: address,
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
