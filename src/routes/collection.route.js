const express = require("express");
const { isAuth } = require("../services/auth/auth.middleware");
const collectionController = require("../services/collection.controller");
const router = express.Router();

router.get("/", collectionController.getCollections);

router.get("/:collectionAddress/nfts", collectionController.getNfts);

router.post("/", isAuth, collectionController.createCollection);

module.exports = router;
