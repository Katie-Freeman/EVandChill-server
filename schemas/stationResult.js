
const mongoose = require('mongoose');

const stationResultSchema = new mongoose.Schema({

    location: String,
    distance: Number,
    response: [String]

});

const StationResult = mongoose.model('Station Result', stationResultSchema);

module.exports = StationResult;
