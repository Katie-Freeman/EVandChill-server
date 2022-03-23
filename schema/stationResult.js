
const mongoose = require('mongoose');

const stationResultSchema = new mongoose.Schema({

    location: String,
    distance: Number,
    response: [
        {
            station: {
                type: Schema.Types.ObjectId,
                ref: 'Station'
            }
        }
    ],
    dateUpdated: Number //Date.now() milliseconds

});

const StationResult = mongoose.model('Station Result', stationResultSchema);

module.exports = StationResult;
