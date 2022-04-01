require("dotenv").config();
const express = require("express");
const router = express.Router();
const Station = require("../schema/station");
const StationResult = require("../schema/stationResult");
const User = require("../schema/user");
const latLongFromLocation = require("../util/locationToCoords");
const axios = require("axios");

const instance = axios.create({
    baseURL: `https://api.openchargemap.io/v3/poi/?key=${process.env.OCM_API_KEY}&countrycode=US`,
});

// search by zip code, city/state or user's location
router.post("/stations", async (req, res) => {
    const { zip, cityState, latitude, longitude } = req.body;

    let location = { lat: latitude, lng: longitude };

    if (!location.lat || !location.lng) {
        if (zip) {
            location = await latLongFromLocation(zip);
        } else if (cityState) {
            location = await latLongFromLocation(cityState);
        }
    }

    try {
        StationResult.findOrCreate(
            {
                location: `${location.lat},${location.lng}`,
            },
            async (err, stations) => {
                console.log(stations);
                let { dateUpdated, response } = stations;
                // 2073600000 ms in a day
                if (
                    !dateUpdated ||
                    Date.now() - dateUpdated > 2073600000 ||
                    response.length === 0
                ) {
                    stationsResponse = await instance.get(
                        `&latitude=${location.lat}&longitude=${location.lng}`
                    );
                    stations.dateUpdated = Date.now();
                    stations.response = stationsResponse.data;
                    stations.save();
                    saveStationsToDB(stationsResponse.data);
                }

                res.json({ stations: response, location: location });
            }
        );
    } catch (err) {}
});

router.get("/id/:stationId", async (req, res) => {
    try {
        const response = await instance.get(
            `&chargepointid=${req.params.stationId}`
        );
        const station = response.data;
        const location = encodeURIComponent(
            `${station[0].AddressInfo.Latitude},${station[0].AddressInfo.Longitude}`
        );

        /* url setup*/
        const entertainmentURL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=1500&type=movie_theater&key=${process.env.GOOGLE_PLACES_API_KEY}`;
        const restaurantsURL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=1500&type=restaurant&key=${process.env.GOOGLE_PLACES_API_KEY}`;
        const storesURL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=1500&type=store&key=${process.env.GOOGLE_PLACES_API_KEY}`;

        /* create requests */
        const entertainmentPromise = await axios.get(entertainmentURL);
        const restaurantsPromise = await axios.get(restaurantsURL);
        const storesPromise = await axios.get(storesURL);

        /* build data object to return from responses */

        const nearbyData = {
            theaters: entertainmentPromise.data.results,
            restaurants: restaurantsPromise.data.results,
            stores: storesPromise.data.results,
        };

        station[0].nearby = nearbyData;
        res.json(station);
    } catch (err) {
        console.log(err);
    }
});

router.post("/add-favorite", async (req, res) => {
    const { stationNumber, username, title, address } = req.body;

    const user = await User.findOne({ username: username }); // or however the JWT is set up

    if (user) {
        try {
            // add to favorites list of logged in user
            user.favorites.push({
                stationId: stationNumber,
                title: title,
                address: address,
                user: user._id,
            });
            const saved = await user.save();
            if (saved) {
                res.json({ success: true, message: "Added to favorites." });
            } else {
                res.json({ success: false, message: "Error!" });
            }
        } catch (err) {
            console.log(err);
        }
    } else {
        // user does not exist
        res.json({ success: false, message: "Invalid username." });
    }
});

router.delete("/remove-favorite", async (req, res) => {
    const stationNumber = req.body.stationNumber;
    const username = req.body.username;

    try {
        const success = await User.updateOne(
            { username: username },
            { $pull: { favorites: { stationId: stationNumber } } }
        );
        if (success) {
            res.json({ success: true, message: "Removed from favorites." });
        } else {
            res.json({ success: false, message: "Error!" });
        }
    } catch (err) {
        console.log(err);
    }
});

const saveStationsToDB = (stations) => {
    console.log("saving to DB...");
    stations.forEach((station) => {
        const connections = station.Connections.map((connection) => ({
            type: connection.ConnectionType.Title,
            speed: connection.ConnectionType.ID,
        }));
        Station.findOrCreate({ externalId: station.ID }, (err, dbStation) => {
            let supportNumber = null;
            if (
                station.OperatorInfo &&
                station.OperatorInfo.PhonePrimaryContact
            ) {
                supportNumber = station.OperatorInfo.PhonePrimaryContact;
            }

            (dbStation.externalId = station.ID),
                (dbStation.lastUpdated = station.DataProvider.DateLastImported),
                (dbStation.name = station.AddressInfo.Title),
                (dbStation.address = `${station.AddressInfo.AddressLine1} ${station.AddressInfo.Town}, ${station.AddressInfo.StateOrProvince} ${station.AddressInfo.Postcode}`),
                (dbStation.latitude = station.AddressInfo.Latitude.toFixed(1)),
                (dbStation.longitude =
                    station.AddressInfo.Longitude.toFixed(1)),
                (dbStation.plugTypes = connections),
                (dbStation.supportNumber = supportNumber);
            dbStation.operatingHours = station.AddressInfo.AccessComments
                ? station.AddressInfo.AccessComments
                : null;

            dbStation.save();
        });
    });
};

module.exports = router;
