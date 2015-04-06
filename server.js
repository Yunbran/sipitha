var express = require('express');
var app = express();
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cors = require('cors');
var partials = require('express-partials');
var util = require('util')
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var _ = require('lodash');

var User = require('./app/database/models/user.model');
var Song = require('./app/database/models/song.model');
var db = require('./app/database/db');

var handler = require('./app/request-handler');


var port = process.env.PORT || 8000;

app.use(partials());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(methodOverride('X-HTTP-Method-Override'));

require('./app/mediaRoutes')(app); 

app.use(express.static(__dirname + '/public'));

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next();
});


// Test functions
// handler.listDatabase();
// handler.deleteDatabase();
// handler.createUser();
// handler.findUser('');
// handler.listSongs();


//These are server calls that anyone without auth token can access
app.post('/authenticate', handler.authenticate);
app.post('/createUser', handler.createUser)
// app.get('/getSongs', handler.getSongs);
app.get('/getTags', handler.getTags);
app.get('/getUsers', handler.getUsers);
app.post('/getTagByName', handler.getTagByName);

// We are protecting all /api routes with JWT
// see ./js/authInterceptor.js
var secret = "it's a secret to everybody";
app.use('/api', expressJwt({secret: secret}));
//configure routes for /api/* at ./app/routes
//everything in /api/ requires an authToken
require('./app/routes')(app); 


// Configures the app's base path and api version.

var docs_handler = express.static(__dirname + '/app/docs/swagger-ui/');
app.get(/docs/, function(req, res, next) {

  if (req.url === '/docs') {
    res.writeHead(302, { 'Location' : req.url + '/' });
    res.end();
    return;
  }
  // take off leading /docs so that connect locates file correctly
  req.url = req.url.substr('/docs'.length);
  return docs_handler(req, res, next);
});

app.get('/getDocs', function(req, res){
  var jt = require('./app/docs/swagger.json');
  res.json(jt);
});



app.listen(port);
console.log('app listening in on port ', port);
exports = module.exports = app; //expose app

