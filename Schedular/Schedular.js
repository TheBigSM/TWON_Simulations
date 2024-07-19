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
const mongoose = require('mongoose');
require('dotenv').config();
const { ObjectId } = require('mongodb');
const axios = require('axios');
const { MongoClient, ServerApiVersion } = require('mongodb');
const serDelayTime   = 3*60*1000;
const agentDelayTime = 4*60*1000;
const genDelayTime   = 20*60*1000;
var serCount = 0

const { username, liberal, mixtral_8_7b, conservative, neutral, agent1, agent2, agent3, agent4, agent5, agent6, agent7, agent8, agent9, agent10, agent11, agent12, agent13, agent14, agent15 } = require('./Constants.js');

var agents = [{username:agent1, persona: liberal},{username:agent2, persona: conservative},{username:agent3, persona: neutral},
          {username:agent4, persona: liberal}, {username:agent5, persona: conservative},{username:agent6, persona: neutral},
          {username:agent7, persona: liberal},{username:agent8, persona: conservative},{username:agent9, persona: neutral},
          {username:agent10, persona: liberal},{username:agent11, persona: conservative},{username:agent12, persona: neutral},
          {username:agent13, persona: liberal},{username:agent14, persona: conservative},{username:agent15, persona: neutral},
        ]  
model = mixtral_8_7b; 

mongoose.Promise = global.Promise;
const { exec } = require('child_process');

var POST_ID_REPLY = ""

function pauseFor(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

const port = 3008;

function isEmpty(obj) {
  if(obj === undefined){ return true}
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

removeUndefined = function(json){
  return JSON.parse(JSON.stringify(json, (k, v) => Array.isArray(v) ? v.filter(e => e !== null) : v, 2 ));
}

filteredComments = function(json){
  filtered = json.filter(x => x != null);
  return filtered
}


var express = require('express');
var app = express();
app.get('/', function (req, res) {
  res.send('Hello World!');
});


async function add_A_Post(txt, userId){
  if(txt.length > 0){
  const post = new Post({desc:txt, userId:userId,  rank:1000.0, pool: "0", "likes": [], "dislikes": [],"comments": [], 'createdAt': new Date(), 'updatedAt': new Date(),'__v': 0 });
  try {
       await post.save();
       console.log('The post has been added');

       } catch(err) {
        console.log(err);
    
  }
}
}


async function add_A_Comment(txt, userId, postId, username){
  if(txt.length > 0){
  const comment = new Comment({body:txt, userId:userId, postId:postId, username: username});
  try {
       await comment.save();
       const post = await Post.findById(postId);
       await post.updateOne({$push: { comments: comment } });
       console.log('The comment has been added');

       } catch(err) {
        console.log(err);
    
  }
}
}

async function like_A_Comment(userId, commentId){
  const comment = await Comment.findById(commentId).populate([{path : "likes", model: "CommentLike", match: { "userId": userId}}, {path : "dislikes", model: "CommentDislike", match: { "userId": userId}}]).sort({ createdAt: 'descending' }).exec();

  var isAlreadyLiked = false;
  var isAlreadyDisliked = false;

  
  if(comment.likes.length > 0){
   const idl = new ObjectId(comment.likes[0]._id)
   isAlreadyLiked = true
   try {
       console.log("LIKE - 1");
       await Comment.findOneAndUpdate({_id: commentId}, {$pull: {'likes': {$in: [idl]}}})
       await CommentLike.findByIdAndDelete({_id:idl});
       console.log("DONE - LIKE - 1")
   } catch(err) {
       console.log(err);
      }
  } 

  if(comment.dislikes.length > 0){
   const idl = new ObjectId(comment.dislikes[0]._id)
   isAlreadyDisliked = true
   try{
       console.log("LIKE - 2");
       await Comment.findOneAndUpdate({_id: commentId}, {$pull: {'dislikes': {$in: [idl]}}});
       await CommentLike.findByIdAndDelete({_id:idl});
       console.log("DONE - LIKE - 2")
   }catch(err) {

    console.log(err);
      }
  }

  if(!isAlreadyLiked){
   if(!isAlreadyDisliked){
   try {
       console.log("LIKE - 3");
       const commentLike = new CommentLike({userId:userId, commentId:commentId});
       await commentLike.save();
       console.log("Commentlike is added");
       const comment = await Comment.findById(commentId);
       await comment.updateOne({$push: { likes: commentLike } });
       console.log("DONE - LIKE - 3");

   } catch(err) {
       console.log(err);

   }
}else{
   console.log("Both are not false");
}
   }else{
   }
}

async function dislike_A_Comment(commentId, userId){
  const comment = await Comment.findById(commentId).populate([{path : "likes", model: "CommentLike", match: { "userId": userId}}, {path : "dislikes", model: "CommentDislike", match: { "userId": userId}}]).sort({ createdAt: 'descending' }).exec();

  var isAlreadyLiked = false;
  var isAlreadyDisliked = false;
  
  if(comment.likes.length > 0){
      const idl = new ObjectId(comment.likes[0]._id)
      isAlreadyLiked = true
      try {
          console.log("DISLIKE - 1");
          
          Comment.findOneAndUpdate({_id: commentId}, {$pull: {'likes': {$in: idl}}}, (err, block) => {
              console.log(err)
              console.log(block)
          });
          const dltobj = await CommentLike.findByIdAndDelete({_id:idl}, (err, block) => {
              console.log(err)
              console.log(block)
          });
          const comment = await Comment.findById(commentId).populate([{path : "likes", model: "CommentLike"}, {path : "dislikes", model: "CommentDislike"}]).sort({ createdAt: 'descending' }).exec();
          var diction = {"likes": -1, "dislikes": parseInt(0)}
          console.log("DONE - DISLIKE - 1")

      } catch(err) {
          console.log(err);
         }
     } 

  if(comment.dislikes.length > 0){
      const idl = new ObjectId(comment.dislikes[0]._id)
      isAlreadyDisliked = true
      try{
          console.log("DISLIKE - 2");
          
          Comment.findOneAndUpdate({_id: commentId}, {$pull: {'dislikes': {$in: idl}}}, (err, block) => {
              console.log(err)
              console.log(block)
          });
  
          const dltobj = await CommentLike.findByIdAndDelete({_id:idl}, (err, block) => {
              console.log(err)
              console.log(block)
          });
          const comment = await Comment.findById(commentId).populate([{path : "likes", model: "CommentLike"}, {path : "dislikes", model: "CommentDislike"}]).sort({ createdAt: 'descending' }).exec();
          var diction = {"likes": parseInt(0), "dislikes":-1 }
          console.log("DONE - DISLIKE - 2")
      }catch(err) {
        console.log(err)
      
         }
     }

  if(!isAlreadyLiked){
      if(!isAlreadyDisliked){
      try {
      console.log("DISLIKE - 3");
      const commentDislike = new CommentDislike({userId:userId, commentId:commentId});
      await commentDislike.save();
      console.log("commentDislike is added");

      const comment = await Comment.findById(commentId);
      await comment.updateOne({$push: { dislikes: commentDislike } });
      const comment2 = await Comment.findById(commentId).populate([{path : "likes", model: "CommentLike"}, {path : "dislikes", model: "CommentDislike"}]).sort({ createdAt: 'descending' }).exec();
      console.log("Comment is liked");
      var diction = {"likes": parseInt(0), "dislikes": 1}
      console.log("DONE - DISLIKE - 3")

  } catch(err) {
      console.log(err);
  }
}else{
  console.log("Both are not false");
}
  }else{
  }

}

async function like_A_Post(userId, postId){
   const post = await Post.findById(postId).populate([{path : "likes", model: "PostLike", match: { "userId": userId}}, {path : "dislikes", model: "PostDislike", match: { "userId": userId}}]).sort({ createdAt: 'descending' }).exec();

  var isAlreadyLiked = false;
  var isAlreadyDisliked = false;

  if(post?.likes?.length > 0){
   isAlreadyLiked = true
   try {
      console.log("Not Added - LIKE - 1");
       const idl = new ObjectId(post.likes[0]._id)
       console.log(idl);
       await Post.findOneAndUpdate({_id: postId}, {$pull: {'likes': {$in: [idl]}}});
       await PostLike.findByIdAndDelete({_id:idl});
       console.log("Not Added - DONE - LIKE - 1")
   } catch(err) {
       console.log(err);
      }
  } 

  else if(post?.dislikes?.length > 0){
   isAlreadyDisliked = true
   try{
      console.log("Not Added - LIKE - 2");
       const idl = new ObjectId(post.dislikes[0]._id)
       Post.findOneAndUpdate({_id: postId}, {$pull: {'dislikes': {$in: idl}}}, (err, block) => {
           console.log(err)
           console.log(block)
       });

       const dltobj = await PostLike.findByIdAndDelete(idl, (err, block) => {
          console.log(err)
          console.log(block)
      });
       console.log("Not Added - DONE - LIKE - 2")

   }catch(err) {
      console.log(err);
   
      }
  }

  if(!isAlreadyLiked){
   if(!isAlreadyDisliked){
   try {
      console.log("LIKE - 3");
       const postLike = new PostLike({userId:userId, postId:postId});
       await postLike.save();
       console.log("postLike is added");
       await Post.findOneAndUpdate({"_id": postId},{$push: { likes: postLike }});
       console.log("DONE - LIKE - 3")

   } catch(err) {
       console.log(err);

   }
}else{
   console.log("Not Added - Both are not false");
}
   }else{
   }
}

async function dislike_A_Post(postId, userId){
  const post = await Post.findById(postId).populate([{path : "likes", model: "PostLike", match: { "userId": userId}}, {path : "dislikes", model: "PostDislike", match: { "userId": userId}}]).sort({ createdAt: 'descending' }).exec();

  var isAlreadyLiked = false;
  var isAlreadyDisliked = false;

  if(post.likes.length > 0){
     const idd = post.likes[0]._id
      isAlreadyLiked = true
      try {
         
         console.log("DISLIKE - 1");
         const idl = new ObjectId(idd);
         Post.findOneAndUpdate({_id: postId}, {$pull: {'likes': {$in: idl}}}, (err, block) => {
              console.log(err)
              console.log(block)
          });
          const dltobj = await PostLike.findByIdAndDelete({_id:idl}, (err, block) => {
              console.log(err)
              console.log(block)

          });

          const post = await Post.findById(postId).populate([{path : "likes", model: "PostLike"}, {path : "dislikes", model: "PostDislike"}]).sort({ createdAt: 'descending' }).exec();
          var diction = {"likes": -1, "dislikes": parseInt(0)}
          console.log("DONE - DISLIKE - 1")
          
          
      } catch(err) {
          console.log(err);
         }
     } else if(post.dislikes.length > 0){
      isAlreadyDisliked = true
      try{
         console.log("DISLIKE - 2");
          const idl = new ObjectId(post.dislikes[0]._id)
          Post.findOneAndUpdate({_id: postId}, {$pull: {'dislikes': {$in: idl}}}, (err, block) => {
              console.log(err)
              console.log(block)
          });
  
          const dltobj = await PostLike.findByIdAndDelete(idl, (err, block) => {
              console.log(err)
              console.log(block)
          });
          const post2 = await Post.findById(postId).populate([{path : "likes", model: "PostLike"}, {path : "dislikes", model: "PostDislike"}]).sort({ createdAt: 'descending' }).exec();
          var diction = {"likes": parseInt(0), "dislikes":-1 }
          console.log("DONE - DISLIKE - 2")
          
      }catch(err) {
        console.log(err);
      
         }
     }

  if(!isAlreadyLiked){
      if(!isAlreadyDisliked){
      try {
     console.log("DISLIKE - 3");
      const postDislike = new PostDislike({userId:userId, postId:postId});
      await postDislike.save();

      const post = await Post.findById(postId);
      await post.updateOne({$push: { dislikes: postDislike } });
      const post2 = await Post.findById(postId).populate([{path : "likes", model: "PostLike"}, {path : "dislikes", model: "PostDislike"}]).sort({ createdAt: 'descending' }).exec();
      //console.log(post2);
      var diction = {"likes": parseInt(0), "dislikes": 1}
      console.log("DONE - DISLIKE - 3")
  } catch(err) {
      console.log(err);
  }
}else{

  console.log("Both are not false");
}
  }else{
  }

}


async function get_Interactions_Agent_on_Posts(agnt, res) {
      posts_req = []
        const posts = await Post.find({"userId":agnt.userId}).sort({ createdAt: -1 }).limit(5).exec();
        for (const p of posts) {
          posts_req.push({'action':"wrote",'message':p["desc"]})

        }

        const postLikes = await PostLike.find({"userId":agnt.userId}).sort({ createdAt: -1 }).limit(5).exec();
        for (const com of postLikes) {
          po = await Post.find({"postId": com["postId"]})

          for (const p of po) {
            posts_req.push({'action':"liked",'message':p["desc"]})

          }
        }

        res = posts_req
        return res
    };

async function get_Interactions_Agent_on_Comments(agnt) {
      posts_req = []
        const comments = await Comment.find({"userId":agnt._id}).sort({ createdAt: 1 }).limit(5).exec();

        for (const c of comments) {
          posts_req.push({'action':"wrote",'message':c["body"]})

        }

        const commentLikes = await CommentLike.find({"userId":agnt._id}).sort({ createdAt: 1 }).limit(5).exec();

        for (const com of commentLikes) {
          co = await Comment.find({"_id": com["commentId"]})

          for (const c of co) {
            posts_req.push({'action':"liked",'message':c["body"]})

          }
        }

        return posts_req
    };

  function addslashes( str ) {
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
      await Post.find().populate({path : "comments", model: "Comment"}).sort({ rank: 1 }).limit(1).exec().then(async(posts) => {
              var count = 0;
              for (const p in posts){
                const post = posts[p]
                POST_ID_REPLY = post.id;
                const u = await User.find({"_id":new ObjectId(post.userId)})
                const post_author = u[0];

                if(post_author){
                for (const comm in post.comments){
                    const post_com = post.comments[comm]

                    if(post_com){
                      const msg = {"author": post_com.username, "message": '"' + (post_com.body).replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0') + '"' }
                      posts_req.push(msg);
                    }
                }
                if(posts_req.length == 0){
                  posts_req.push({"author": post_author.username, "message": '"' + (post.desc).replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0') + '"' });
                }

              }}
              
              });
              if(posts_req.length >0){
                posts_thread={"posts"  :posts_req};
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


async function agent_Like_Comment_Loop() {

      mongoose.connect(process.env.DB_URL,  {useNewUrlParser: true }).then(async(req, res) => {
      console.log("Successfully connected to the database");
      const databaseName = 'test';
        
      const today = new Date();
      const Ffth_before = new Date();
      Ffth_before.setDate(today.getDate() - 30);
      Ffth_before.setHours(0, 0, 0, 0);
    
      const query = {"createdAt": { $lt: today, $gte: Ffth_before }};
    
            Comment.find(query).sort({ updatedAt: 1 }).limit(1).then(async(comments) => {
              var count = 0;
              for (const comm in comments){
                console.log("COMMENT");
                console.log(count+1);
                
                const comment = comments[comm]
                console.log(comment);
                const u = await User.find({"_id":new ObjectId(comment.userId)})
                const usr = u[0];

                const p = await Post.find({"_id":new ObjectId(comment.postId)})
                const pst = p[0];
                if(usr){
                  if(pst){
                var newArray = [];
                for (var i = 0; i < 1; i++) {
                  var randomIndex = getRandomInt(0, agents.length - 1);
                  newArray.push(agents[randomIndex]);
              }


                var agent_count = 0;
                for (const item of newArray) {
                  
                  const agnts = await User.find({username:item[username]})
                  const agnt = agnts[0];
                  
                  if(agnt){
                    if(usr.username != agnt.username){
    
                      console.log("AGENT");
                      console.log(agent_count+1);
    
                      const msg = {"author": usr.username, "message": comment["body"]}
                      const interactions = await get_Interactions_Agent_on_Comments(agnt);
                      jsn = {"post": msg,"history": {interactions}, "integration":{"model": model,"provider": "local"}, 
                        "language": "English", persona: [item[persona]], "platform": "Twitter"}
                        await delay(2000);
                        const jsonContent = JSON.stringify(jsn);
                        const agent_would_you_like = async (jsonContent) => {
                          await fetch("like/", { 
                            method: "POST", 
                            path: '/like',
                            headers: {"Content-Type": "application/json","Content-Type": "application/json;charset=UTF-8", "User-Agent": "node-fetch"},
                            body: jsonContent,
                          })
                          .then(function json(response) {
                            return response.json()
                          })
                          .then((res) => {
                            
                              console.log(res["statusText"]);
                              if(res){
                              like_A_Comment(agnt._id, comment["_id"]);
                              }
    
                            
                          }).catch((err) => {
                              console.log("err1");
                              console.log(err);
                              
                          });
                        };
                        agent_would_you_like(jsonContent);
                        if(count == 0){

                        }else{

                        }
                  }
                }
                agent_count = agent_count + 1
            }}else{
              console.log("post not found");
            }
          }else{console.log("user not found1");}
              count = count + 1
            }
              }); 
    
      }).catch(err => {
        console.log('Could not connect to the database. Exiting now...', err);
        process.exit();
        });
    };

async function agent_Like_Post_Loop() {

  mongoose.connect(process.env.DB_URL,  {useNewUrlParser: true }).then(async(req, res) => {
  console.log("Successfully connected to the database");
  const databaseName = 'test';
    
  const today = new Date();
  const Ffth_before = new Date();
  Ffth_before.setDate(today.getDate() - 30);
  Ffth_before.setHours(0, 0, 0, 0);

  const query = {"createdAt": { $lt: today, $gte: Ffth_before }};

  Post.find().sort({ rank: 1 }).limit(1).then(async(posts) => {
    var count = 0;
    for (const p in posts){
      console.log("POST");
      console.log(count+1);
      const post = posts[p]
      console.log(post);
      const u = await User.find({"_id":new ObjectId(post["userId"])})
      const usr = u[0];
      if(usr){
        
                var newArray = [];
                for (var i = 0; i < 1; i++) {
                  var randomIndex = getRandomInt(0, agents.length - 1);
                  newArray.push(agents[randomIndex]);
              }
            var agent_count = 0;
            for (const item of newArray) {
              
              const agnts = await User.find({username:item[username]})
              const agnt = agnts[0];
              if(agnt){
                if(usr.username != agnt.username){

                  console.log("AGENT");
                  console.log(agent_count);
                  console.log(agnt.username);

                  const msg = {"author": usr.username, "message": post["desc"]}
                  const interactions = await get_Interactions_Agent_on_Posts(async(agnt, interact) => {});
                  jsn = {"post": msg,"history": {interactions}, "integration":{"model": model,"provider": "local"}, 
                    "language": "English", persona: [item[persona]], "platform": "Twitter"}
                    //console.log(jsn)
                    const jsonContent = JSON.stringify(jsn);
                    //console.log(jsonContent);
                    const agent_would_you_like = async (jsonContent) => {

                      await fetch(process.env.AGENTS_URL+"like/", { 
                        method: "POST", 
                        path: '/like',
                        headers: {"Content-Type": "application/json", "Content-Type": "application/json;charset=UTF-8", "User-Agent": "node-fetch"},
                        body: jsonContent,
                      })
                      .then(function json(response) {
                        return response.json()
                      })
                    .then((res) => {

                          console.log(res["statusText"]);
                          if(res){
                          like_A_Post(agnt._id, post["_id"]);
                          }
                      }).catch((err) => {
                          console.log("err2");
                          console.log(err);
                          
                      });
                    };
                    agent_would_you_like(jsonContent);
                    //await delay(agentDelayTime);
                    //await pauseFor(agentDelayTime);
              }else{
                console.log("AGENT");
                console.log(agent_count);
                console.log(agnt.username);
              }
            }
            agent_count = agent_count + 1
          }
        }
            count =count + 1
          }
          }); 

  }).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
    });
};

async function agent_Reply_Comment_Loop() {

  mongoose.connect(process.env.DB_URL,  {useNewUrlParser: true }).then(async(req, res) => {
  console.log("Successfully connected to the database");
  const databaseName = 'test';
    
  const today = new Date();
  const Ffth_before = new Date();
  Ffth_before.setDate(today.getDate() - 60);
  Ffth_before.setHours(0, 0, 0, 0);
  //console.log(today)
  //console.log(Ffth_before)

  const query = {"createdAt": { $lt: today, $gte: Ffth_before }, "comments":{$exists: true, $ne: [] }};
  Post.find().populate({path : "comments", model: "Comment"}).sort({ rank: 1 }).limit(1).then(async(posts) => {
    var count = 0;
    //console.log(posts.length);
    for (const p in posts){
      console.log("POST");
      console.log(count+1);
      const post = posts[p]
      console.log(post);
      const u = await User.find({"_id":new ObjectId(post["userId"])})
      const usr = u[0];

              var newArray = [];
                for (var i = 0; i < 1; i++) {
                  var randomIndex = getRandomInt(0, agents.length - 1);
                  newArray.push(agents[randomIndex]);
              }

            var agent_count = 0;
            for (const item of newArray) {
              
              const agnts = await User.find({username:item[username]})
              const agnt = agnts[0]
              console.log(agnt.username);
              console.log(usr);
              if(agnt){
                if(usr){
                if(usr.username != agnt.username){

                console.log("AGENT");
                console.log(agnt.username);
                //console.log("LATLY RANKED POST");
                console.log(post["desc"]);
                
                console.log(agent_count+1);
                  const interactions = await get_Interactions_Agent_on_Comments(agnt);
                  const interact = await get_thread_Agent_on_Comments(agnt);

                  jsn = {
                    "history": {interactions}, 
                    "integration":{"model": model,"provider": "local"}, 
                    "language": "English",
                    "length":"few-word", 
                    persona: [item[persona]], 
                    "platform": "Twitter",
                    "thread": interact 
                  }

                  console.log(jsn);

                    const jsonContent = JSON.stringify(jsn);
                    console.log(jsonContent);              
                  const agent_would_you_reply = async (jsonContent) => {
                    await fetch(process.env.AGENTS_URL+"reply/", { 
                      method: "POST", 
                      path: '/reply',
                      headers: {"Content-Type": "application/json", "Content-Type": "application/json;charset=UTF-8", "User-Agent": "node-fetch", 'accept': 'application/json'},
                      body: jsonContent,
                    })
                    .then(function json(response) {
                        return response.json()
                      })
                    .then((res) => {
                      //console.log(POST_ID_REPLY)
                      //console.log(agnt._id)
                      //console.log(agnt.username)
                        console.log(res["status"]);
                        console.log(res);
                        console.log(res["response"]);
                        if(res["response"]){
                          add_A_Comment(res["response"], agnt.id, POST_ID_REPLY, agnt.username);
                        }
                    }).catch((err) => {
                      console.log("err3");
                          console.log(err);
                    });
                  };
                  agent_would_you_reply(jsonContent);
                  //await delay(agentDelayTime);
                  //await pauseFor(agentDelayTime);
                  //setTimeout(delayedFunction, 100000);
                
                   // }
                 // }
                    
              //}
            }
          }else{
            console.log("user not found 2");
          }}
            agent_count = agent_count + 1
          }
         // }
         count = count+1}
        }); 

  }).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
    });
};

async function agent_Generate_Comment_Loop() {

  mongoose.connect(process.env.DB_URL,  {useNewUrlParser: true }).then(async(req, res) => {
  console.log("Successfully connected to the database");
  const databaseName = 'test';
    
  const today = new Date();
  const Ffth_before = new Date();
  Ffth_before.setDate(today.getDate() - 60);
  Ffth_before.setHours(0, 0, 0, 0);
  //console.log(today)
  //console.log(Ffth_before)
      
      var newArray = [];
      for (var i = 0; i < 1; i++) {
        var randomIndex = getRandomInt(0, agents.length - 1)
        newArray.push(agents[randomIndex]);
        }
      var agent_count = 0;
      for (const item of newArray) {
        const agnts = await User.find({username:item[username]})
        const agnt = agnts[0]
        if(agnt){
          console.log("AGENT");
          console.log(agent_count+1);
          const interactions = await get_Interactions_Agent_on_Comments(agnt);

                  jsn = {
                    "history": {interactions}, 
                    "integration":{"model": model,"provider": "local"}, 
                    "language": "English","length":"few-word", 
                    persona: [item[persona]], 
                    "platform": "Twitter",
                    "topic": "Ukraine war"//"Ukraine war" 
                  }

                  console.log(jsn);

                    const jsonContent = JSON.stringify(jsn);
                    console.log(jsonContent);

                  const agent_would_you_generate = async (jsonContent) => {
                    await fetch(process.env.AGENTS_URL+"generate/", { 
                      method: "POST", 
                      path: '/generate',
                      headers: {"Content-Type": "application/json", "Content-Type": "application/json;charset=UTF-8", "User-Agent": "node-fetch"},
                      body: jsonContent,
                    })
                    .then(function json(response) {
                      return response.json()
                    })
                  .then((res) => {
                    //console.log(POST_ID_REPLY)
                    //console.log(agnt._id)
                    //console.log(agnt.username)
                      console.log(res["status"]);
                      console.log(res);
                      console.log(res["response"]);
                      if(res["response"]){
                        add_A_Post(res["response"], agnt.id);
                      }
                  }).catch((err) => {
                    console.log("err4");
                        console.log(err);
                  });
                  };
                  agent_would_you_generate(jsonContent);
                  //await delay(agentDelayTime);
                  //await pauseFor(agentDelayTime);
                  //setTimeout(delayedFunction, 100000);
                
                   // }
                 // }
                    
              //}
            }
            agent_count = agent_count + 1
          }

  }).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
    });
};


app.listen(port, function () {
const myService1 = () => {
    console.log("Bots Service is running after 10 minutes.");  
    agent_Like_Post_Loop();
    agent_Like_Comment_Loop();
    agent_Reply_Comment_Loop();
    serCount = serCount + 1;
    console.log(serCount);
};

const myService2 = () => { 
  agent_Generate_Comment_Loop();
  serCount = serCount + 1;
  console.log(serCount);
};


setInterval(myService1, serDelayTime);
setInterval(myService2, genDelayTime);

console.log(`Scheduler app listening on port ${port}!`);


});