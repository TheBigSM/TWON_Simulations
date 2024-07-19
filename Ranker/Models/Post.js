const { Decimal128, Double } = require('mongodb');
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
userId: {
    type: String,
    required: true
},
desc: {
    type: String,
    required: true,
    max: 500
},
img:{
    type: String
},
reposts: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Repost'
  }],
pool: {
    type: String,
    default: "0"
},
rank: {
    type: Number,
    default: 1000.0
},
likes: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PostLike'
  }],

dislikes: [{
  type: mongoose.Schema.Types.ObjectId, 
  ref: 'PostDislike'
}],
comments:[{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Comment'
    }],
postedBy: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    }},
{timestamps: true}
);

module.exports = mongoose.model('Post', PostSchema);

