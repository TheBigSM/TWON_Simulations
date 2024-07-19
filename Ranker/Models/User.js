const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
username: {
    type: String,
    required: true,
    min: 3,
    max: 20,
    unique: true
},
email: {
    type: String,
    required: true,
    max: 50,
    uniquie: true
},
password: {
    type: String,
    required: true,
    min: 6
},
profilePicture: {
    type: String,
    default: '',
},
coverPicture: {
    type: String,
    default: '',
},
followers: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
    }],
followings: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
    }],
viewedPosts:[{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Viewpost'
    }],
readPosts: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Readpost'
}],
activity: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TimeMe'
}],
uniqueId:{
    type: String,
    required: true,
    default: "0"
},
isAdmin: {
    type: Boolean,
    default: false,
},
pool: {
    type: String,
    default: "A"
},
feedValue: {
    type: String,
    default: "0"
},
desc: {
    type: String,
    max: 50,
},
city: {
    type: String,
    max: 50,
},
from: {
    type: String,
    max: 50,
},
relationship: {
    type: String,
    max: 20,
},
},
{timestamps: true}
);

module.exports = mongoose.model('User', UserSchema);

