require("dotenv").config();
const express = require("express")
const router = express.Router()
//const Station = require('../schema/station')
const StationResult = require('../schema/stationResult')
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
    const station = req.body.station
    const username = req.body.username

    const user = await User.findOne({ username: username }) // or however the JWT is set up

    if (user) {
        try {
            // add to favorites list of logged in user
        } catch (err) {
            console.log(err)
        }
    }
})

router.delete('/remove-favorite', async (req, res) => {
    const station = req.body.station
    const username = req.body.username

    // delete from User favorites by station
})

router.post('/add-photo', async (req, res) => {

})

module.exports = router;




