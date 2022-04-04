require("dotenv").config();
const express = require("express");
const axios = require("axios");
const router = express.Router();
const Station = require("../schema/station");
const StationResult = require("../schema/stationResult");
const User = require("../schema/user");
const latLongFromLocation = require("../util/locationToCoords");
const validateJwt = require("../middleware/validateJwt");
const sanitizeResponseData = require("../util/sanitizeReponseData");
const getAndSanitizeStationsResponse = require("../util/getAndSanitizeResponse");
const buildNearbyResults = require("../util/buildNearbyResults");
const saveStationsToDB = require("../util/saveStationsToDB");

const instance = axios.create({
    baseURL: `https://api.openchargemap.io/v3/poi/?key=${process.env.OCM_API_KEY}&countrycode=US`,
});

// search by zip code, city/state or user's location
router.post("/stations", async (req, res) => {
    const { zip, cityState, latitude, longitude } = req.body;
    let location = { lat: latitude, lng: longitude };

    try {
        if (!location.lat || !location.lng) {
            if (zip) {
                location = await latLongFromLocation(zip, true);
            } else if (cityState) {
                location = await latLongFromLocation(cityState);
            }
        }
        location.lat = parseFloat(location.lat.toFixed(1));
        location.lng = parseFloat(location.lng.toFixed(1));
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
                            await getAndSanitizeStationsResponse(
                                location,
                                instance
                            );
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
                        await getAndSanitizeStationsResponse(
                            location,
                            instance
                        );
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
    } catch (err) {
        if (err.message === "LocationParseFailure") {
            res.status(400).json({
                success: false,
                message: "Unable to resolve location",
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Unable to location stations",
            });
        }
    }
});

router.get("/id/:stationId", async (req, res) => {
    try {
        Station.findOne(
            { externalId: req.params.stationId },
            async (err, dbStation) => {
                if (err) throw new Error("Unable to retrieve station details");
                if (dbStation) {
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
                    Station.create({ sanitizedStation });
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
            if (!dbStation) {
                return res.status(400).json({
                    success: false,
                    message: "Error retrieving nearby places",
                });
            }
            const nearbyResults = await buildNearbyResults(dbStation);
            dbStation.amenities = nearbyResults;
            dbStation.save();
            res.json(nearbyResults);
        }
    );
});

router.post("/add-favorite", validateJwt, async (req, res) => {
    const { stationNumber, title, address } = req.body;

    const user = await User.findById(req.userId);

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

router.delete("/remove-favorite", validateJwt, async (req, res) => {
    const stationNumber = req.body.stationNumber;

    try {
        const success = await User.findByIdAndUpdate(req.userId, {
            $pull: { favorites: { stationId: stationNumber } },
        });
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

router.post("/:stationId/add-review", validateJwt, async (req, res) => {
    const stationNumber = parseInt(req.body.stationNumber);
    const review = req.body.review;
    const isWorking = req.body.isWorking;
    const rating = parseInt(req.body.rating);

    const user = await User.findById(req.userId);
    const station = await Station.findOne({ externalId: stationNumber });

    if (user && station) {
        try {
            const stationResponse = await station.reviews.push({
                user: user,
                review: review,
                rating: rating,
            });
            station.save();

            const userResponse = await user.reviews.push({
                stationId: stationNumber,
                stationName: station.name,
                user: req.userId,
                review: review,
                isWorking: isWorking,
                rating: rating,
            });
            user.save();

            if (stationResponse && userResponse) {
                return res.json({
                    success: true,
                    user: userResponse,
                    station: stationResponse,
                });
            } else {
                throw new Error();
            }
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Failed to save review",
            });
        }
    } else {
        res.json({ success: false, message: "Invalid username." });
    }
});

module.exports = router;
