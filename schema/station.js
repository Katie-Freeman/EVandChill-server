
const mongoose = require('mongoose');
const { Schema } = mongoose;

const stationSchema = new mongoose.Schema({
  externalId: String, // id from OCM
  lastUpdated: String, // OCM DataProvider.DateLastImported
  name: String,
  address: String,
  latitude: Number, // OCM lat/lng - rounded to nearest tenth
  longitude: Number,
  images: [
    {
      imageUrl: String,
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  plugTypes: [
    // {
    //     type: String,
    //     speed: Number,
    //     quantity: Number
    // }
  ],
  supportNumber: String,
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
    gasStations: [
      {
        name: String,
        address: String,
        location: String,
      },
    ],
    groceryStores: [
      {
        name: String,
        address: String,
        location: String,
      },
    ],
  },
});

const Station = mongoose.model('Station', stationSchema);

module.exports = Station;
