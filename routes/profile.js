require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../schema/user");
const bcrypt = require("bcrypt");
const validateJwt = require("../middleware/validateJwt");

router.get("/:username", validateJwt, async (req, res) => {
    const user = await User.findById(req.userId);
    if (user) {
        res.json({
            success: true,
            user: {
                email: user.email,
                favorites: user.favorites,
                reviews: user.reviews,
            },
        });
    } else {
        res.status(404).json({ success: false, message: "User not found" });
    }
});

router.get("/:username/my-favorites", validateJwt, async (req, res) => {
    const user = await User.findById(req.userId);
    if (user) {
        res.json({ success: true, favorites: user.favorites });
    } else {
        res.status(404).json({ success: false, message: "User not found" });
    }
});

router.delete("/favorites", validateJwt, async (req, res) => {
    const { favoriteId } = req.body;

    const success = await User.findByIdAndUpdate(req.userId, {
        $pull: { favorites: { _id: favoriteId } },
    });

    if (success) {
        res.json({ success });
    } else {
        res.status(400).json({ error: "Could not update" });
    }
});

router.get("/:username/my-reviews", validateJwt, async (req, res) => {
    const user = await User.findById(req.userId);
    if (user) {
        res.json({ success: true, reviews: user.reviews });
    } else {
        res.status(404).json({
            success: false,
            message: "Unable to get reviews",
        });
    }
});

router.delete("/reviews", async (req, res) => {
    const { reviewId, userId, stationId } = req.body;
    const userSuccess = await User.updateOne(
        {
            _id: userId,
        },
        { $pullAll: { reviews: [{ " _id": reviewId }] } }
    );
    const stationSuccess = await Station.updateOne(
        {
            externalId: String(stationId),
        },
        { $pullAll: { reviews: [{ _id: reviewId }] } }
    );

    if (userSuccess && stationSuccess) {
        res.json({ userSuccess, stationSuccess });
    } else {
        res.json({ error: "Could not update" });
    }
});

router.post("/update-password", validateJwt, async (req, res) => {
    const { password, newPassword, newPasswordConfirmed } = req.body;

    const user = await User.findById(req.userId);

    if (user) {
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            if (newPassword === newPasswordConfirmed) {
                const updatedPasword = await bcrypt.hash(newPassword, 10);
                user.password = updatedPasword;
                await user.save();
                res.json({ success: true, message: "Password updated." });
            } else {
                res.status(400).json({
                    success: false,
                    message: "New passwords do not match.",
                });
            }
        } else {
            res.status(403).json({
                success: false,
                message: "Incorrect password.",
            });
        }
    } else {
        res.status(404).json({
            success: false,
            message: "User does not exist.",
        });
    }
});

router.post("/update-email", validateJwt, async (req, res) => {
    const { email, newEmail } = req.body;

    const user = await User.findById(req.userId);

    if (email === user.email) {
        user.email = newEmail;
        await user.save();
        res.json({ success: true, message: "Email updated." });
    } else {
        res.status(400).json({ success: false, message: "Incorrect email." });
    }
});

module.exports = router;
