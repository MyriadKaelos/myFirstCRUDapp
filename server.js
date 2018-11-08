const MongoClient = require('mongodb').MongoClient;

// call the packages we need
var express       = require('express');      // call express
var bodyParser    = require('body-parser');
var app           = express();     // define our app using express
var user = [{uName: "ERROR"}];
var isLoggedIn = false;
var posts = [];
var users = [{uName: "ERROR"}];
// configure app to use bodyParser() and ejs
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine','ejs');
// get an instance of the express Router
var router = express.Router();
// a “get” at the root of our web app: http://localhost:3000/api
router.get('/', function(req, res) {
  res.render('login.ejs', {error: ""});
});
// all of our routes will be prefixed with /api
app.use('/', router);
//ADD A NEW USER
app.post('/api/newUser', function (req, res) {
  var uName = req.body.uName;
  var pName = req.body.pName;
  db.collection('users').insertOne({uName:uName, pName:pName});
  res.redirect('/api');
});
//LOG IN
app.post('/api/login', function (req, res) {
  var uName = req.body.uName;
  var pName = req.body.pName;
  db.collection('users').find({}).toArray((err, result) => {if(err) {console.log(err)} else {users = result}});
  db.collection('users').find({uName:uName, pName:pName}).toArray((err, result) => {
    if(err) {console.log(err)} else {
      user = result;
      isLoggedIn = true;
      if(result.length > 0) {
        db.collection('posts').find({}).toArray((err, result2) => {
          res.render('index.ejs', {posts: result2, user: result, users: users});
        })
      } else {
        res.render('login.ejs', {error: "Your username or password was incorrect"});
      }
    }
  });
});
//MAKE A POST
app.post('/api/newPost', function (req, res) {
  var data = req.body.data;
  var d = new Date();
  db.collection('posts').insertOne({data:data, user: user[0], timeStamp: d.getTime()});
  db.collection('posts').find({}).toArray((err, result) => {
    var sorted = result.sort(compare);
    if(err) {console.log(err)} else {res.render('index.ejs', {user: user, posts: sorted, users: users})}
  });
});
//MASS DELETE
app.post('/api/massDelete', function (req, res) {
  db.collection('posts').deleteMany({});
});
//sort the stuffs
function compare(a,b) {
  var d = new Date().getTime();
  if (d - a.timeStamp < d - b.timeStamp) {return -1}
  if (d - a.timeStamp > d - b.timeStamp) {return 1}
  return 0;
}

// START THE SERVER
//==========================================================


var db
MongoClient.connect('mongodb://yateslough:Yateslough1@ds111113.mlab.com:11113/tester', {useNewUrlParser: true}, (err, client) => {
  if (err) {console.log(err)}
  db = client.db('tester');  //sets database var equal to global db var above
  app.listen(process.env.PORT || 5000 () => {
    console.log('listening on 5000');
  });
});
