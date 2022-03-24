require("dotenv").config();
const express = require("express")
const router = express.Router()
const User = require('../schema/user')

router.get('/my-favorites', async (req, res) => {
    const user = await User.findOne({ username: username })
    if (user) {

        // const favorites = await User.find().where('_id').in
        res.json({ favorites: user.favorites })
    } else {
        // user not found
    }
})

router.get('/my-reviews', async (req, res) => {

})

module.exports = router;
