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
const io = require('socket.io-client');
const socket = io('http://localhost:3000');

const { persona, username, liberal, mistral_7b, mixtral_8_7b, conservative, neutral, agent1, agent2, agent3, agent4, agent5, agent6, agent7, agent8, agent9, agent10, agent11, agent12, agent13, agent14, agent15 } = require('./Constants.js');
var agents = [
{ username: agent1, persona: liberal }, { username: agent2, persona: conservative }, { username: agent3, persona: neutral },
{ username: agent4, persona: liberal }, { username: agent5, persona: conservative }, { username: agent6, persona: neutral },
{ username: agent7, persona: liberal }, { username: agent8, persona: conservative }, { username: agent9, persona: neutral },
{ username: agent10, persona: liberal }, { username: agent11, persona: conservative }, { username: agent12, persona: neutral },
{ username: agent13, persona: liberal }, { username: agent14, persona: conservative }, { username: agent15, persona: neutral },
]
model = "mistral:7b-instruct-v0.2-q6_K";//"gpt-3.5-turbo";//"gpt-4";// "mistral:7b-instruct-v0.2-q6_K";


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
    responseLogger.log(followings);
    responseLogger.log(followers);

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
      responseLogger.log("Not Added - DONE - LIKE - 1")
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
      responseLogger.log("Not Added - DONE - LIKE - 2")

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
      responseLogger.log("DONE - DISLIKE - 1")


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
      responseLogger.log("DONE - DISLIKE - 2")

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
  const comments = await Comment.find({ "userId": agnt._id }).sort({ createdAt: -1 }).limit(5).exec();

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
  await Post.find().populate({ path: "comments", model: "Comment" }).sort({ rank: 1 }).limit(1).exec().then(async (posts) => {
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
  try {
  responseLogger.log("agent_Like_Comment_Loop");
    const today = new Date();
    const Ffth_before = new Date();
    Ffth_before.setDate(today.getDate() - 30);
    Ffth_before.setHours(0, 0, 0, 0);
    
    responseLogger.log(randomAgent);
    responseLogger.log(username);
    responseLogger.log( randomAgent[username]);
    const agnts = await User.find({ "username": randomAgent["username"] }) 
    const agnt = Array.isArray(agnts) ? agnts[0] : agnts;

    //const query = { "createdAt": { $lt: today, $gte: Ffth_before } };
    responseLogger.log(agnt);
    responseLogger.log(agnt._id);
    const allfofo = await getFollowingsAndFollowers(agnt._id);
    
    const result = await recommender.fetchAllPosts({"userId": allfofo});
    responseLogger.log("result");
    responseLogger.log(result);
    
    const comments = await Comment.find({ userId: { $in: allfofo }, "createdAt": { $lt: today, $gte: Ffth_before }})
        .sort({ updatedAt: -1 })
        .limit(1);
      
      var count = 0;
      for (const comm in comments) {
        //myLogger.log(count + 1);
        const comment = comments[comm]
        const u = await User.find({ "_id": new ObjectId(comment["userId"]) })
        const usr = u[0];

        const p = await Post.find({ "_id": new ObjectId(comment["postId"]) })
        const pst = p[0];
        
        const agnts = await User.find({ username: randomAgent["username"]})
        const agnt = Array.isArray(agnts) ? agnts[0] : agnts;;

                  //myLogger.log("AGENT");
                  //myLogger.log(agent_count + 1);

                  const msg = { "author": usr.username, "message": comment["body"] }
                  const interactions = await get_Interactions_Agent_on_Comments(agnt);
                  jsn = {
                    "post": msg, "history": { interactions }, "integration": { "model": model, "provider": "together" },
                    "language": "English", persona: [randomAgent["persona"]], "platform": "Twitter"
                  }
                  const jsonContent = JSON.stringify(jsn);
                  const res = await fetch(process.env.AGENTS_URL + "like/", {
                      method: "POST",
                      path: '/like',
                      headers: { "Content-Type": "application/json", "Content-Type": "application/json;charset=UTF-8", "User-Agent": "node-fetch" },
                      body: jsonContent,
                    }).then(response => response.json());
                    responseLogger.log(res);
                    if (res.response) {
                          like_A_Comment(agnt._id, comment["_id"]);
                        }
                      }
                    } catch (err) {
                      responseLogger.log("Error in agent_Like_Comment_Loop:", err);
                    }
                  }

async function agent_Like_Post_Loop(randomAgent) {
  try {
  responseLogger.log("agent_Like_Post_Loop");
    const databaseName = "";

    const today = new Date();
    const Ffth_before = new Date();
    Ffth_before.setDate(today.getDate() - 30);
    Ffth_before.setHours(0, 0, 0, 0);
    responseLogger.log(randomAgent);
    responseLogger.log(username);
    responseLogger.log( randomAgent[username]);
    const agnts = await User.find({ username: randomAgent["username"] })
    const agnt = Array.isArray(agnts) ? agnts[0] : agnts;
    //const query = { "createdAt": { $lt: today, $gte: Ffth_before } };
    responseLogger.log(agnt);
    responseLogger.log(agnt._id);
    
    const allfofo = await getFollowingsAndFollowers(agnt._id);
    responseLogger.log(allfofo);
    const result = await recommender.fetchAllPosts({"userId": allfofo});
    responseLogger.log("result");
    responseLogger.log(result);
    
    const posts = await Post.find({"userId":allfofo})
        .populate({ path: "comments", model: "Comment" })
        .sort({ rank: -1 })
        .limit(1);

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
                const res = await fetch(process.env.AGENTS_URL + "like/", {
                    method: "POST",
                    path: '/like',
                    headers: { "Content-Type": "application/json", "Content-Type": "application/json;charset=UTF-8", "User-Agent": "node-fetch" },
                    body: jsonContent,
                }).then(response => response.json());
              responseLogger.log(res);
              if (res.response) {
                        like_A_Post(agnt._id, post["_id"]);
                      }
                    }
                  } catch (err) {
                    responseLogger.log("Error in agent_Like_Post_Loop:", err);
                  }
                }


async function agent_Reply_Comment_Loop(randomAgent) {
  try {
    responseLogger.log("agent_Reply_Comment_Loop");

    const today = new Date();
    const Ffth_before = new Date();
    Ffth_before.setDate(today.getDate() - 60);
    Ffth_before.setHours(0, 0, 0, 0);
    
    responseLogger.log(randomAgent);
    responseLogger.log(username);
    responseLogger.log( randomAgent[username]);

    const agnts = await User.find({ username: randomAgent[username] })
    const agnt =  agnts[0] 
    
    if (agnt) {
      const post = await Post.findOne()
        .populate({ path: "comments", model: "Comment" })
        .sort({ rank: -1 })
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
    responseLogger.log("Error in agent_Reply_Comment_Loop:", err);
  }
}

async function agent_Generate_Post_Loop(randomAgent) {
  try {
  responseLogger.log("agent_Generate_Post_Loop");
    const today = new Date();
    const Ffth_before = new Date();
    Ffth_before.setDate(today.getDate() - 60);
    Ffth_before.setHours(0, 0, 0, 0);
    ////myLogger.log(today)
    ////myLogger.log(Ffth_before)
    var agent_count = 0;
    
    responseLogger.log(randomAgent);
    responseLogger.log(randomAgent["username"]);
    
    const agnts = await User.find({"username": randomAgent[username] })
    responseLogger.log(agnts[0]);
    const agnt =agnts[0]
    if (agnt) {
      responseLogger.log(agnt);
      responseLogger.log(agnt._id);
      
      const allfofo = await getFollowingsAndFollowers(agnt._id);
      
      const result = await recommender.fetchAllPosts({"userId": allfofo});
      responseLogger.log("result");
      responseLogger.log(result);
      const interactions = await get_Interactions_Agent_on_Comments(agnt);

      jsn = {
          "history": { interactions },
          "integration": { "model": model, "provider": "together" },
          "language": "English", "length": "few-word",
          persona: [randomAgent["persona"]],
          "platform": "Twitter",
          "topic": "US elections 2024"//"Ukraine war" 
      }

      responseLogger.log(jsn);

        const jsonContent = JSON.stringify(jsn);
        responseLogger.log(jsonContent);
        responseLogger.log(process.env.AGENTS_URL);

        const res = await fetch(process.env.AGENTS_URL + "generate/", {
            method: "POST",
            path: '/generate',
            headers: { "Content-Type": "application/json", "Content-Type": "application/json;charset=UTF-8", "User-Agent": "node-fetch" },
            body: jsonContent,
        }).then(response => response.json());
              responseLogger.log("res");
              responseLogger.log(res);
              if (res["response"]) {
                add_A_Post(res["response"], agnt.id);
              }
          }
        } catch (err) {
          responseLogger.log("Error in agent_Generate_Post_Loop:", err);
        }
      }


app.listen(process.env.network_port, function () {
  const myService1 = (randomAgent) => {
    //responseLogger.log("Bots Service 1 is running after 10 minutes.");
    agent_Like_Post_Loop(randomAgent);
    serCount = serCount + 1;
    //myLogger.log(serCount);
  };
  const myService2 = (randomAgent) => {
    responseLogger.log("Bots Service 2 is running after 10 minutes.");
    agent_Like_Comment_Loop(randomAgent);
    serCount = serCount + 1;
    //myLogger.log(serCount);
  };
  const myService3 = (randomAgent) => {
    responseLogger.log("Bots Service 3 is running after 10 minutes.");
    agent_Reply_Comment_Loop(randomAgent);
    serCount = serCount + 1;
    //myLogger.log(serCount);
  };
  const myService4 = (randomAgent) => {
    responseLogger.log("Bots Service 4 is running after 10 minutes.");
    responseLogger.log(randomAgent);
    agent_Generate_Post_Loop(randomAgent);
    serCount = serCount + 1;
    //myLogger.log(serCount);
  };
  

  //myService4();

  //Run_A_Action()
  //setInterval(Run_A_Action ,serDelayTime);
  //responseLogger.log(`Scheduler app listening on port ${port}!`);

  const Run_A_Action = async () => {
    try {
      for (let i = 0; i < 50; i++) {
      
          var con = getRandomInt(0, agents.length)
          var randomAgent = agents[con];
  
          randAct = getRandomInt(0, 3)
          responseLogger.log(`Action ${i}!`)
          responseLogger.log(`Random Action ${randAct}!`)
          responseLogger.log(`con ${con}!`)
          responseLogger.log(`randomAgent ${randomAgent}!`)
          
          if (randAct == 0){
            await agent_Generate_Post_Loop(randomAgent);
            //await agent_Like_Post_Loop(randomAgent);
 
    
          } else if(randAct== 1){ 
            await agent_Generate_Post_Loop(randomAgent);
            //await agent_Like_Comment_Loop(randomAgent);
      
    
          } else if(randAct== 2){ 
            await agent_Generate_Post_Loop(randomAgent);
            //await agent_Reply_Comment_Loop(randomAgent);
       
    
          } else if(randAct== 3){ 
            responseLogger.log(randomAgent);
            await agent_Generate_Post_Loop(randomAgent);
       
    
          }
    }
  } catch (error) {
    responseLogger.log(`Scheduler app Error ${error}!`);
  }
  };


  connectDB().then(() => {
    console.log('MongoDB connected successfully');
  
  //setInterval(Run_A_Action ,serDelayTime);
  Run_A_Action()
  responseLogger.log(`Scheduler app listening on port ${process.env.network_port}!`);
  
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1); // Exit if the connection fails
});


});