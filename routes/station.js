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

const sanitizeResponseData = (station) => {
    const connections = station.Connections.map((connection) => ({
        type: connection.ConnectionType.Title,
        quantity: connection.Quantity ? connection.Quantity : "Unknown",
        speed: connection.Level ? connection.Level.Title : "No data available",
    }));
    let supportNumber = null;
    let supportEmail = null;
    if (station.OperatorInfo) {
        const { PhonePrimaryContact, ContactEmail } = station.OperatorInfo;
        if (PhonePrimaryContact) supportNumber = PhonePrimaryContact;
        if (ContactEmail) supportEmail = ContactEmail;
    }

    return {
        externalId: station.ID,
        lastUpdated: station.DataProvider.DateLastImported,
        name: station.AddressInfo.Title,
        address: station.AddressInfo.AddressLine1,
        cityStateZip: `${station.AddressInfo.Town}, ${station.AddressInfo.StateOrProvince} ${station.AddressInfo.Postcode}`,
        latitude: station.AddressInfo.Latitude,
        longitude: station.AddressInfo.Longitude,
        plugTypes: connections,
        supportNumber: supportNumber,
        supportEmail: supportEmail,
        operatingHours: station.AddressInfo.AccessComments
            ? station.AddressInfo.AccessComments
            : null,
        amenities: {
            lastUpdated: null,
            entertainment: [],
            restaurants: [],
            stores: [],
        },
    };
};

const getAndSanitizeStationsResponse = async (location) => {
    const stationsResponse = await instance.get(
        `&latitude=${location.lat}&longitude=${location.lng}`
    );
    const sanitizedStations = stationsResponse.data.map((station) =>
        sanitizeResponseData(station)
    );

    return sanitizedStations;
};

const getGooglePlaceResult = async (location, type) => {
    const placeResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=1500&type=${type}&key=${process.env.GOOGLE_PLACES_API_KEY}`
    );
    return placeResponse.data.results;
};

const buildNearbyResults = async (station) => {
    const location = encodeURIComponent(
        `${station.latitude},${station.longitude}`
    );

    const entertainmentResults = await getGooglePlaceResult(
        location,
        "movie_theater"
    );
    const restaurantResults = await getGooglePlaceResult(
        location,
        "restaurant"
    );
    const storesResults = await getGooglePlaceResult(location, "store");

    /* build data object to return from responses */
    const nearbyData = {
        entertainment: entertainmentResults,
        restaurants: restaurantResults,
        stores: storesResults,
        lastUpdated: Date.now(),
    };

    return nearbyData;
};

// search by zip code, city/state or user's location
router.post("/stations", async (req, res) => {
    const { zip, cityState, latitude, longitude } = req.body;
    let location = { lat: latitude, lng: longitude };

    if (!location.lat || !location.lng) {
        if (zip) {
            location = await latLongFromLocation(zip, true);
        } else if (cityState) {
            location = await latLongFromLocation(cityState);
        }
    }
    location.lat = parseFloat(location.lat.toFixed(1));
    location.lng = parseFloat(location.lng.toFixed(1));
    try {
        StationResult.findOne(
            {
                location: `${location.lat},${location.lng}`,
            },
            async (err, stations) => {
                if (stations) {
                    let { dateUpdated, response } = stations;
                    // 2073600000 ms in a day
                    if (
                        !dateUpdated ||
                        Date.now() - dateUpdated > 2073600000 ||
                        response.length === 0
                    ) {
                        const sanitizedStations =
                            await getAndSanitizeStationsResponse(location);
                        stations.dateUpdated = Date.now();
                        stations.response = sanitizedStations;
                        stations.save();
                        saveStationsToDB(sanitizedStations);
                        res.json({ stations: sanitizedStations, location });
                    } else {
                        res.json({ stations: response, location });
                    }
                } else {
                    const sanitizedStations =
                        await getAndSanitizeStationsResponse(location);
                    StationResult.create({
                        response: sanitizedStations,
                        dateUpdated: Date.now(),
                        location: `${location.lat},${location.lng}`,
                    });
                    saveStationsToDB(sanitizedStations);
                    res.json({ stations: sanitizedStations, location });
                }
            }
        );
    } catch (err) {}
});

router.get("/id/:stationId", async (req, res) => {
    try {
        Station.findOrCreate(
            { externalId: req.params.stationId },
            async (err, dbStation) => {
                if (err) throw new Error("Unable to retrieve station details");
                if (dbStation.name) {
                    const { amenities } = dbStation;
                    // 2073600000 ms in a day
                    if (
                        !amenities.lastUpdated ||
                        Date.now() - amenities.lastUpdated > 2073600000
                    ) {
                        const nearbyResults = await buildNearbyResults(
                            dbStation
                        );
                        dbStation.amenities = nearbyResults;
                        dbStation.save();
                        res.json(dbStation);
                    } else {
                        res.json(dbStation);
                    }
                } else {
                    const response = await instance.get(
                        `&chargepointid=${req.params.stationId}`
                    );
                    const stationRaw = response.data[0];
                    const sanitizedStation = sanitizeResponseData(stationRaw);
                    const nearbyResults = await buildNearbyResults(
                        sanitizedStation
                    );
                    sanitizedStation.amenities = nearbyResults;
                    parseStationForDB(dbStation, sanitizedStation);
                    dbStation.save();
                    res.json(sanitizedStation);
                }
            }
        );
    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Unable to get station details",
        });
    }
});

router.get("/id/:stationId/amenities", async (req, res) => {
    Station.findOne(
        { externalId: req.params.stationId },
        async (err, dbStation) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "Error retrieving nearby places",
                });
            }
            console.log(dbStation);
            const nearbyResults = await buildNearbyResults(dbStation);
            dbStation.amenities = nearbyResults;
            dbStation.save();
            res.json(nearbyResults);
        }
    );
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
                res.status(500).json({
                    success: false,
                    message: "Error adding favorite!",
                });
            }
        } catch (err) {
            res.status(500).json({
                success: false,
                message: "Error adding favorite!",
            });
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
            res.status(500).json({
                success: false,
                message: "Error removing favorite!",
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error removing favorite!",
        });
    }
});

const parseStationForDB = (dbStation, station) => {
    // dbStation.externalId = station.externalId;
    dbStation.lastUpdated = station.lastUpdated;
    dbStation.name = station.name;
    dbStation.address = station.address;
    dbStation.cityStateZip = station.cityStateZip;
    dbStation.latitude = station.latitude;
    dbStation.longitude = station.longitude;
    dbStation.plugTypes = station.plugTypes;
    dbStation.supportNumber = station.supportNumber;
    dbStation.supportEmail = station.supportEmail;
    dbStation.operatingHours = station.operatingHours;
    if (!dbStation.amenities.lastUpdated)
        dbStation.amenities = station.amenities;
};

const saveStationsToDB = (stations) => {
    console.log("saving to DB...");
    stations.forEach((station) => {
        Station.findOne({ externalId: station.ID }, (err, dbStation) => {
            if (dbStation) {
                parseStationForDB(dbStation, station);
                dbStation.save();
            } else {
                Station.create(station);
            }
        });
    });
};

router.post("/:stationId/add-review", async (req, res) => {
    const stationNumber = parseInt(req.body.stationNumber);
    const username = req.body.username;
    const review = req.body.review;
    const isWorking = req.body.isWorking;
    const rating = parseInt(req.body.rating);

    const user = await User.findOne({ username: username });
    const station = await Station.findOne({ externalId: stationNumber });

    if (user && station) {
        console.log("STATION", station);
        try {
            const stationResponse = await station.reviews.push({
                user: user,
                review: review,
                rating: rating,
            });
            station.save();

            const userResponse = await user.reviews.push({
                stationId: stationNumber,
                user: username,
                review: review,
                isWorking: isWorking,
                rating: rating,
            });
            user.save();

            console.log("STATION RESPONSE", stationResponse);
            if (stationResponse && userResponse) {
                return res.json({
                    user: userResponse,
                    station: stationResponse,
                });
            }
        } catch (error) {
            return res.json({ error });
        }
    } else {
        res.json({ success: false, message: "Invalid username." });
    }
});

module.exports = router;
