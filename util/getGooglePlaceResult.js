const getGooglePlaceResult = async (location, type) => {
    const placeResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=1500&type=${type}&key=${process.env.GOOGLE_PLACES_API_KEY}`
    );
    return placeResponse.data.results;
};

module.exports = getGooglePlaceResult;
