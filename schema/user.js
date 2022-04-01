const mongoose = require('mongoose')
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    favorites: [
        {
            stationId: Number,
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    ],
    reviews: [
        {
            stationId: Number,
            review: String,
            rating:Number,
            isWorking:Boolean,
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    ]

})

const User = mongoose.model('User', userSchema)

module.exports = User;
