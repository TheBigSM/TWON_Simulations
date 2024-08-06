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
var express = require('express');
require('dotenv').config();


const { MongoClient, ServerApiVersion } = require('mongodb');
mongoose.Promise = global.Promise;
const { exec } = require('child_process');

const hostname = '127.0.0.1';
const port = 3009;

function isEmpty(obj) {
  if(obj === undefined){ return true}
  return Object.keys(obj).length === 0;
}

function getArrayOfValuesRepost(dict){
  var arr = new Array();
  if(isEmpty(dict) == true){
    return dict
  }
  for(likObj in dict){
    var fobj = dict[likObj];
    arr[likObj] = fobj["createdAt"];
  }
  return arr;
}

function clean(obj) {
  for (var propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined) {
      delete obj[propName];
    }
  }
  return obj
}

filteredComments = function(json){
  filtered = json.filter(x => x != null);
  return filtered
}

function getArrayOfValuesComments(dict){
  var arr = new Array();
  for(first in dict){
    var firstComment = dict[first]
    var dictLikes = new Array();
    var dictDislikes = new Array();

  if(isEmpty(firstComment["likes"]) != true){

      var arr2 = new Array();
      for(firstlike in firstComment["likes"]){
        var firstLikeOIbj = firstComment["likes"][firstlike]
        arr2[firstlike] = firstLikeOIbj["createdAt"];
     }
    
     dictLikes[first] = arr2
    
  } else {
    dictLikes[first] = firstComment["likes"];
  }


  if(isEmpty(firstComment["dislikes"]) != true){
    var arr2 = new Array();
    for(firstlike in firstComment["dislikes"]){
      var firstLikeOIbj = firstComment["dislikes"][firstlike]
      arr2[firstlike] = firstLikeOIbj["createdAt"];
  }
  var dictDislikes = {};
  dictDislikes[first] = arr2
  }else{
    dictDislikes[first]  = firstComment["dislikes"];
  }

  if(dictLikes[first].length == 0 && dictDislikes[first].length == 0){
    

  }else if(dictLikes[first].length != 0){
    arr[first] = {"likes": dictLikes[first], "dislikes": dictDislikes[first],  "timestamp": firstComment["createdAt"], "id":firstComment["_id"]}
    

  }else if(dictDislikes[first].length != 0){
    arr[first] = {"likes": dictLikes[first], "dislikes": dictDislikes[first],  "timestamp": firstComment["createdAt"], "id":firstComment["_id"]}
    
  } 
}
return arr
}

function getArrayOfValuesReposts(dict){
  console.log(dict);
  var arr = new Array();
  if(isEmpty(dict) == true){
    return dict
  }
  for(likObj in dict){
    var fobj = dict[likObj];
    arr[likObj] = fobj["createdAt"];
  }
  return arr;
}

function getArrayOfValuesDislikes(dict){
  var arr = new Array();
  if(isEmpty(dict) == true){
    return dict
  }
  for(likObj in dict){
    var fobj = dict[likObj];
    arr[likObj] = fobj["createdAt"];
  }
  return arr;
}

function getArrayOfValuesLikes(dict){
  var arr = new Array();
  if(isEmpty(dict) == true){
    return dict
  }
  for(likObj in dict){
    var fobj = dict[likObj];
    arr[likObj] = fobj["createdAt"];
  }
  return arr;
}

function getArrayOfValues(dict){
  var arr = [];
  var hasKey = false
  for (var key in dict) {
    if (dict.hasOwnProperty(key)) {
      hasKey = true
        arr.push(dict[key]);
    }
}
if(hasKey == true){ return arr} else { return dict;}
}

const getPostsRanking = async (jsonContent) => {

  await fetch(process.env.POST_RANKING_URL+ "rank/", { 
    method: "POST", 
    path: '/rank',
    headers: {"Content-Type": "application/json", "Content-Length": jsonContent.length, "User-Agent": "node-fetch"},
    body: jsonContent,
  }).then((response) => {
    return response.json();

  }).then((json) => {

    var arrayOfObj = []
    var count = 0
  for (const [key, value] of Object.entries(json["ranking_map"])) {
      console.log(key, value);
      arrayOfObj[count] = {"_id": key, "update": value};
      count = count + 1
  }
  console.log(arrayOfObj);

  const updatePromises = arrayOfObj.map(({ _id, update }) => {
    console.log(_id);  
    console.log(update);  

     Post.updateOne({ _id: _id }, {$set:{"rank": update}})
        .then((result) => {
          console.log("SUCCES");
      console.log(result);
  }).catch((err) => {
    console.log("err");
        console.log(err);
  });
  

});
  //array = Object.keys(json["ranking_map"]).map(function(k) {
  //  console.log(k)
  //  return {k : {"rank": json["ranking_map"][k]}};
  //});

  //console.log(array);

  }).catch((error) => {
  // Your error is here!
  console.log(error)

  });



};


async function fetchAllPosts(ff_ids) {
  console.log("connecting to the db");
  mongoose.connect(process.env.DB_URL,  {
    useNewUrlParser: true
    }).then(async(req, res) => {

  console.log("Successfully connected to the database"); 

  const databaseName = "hack1"; // Database name
  
  const user2 = await User.find().sort({ createdAt: 'descending' }).exec();
  const jsonContent2 = JSON.stringify(user2);
  
  const post2 = await Post.find(ff_ids).populate([{path : "reposts",  model: "Repost",      select: "createdAt _id"},
                                            {path : "likes",    model: "PostLike",    select: "createdAt _id"}, 
                                            {path : "dislikes", model: "PostDislike", select: "createdAt _id"}, 
                                            {path : "comments", model: "Comment",     select: "createdAt _id", populate: {path : "likes", model: "CommentLike", select: "createdAt _id"}}, 
                                            {path : "comments", model: "Comment", select: "createdAt _id", populate: {path : "dislikes", model: "CommentDislike", select: "createdAt _id"}}]).exec();//.sort({ createdAt: 'descending' })
  const items = [];
  post2.forEach(function (item, index) {
    const dic = {};
    console.log(item["reposts"])
    dic["comments"]  = filteredComments(getArrayOfValuesComments(item["comments"]));
    dic["reposts"]   = getArrayOfValuesReposts(item["reposts"]);
    dic["dislikes"]  = getArrayOfValuesDislikes(item["dislikes"]);
    dic["likes"]     = getArrayOfValuesLikes(item["likes"]);
    dic["timestamp"] = getArrayOfValues(item["createdAt"]);
    dic["id"]        = item["_id"];
    items.push(dic);
  });
  var datetime = new Date();

  const dic2 = {};
  dic2["items"]  = items;
  dic2["reference_datetime"]  = datetime;
  dic2["reference_datetime"]  = datetime;
  dic2["decay"]  = { "minimum": 0.2, "reference_timedelta": "P3D"} 
  dic2["noise"]  = { "low": 0.6, "high": 1.4}
  dic2["engagement"]  = {"func": "count_based", "log_normalize": false }
  dic2["weights"]  =  { "likes": 1.0, "dislikes": 1.0, "comments": 1.0, "comments_likes": 1.0, "comments_dislikes": 1.0} 
  dic2["ranking_map"] =  { "additionalProp1": 0, "additionalProp2": 0, "additionalProp3": 0 }

  const jsonContent = JSON.stringify(dic2);
  console.log(jsonContent);
  getPostsRanking(jsonContent);

  }).catch(err => {
  console.log('Could not connect to the database. Exiting now...', err);
  process.exit();
  });

};

var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(port, function () {

  console.log(`Recommender app listening on port ${port}!`);

  const myService = () => {
    fetchAllPosts();
};

const delayInMilliseconds = 1 * 60 * 1000;
setInterval(myService, delayInMilliseconds);

});

module.exports = {
  fetchAllPosts
};