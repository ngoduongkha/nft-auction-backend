const { CollectionModel } = require("../models/collection.model");

exports.getCollections = async function (req, res) {
  try {
    const data = await CollectionModel.find();

    return res.status(200).json({
      success: true,
      message: "Get list collection successfully",
      data: data,
    });
  } catch (error) {
    console.log("Get list collection failed");
    console.log("Message: ", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

exports.createCollection = async function (req, res) {
  const { name, address, isMultiToken } = req.body;
  const owner = req.user.wallet;

  try {
    const data = await CollectionModel.create({
      owner: owner,
      name: name,
      address: address,
      isMultiToken: isMultiToken,
    });

    res.status(201).json({
      success: true,
      message: "New collection added successfully",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};
