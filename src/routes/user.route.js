const express = require("express");
const router = express.Router();
const UserModel = require("../models/user.model");
const { isAuth } = require("../services/auth/auth.middleware");

router.get("/wallet/:wallet", async function (req, res) {
  return UserModel.findOne({ wallet: req.params.wallet })
    .then((data) => res.status(200).json(data))
    .catch((error) =>
      res.status(500).json({
        success: false,
        message: "Server error. Please try again.",
        error: error.message,
      })
    );
});

router.patch("/", isAuth, async function (req, res) {
  const { username, bio, email, wallet, image, banner } = req.body;

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

    res.status(201).json({
      success: true,
      message: "New user created successfully",
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
});

router.patch("/collection", isAuth, async function (req, res) {
  const { wallet, name, address, isMultiToken } = req.body;

  try {
    const collection = {
      name: name,
      address: address,
      isMultiToken: isMultiToken,
    };

    const data = await UserModel.findByIdAndUpdate(
      { wallet: wallet },
      {
        $push: { collections: collection },
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "New collection added successfully",
      user: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
});

module.exports = router;
