require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../schema/user");

router.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const user = await User.findOne({
    username: username,
  });
  if (user) {
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        const token = jwt.sign({ username: user.username }, process.env.JWT);
        res.json({ success: true, user: user, token: token });
      } else {
        res.json({ success: false, message: "Not Authenticated" });
      }
    });
  } else {
    res.json({ success: false, message: "Authenticaton failed" });
  }
});

router.post("/register", async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  console.log("Registering");
  const user = await User.findOne({
    username: username,
  });
  if (user) {
    res.json({ success: false, message: "Username already exisits!" });
  } else {
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, function (err, hash) {
        const user = new User({
          username: username,
          email: email,
          password: hash,
        });
        user.save((error) => {
          if (error) {
            res.json({ success: false, message: error });
          } else {
            res.json({ success: true, message: "User has been saved!" });
          }
        });
      });
    });
  }
});

// router.delete('/favorites', (req, res) => {
    
// })

module.exports = router;
