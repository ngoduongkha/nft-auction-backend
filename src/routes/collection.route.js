const express = require("express");
const { isAuth } = require("../services/auth/auth.middleware");
const {
  getAllCollection,
  createCollection,
} = require("../services/collection.controller");
const router = express.Router();

router.get("/", getAllCollection);

router.post("/", isAuth, createCollection);

module.exports = router;
