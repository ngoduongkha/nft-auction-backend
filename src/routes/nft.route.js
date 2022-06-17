require("dotenv").config();

const MARKET_CONTRACT_ADDRESS = process.env.MARKET_CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PROJECT_ID = process.env.PROJECT_ID;

const express = require("express");
const ethers = require("ethers");
const nftController = require("../services/nft.controller");

const { isAuth } = require("../services/auth/auth.middleware");
const { scheduleJob } = require("node-schedule");
const { abi } = require("../abi/NFTMarketplace.json");

const router = express.Router();
const provider = new ethers.providers.JsonRpcProvider(
  `https://rinkeby.infura.io/v3/${PROJECT_ID}`
);
const contract = new ethers.Contract(MARKET_CONTRACT_ADDRESS, abi, provider);

contract.on(
  "MarketItemAuctionListed",
  (
    tokenId,
    nftContract,
    seller,
    isMultiToken,
    startingPrice,
    startTime,
    endTime
  ) => {
    const auctionCreationData = {
      tokenId: tokenId.toString(),
      nftContract: nftContract,
      seller: seller,
      isMultiToken: isMultiToken,
      startingPrice: startingPrice.toString(),
      startTime: startTime.toString(),
      endTime: endTime.toString(),
    };

    const date = new Date(0);
    date.setUTCSeconds(Number(auctionCreationData.endTime) + 30);
    console.log("Job scheduled at: ", date);

    scheduleJob(date, async function () {
      try {
        console.log("End auction job started!");
        console.log("Item: ", auctionCreationData);

        const signer = new ethers.Wallet(PRIVATE_KEY, provider);
        const signedContract = contract.connect(signer);
        const tx = await signedContract.endAuction(auctionCreationData.tokenId);

        console.log(tx);

        await nftController.endAuction(tokenId);

        console.log("End auction job done!");
      } catch (error) {
        console.error("End auction failed!");
        console.error("Error: ", error.message);
      }
    });
  }
);

router.get("/id/:id", nftController.getNft);

router.get("/", nftController.getNfts);

router.get("/listing", nftController.getListingNfts);

router.post("/", isAuth, nftController.createNft);

router.patch("/list-nft", isAuth, nftController.listNft);

router.patch("/create-auction", isAuth, nftController.createAuction);

router.patch("/place-bid", isAuth, nftController.placeBid);

router.patch("/withdraw-bid", isAuth, nftController.withdrawBid);

router.patch("/buy", isAuth, nftController.buyNft);

router.patch("/cancel-list", isAuth, nftController.cancelListing);

module.exports = router;
