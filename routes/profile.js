require("dotenv").config();
const express = require("express")
const router = express.Router()
const User = require('../schema/user')
const bcrypt = require('bcrypt');
const Station = require("../schema/station");

router.get('/my-favorites', async (req, res) => {
    const username = req.body.username
    const user = await User.findOne({ username: username })
    if (user) {
        res.json({ success: true, favorites: user.favorites })
    } else {
        // user not found
    }
})

router.get('/my-reviews', async (req, res) => {
    const username = req.body.username
    const user = await User.findOne({ username: username })
    if (user) {
        res.json({ success: true, reviews: user.reviews })
    } else {
        // user not found
    }
})

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
