// require("dotenv").config();

// const PRIVATE_KEY = process.env.PRIVATE_KEY;
// const PROJECT_ID = process.env.PROJECT_ID;
// const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// import { scheduleJob } from "node-schedule";
// import { abi } from "../../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
// const provider = new ethers.providers.JsonRpcProvider(
//   `https://rinkeby.infura.io/v3/${PROJECT_ID}`
// );
// const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

// contract.on(
//   "MarketItemAuctionListed",
//   (
//     tokenId,
//     nftContract,
//     seller,
//     isMultiToken,
//     startingPrice,
//     startTime,
//     endTime
//   ) => {
//     const auctionCreationData = {
//       tokenId: tokenId.toString(),
//       nftContract: nftContract,
//       seller: seller,
//       isMultiToken: isMultiToken,
//       startingPrice: startingPrice.toString(),
//       startTime: startTime.toString(),
//       endTime: endTime.toString(),
//     };

//     const date = new Date(0);
//     date.setUTCSeconds(Number(auctionCreationData.endTime) + 30);
//     console.log("Job scheduled at: ", date);

//     scheduleJob(date, async function () {
//       try {
//         console.log("End auction job started!");
//         console.log("Item: ", auctionCreationData);
//         let wallet = new ethers.Wallet(PRIVATE_KEY, provider);
//         let contractWithSigner = contract.connect(wallet);
//         let tx = await contractWithSigner.endAuction(
//           auctionCreationData.tokenId
//         );
//         console.log(tx);
//         console.log("End auction job done!");
//       } catch (error) {
//         console.error("End auction failed!");
//         console.error("Error: ", error.message);
//       }
//     });
//   }
// );
