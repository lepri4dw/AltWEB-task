const express = require("express");
const mongoose = require("mongoose");
const {OAuth2Client} = require("google-auth-library");
const config = require("../config");
const crypto = require("crypto");
const fs = require("fs");
const fetch = require('node-fetch');
const path = require("path");
const {imagesUpload} = require("../multer");
const User = require("../models/User");

const usersRouter = express.Router();
const client = new OAuth2Client(config.google.clientId);

usersRouter.post('/', imagesUpload.single('avatar'), async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = new User({
      email: email,
      password: password,
      displayName: displayName || email.split('@')[0], 
      avatar: req.file ? req.file.filename : 'images/default-avatar.png',
    });

    await user.save();
    
    const jwtToken = user.generateJWT();
    return res.json({ token: jwtToken, user });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ error: errors });
    }
    return next(error);
  }
});

usersRouter.post('/auth', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({email: email});

    if (!user) {
      return res.status(400).json({error: 'Invalid email or password'});
    }

    const isMatch = await user.checkPassword(password);

    if (!isMatch) {
      return res.status(400).json({error: 'Invalid email or password'});
    }

    const jwtToken = user.generateJWT();
    return res.json({ token: jwtToken, user });
  } catch (error) {
    return next(error);
  }
});

const downloadFile = async (url, filename) => {
  const response = await fetch(url);
  const fileStream = fs.createWriteStream(filename);
  await new Promise((resolve, reject) => {
    response.body.pipe(fileStream);
    response.body.on("error", (err) => {
      reject(err);
    });
    fileStream.on("finish", function () {
      resolve();
    });
  });
};

usersRouter.post('/google', async (req, res, next) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: req.body.credential,
      audience: config.google.clientId,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).send({ error: "Google login error!" });
    }

    const email = payload["email"];
    const googleId = payload["sub"];

    if (!email) {
      return res.status(400).send({error: 'Not enough user data'});
    }    let user = await User.findOne({email});

    if (!user) {
      const displayName = payload["name"];
      const avatar = payload["picture"];

      const imageRandomId = crypto.randomUUID();

      if (!avatar) {
        return res.status(400).send({error: 'Not enough user data'});
      }
      const imagePath = path.join(config.publicPath, 'images', imageRandomId + '.jpg');

      await downloadFile(avatar, imagePath);
      user = new User({
        email: email,
        password: crypto.randomUUID(),
        displayName,
        googleId,
        avatar: 'images/' + imageRandomId + '.jpg',
      });
    }

    await user.save();

    const jwtToken = user.generateJWT();
    return res.json({ token: jwtToken, user });
  } catch (e) {
    return next(e);
  }
});

module.exports = usersRouter;
