const mongoose = require("mongoose");
const { Schema } = mongoose;

const stationSchema = new mongoose.Schema({
    externalId: String, // id from OCM
    lastUpdated: String, // OCM DataProvider.DateLastImported
    name: String,
    address: String,
    cityStateZip: String,
    latitude: Number, // OCM lat/lng - rounded to nearest tenth
    longitude: Number,
    plugTypes: [{}],
    supportNumber: String,
    supportEmail: String,
    reviews: [
        {
            review: String,
            rating: Number,
            isWorking: Boolean,
            user: {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        },
    ],
    operatingHours: String,
    amenities: {
        lastUpdated: Number, //when search was last performed - Date.now() milliseconds
        restaurants: [],
        entertainment: [],
        stores: [],
    },
});

const Station = mongoose.model("Station", stationSchema);

module.exports = Station;
