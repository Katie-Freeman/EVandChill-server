const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../schema/user");

const parseSuccessObject = (user) => {
    const token = jwt.sign({ username: user.username }, process.env.JWT);
    const userResp = { ...user._doc };
    delete userResp.password;
    delete userResp.__v;

    return {
        success: true,
        user: userResp,
        token,
    };
};

router.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = await User.findOne({
        username: username,
    });
    if (user) {
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                const successObj = parseSuccessObject(user);
                res.json(successObj);
            } else {
                res.status(400).json({
                    success: false,
                    message: "Not Authenticated",
                });
            }
        });
    } else {
        res.status(400).json({
            success: false,
            message: "Authenticaton failed",
        });
    }
});

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    const user = await User.findOne({
        username: username,
    });

    if (user) {
        res.status(400).json({
            success: false,
            userTaken: true,
            message: "Username already exists!",
        });
    } else {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
                const newUser = new User({
                    username: username,
                    email: email,
                    password: hash,
                });
                newUser.save((error) => {
                    console.log(newUser);
                    console.log(newUser._id.toString());
                    if (error) {
                        res.status(500).json({
                            success: false,
                            message: error,
                        });
                    } else {
                        const successObj = parseSuccessObject(newUser);
                        res.json(successObj);
                    }
                });
            });
        });
    }
});

router.delete("/favorites", (req, res) => {});

module.exports = router;
