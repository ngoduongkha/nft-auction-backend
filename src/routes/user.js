const express = require("express");
const router = express.Router();
const UserModel = require("../models/user");

router.get("/", async function (_req, res) {
  return UserModel.find()
    .then((data) => res.status(200).json(data))
    .catch((error) =>
      res.status(500).json({
        success: false,
        message: "Server error. Please try again.",
        error: error.message,
      })
    );
});

router.get("/:id", async function (req, res) {
  return UserModel.findById(req.params.id)
    .then((data) => res.status(200).json(data))
    .catch((error) =>
      res.status(500).json({
        success: false,
        message: "Server error. Please try again.",
        error: error.message,
      })
    );
});

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

router.post("/", async function (req, res) {
  const { username, bio, email, wallet, image, banner } = req.body;
  console.log(req.body);
  const user = new UserModel({
    username: username,
    bio: bio,
    email: email,
    wallet: wallet,
    image: image,
    banner: banner,
  });

  return user
    .save()
    .then((newUser) =>
      res.status(201).json({
        success: true,
        message: "New user created successfully",
        user: newUser,
      })
    )
    .catch((error) =>
      res.status(500).json({
        success: false,
        message: "Server error. Please try again.",
        error: error.message,
      })
    );
});

router.post("/collection", async function (req, res) {
  const { userId, name, address, isMultiToken } = req.body;

  const collection = {
    name: name,
    address: address,
    isMultiToken: isMultiToken,
  };

  return UserModel.findByIdAndUpdate(
    userId,
    {
      $push: { collections: collection },
    },
    { new: true }
  )
    .then((data) =>
      res.status(201).json({
        success: true,
        message: "New collection added successfully",
        user: data,
      })
    )
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: "Server error. Please try again.",
        error: error.message,
      });
    });
});

router.patch("/:id", async function (req, res) {
  const updatedUser = req.body;

  return UserModel.findByIdAndUpdate(req.params.id, updatedUser, { new: true })
    .then((data) => res.status(200).json(data))
    .catch((error) =>
      res.status(500).json({
        success: false,
        message: "Server error. Please try again.",
        error: error.message,
      })
    );
});

router.delete("/:id", async function (req, res) {
  return UserModel.findByIdAndDelete(req.params.id)
    .then((data) => res.send(`User with id ${data.id} has been deleted.`))
    .catch((error) =>
      res.status(500).json({
        success: false,
        message: "Server error. Please try again.",
        error: error.message,
      })
    );
});

module.exports = router;
