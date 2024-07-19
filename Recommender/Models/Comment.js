const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  body: {
      type: String,
      required: true,
    },
    userId: {
      type:mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: {
      type: String,
      required: true,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'CommentLike'
    }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CommentDislike'
  }],
    postId: {
      type:mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },
},{
  timestamps: true 
});

module.exports = mongoose.model('Comment', CommentSchema);