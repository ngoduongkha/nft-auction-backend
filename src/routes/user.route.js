const express = require("express");
const router = express.Router();
const { isAuth } = require("../services/auth/auth.middleware");
const {
  getUser,
  updateUser,
  getNfts,
  getListingNfts,
  getBiddingNfts,
} = require("../services/user.controller");

router.get("/", isAuth, getUser);

router.get("/nfts", isAuth, getNfts);

router.get("/listing-nfts", isAuth, getListingNfts);

router.get("/", isAuth, getBiddingNfts);

router.patch("/", isAuth, updateUser);

module.exports = router;
