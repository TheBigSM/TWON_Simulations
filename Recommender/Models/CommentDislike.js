const mongoose = require('mongoose');

const CommentDislike = new mongoose.Schema({
userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
commentId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
}},
{timestamps: true}
);

module.exports = mongoose.model('CommentDislike', CommentDislike);