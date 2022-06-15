require("dotenv").config();

const express = require("express");
const { isAuth } = require("../services/auth/auth.middleware");
const nftController = require("../services/nft.controller");
const router = express.Router();

router.get("/id/:id", nftController.getNft);

router.get("/", nftController.getNfts);

router.get("/listing", nftController.getListingNfts);

router.post("/", isAuth, nftController.createNft);

router.patch("/list-nft", isAuth, nftController.listNft);

router.patch("/create-auction", isAuth, nftController.createAuction);

router.patch("/place-bid", isAuth, nftController.placeBid);

router.patch("/withdrawBid", isAuth, nftController.withdrawBid);

router.patch("/buy", isAuth, nftController.buyNft);

router.patch("/cancelList", isAuth, nftController.cancelListing);

module.exports = router;
