require("dotenv").config();
const express = require("express")
const router = express.Router()
const User = require('../schema/user')
const bcrypt = require('bcrypt');
const Station = require("../schema/station");

router.get('/:username/my-favorites', async (req, res) => {
    const username = req.params.username
    const user = await User.findOne({ username: username })
    if (user) {
        res.json({ success: true, favorites: user.favorites })
    } else {
        // user not found
    }
})

router.delete("/favorites", async (req, res) => {
    const { favoriteId, userId } = req.body

    const success = await User.updateOne({
        _id: userId
    },
        { $pull: { favorites: { _id: favoriteId } } }
    )

    if (success) {
        res.json({ success })
    } else {
        res.json({ error: "Could not update" })
    }
});

router.get('/:username/my-reviews', async (req, res) => {
    const username = req.body.username
    const user = await User.findOne({ username: username })
    if (user) {
        res.json({ success: true, reviews: user.reviews })
    } else {
        // user not found
    }
})

router.delete("/reviews", async (req, res) => {
  const { reviewId, userId, stationId} = req.body;
  console.log("review", reviewId)
//   const user = await user.findOne({ _id: userId});
//   user.reviews.pull(reviewId);
//   user.save();

//   const station = await station.findOne({ externalId: stationId});
//   station.reviews.pull(reviewId);
//   station.save();
  const userSuccess = await User.updateOne(
    {
      "_id": userId,
    },
    { $pullAll: { "reviews": [{" _id": reviewId }] } }
  );
console.log("USER", userSuccess)
  const stationSuccess = await Station.updateOne(
    {
      "externalId": String(stationId),
    },
    { $pullAll: { "reviews": [{ "_id": reviewId }] } }
  );
// console.log("STATION", stationSuccess)
  if (userSuccess && stationSuccess) {
    res.json({ userSuccess, stationSuccess});
  } else {
    res.json({ error: "Could not update" });
  }
});

router.post('/update-password', async (req, res) => {
    const { password, newPassword, newPasswordConfirmed, username } = req.body

    const user = await User.findOne({ username: username })

    if (user) {
        const match = await bcrypt.compare(password, user.password)
        if (match) {
            if (newPassword === newPasswordConfirmed) {

                const updatedPasword = await bcrypt.hash(newPassword, 10)
                user.password = updatedPasword
                await user.save()
                res.json({ success: true, message: 'Password updated.' })

            } else {
                res.json({ success: false, message: 'New passwords do not match.' })
            }
        } else {
            res.json({ success: false, message: 'Incorrect password.' })
        }
    } else {
        res.json({ success: false, message: 'User does not exist.' })
    }
})

router.post('/update-email', async (req, res) => {
    const { email, newEmail, username } = req.body

    const user = await User.findOne({ username: username })

    if (email === user.email) {
        user.email = newEmail
        await user.save()
        res.json({ success: true, message: 'Email updated.' })
    } else {
        res.json({ success: false, message: 'Incorrect email.' })
    }
})

module.exports = router;
