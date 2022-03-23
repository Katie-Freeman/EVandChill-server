
const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
    externalId: String, //id from HERE
    lastUpdated: String, //HERE lastUpdatedTimestamp
    name: String,
    address: String,
    images: [
        {
            imageUrl: String,
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }

        }
    ],
    plugTypes: [
        {
            type: String,
            speed: String,
            quantity: Number
        }
    ],
    supportNumber: String,
    reviews: [
        {
            review: String,
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }

        }
    ],
    operatingHours: String,
    amenities: {
        lastUpdated: Number, //when search was last performed - Date.now() milliseconds
        restaurants: [
            {
                name: String,
                address: String,
                location: String
            }
        ],
        entertainment: [
            {
                name: String,
                address: String,
                location: String
            }
        ],
        gasStations: [
            {
                name: String,
                address: String,
                location: String
            }
        ],
        groceryStores: [
            {
                name: String,
                address: String,
                location: String
            }
        ]
    }

});

const Station = mongoose.model('Station', stationSchema);

module.exports = Station;
