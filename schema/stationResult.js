const mongoose = require("mongoose");
const { Schema } = mongoose;
const findOrCreate = require("mongoose-find-or-create");
const stationResultSchema = new mongoose.Schema({
    location: String,
    distance: Number,
    response: [{}],
    dateUpdated: Number, //Date.now() milliseconds
});
stationResultSchema.plugin(findOrCreate);

const StationResult = mongoose.model("Station Result", stationResultSchema);

module.exports = StationResult;
