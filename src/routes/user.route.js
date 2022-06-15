const express = require("express");
const router = express.Router();
const { isAuth } = require("../services/auth/auth.middleware");
const userController = require("../services/user.controller");

router.get("/", isAuth, userController.getUser);

router.get("/nfts", isAuth, userController.getNfts);

router.get("/listing-nfts", isAuth, userController.getListingNfts);

router.get("/bidding-nfts", isAuth, userController.getBiddingNfts);

router.patch("/", isAuth, userController.updateUser);

module.exports = router;
