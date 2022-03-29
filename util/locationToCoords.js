
require("dotenv").config();
const axios = require('axios');

const latLongFromLocation = async (location) => {
    try {
        console.log('fetching data...')
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?key=${process.env.GOOGLE_MAPS_API_KEY}&address=${location}&region=us`);
        const lat = parseFloat(response.data.results[0].geometry.location.lat.toFixed(1));
        const lng = parseFloat(response.data.results[0].geometry.location.lng.toFixed(1));
        console.log(lat, lng);
        return { lat: lat, lng: lng };
    } catch (err) {
        console.log(err);
    }
};

module.exports = latLongFromLocation;


