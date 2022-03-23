require("dotenv").config();
const express = require("express")
const router = express.Router()
const Station = require('../schema/station')
const StationResult = require('../schema/stationResult')
const latLongFromLocation = require('../util/locationToCoords')

const instance = axios.create({
    baseURL: 'https://ev-v2.cc.api.here.com/ev/stations.json?',
    headers: `Authorization: Bearer ${process.env.EV_API}`
})

// search by zip code, city/state or user's location
router.get('/stations', async (req, res) => {

    let location = ''
    if (req.body.searchBox) {
        // city or zip entered in search
        location = latLongFromLocation(req.body.searchBox)
    } else {
        // search by user's location
        location = req.body.coords
    }

    const stations = await StationResult.findOne({ location: location })
    if (stations) {
        // coords result is in DB, pull info from there
    } else {
        // ask HERE API for stations, add to DB
        const response = instance.get(`prox=${location.lat},${location.lng},5000`)
        res.json(response)

    }

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




