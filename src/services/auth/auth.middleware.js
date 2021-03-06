require("dotenv").config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const { UserModel } = require("../../models/user.model");
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

  const user = await UserModel.findOne({ wallet: verified.payload.wallet });
  req.user = user;

  return next();
};
