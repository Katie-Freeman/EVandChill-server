require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../schema/user");
const Station = require("../schema/station");
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

router.delete("/:username/reviews", validateJwt, async (req, res) => {
    const { reviewId, stationId } = req.body;

    try {
        const user = await User.findById(req.userId);
        const station = await Station.findOne({ externalId: stationId });
        if (user && station) {
            const reviewToDelete = user.reviews.find((review) => {
                console.log(review);
                return review._id.toString() === reviewId;
            });
            console.log(reviewToDelete);
            if (!reviewToDelete) throw new Error();
            const newUserReviews = user.reviews.filter((review) => {
                return review._id.toString() !== reviewId;
            });
            user.reviews = newUserReviews;
            await user.save();
            station.reviews = station.reviews.filter(
                (review) =>
                    !(
                        review.user.toString() === req.userId &&
                        review.review === reviewToDelete.review
                    )
            );
            await station.save();
            res.json({ success: true, message: "Review deleted" });
        } else {
            throw new Error();
        }
    } catch (err) {
        console.log(err);
        res.status(400).json({
            success: false,
            message: "unable to remove review",
        });
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
