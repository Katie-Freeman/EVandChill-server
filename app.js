require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { scheduler, guestJob } = require("./util/guestReset");
const PORT = process.env.PORT || 8080;
const MONGOURL = process.env.MONGO_URL;

app.use(express.json());
app.use(cookieParser(process.env.COOKIE));

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

// ROUTES
app.use("/station", require("./routes/station.js"));
app.use("/user", require("./routes/user.js"));
app.use("/profile", require("./routes/profile.js"));

mongoose.connect(MONGOURL, () => {
    console.info("Connected to MongoDB");
    app.listen(PORT, () => {
        console.info(`EV & Chill server running on port ${PORT}`);
        scheduler.addSimpleIntervalJob(guestJob);
    });
});
