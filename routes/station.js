
const express = require("express")
const router = express.Router()
const Station = require('../schemas/station')
const StationResult = require('../schemas/stationResult')
const latLongFromLocation = require('../util/locationToCoords')




