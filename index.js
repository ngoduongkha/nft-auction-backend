require('dotenv').config();

const PORT = process.env.PORT || 5000;
const express = require('express');
const mongoose = require('mongoose');
const mongoString = process.env.DATABASE_URL;
const nftRoutes = require('./src/routes/nft');
const userRoutes = require('./src/routes/user');

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
  console.log(error);
});

database.once('connected', () => {
  console.log('Database Connected');
});
const app = express();

app.use(express.json());
app.use('/api/nft', nftRoutes);
app.use('/api/user', userRoutes);

app.listen(PORT, () => {
  console.log(`Server Started at ${PORT}`);
});
