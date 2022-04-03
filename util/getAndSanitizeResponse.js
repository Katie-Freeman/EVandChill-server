const sanitizeResponseData = require("./sanitizeReponseData");

const getAndSanitizeStationsResponse = async (location, instance) => {
    const stationsResponse = await instance.get(
        `&latitude=${location.lat}&longitude=${location.lng}`
    );
    const sanitizedStations = stationsResponse.data.map((station) =>
        sanitizeResponseData(station)
    );

    return sanitizedStations;
};

module.exports = getAndSanitizeStationsResponse;
