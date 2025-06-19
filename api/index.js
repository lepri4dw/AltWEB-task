require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const config = require("./config");
const usersRouter = require("./routers/users");

const app = express();
const port = 8000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.static('public'));
app.use(express.json());
app.use('/user', usersRouter);

const run = async () => {
  mongoose.set('strictQuery', false);
  await mongoose.connect(config.db);

  app.listen(port, () => {
    console.log('We are live on ' + port);
  });

  process.on('exit', () => {
    mongoose.disconnect();
  })
};

run().catch(console.error);
