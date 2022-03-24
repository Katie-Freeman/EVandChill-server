require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const User = require("./schema/user");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const PORT = process.env.PORT || 8080;
const MONGOURL = process.env.MONGO_URL;

app.use(express.json());
app.use(cookieParser(process.env.COOKIE));

// ROUTES
app.use('/station', require('./routes/station.js'));
app.use('/profile', require('./routes/profile.js'));

const whitelist = process.env.WHITELIST ? process.env.WHITELIST.split(",") : [];
app.use(
    cors({
        origin: (origin, cb) => {
            if (!origin || whitelist.indexOf(origin) !== -1) {
                cb(null, true);
            } else {
                cb(new Error("Blocked by CORS"));
            }
        },
        credentials: true,
    })
);

app.get("/", (req, res) => res.json({ works: "HELLO!" }));


mongoose.connect(MONGOURL, () => {
    console.info("Connected to MongoDB");
    app.listen(PORT, () =>
        console.info(`EV & Chill server running on port ${PORT}`)
    );
});

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = await User.findOne({
        username: username
    })

    if (user) {
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                const token = jwt.sign(
                    { username: user.username },
                    process.env.JWT
                )
                res.json({ success: true, user: user, token: token })
            } else {
                res.json({ success: false, message: "Not Auuthenticated" })
            }
        })
    } else {
        res.json({ success: false, message: "Authenticaton failed" })
    }
});

app.post('/register', async (req, res) => {
    const username = req.body.username;
    const password = req.body.username;
    const email = req.body.email;

    const user = await User.findOne({
        username: username
    })

    if (user) {
        res.json({ success: false, message: 'Username already exisits!' })
    } else {
        const hashedPassword = await bcrypt.hash(password, 10)
        try {
            const user = await User.create({
                username: username,
                password: hashedPassword,
                email: email
            })
            if (user) {
                res.json({ success: true, message: "User has been saved!" })
            }
        } catch (err) {
            console.log(err)
        }
    }
})
