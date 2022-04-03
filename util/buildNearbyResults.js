const getGooglePlaceResult = require("./getGooglePlaceResult");

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

module.exports = buildNearbyResults;
