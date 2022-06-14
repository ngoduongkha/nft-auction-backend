require("dotenv").config();

const ACCESS_TOKEN_LIFE = process.env.ACCESS_TOKEN_LIFE;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SIZE = process.env.REFRESH_TOKEN_SIZE;

const UserModel = require("../../models/user.model");
const authMethod = require("./auth.method");

exports.isAuth = async (req, res, next) => {
  const accessTokenFromHeader = req.headers.x_authorization;
  if (!accessTokenFromHeader) {
    return res.status(401).json({
      success: false,
      message: "Access token not found",
      error: "Access token not found",
    });
  }

  const verified = await authMethod.verifyToken(
    accessTokenFromHeader,
    ACCESS_TOKEN_SECRET
  );

  if (!verified) {
    return res.status(401).json({
      success: false,
      message: "You don't have permission",
      error: "You don't have permission",
    });
  }

  const user = await UserModel.getUser(verified.payload.username);
  req.user = user;

  return next();
};
