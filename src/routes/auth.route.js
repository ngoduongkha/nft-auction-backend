const express = require("express");
const router = express.Router();

const authController = require("../services/auth/auth.controller");

router.post("/login", authController.login);
router.post("/refresh", authController.refreshToken);

module.exports = router;
