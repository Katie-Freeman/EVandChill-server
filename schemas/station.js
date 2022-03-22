
const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
    externalId: String,
    lastUpdated: String, //HERE lastUpdatedTimestamp
    address: String,
    images: [
        {
            imgageUrl: String,
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
        lastUpdated: String, //when search was last performed
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
