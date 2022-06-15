require("dotenv").config();

const express = require("express");
const { NftModel } = require("../models/nft.model");
const { isAuth } = require("../services/auth/auth.middleware");
const {
  getNft,
  listNft,
  createAuction,
  placeBid,
  withdrawBid,
  buyNft,
  cancelListing,
} = require("../services/nft.controller");
const router = express.Router();

router.get("/id/:id", getNft);

router.get("/", async function (req, res) {
  const pageNumber = parseInt(req.query.pageNumber) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const bidded = req.query.bidded === undefined || req.query.bidded === "true";
  const sold = req.query.sold === undefined || req.query.sold === "true";

  try {
    const query = {
      $and: [{ sold: sold }, { bidded: bidded }],
    };
    const total = await NftModel.find(query).count();
    const nfts = await NftModel.find(query)
      .limit(pageSize)
      .skip(pageSize * pageNumber - pageSize)
      .limit(pageSize);

    console.log("Get listing successfully");
    res.status(200).json({
      success: true,
      message: "Get listing successfully",
      data: {
        nfts: nfts,
        meta: {
          total: total,
          currentPage: pageNumber,
          pageSize: pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    });
  } catch (error) {
    console.log("Get listing failed");
    console.log("Message: ", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
});

// router.get("/collection/:collectionAddress", async function (req, res) {
//   const { collectionAddress } = req.params.collectionAddress;

//   try {
//     const nfts = await NftModel.find({ collectionAddress: collectionAddress });

//     console.log("Get nfts by collection successfully");
//     res.status(200).json({
//       success: true,
//       message: "Get nfts by collection successfully",
//       data: nfts,
//     });
//   } catch (error) {
//     console.log("Get nfts by collection failed");
//     console.log("Message: ", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Server error. Please try again.",
//       error: error.message,
//     });
//   }
// });

router.get("/listing", async function (req, res) {
  const pageNumber = parseInt(req.query.pageNumber) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  try {
    const query = {
      $or: [{ sold: false }, { bidded: false }],
    };
    const total = await NftModel.find(query).count();
    const nfts = await NftModel.find(query)
      .skip(pageSize * pageNumber - pageSize)
      .limit(pageSize);

    console.log("Get listing successfully");
    res.status(200).json({
      success: true,
      message: "Get listing successfully",
      data: {
        nfts: nfts,
        meta: {
          total: total,
          currentPage: pageNumber,
          pageSize: pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    });
  } catch (error) {
    console.log("Get listing failed");
    console.log("Message: ", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
});

router.post("/", (req, res) => {
  const {
    tokenId,
    nftContract,
    owner,
    name,
    description,
    image,
    isMultiToken,
  } = req.body;

  NftModel.create({
    tokenId: tokenId,
    collectionAddress: nftContract,
    owner: owner,
    isMultiToken: isMultiToken,
    name: name,
    description: description,
    image: image,
  })
    .then((data) => {
      console.log(`Create market item with id ${tokenId} successfully`);
      res.status(201).json({
        success: true,
        message: "Create market item successfully",
        data: data,
      });
    })
    .catch((error) => {
      console.log("Create market item failed");
      console.log("Message: ", error.message);
      res.status(500).json({
        success: false,
        message: "Server error. Please try again.",
        error: error.message,
      });
    });
});

router.patch("/list-nft", isAuth, listNft);

router.patch("/create-auction", isAuth, createAuction);

router.patch("/place-bid", isAuth, placeBid);

router.patch("/withdrawBid", isAuth, withdrawBid);

router.patch("/buy", isAuth, buyNft);

router.patch("/cancelList", isAuth, cancelListing);

module.exports = router;
