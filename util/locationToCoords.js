require("dotenv").config();
const axios = require("axios");

const latLongFromLocation = async (location, zip) => {
    try {
        const key = zip ? "components=postal_code:" : "address=";
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?key=${process.env.GOOGLE_MAPS_API_KEY}&${key}${location}&region=us`
        );
        if (response.data.results.length > 0) {
            const lat = parseFloat(
                response.data.results[0].geometry.location.lat
            );
            const lng = parseFloat(
                response.data.results[0].geometry.location.lng
            );
            return { lat: lat, lng: lng };
        } else {
            throw new Error("LocationParseFailure");
        }
    } catch (err) {
        throw new Error("LocationParseFailure");
    }
};

module.exports = latLongFromLocation;
