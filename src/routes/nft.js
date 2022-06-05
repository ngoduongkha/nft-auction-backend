require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PROJECT_ID = process.env.PROJECT_ID;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const express = require("express");
const router = express.Router();
const ethers = require("ethers");
const schedule = require("node-schedule");
const Token = require("../../NFTMarketplace.json");
const provider = new ethers.providers.JsonRpcProvider(
  `https://rinkeby.infura.io/v3/${PROJECT_ID}`
);
const contract = new ethers.Contract(CONTRACT_ADDRESS, Token.abi, provider);
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function IPFStoJSON(i, tokenContract) {
  const tokenUri =
    i.isMultiToken == true
      ? await tokenContract.get1155TokenURI(i.tokenId.toString())
      : await tokenContract.get721TokenURI(i.tokenId.toString());
  const response = await fetch(tokenUri);
  const meta = await response.json();

  const auctionInfo = {
    startAt: i.auctionInfo.startAt.toString(),
    endAt: i.auctionInfo.endAt.toString(),
    highestBidder: i.auctionInfo.highestBidder,
    highestBid: i.auctionInfo.highestBid.toString(),
    highestBidTime: i.auctionInfo.highestBidTime.toString(),
    startingPrice: i.auctionInfo.startingPrice.toString(),
  };

  return {
    tokenId: i.tokenId.toString(),
    nftContract: i.nftContract,
    seller: i.seller,
    owner: i.owner,
    name: meta.name,
    description: meta.description,
    image: meta.image,
    price: i.price.toString(),
    sold: i.sold,
    bidded: i.bidded,
    isMultiToken: i.isMultiToken,
    auctionInfo: auctionInfo,
  };
}

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

    schedule.scheduleJob(date, async function () {
      try {
        console.log("End auction job started!");
        console.log("Item: ", auctionCreationData);
        let wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        let contractWithSigner = contract.connect(wallet);
        let tx = await contractWithSigner.endAuction(
          auctionCreationData.tokenId
        );
        console.log(tx);
        console.log("End auction job done!");
      } catch (error) {
        console.error("End auction failed!");
        console.error("Error: ", error.message);
      }
    });
  }
);

router.get("/", async function (req, res) {
  try {
    const { cursor, howMany } = req.query;
    const data = await contract.fetchAllNFTs(cursor ?? 0, howMany ?? 10);
    const result = [];
    for (const item of data.items) {
      result.push(await IPFStoJSON(item, contract));
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.get("/available", async function (req, res) {
  try {
    const data = await contract.fetchAvailableMarketItems();
    const result = [];
    for (const item of data.items) {
      result.push(await IPFStoJSON(item, contract));
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.get("/user-auction/:userAddress", async function (req, res) {
  try {
    const { userAddress } = req.params;
    const data = await contract.fetchAvailableBiddedAuction(userAddress);
    console.log(data);
    const result = [];
    for (const item of data.items) {
      result.push(await IPFStoJSON(item, contract));
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.get("/user/:userAddress", async function (req, res) {
  try {
    const { userAddress } = req.params;
    const data = await contract.fetchMyNFTs(userAddress);
    const result = [];
    for (const item of data.items) {
      result.push(await IPFStoJSON(item, contract));
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.get("/id/:id", async function (req, res) {
  try {
    const data = await contract.fetchMarketItem(req.params.id);
    const result = await IPFStoJSON(data, contract);
    res.status(200).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
