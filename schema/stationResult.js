const mongoose = require("mongoose");
const stationResultSchema = new mongoose.Schema({
    location: String,
    distance: Number,
    response: [{}],
    dateUpdated: Number, //Date.now() milliseconds
});

const StationResult = mongoose.model("StationResult", stationResultSchema);

module.exports = StationResult;
