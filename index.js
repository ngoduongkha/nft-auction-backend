require("dotenv").config();

const PORT = process.env.PORT || 5000;
const express = require("express");
const mongoose = require("mongoose");
const mongoString = process.env.DATABASE_URL;
const nftRoutes = require("./src/routes/nft.route");
const userRoutes = require("./src/routes/user.route");
const authRoutes = require("./src/routes/auth.route");
const collectionRoutes = require("./src/routes/collection.route");
const cors = require("cors");

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/nft", nftRoutes);
app.use("/api/user", userRoutes);
app.use("/api/collection", collectionRoutes);

app.listen(PORT, () => {
  console.log(`Server Started at ${PORT}`);
});
