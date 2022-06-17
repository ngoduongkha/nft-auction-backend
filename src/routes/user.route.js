const express = require("express");
const router = express.Router();
const { isAuth } = require("../services/auth/auth.middleware");
const userController = require("../services/user.controller");

router.get("/:wallet", userController.getUser);

router.get("/:wallet/nfts", userController.getNfts);

router.get("/:wallet/collections", userController.getCollections);

router.get("/:wallet/listing-nfts", userController.getListingNfts);

router.get("/:wallet/bidding-nfts", userController.getBiddingNfts);

router.patch("/", isAuth, userController.updateUser);

module.exports = router;
