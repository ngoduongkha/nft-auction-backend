require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const express = require('express');
const router = express.Router();
const ethers = require('ethers');
const schedule = require('node-schedule');
const Token = require('../../NFTMarketplace.json');
const tokenAddress = '0x0fFCDEd751812f6ef317378600852288AD022366';
const provider = new ethers.providers.JsonRpcProvider(
  'https://rinkeby.infura.io/v3/ff81c88502c540f0b690b55ed77a2c71'
);
const contract = new ethers.Contract(tokenAddress, Token.abi, provider);
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function IPFStoJSON(i, tokenContract) {
  const tokenUri =
    i.isMultiToken == true
      ? await tokenContract.get1155TokenURI(i.tokenId.toString())
      : await tokenContract.get721TokenURI(i.tokenId.toString());
  const response = await fetch(tokenUri);
  const meta = await response.json();

  const autionInfo = {
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
    autionInfo: autionInfo,
  };
}

contract.on(
  'MarketItemAuctionListed',
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

    console.log('Auction started!!!', auctionCreationData);

    const date = new Date(auctionCreationData.endTime);
    schedule.scheduleJob(date, async function () {
      try {
        console.log('Auction scheduled!');
        let wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        let contractWithSigner = contract.connect(wallet);
        let tx = await contractWithSigner.endAuction(
          auctionCreationData.tokenId
        );
        console.log(tx);
      } catch (error) {
        console.error('End auction failed!');
        console.error('Error: ', error);
      }
    });
  }
);

router.get('/', async function (req, res) {
  try {
    const { cursor, howMany } = req.body;
    const data = await contract.fetchAllNFTs(cursor ?? 0, howMany ?? 1);
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

router.get('/:id', async function (req, res) {
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
