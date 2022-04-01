const mongoose = require("mongoose");
const { Schema } = mongoose;
const findOrCreate = require("mongoose-find-or-create");

const stationSchema = new mongoose.Schema({
    externalId: String, // id from OCM
    lastUpdated: String, // OCM DataProvider.DateLastImported
    name: String,
    address: String,
    latitude: Number, // OCM lat/lng - rounded to nearest tenth
    longitude: Number,
    plugTypes: [
        // {
        //     type: String,
        //     speed: Number,
        //     quantity: Number
        // }
    ],
    supportNumber: String,
    supportEmail: String,
    reviews: [
        {
            review: String,
            user: {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        },
    ],
    operatingHours: String,
    amenities: {
        lastUpdated: Number, //when search was last performed - Date.now() milliseconds
        restaurants: [
            {
                name: String,
                address: String,
                location: String,
            },
        ],
        entertainment: [
            {
                name: String,
                address: String,
                location: String,
            },
        ],
        stores: [
            {
                name: String,
                address: String,
                location: String,
            },
        ],
    },
});

stationSchema.plugin(findOrCreate);

const Station = mongoose.model("Station", stationSchema);

module.exports = Station;
