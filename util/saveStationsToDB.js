const Station = require("../schema/station");

const parseStationForDB = (dbStation, station) => {
    dbStation.lastUpdated = station.lastUpdated;
    dbStation.name = station.name;
    dbStation.address = station.address;
    dbStation.cityStateZip = station.cityStateZip;
    dbStation.latitude = station.latitude;
    dbStation.longitude = station.longitude;
    dbStation.plugTypes = station.plugTypes;
    dbStation.supportNumber = station.supportNumber;
    dbStation.supportEmail = station.supportEmail;
    dbStation.operatingHours = station.operatingHours;
    if (!dbStation.amenities.lastUpdated)
        dbStation.amenities = station.amenities;
};

const saveStationsToDB = (stations) => {
    console.log("saving to DB...");
    stations.forEach((station) => {
        Station.findOne(
            { externalId: station.externalId },
            (err, dbStation) => {
                if (dbStation) {
                    parseStationForDB(dbStation, station);
                    dbStation.save();
                } else {
                    Station.create(station);
                }
            }
        );
    });
};

module.exports = saveStationsToDB;
