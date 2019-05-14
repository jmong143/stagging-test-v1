/* Config */
require('dotenv').config();
const config = require('./config'); 

/* Packages */
const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');

/* Services */
const Directory = require('./services/Directory');

/* Routes */
const user = require('./routes/users');
const auth = require('./routes/auth');
const profile = require('./routes/profile');
const subjects = require('./routes/subject');
const dailyTips = require('./routes/dailyTips');
const subjectCode = require('./routes/subjectCode');
const homepage = require('./routes/homepage');
const news = require('./routes/news');
const activity = require('./routes/activity');
const subscription = require('./routes/subscription');
const subjectUpdates = require('./routes/subjectUpdates');
//const uploads = require('./routes/uploads');

const app = express();

/* Setup Local Upload Directories */
//Directory.initialize();

let dbConnection = false;

/* MongoDB Atlas*/

const uri = 'mongodb://pinnacle:Qwe12345@'+
   'cluster0-shard-00-00-js4og.mongodb.net:27017,'+
   'cluster0-shard-00-01-js4og.mongodb.net:27017,'+
   'cluster0-shard-00-02-js4og.mongodb.net:27017/test?'+
   'ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true';
   
mongoose.connect(uri, { useNewUrlParser: true }, function(err) {
   if (err) throw err;
   console.log('[MongoDB] Connection Successful.');
   dbConnection = true; 
});

/* MongoDb Local */

// mongoose.connect(config.db.host + config.db.database, { useNewUrlParser: true }, function (err) {
//    if (err) throw err;
//    console.log('[MongoDB] Connection Successful.');
//    dbConnection = true;
// });

mongoose.set('useCreateIndex', true);

let db = mongoose.connection;

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* Use Routes */

app.use('/users', user);
app.use('/auth', auth);
app.use('/profile', profile);
app.use('/subjects', subjects);
app.use('/tips', dailyTips);
app.use('/admin/subjects/codes', subjectCode);
app.use('/home', homepage);
app.use('/news', news);
app.use('/activities', activity);
app.use('/subscriptions', subscription);
app.use('/updates', subjectUpdates);
//app.use('/uploads', uploads);

/* Service Status*/

app.get('/status', function(req, res){
   if (dbConnection) {
      res.status(200).json({
         "message": "API is Running and DB Connection is Up."
      });   
   } else {
      res.status(500).json({
         "message": "Database Connection Error"
      });   
    }   
});

app.listen(config.server.port, function(){
   console.log('[API] '+config.server.appname + ' Server is running on Port', config.server.port);
});