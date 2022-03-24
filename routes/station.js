require("dotenv").config();
const express = require("express")
const router = express.Router()
const Station = require('../schema/station')
const StationResult = require('../schema/stationResult')
const User = require('../schema/user')
const latLongFromLocation = require('../util/locationToCoords')
const axios = require('axios');

const instance = axios.create({
    baseURL: `https://api.openchargemap.io/v3/poi/?key=${process.env.OCM_API_KEY}&countrycode=US`
})

// search by zip code, city/state or user's location
router.post('/stations', async (req, res) => {

    if (req.body.searchBox) {
        // city or zip entered in search
        const location = await latLongFromLocation(req.body.searchBox)
        try {
            console.log(location)
            const response = await instance.get(`&latitude=${location.lat}&longitude=${location.lng}`)
            // console.log(response.data)
            res.json(response.data)
        } catch (err) {
            console.log(err)
        }

    } else {
        // search by user's location
        try {
            const response = await instance.get(`&latitude=${req.body.latitude}&longitude=${req.body.longitude}&maxresults=10`)
            res.json(response)
        } catch (err) {
            console.log(err)
        }
    }

    // const stations = await StationResult.findOne({ location: location })
    // if (stations) {
    //     // coords result is in DB, pull info from there
    //     console.log(true)
    // } else {
    //     // ask HERE API for stations, add to DB

    // }

})

router.post('/add-favorite', async (req, res) => {
    const stationNumber = req.body.stationNumber
    const username = req.body.username

    const user = await User.findOne({ username: username }) // or however the JWT is set up

    if (user) {
        try {
            // add to favorites list of logged in user
            user.favorites.push({
                stationId: stationNumber,
                user: user._id
            })
            const saved = await user.save()
            if (saved) {
                res.json({ success: true, message: 'Added to favorites.' })
            } else {
                res.json({ success: false, message: 'Error!' })
            }
        } catch (err) {
            console.log(err)
        }
    } else {
        // user does not exist
        res.json({ success: false, message: 'Invalid username.' })
    }
})

router.delete('/remove-favorite', async (req, res) => {
    const favoriteId = req.body.favoriteId
    const username = req.body.username

    const user = await User.findOne({ username: username }) // or however the JWT is set up
    //console.log(user)
    if (user) {
        try {
            // remove favorite with pull
            user.favorites.pull(favoriteId)
            const saved = await user.save()
            if (saved) {
                res.json({ success: true, message: 'Removed from favorites.' })
            } else {
                res.json({ success: false, message: 'Error!' })
            }

        } catch (err) {
            console.log(err)
        }
    } else {
        // user does not exist
        res.json({ success: false, message: 'Invalid username.' })
    }
})

router.post('/add-photo', async (req, res) => {

})

module.exports = router;




