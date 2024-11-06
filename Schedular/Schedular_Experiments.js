const https = require('https');
const fs = require('fs');
const Post = require('./Models/Post.js');
const Comment = require('./Models/Comment.js');
const CommentDislike = require('./Models/CommentDislike.js');
const CommentLike = require('./Models/CommentLike.js');
const PostDislike = require('./Models/PostDislike.js');
const PostLike = require('./Models/PostLike.js');
const Readpost = require('./Models/Readpost.js');
const Repost = require('./Models/Repost.js');
const Subscription = require('./Models/Subscription.js');
const User = require('./Models/User.js');
const Viewpost = require('./Models/Viewpost.js');
const recommender = require('./recommender.js');
const mongoose = require('mongoose');
require('dotenv').config();
const { ObjectId } = require('mongodb');
const axios = require('axios');
const { MongoClient, ServerApiVersion } = require('mongodb');
const serDelayTime = 15000;//0.5 * 60 * 1000;//3*60*1000;
const agentDelayTime = 0.4 * 60 * 1000;//4*60*1000;
const genDelayTime = 2 * 60 * 1000;//20*60*1000;
var serCount = 0
const connectDB = require('./db.js');

const { persona, username, liberal, mistral_7b, mixtral_8_7b, conservative, neutral, agent1, agent2, agent3, agent4, agent5, agent6, agent7, agent8, agent9, agent10, agent11, agent12, agent13, agent14, agent15, agent16, agent17, agent18, agent19, agent20, agent21, agent22, agent23, agent24, agent25, 
agent26, agent27, agent28, agent29, agent30, agent31, agent32, agent33, agent34, agent35,
agent36, agent37, agent38, agent39, agent40, agent41, agent42, agent43, agent44, agent45,
agent46, agent47, agent48, agent49, agent50, agent51, agent52, agent53, agent54, agent55,
agent56, agent57, agent58, agent59, agent60, agent61, agent62, agent63, agent64, agent65,
agent66, agent67, agent68, agent69, agent70, agent71, agent72, agent73, agent74, agent75,
agent76, agent77, agent78, agent79, agent80, agent81, agent82, agent83, agent84, agent85,
agent86, agent87, agent88, agent89, agent90, agent91, agent92, agent93, agent94, agent95,
agent96, agent97, agent98, agent99, agent100, agent101, agent102, agent103, agent104, agent105,
agent106, agent107, agent108, agent109, agent110, agent111, agent112, agent113, agent114, agent115,
agent116, agent117, agent118, agent119, agent120, agent121, agent122, agent123, agent124, agent125,
agent126, agent127, agent128, agent129, agent130, agent131, agent132, agent133, agent134, agent135,
agent136, agent137, agent138, agent139, agent140, agent141, agent142, agent143, agent144, agent145,
agent146, agent147, agent148, agent149, agent150, agent151, agent152, agent153, agent154, agent155,
agent156, agent157, agent158, agent159, agent160, agent161, agent162, agent163, agent164, agent165,
agent166, agent167, agent168, agent169, agent170, agent171, agent172, agent173, agent174, agent175,
agent176, agent177, agent178, agent179, agent180, agent181, agent182, agent183, agent184, agent185,
agent186, agent187, agent188, agent189, agent190, agent191, agent192, agent193, agent194, agent195,
agent196, agent197, agent198, agent199, agent200, agent201, agent202, agent203, agent204, agent205,
agent206, agent207, agent208, agent209, agent210, agent211, agent212, agent213, agent214, agent215,
agent216, agent217, agent218, agent219, agent220, agent221, agent222, agent223, agent224, agent225,
agent226, agent227, agent228, agent229, agent230, agent231, agent232, agent233, agent234, agent235,
agent236, agent237, agent238, agent239, agent240, agent241, agent242, agent243, agent244, agent245,
agent246, agent247, agent248, agent249, agent250, agent251, agent252, agent253, agent254, agent255,
agent256, agent257, agent258, agent259} = require('./Constants.js');
/*var agents = [
{ username: agent1, persona: "academic_writer" }, 
{ username: agent2, persona: "science_journalist2" }, 
{ username: agent3, persona: "academic_communications" },
{ username: agent4, persona: "academic_researcher" }, 
{ username: agent5, persona: "science_journalist"}, 
{ username: agent6, persona: "science_communicator" },
{ username: agent7, persona: "science_editor" }, 
{ username: agent8, persona: "science_writer"}, 
{ username: agent9, persona: "journalist"},
{ username: agent10, persona: "science_journalist3"}, 
{ username: agent11, persona: "science_news_aggregator"}, 
{ username: agent12, persona: "environmental_journalist"},
{ username: agent13, persona: "science_communications_specialist"}, 
{ username: agent14, persona: "science_writer2" }, 
{ username: agent15, persona: "scientific_journalist"},
]*/

var agents = [
  {username: agent1, persona: 'academic communications'},
  {username: agent2, persona: 'academic researcher'},
  {username: agent3, persona: 'academic researcher'},
  {username: agent4, persona: 'academic researcher'},
  {username: agent5, persona: 'academic researcher'},
  {username: agent6, persona: 'academic science'},
  {username: agent7, persona: 'academic science'},
  {username: agent8, persona: 'academic science'},
  {username: agent9, persona: 'academic writer'},
  {username: agent10, persona: 'biologist'},
  {username: agent11, persona: 'biology'},
  {username: agent12, persona: 'biotechnology researcher'},
  {username: agent13, persona: 'climate science'},
  {username: agent14, persona: 'editor'},
  {username: agent15, persona: 'editor'},
  {username: agent16, persona: 'editor'},
  {username: agent17, persona: 'educator'},
  {username: agent18, persona: 'entry-level biology'},
  {username: agent19, persona: 'environmental science'},
  {username: agent20, persona: 'environmental'},
  {username: agent21, persona: 'environmental'},
  {username: agent22, persona: 'general-interest science'},
  {username: agent23, persona: 'journalist'},
  {username: agent24, persona: 'journalist'},
  {username: agent25, persona: 'medical'},
  {username: agent26, persona: 'microbiologist'},
  {username: agent27, persona: 'microbiologist'},
  {username: agent28, persona: 'molecular biologist'},
  {username: agent29, persona: 'news aggregator'},
  {username: agent30, persona: 'research coordinator'},
  {username: agent31, persona: 'science communications'},
  {username: agent32, persona: 'science communicator,'},
  {username: agent33, persona: 'science communicator'},
  {username: agent34, persona: 'science communicator'},
  {username: agent35, persona: 'science communicator'},
  {username: agent36, persona: 'science communicator'},
  {username: agent37, persona: 'science editor'},
  {username: agent38, persona: 'science editor'},
  {username: agent39, persona: 'science editor'},
  {username: agent40, persona: 'science editor'},
  {username: agent41, persona: 'science enthusiast'},
  {username: agent42, persona: 'science journalist'},
  {username: agent43, persona: 'science journalist'},
  {username: agent44, persona: 'science journalist'},
  {username: agent45, persona: 'science journalist'},
  {username: agent46, persona: 'science journalist'},
  {username: agent47, persona: 'science journalist'},
  {username: agent48, persona: 'science journalist'},
  {username: agent49, persona: 'science journalist'},
  {username: agent50, persona: 'science journalist'},
  {username: agent51, persona: 'science journalist'},
  {username: agent52, persona: 'science journalist'},
  {username: agent53, persona: 'science journalist'},
  {username: agent54, persona: 'science journalist'},
  {username: agent55, persona: 'science journalist'},
  {username: agent56, persona: 'science journalist'},
  {username: agent57, persona: 'science journalist'},
  {username: agent58, persona: 'science journalist'},
  {username: agent59, persona: 'science journalist'},
  {username: agent60, persona: 'science journalist'},
  {username: agent61, persona: 'science journalist'},
  {username: agent62, persona: 'science journalist'},
  {username: agent63, persona: 'science journalist'},
  {username: agent64, persona: 'science journalist'},
  {username: agent65, persona: 'science journalist'},
  {username: agent66, persona: 'science journalist'},
  {username: agent67, persona: 'science journalist'},
  {username: agent68, persona: 'science journalist'},
  {username: agent69, persona: 'science journalist'},
  {username: agent70, persona: 'science journalist'},
  {username: agent71, persona: 'science journalist'},
  {username: agent72, persona: 'science journalist'},
  {username: agent73, persona: 'science journalist'},
  {username: agent74, persona: 'science journalist'},
  {username: agent75, persona: 'science journalist'},
  {username: agent76, persona: 'science journalist'},
  {username: agent77, persona: 'science journalist'},
  {username: agent78, persona: 'science journalist'},
  {username: agent79, persona: 'science journalist'},
  {username: agent80, persona: 'science journalist'},
  {username: agent81, persona: 'science journalist'},
  {username: agent82, persona: 'science journalist'},
  {username: agent83, persona: 'science journalist'},
  {username: agent84, persona: 'science journalist'},
  {username: agent85, persona: 'science journalist'},
  {username: agent86, persona: 'science journalist'},
  {username: agent87, persona: 'science journalist'},
  {username: agent88, persona: 'science journalist'},
  {username: agent89, persona: 'science journalist'},
  {username: agent90, persona: 'science journalist'},
  {username: agent91, persona: 'science journalist'},
  {username: agent92, persona: 'science journalist'},
  {username: agent93, persona: 'science journalist'},
  {username: agent94, persona: 'science journalist'},
  {username: agent95, persona: 'science journalist'},
  {username: agent96, persona: 'science journalist'},
  {username: agent97, persona: 'science journalist'},
  {username: agent98, persona: 'science journalist'},
  {username: agent99, persona: 'science journalist'},
  {username: agent100, persona: 'science journalist'},
  {username: agent101, persona: 'science journalist'},
  {username: agent102, persona: 'science journalist'},
  {username: agent103, persona: 'science journalist'},
  {username: agent104, persona: 'science journalist'},
  {username: agent105, persona: 'science journalist'},
  {username: agent106, persona: 'science journalist'},
  {username: agent107, persona: 'science journalist'},
  {username: agent108, persona: 'science journalist'},
  {username: agent109, persona: 'science journalist'},
  {username: agent110, persona: 'science journalist'},
  {username: agent111, persona: 'science journalist'},
  {username: agent112, persona: 'science journalist'},
  {username: agent113, persona: 'science journalist'},
  {username: agent114, persona: 'science journalist'},
  {username: agent115, persona: 'science journalist'},
  {username: agent116, persona: 'science journalist'},
  {username: agent117, persona: 'science journalist'},
  {username: agent118, persona: 'science journalist'},
  {username: agent119, persona: 'science journalist'},
  {username: agent120, persona: 'science journalist'},
  {username: agent121, persona: 'science journalist'},
  {username: agent122, persona: 'science journalist'},
  {username: agent123, persona: 'science journalist'},
  {username: agent124, persona: 'science journalist'},
  {username: agent125, persona: 'science journalist'},
  {username: agent126, persona: 'science journalist'},
  {username: agent127, persona: 'science journalist'},
  {username: agent128, persona: 'science journalist'},
  {username: agent129, persona: 'science journalist'},
  {username: agent130, persona: 'science journalist'},
  {username: agent131, persona: 'science journalist'},
  {username: agent132, persona: 'science journalist'},
  {username: agent133, persona: 'science journalist'},
  {username: agent134, persona: 'science journalist'},
  {username: agent135, persona: 'science journalist'},
  {username: agent136, persona: 'science journalist'},
  {username: agent137, persona: 'science journalist'},
  {username: agent138, persona: 'science journalist'},
  {username: agent139, persona: 'science journalist'},
  {username: agent140, persona: 'science journalist'},
  {username: agent141, persona: 'science journalist'},
  {username: agent142, persona: 'science journalist'},
  {username: agent143, persona: 'science journalist'},
  {username: agent144, persona: 'science journalist'},
  {username: agent145, persona: 'science journalist'},
  {username: agent146, persona: 'science journalist'},
  {username: agent147, persona: 'science journalist'},
  {username: agent148, persona: 'science journalist'},
  {username: agent149, persona: 'science journalist'},
  {username: agent150, persona: 'science journalist'},
  {username: agent151, persona: 'science journalist'},
  {username: agent152, persona: 'science journalist'},
  {username: agent153, persona: 'science journalist'},
  {username: agent154, persona: 'science journalist'},
  {username: agent155, persona: 'science journalist'},
  {username: agent156, persona: 'science journalist'},
  {username: agent157, persona: 'science news'},
  {username: agent158, persona: 'science news'},
  {username: agent159, persona: 'science news'},
  {username: agent160, persona: 'science news'},
  {username: agent161, persona: 'science news'},
  {username: agent162, persona: 'science news'},
  {username: agent163, persona: 'science news'},
  {username: agent164, persona: 'science news'},
  {username: agent165, persona: 'science news'},
  {username: agent166, persona: 'science news'},
  {username: agent167, persona: 'science news'},
  {username: agent168, persona: 'science news'},
  {username: agent169, persona: 'science reporter'},
  {username: agent170, persona: 'science researcher'},
  {username: agent171, persona: 'science researcher'},
  {username: agent172, persona: 'science writer'},
  {username: agent173, persona: 'science writer'},
  {username: agent174, persona: 'science writer'},
  {username: agent175, persona: 'science writer'},
  {username: agent176, persona: 'science writer'},
  {username: agent177, persona: 'science writer'},
  {username: agent178, persona: 'science writer'},
  {username: agent179, persona: 'science writer'},
  {username: agent180, persona: 'science writer'},
  {username: agent181, persona: 'science writer'},
  {username: agent182, persona: 'science writer'},
  {username: agent183, persona: 'science writer'},
  {username: agent184, persona: 'science writer'},
  {username: agent185, persona: 'science writer'},
  {username: agent186, persona: 'science writer'},
  {username: agent187, persona: 'science writer'},
  {username: agent188, persona: 'science writer'},
  {username: agent189, persona: 'science writer'},
  {username: agent190, persona: 'science writer'},
  {username: agent191, persona: 'science writer'},
  {username: agent192, persona: 'science writer'},
  {username: agent193, persona: 'science writer'},
  {username: agent194, persona: 'science writer'},
  {username: agent195, persona: 'science writer'},
  {username: agent196, persona: 'science writer'},
  {username: agent197, persona: 'science writer'},
  {username: agent198, persona: 'science writer'},
  {username: agent199, persona: 'science writer'},
  {username: agent200, persona: 'science writer'},
  {username: agent201, persona: 'science writer'},
  {username: agent202, persona: 'science writer'},
  {username: agent203, persona: 'science writer'},
  {username: agent204, persona: 'science writer'},
  {username: agent205, persona: 'science writer'},
  {username: agent206, persona: 'science writer'},
  {username: agent207, persona: 'science writer'},
  {username: agent208, persona: 'science writer'},
  {username: agent209, persona: 'science writer'},
  {username: agent210, persona: 'science writer'},
  {username: agent211, persona: 'science writer'},
  {username: agent212, persona: 'science writer'},
  {username: agent213, persona: 'science writer'},
  {username: agent214, persona: 'science writer'},
  {username: agent215, persona: 'science writer'},
  {username: agent216, persona: 'science writer'},
  {username: agent217, persona: 'science writer'},
  {username: agent218, persona: 'science writer'},
  {username: agent219, persona: 'science writer'},
  {username: agent220, persona: 'science writer'},
  {username: agent221, persona: 'science writer'},
  {username: agent222, persona: 'science writer'},
  {username: agent223, persona: 'science writer'},
  {username: agent224, persona: 'science writer'},
  {username: agent225, persona: 'science writer'},
  {username: agent226, persona: 'science writer'},
  {username: agent227, persona: 'science writer'},
  {username: agent228, persona: 'science writer'},
  {username: agent229, persona: 'science writer'},
  {username: agent230, persona: 'science writer'},
  {username: agent231, persona: 'science writer'},
  {username: agent232, persona: 'science writer'},
  {username: agent233, persona: 'science writer'},
  {username: agent234, persona: 'science writer'},
  {username: agent235, persona: 'science writer'},
  {username: agent236, persona: 'science writer'},
  {username: agent237, persona: 'science writer'},
  {username: agent238, persona: 'science writer'},
  {username: agent239, persona: 'science writer'},
  {username: agent240, persona: 'science writer'},
  {username: agent241, persona: 'science writer'},
  {username: agent242, persona: 'science writer'},
  {username: agent243, persona: 'science technology'},
  {username: agent244, persona: 'science'},
  {username: agent245, persona: 'science'},
  {username: agent246, persona: 'science'},
  {username: agent247, persona: 'science'},
  {username: agent248, persona: 'science'},
  {username: agent249, persona: 'science'},
  {username: agent250, persona: 'science'},
  {username: agent251, persona: 'science'},
  {username: agent252, persona: 'science'},
  {username: agent253, persona: 'science'},
  {username: agent254, persona: 'scientific editor'},
  {username: agent255, persona: 'scientific journalist'},
  {username: agent256, persona: 'scientific journalist'},
  {username: agent257, persona: 'scientific research'},
  {username: agent258, persona: 'scientific researcher'},
  {username: agent259, persona: 'scientist'}
]

model = "mistral:7b-instruct-v0.2-q6_K";
//topic = "Ukraine war"
topic = "What are the implications of the recent violence between Israel and Palestine for Middle East peace efforts?" 

ResearchQuestion = "How does the framing of scientific information in media impact public understanding and perception of scientific issues?";

const myLogger = (function() {
  function log(...args) {
      const timestamp = new Date().toISOString();
      console.log(`[myLogger ${timestamp}]`, ...args);
  }

  return {
      log
  };
})();

const responseLogger = (function() {
  function log(...args) {
      const timestamp = new Date().toISOString();
      console.log(`[responseLogger ${timestamp}]`, ...args);
  }

  return {
      log
  };
})();


//myLogger.log(agent1)
//myLogger.log(agents.length)

mongoose.Promise = global.Promise;
const { exec } = require('child_process');

var POST_ID_REPLY = ""

function pauseFor(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
}


function isEmpty(obj) {
  if (obj === undefined) { return true }
  return Object.keys(obj).length === 0;
}

function clean(obj) {
  for (var propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined) {
      delete obj[propName];
    }
  }
  return obj
}



removeUndefined = function (json) {
  return JSON.parse(JSON.stringify(json, (k, v) => Array.isArray(v) ? v.filter(e => e !== null) : v, 2));
}

filteredComments = function (json) {
  filtered = json.filter(x => x != null);
  return filtered
}


var express = require('express');
var app = express();
app.get('/', function (req, res) {
  res.send('Hello World!');
});


async function add_A_Post(txt, userId) {
  if (txt.length > 0) {
    const post = new Post({ desc: txt, userId: userId, rank: 1000.0, pool: "0", "likes": [], "dislikes": [], "comments": [], 'createdAt': new Date(), 'updatedAt': new Date(), '__v': 0 });
    try {
      await post.save();
      responseLogger.log('The post has been added');

    } catch (err) {
      responseLogger.log(err);

    }
  }
}

async function add_As_Read(txt, userId) {
  if (txt.length > 0) {
    const post = new Post({ desc: txt, userId: userId, rank: 1000.0, pool: "0", "likes": [], "dislikes": [], "comments": [], 'createdAt': new Date(), 'updatedAt': new Date(), '__v': 0 });
    try {
      await post.save();
      responseLogger.log('The post has been added');

    } catch (err) {
      responseLogger.log(err);

    }
  }
}



async function add_A_Comment(txt, userId, postId, username) {
  if (txt.length > 0) {
    const comment = new Comment({ body: txt, userId: userId, postId: postId, username: username });
    try {
      await comment.save();
      const post = await Post.findById(postId);
      await post.updateOne({ $push: { comments: comment } });
      responseLogger.log('The comment has been added');

    } catch (err) {
      responseLogger.log(err);

    }
  }
}

async function getFollowingsAndFollowers(agentUserId) {
  responseLogger.log("getFollowingsAndFollowers")
    responseLogger.log(agentUserId)
    const user = await User.findById(agentUserId);
    if (!user) {
      console.log("User not found");
      return;
    }

    // Get the list of followings and followers
    const followings = user.followings;
    const followers = user.followers;

    // Combine followings and followers into a single array
    const combinedUsers = [...followings, ...followers];
    responseLogger.log("Total Followings and followers");
    responseLogger.log(combinedUsers.length);
    
    return combinedUsers
}


async function like_A_Comment(userId, commentId) {
  const comment = await Comment.findById(commentId).populate([{ path: "likes", model: "CommentLike", match: { "userId": userId } }, { path: "dislikes", model: "CommentDislike", match: { "userId": userId } }]).sort({ createdAt: 'descending' }).exec();

  var isAlreadyLiked = false;
  var isAlreadyDisliked = false;

  if (comment.likes.length > 0) {
    const idl = new ObjectId(comment.likes[0]._id)
    isAlreadyLiked = true
    try {
      //myLogger.log("LIKE - 1");
      await Comment.findOneAndUpdate({ _id: commentId }, { $pull: { 'likes': { $in: [idl] } } })
      await CommentLike.findByIdAndDelete({ _id: idl });
      responseLogger.log("DONE - LIKE - 1")
    } catch (err) {
      responseLogger.log(err);
    }
  }

  if (comment.dislikes.length > 0) {
    const idl = new ObjectId(comment.dislikes[0]._id)
    isAlreadyDisliked = true
    try {
      //myLogger.log("LIKE - 2");
      await Comment.findOneAndUpdate({ _id: commentId }, { $pull: { 'dislikes': { $in: [idl] } } });
      await CommentLike.findByIdAndDelete({ _id: idl });
      responseLogger.log("DONE - LIKE - 2")
    } catch (err) {

      responseLogger.log(err);
    }
  }

  if (!isAlreadyLiked) {
    if (!isAlreadyDisliked) {
      try {
        //myLogger.log("LIKE - 3");
        const commentLike = new CommentLike({ userId: userId, commentId: commentId });
        await commentLike.save();
        //myLogger.log("Commentlike is added");
        const comment = await Comment.findById(commentId);
        await comment.updateOne({ $push: { likes: commentLike } });
        responseLogger.log("DONE - LIKE - 3");

      } catch (err) {
        responseLogger.log(err);

      }
    } else {
      //myLogger.log("Both are not false");
    }
  } else {
  }
}

async function dislike_A_Comment(commentId, userId) {
  const comment = await Comment.findById(commentId).populate([{ path: "likes", model: "CommentLike", match: { "userId": userId } }, { path: "dislikes", model: "CommentDislike", match: { "userId": userId } }]).sort({ createdAt: 'descending' }).exec();

  var isAlreadyLiked = false;
  var isAlreadyDisliked = false;

  if (comment.likes.length > 0) {
    const idl = new ObjectId(comment.likes[0]._id)
    isAlreadyLiked = true
    try {
      //myLogger.log("DISLIKE - 1");

      Comment.findOneAndUpdate({ _id: commentId }, { $pull: { 'likes': { $in: idl } } }, (err, block) => {
        //myLogger.log(err)
        //myLogger.log(block)
      });
      const dltobj = await CommentLike.findByIdAndDelete({ _id: idl }, (err, block) => {
        //myLogger.log(err)
        //myLogger.log(block)
      });
      const comment = await Comment.findById(commentId).populate([{ path: "likes", model: "CommentLike" }, { path: "dislikes", model: "CommentDislike" }]).sort({ createdAt: 'descending' }).exec();
      var diction = { "likes": -1, "dislikes": parseInt(0) }
      responseLogger.log("DONE - DISLIKE - 1")

    } catch (err) {
      responseLogger.log(err);
    }
  }

  if (comment.dislikes.length > 0) {
    const idl = new ObjectId(comment.dislikes[0]._id)
    isAlreadyDisliked = true
    try {
      //myLogger.log("DISLIKE - 2");

      Comment.findOneAndUpdate({ _id: commentId }, { $pull: { 'dislikes': { $in: idl } } }, (err, block) => {
        //myLogger.log(err)
        //myLogger.log(block)
      });

      const dltobj = await CommentLike.findByIdAndDelete({ _id: idl }, (err, block) => {
        //myLogger.log(err)
        //myLogger.log(block)
      });
      const comment = await Comment.findById(commentId).populate([{ path: "likes", model: "CommentLike" }, { path: "dislikes", model: "CommentDislike" }]).sort({ createdAt: 'descending' }).exec();
      var diction = { "likes": parseInt(0), "dislikes": -1 }
      responseLogger.log("DONE - DISLIKE - 2")
    } catch (err) {
      responseLogger.log(err)

    }
  }

  if (!isAlreadyLiked) {
    if (!isAlreadyDisliked) {
      try {
        //myLogger.log("DISLIKE - 3");
        const commentDislike = new CommentDislike({ userId: userId, commentId: commentId });
        await commentDislike.save();
        //myLogger.log("commentDislike is added");

        const comment = await Comment.findById(commentId);
        await comment.updateOne({ $push: { dislikes: commentDislike } });
        const comment2 = await Comment.findById(commentId).populate([{ path: "likes", model: "CommentLike" }, { path: "dislikes", model: "CommentDislike" }]).sort({ createdAt: 'descending' }).exec();
        //myLogger.log("Comment is liked");
        var diction = { "likes": parseInt(0), "dislikes": 1 }
        responseLogger.log("DONE - DISLIKE - 3")

      } catch (err) {
        responseLogger.log(err);
      }
    } else {
      //myLogger.log("Both are not false");
    }
  } else {
  }

}

async function like_A_Post(userId, postId) {
  const post = await Post.findById(postId).populate([{ path: "likes", model: "PostLike", match: { "userId": userId } }, { path: "dislikes", model: "PostDislike", match: { "userId": userId } }]).sort({ createdAt: 'descending' }).exec();

  var isAlreadyLiked = false;
  var isAlreadyDisliked = false;

  if (post?.likes?.length > 0) {
    isAlreadyLiked = true
    try {
      //myLogger.log("Not Added - LIKE - 1");
      const idl = new ObjectId(post.likes[0]._id)
      //myLogger.log(idl);
      await Post.findOneAndUpdate({ _id: postId }, { $pull: { 'likes': { $in: [idl] } } });
      await PostLike.findByIdAndDelete({ _id: idl });
      //myLogger.log("Not Added - DONE - LIKE - 1")
    } catch (err) {
      //myLogger.log(err);
    }
  }

  else if (post?.dislikes?.length > 0) {
    isAlreadyDisliked = true
    try {
      //myLogger.log("Not Added - LIKE - 2");
      const idl = new ObjectId(post.dislikes[0]._id)
      Post.findOneAndUpdate({ _id: postId }, { $pull: { 'dislikes': { $in: idl } } }, (err, block) => {
        //myLogger.log(err)
        //myLogger.log(block)
      });

      const dltobj = await PostLike.findByIdAndDelete(idl, (err, block) => {
        //myLogger.log(err)
        //myLogger.log(block)
      });
      //myLogger.log("Not Added - DONE - LIKE - 2")

    } catch (err) {
      //myLogger.log(err);

    }
  }

  if (!isAlreadyLiked) {
    if (!isAlreadyDisliked) {
      try {
        //myLogger.log("LIKE - 3");
        const postLike = new PostLike({ userId: userId, postId: postId });
        await postLike.save();
        //myLogger.log("postLike is added");
        await Post.findOneAndUpdate({ "_id": postId }, { $push: { likes: postLike } });
        responseLogger.log("DONE - LIKE - 3")

      } catch (err) {
        responseLogger.log(err);

      }
    } else {
      //myLogger.log("Not Added - Both are not false");
    }
  } else {
  }
}

async function dislike_A_Post(postId, userId) {
  const post = await Post.findById(postId).populate([{ path: "likes", model: "PostLike", match: { "userId": userId } }, { path: "dislikes", model: "PostDislike", match: { "userId": userId } }]).sort({ createdAt: 'descending' }).exec();

  var isAlreadyLiked = false;
  var isAlreadyDisliked = false;

  if (post.likes.length > 0) {
    const idd = post.likes[0]._id
    isAlreadyLiked = true
    try {

      //myLogger.log("DISLIKE - 1");
      const idl = new ObjectId(idd);
      Post.findOneAndUpdate({ _id: postId }, { $pull: { 'likes': { $in: idl } } }, (err, block) => {
        //myLogger.log(err)
        //myLogger.log(block)
      });
      const dltobj = await PostLike.findByIdAndDelete({ _id: idl }, (err, block) => {
        //myLogger.log(err)
        //myLogger.log(block)

      });

      const post = await Post.findById(postId).populate([{ path: "likes", model: "PostLike" }, { path: "dislikes", model: "PostDislike" }]).sort({ createdAt: 'descending' }).exec();
      var diction = { "likes": -1, "dislikes": parseInt(0) }
      //myLogger.log("DONE - DISLIKE - 1")


    } catch (err) {
      //myLogger.log(err);
    }
  } else if (post.dislikes.length > 0) {
    isAlreadyDisliked = true
    try {
      //myLogger.log("DISLIKE - 2");
      const idl = new ObjectId(post.dislikes[0]._id)
      Post.findOneAndUpdate({ _id: postId }, { $pull: { 'dislikes': { $in: idl } } }, (err, block) => {
        //myLogger.log(err)
        //myLogger.log(block)
      });

      const dltobj = await PostLike.findByIdAndDelete(idl, (err, block) => {
        //myLogger.log(err)
        //myLogger.log(block)
      });
      const post2 = await Post.findById(postId).populate([{ path: "likes", model: "PostLike" }, { path: "dislikes", model: "PostDislike" }]).sort({ createdAt: 'descending' }).exec();
      var diction = { "likes": parseInt(0), "dislikes": -1 }
      //myLogger.log("DONE - DISLIKE - 2")

    } catch (err) {
      //myLogger.log(err);

    }
  }

  if (!isAlreadyLiked) {
    if (!isAlreadyDisliked) {
      try {
        //myLogger.log("DISLIKE - 3");
        const postDislike = new PostDislike({ userId: userId, postId: postId });
        await postDislike.save();

        const post = await Post.findById(postId);
        await post.updateOne({ $push: { dislikes: postDislike } });
        const post2 = await Post.findById(postId).populate([{ path: "likes", model: "PostLike" }, { path: "dislikes", model: "PostDislike" }]).sort({ createdAt: 'descending' }).exec();
        ////myLogger.log(post2);
        var diction = { "likes": parseInt(0), "dislikes": 1 }
        responseLogger.log("DONE - DISLIKE - 3")
      } catch (err) {
        responseLogger.log(err);
      }
    } else {

      //myLogger.log("Both are not false");
    }
  } else {
  }

}


async function get_Interactions_Agent_on_Posts(agnt, res) {
  posts_req = []
  const posts = await Post.find({ "userId": agnt.userId }).sort({ createdAt: -1 }).limit(5).exec();
  for (const p of posts) {
    posts_req.push({ 'action': "wrote", 'message': p["desc"] })

  }

  const postLikes = await PostLike.find({ "userId": agnt.userId }).sort({ createdAt: -1 }).limit(5).exec();
  for (const com of postLikes) {
    po = await Post.find({ "postId": com["postId"] })

    for (const p of po) {
      posts_req.push({ 'action': "liked", 'message': p["desc"] })

    }
  }

  res = posts_req
  return res
};

async function get_Interactions_Agent_on_Comments(agnt) {
  posts_req = []
  const comments = await Comment.find({ "userId": agnt._id }).sort({ createdAt: -1 }).limit(1).exec();

  for (const c of comments) {
    posts_req.push({ 'action': "wrote", 'message': c["body"] })

  }

  const commentLikes = await CommentLike.find({ "userId": agnt._id }).sort({ createdAt: -1 }).limit(5).exec();

  for (const com of commentLikes) {
    co = await Comment.find({ "_id": com["commentId"] })

    for (const c of co) {
      posts_req.push({ 'action': "liked", 'message': c["body"] })

    }
  }

  return posts_req
};

function addslashes(str) {
  return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

async function get_thread_Agent_on_Comments(agnt) {

  posts_thread = []
  posts_req = []


  const today = new Date();
  const Ffth_before = new Date();
  Ffth_before.setDate(today.getDate() - 60);
  Ffth_before.setHours(0, 0, 0, 0);

  const query = {
    "createdAt": {
      $lt: today,
      $gte: Ffth_before
    }
  };
  ;
  await Post.find().populate({ path: "comments", model: "Comment" }).sort({ rank: -1 }).limit(1).exec().then(async (posts) => {
    var count = 0;
    for (const p in posts) {
      const post = posts[p]
      POST_ID_REPLY = post.id;
      const u = await User.find({ "_id": new ObjectId(post.userId) })
      const post_author = u[0];

      if (post_author) {
        for (const comm in post.comments) {
          const post_com = post.comments[comm]

          if (post_com) {
            const msg = { "author": post_com.username, "message": '"' + (post_com.body).replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0') + '"' }
            posts_req.push(msg);
          }
        }
        if (posts_req.length == 0) {
          posts_req.push({ "author": post_author.username, "message": '"' + (post.desc).replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0') + '"' });
        }
      }
    }

  });
  if (posts_req.length > 0) {
    posts_thread = { "posts": posts_req };
  }
  return posts_thread
};

function delayedFunction() {

}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));

}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


async function agent_Like_Comment_Loop(randomAgent) {
  responseLogger.log("agent_Like_Comment_Loop");
  mongoose.connect(process.env.DB_URL, { useNewUrlParser: true }).then(async (req, res) => {
    //myLogger.log("Successfully connected to the database");
    const today = new Date();
    const Ffth_before = new Date();
    Ffth_before.setDate(today.getDate() - 30);
    Ffth_before.setHours(0, 0, 0, 0);
    
    const agnts = await User.find({ username: randomAgent[username] })
    const agnt = agnts[0]

    //const query = { "createdAt": { $lt: today, $gte: Ffth_before } };
    responseLogger.log(agnt);
    responseLogger.log(agnt._id);
    
    //const result = await recommender.fetchAllPosts({"userId": await getFollowingsAndFollowers(agnt._id)});
    //responseLogger.log(result);
    
    Comment.find({ userId: { $in: await getFollowingsAndFollowers(agnt._id) }, "createdAt": { $lt: today, $gte: Ffth_before }}).sort({ updatedAt: 1 }).limit(1).then(async (comments) => {
      var count = 0;
      for (const comm in comments) {
        //myLogger.log(count + 1);
        const comment = comments[comm]
        const u = await User.find({ "_id": new ObjectId(comment["userId"]) })
        const usr = u[0];

        const p = await Post.find({ "_id": new ObjectId(comment["postId"]) })
        const pst = p[0];
        
        const agnts = await User.find({ username: randomAgent[username]})
        const agnt = agnts[0];

                  //myLogger.log("AGENT");
                  //myLogger.log(agent_count + 1);

                  const msg = { "author": usr.username, "message": comment["body"] }
                  const interactions = await get_Interactions_Agent_on_Comments(agnt);
                  jsn = {
                    "post": msg, "history": { interactions }, "integration": { "model": model, "provider": "together" },
                    "language": "English", persona: [randomAgent["persona"]], "platform": "Twitter"
                  }
                  await delay(2000);
                  const jsonContent = JSON.stringify(jsn);
                  const agent_would_you_like = async (jsonContent) => {
                    await fetch(process.env.AGENTS_URL + "like/", {
                      method: "POST",
                      path: '/like',
                      headers: { "Content-Type": "application/json", "Content-Type": "application/json;charset=UTF-8", "User-Agent": "node-fetch" },
                      body: jsonContent,
                    })
                      .then(function json(response) {
                        return response()
                      })
                      .then((res) => {
                        //myLogger.log("Comment -like - response ****");
                        myLogger.log(res);
                        if (res) {
                          like_A_Comment(agnt._id, comment["_id"]);
                        }
                      }).catch((err) => {
                        //myLogger.log("err1");
                        //myLogger.log(err);

                      });
                  };
                  agent_would_you_like(jsonContent);
                }
    });

  }).catch(err => {
    //myLogger.log('Could not connect to the database. Exiting now...', err);
    process.exit();
  });
};

async function agent_Like_Post_Loop(randomAgent) {
  //responseLogger.log("agent_Like_Post_Loop");
  mongoose.connect(process.env.DB_URL, { useNewUrlParser: true }).then(async (req, res) => {
    //responseLogger.log("Successfully connected to the database");
    const databaseName = "";

    const today = new Date();
    const Ffth_before = new Date();
    Ffth_before.setDate(today.getDate() - 30);
    Ffth_before.setHours(0, 0, 0, 0);
    const agnts = await User.find({ username: randomAgent[username] })
    const agnt = agnts[0]
    //const query = { "createdAt": { $lt: today, $gte: Ffth_before } };
    //responseLogger.log(agnt);
    //responseLogger.log(agnt._id);
    
    //const result = await recommender.fetchAllPosts({"userId": await getFollowingsAndFollowers(agnt._id)});
    //responseLogger.log(result);
    Post.find({"userId": await getFollowingsAndFollowers(agnt._id)}).sort({ rank: 1 }).limit(1).then(async (posts) => {
      var count = 0;
      for (const p in posts) {
        const post = posts[p]
        const u = await User.find({ "_id": new ObjectId(post["userId"])})
        const usr = u[0];
        const msg = { "author": usr.username, "message": post["desc"] }
        const interactions = await get_Interactions_Agent_on_Posts(async (agnt, interact) => { });
        jsn = {"post": msg, "history": { interactions }, "integration": { "model": model, "provider": "together" },
                  "language": "English", persona: [randomAgent["persona"]], "platform": "Twitter"
        }
                 //myLogger.log(jsn)
                const jsonContent = JSON.stringify(jsn);
                ////myLogger.log(jsonContent);
                const agent_would_you_like = async (jsonContent) => {

                  await fetch(process.env.AGENTS_URL + "like/", {
                    method: "POST",
                    path: '/like',
                    headers: { "Content-Type": "application/json", "Content-Type": "application/json;charset=UTF-8", "User-Agent": "node-fetch" },
                    body: jsonContent,
                  }).then(function json(response) {
                      return response()
                    }).then((res) => {
                      //myLogger.log(res["statusText"]);
                      //myLogger.log(res)
                      if (res) {
                        //myLogger.log(res)
                        like_A_Post(agnt._id, post["_id"]);
                      }
                    }).catch((err) => {
                      //myLogger.log("err2");
                      //myLogger.log(err);

                    });
                };
                agent_would_you_like(jsonContent);
                //await delay(agentDelayTime);
                //await pauseFor(agentDelayTime);
              }
    });
  }).catch(err => {
    //myLogger.log('Could not connect to the database. Exiting now...', err);
    process.exit();
  });
};

async function agent_Reply_Comment_Loop(randomAgent) {
  try {
    responseLogger.log("agent_Reply_Comment_Loop");
    

    const today = new Date();
    const Ffth_before = new Date();
    Ffth_before.setDate(today.getDate() - 60);
    Ffth_before.setHours(0, 0, 0, 0);

    const agnts = await User.find({ username: randomAgent.username });
    const agnt = agnts[0];
    
    responseLogger.log(randomAgent.username);
    
    if (agnt) {
      const post = await Post.findOne()
      .populate({ path: "comments", model: "Comment" })
      .sort({ createdAt: -1 })
      .exec();

      //for (const post of posts) {
        const user = await User.findById(post.userId);
        
        const interactions = await get_Interactions_Agent_on_Comments(agnt);
        const interact = await get_thread_Agent_on_Comments(agnt);

        const jsn = {
          "history": { interactions },
          "integration": { "model": model, "provider": "together" },
          "language": "English",
          "length": "few-word",
          persona: [randomAgent.persona],
          "platform": "Twitter",
          "thread": interact
        };

        const jsonContent = JSON.stringify(jsn);
        responseLogger.log(jsonContent);

        const res = await fetch(process.env.AGENTS_URL + "reply/", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json;charset=UTF-8", 
            "User-Agent": "node-fetch",
            "accept": "application/json"
          },
          body: jsonContent,
        })

        if (res.ok) {
          const responseData = await res.json(); // Parse the JSON from the response
          myLogger.log(responseData);
  
          // Check if response has the required 'response' field
          if (responseData.response) {
            await add_A_Comment(responseData.response, agnt.id, POST_ID_REPLY, agnt.username);
          }
        } else {
          // Log if response is not ok
          myLogger.log(`Error in fetch: ${res.statusText}`);
        }
      }
  } catch (err) {
    myLogger.log("Error in agent_Reply_Comment_Loop:", err);
  }
}


/*async function agent_Reply_Comment_Loop(randomAgent) {
  try {
  responseLogger.log("agent_Reply_Comment_Loop");

    const today = new Date();
    const Ffth_before = new Date();
    Ffth_before.setDate(today.getDate() - 60);
    Ffth_before.setHours(0, 0, 0, 0);
    ////myLogger.log(today)
    ////myLogger.log(Ffth_before)
    const agnts = await User.find({ username: randomAgent[username]});
    const agnt = agnts[0];
    //responseLogger.log(agnt);
    //responseLogger.log(agnt._id);
    
    //const result = await recommender.fetchAllPosts({"userId": await getFollowingsAndFollowers(agnt._id)});
    //responseLogger.log(result);
    //const query = { "createdAt": { $lt: today, $gte: Ffth_before }, "comments": { $exists: true, $ne: [] } };
    Post.find().populate({ path: "comments", model: "Comment" }).sort({ rank: 1 }).limit(1).then(async (posts) => {
      var count = 0;
      //myLogger.log(posts.length);
      for(const p in posts) {
        //myLogger.log("POST");
        //myLogger.log(count + 1);
        const post = posts[p]
        const u = await User.find({ "_id": new ObjectId(post["userId"]) })
        const usr = u[0];

          const agnts = await User.find({ username: randomAgent[username] })
          const agnt = agnts[0]
                const interactions = await get_Interactions_Agent_on_Comments(agnt);
                const interact = await get_thread_Agent_on_Comments(agnt);

                jsn = {
                  "history": { interactions },
                  "integration": { "model": model, "provider": "together" },
                  "language": "English",
                  "length": "few-word",
                  persona: [randomAgent["persona"]],
                  "platform": "Twitter",
                  "thread": interact
                }

                //myLogger.log(jsn);

                const jsonContent = JSON.stringify(jsn);
                responseLogger.log(jsonContent);
                const res = await fetch(process.env.AGENTS_URL + "reply/", {
                    method: "POST",
                    path: '/reply',
                    headers: { "Content-Type": "application/json", "Content-Type": "application/json;charset=UTF-8", "User-Agent": "node-fetch", 'accept': 'application/json' },
                    body: jsonContent,
                  }).then(response => response());
                    //.then(function json(response) {
                    //  return response()
                    //})
                    //.then((res) => {
                      //myLogger.log(res["status"]);
                      myLogger.log(res);
                    //  myLogger.log(res["response"]);
                    if (res.response) {
                        await add_A_Comment(res["response"], agnt.id, POST_ID_REPLY, agnt.username);
                      }
                   // }).catch((err) => {
                      //myLogger.log("err3");
                   //   myLogger.log(err);
                    //});
                
        }
        // }
        count = count + 1
    });
  } catch (err) {
    myLogger.log("Error in agent_Generate_Post_Loop:", err);
  }
}*/

/*(async function agent_Generate_Post_Loop(randomAgent) {
  responseLogger.log("agent_Generate_Post_Loop");
  mongoose.connect(process.env.DB_URL, { useNewUrlParser: true }).then(async (req, res) => {
    //myLogger.log("Successfully connected to the database");
    const today = new Date();
    const Ffth_before = new Date();
    Ffth_before.setDate(today.getDate() - 60);
    Ffth_before.setHours(0, 0, 0, 0);
    ////myLogger.log(today)
    ////myLogger.log(Ffth_before)
    var agent_count = 0;
    const agnts = await User.find({ username: randomAgent[username] })
    const agnt = agnts[0]
    if (agnt) {
    responseLogger.log(agnt);
      responseLogger.log(agnt._id);
      
      //const result = await recommender.fetchAllPosts({"userId": await getFollowingsAndFollowers(agnt._id)});
      //responseLogger.log(result);
      const interactions = await get_Interactions_Agent_on_Comments(agnt);

      jsn = {
          "history": {},
          "integration": { "model": model, "provider": "together" },
          "language": "English", "length": "few-word",
          persona: [randomAgent["persona"]],
          "platform": "Twitter",
          "topic": topic//"Ukraine war" 
      }

        myLogger.log(jsn);

        const jsonContent = JSON.stringify(jsn);
        myLogger.log(jsonContent);

        const agent_would_you_generate = async (jsonContent) => {
          myLogger.log("agent_would_you_generate");
          await fetch(process.env.AGENTS_URL + "generate/", {
            method: "POST",
            path: '/generate',
            headers: { "Content-Type": "application/json", "Content-Type": "application/json;charset=UTF-8", "User-Agent": "node-fetch" },
            body: jsonContent,
          }).then(function json(response) {
              return response()
            }).then((res) => {
              ////myLogger.log(POST_ID_REPLY)
              ////myLogger.log(agnt._id)
              ////myLogger.log(agnt.username)
              //myLogger.log(res["status"]);
              myLogger.log(res);
              myLogger.log(res["response"]);
              if (res["response"]) {
                add_A_Post(res["response"], agnt.id);
              }
            }).catch((err) => {
              myLogger.log("err4");
              myLogger.log(err);
            });
        };
        await agent_would_you_generate(jsonContent);
        //await delay(agentDelayTime);
        //await pauseFor(agentDelayTime);
        //setTimeout(delayedFunction, 100000);

        // }
        // }

        //}
      }
      agent_count = agent_count + 1

  }).catch(err => {
    //myLogger.log('Could not connect to the database. Exiting now...', err);
    process.exit();
  });
};*/

async function agent_Generate_Post_Loop(randomAgent) {
  try {
    responseLogger.log("agent_Generate_Post_Loop");

    // Assuming the mongoose connection is established elsewhere
    const today = new Date();
    const Ffth_before = new Date();
    Ffth_before.setDate(today.getDate() - 60);
    Ffth_before.setHours(0, 0, 0, 0);

    const agnts = await User.find({ username: randomAgent.username });
    const agnt = agnts[0];
    
    if (agnt) {
      responseLogger.log(agnt);
      responseLogger.log(agnt._id);
      
      //const interactions = await get_Interactions_Agent_on_Comments(agnt);

      const jsn = {
        "history": {},
        "integration": { "model": model, "provider": "together" },
        "language": "English",
        "length": "few-word",
        persona: [randomAgent.persona],
        "platform": "Twitter",
        "topic": topic // or any other topic
      };

      myLogger.log(jsn);

      const jsonContent = JSON.stringify(jsn);
      myLogger.log(jsonContent);

      const res = await fetch(process.env.AGENTS_URL + "generate/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json;charset=UTF-8", 
          "User-Agent": "node-fetch" 
        },
        body: jsonContent,
      }).then(response => response());

      myLogger.log(res);
      if (res.response) {
        await add_A_Post(res.response, agnt.id);
      }
    }

  } catch (err) {
    myLogger.log("Error in agent_Generate_Post_Loop:", err);
  }
}


async function add_research_question(randomAgent) {
  try {
    responseLogger.log("add_research_question");
    responseLogger.log(randomAgent.username);

    // Assuming the mongoose connection is established elsewhere
    const today = new Date();
    const Ffth_before = new Date();
    Ffth_before.setDate(today.getDate() - 60);
    Ffth_before.setHours(0, 0, 0, 0);

    const agnts = await User.find({ username: randomAgent.username });
    const agnt = agnts[0];
    
    if (agnt) {
      responseLogger.log(agnt);
      responseLogger.log(agnt._id);
        await add_A_Post(ResearchQuestion, agnt.id);
      //}
    }

  } catch (err) {
    myLogger.log("Error in agent_Generate_Post_Loop:", err);
  }
}




function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.listen(process.env.network_port, function () {
  const myService1 = async (randomAgent) => {
    //responseLogger.log("Bots Service 1 is running after 10 minutes.");
    await agent_Like_Post_Loop(randomAgent);
    serCount = serCount + 1;
    //myLogger.log(serCount);
  };
  const myService2 = async (randomAgent) => {
    responseLogger.log("Bots Service 2 is running after 10 minutes.");
    await agent_Like_Comment_Loop(randomAgent);
    serCount = serCount + 1;
    //myLogger.log(serCount);
  };
  const myService3 = async (randomAgent) => {
    responseLogger.log("Bots Service 3 is running after 10 minutes.");
    await agent_Reply_Comment_Loop(randomAgent);
    serCount = serCount + 1;
    //myLogger.log(serCount);
  };
  const myService4 = async (randomAgent) => {
    responseLogger.log("Bots Service 4 is running after 10 minutes.");
    await agent_Generate_Post_Loop(randomAgent);
    serCount = serCount + 1;
    //myLogger.log(serCount);
  };
  
  //myService4();
  const Run_A_Action = async () => {
    for (let i = 0; i < 1; i++) {
    
      //await agent_Generate_Post_Loop(agents[i]);
      await add_research_question(agents[i]);
      
      for (let j = 0; j < 10000; j++) {
       // if (i == 0) {
          responseLogger.log(j);
          //if (j%3 == 0) {
            responseLogger.log(agents[j%259]);
            await agent_Reply_Comment_Loop(agents[j%259]);
            //} //
          //else if (j%3 == 1) {
           //   await agent_Reply_Comment_Loop(agents[(j)]);
           // } //
          //else if (j%3 == 2) {
           //   await agent_Reply_Comment_Loop(agents[(j)]);
           // } //
        //}
  
        //if (i == 1) {
        //  if (j%3 == 0) await agent_Reply_Comment_Loop(agents[(j%3)]);
        //  if (j%3 == 1) await agent_Reply_Comment_Loop(agents[(j%3)]);
        //  if (j%3 == 2) await agent_Reply_Comment_Loop(agents[(j%3)]);
        //}
  
        //if (i == 2) {
         // if (j%3 == 0) await agent_Reply_Comment_Loop(agents[(j%3)]);
         // if (j%3 == 1) await agent_Reply_Comment_Loop(agents[(j%3)]);
         // if (j%3 == 2) await agent_Reply_Comment_Loop(agents[(j%3)]);
        //}
      }
    }
  };
  
  
   /* try {
  
    var randomAgent = agents[getRandomInt(0, agents.length)];
  
    randAct = getRandomInt(0, 3)
    responseLogger.log(`Random Action ${randAct}!`)
    if (randAct == 0){
      myService1(randomAgent);
    
    } else if(randAct== 1){ 
      myService2(randomAgent);
    
    } else if(randAct== 2){ 
      myService3(randomAgent);
    
    } else if(randAct== 3){ 
      myService4(randomAgent);
    
    }
  } catch (error) {
    responseLogger.log(`Scheduler app Error ${error}!`);
  }*/
  //};
  connectDB().then(() => {
    console.log('MongoDB connected successfully');
    
  Run_A_Action()
  //setInterval(Run_A_Action ,serDelayTime);
  responseLogger.log(`Scheduler app listening on port ${process.env.network_port}!`);
  //process.exit(1); 
  
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1); // Exit if the connection fails
});

});