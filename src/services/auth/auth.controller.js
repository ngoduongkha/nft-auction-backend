require("dotenv").config();

const randToken = require("rand-token");
const UserModel = require("../../models/user.model");
const authMethod = require("./auth.method");

const ACCESS_TOKEN_LIFE = process.env.ACCESS_TOKEN_LIFE;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SIZE = process.env.REFRESH_TOKEN_SIZE;

exports.login = async (req, res) => {
  const wallet = req.body.wallet;

  let user = await UserModel.findOne({ wallet: wallet });
  if (!user) {
    user = await UserModel.create({ wallet: wallet });
  }

  const dataForAccessToken = {
    wallet: user.wallet,
  };

  const accessToken = await authMethod.generateToken(
    dataForAccessToken,
    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_LIFE
  );

  if (!accessToken) {
    return res.status(401).json({
      success: false,
      message: "Login failed",
      error: "Login failed",
    });
  }

  if (!user.refreshToken) {
    const refreshToken = randToken.generate(REFRESH_TOKEN_SIZE);
    user = await UserModel.findOneAndUpdate(
      { wallet: wallet },
      { refreshToken: refreshToken },
      { new: true }
    );
  }

  return res.status(200).json({
    success: true,
    message: "Login successfully",
    data: {
      user: user,
      token: accessToken,
    },
  });
};

exports.refreshToken = async (req, res) => {
  const accessTokenFromHeader = req.headers.x_authorization;
  const refreshTokenFromBody = req.body.refreshToken;

  if (!accessTokenFromHeader) {
    return res.status(400).json({
      success: false,
      message: "Access token not found",
      error: "Access token not found",
    });
  }

  if (!refreshTokenFromBody) {
    return res.status(400).json({
      success: false,
      message: "Access token not found",
      error: "Access token not found",
    });
  }

  const decoded = await authMethod.decodeToken(
    accessTokenFromHeader,
    ACCESS_TOKEN_SECRET
  );

  if (!decoded) {
    return res.status(400).json({
      success: false,
      message: "Access token invalid",
      error: "Access token invalid",
    });
  }

  const wallet = decoded.payload.wallet;

  const user = await UserModel.findOne({ wallet: wallet });

  if (refreshTokenFromBody !== user.refreshToken) {
    return res.status(400).json({
      success: false,
      message: "Refresh token invalid",
      error: "Refresh token invalid",
    });
  }

  const dataForAccessToken = {
    wallet,
  };

  const accessToken = await authMethod.generateToken(
    dataForAccessToken,
    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_LIFE
  );

  return res.status(200).json({
    success: true,
    message: "Refresh token successfully",
    data: {
      user: user,
      token: accessToken,
    },
  });
};