require('dotenv').config();
const config = require('./config'); 
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

/* Routes */
const user = require('./routes/users');
const auth = require('./routes/auth');
const profile = require('./routes/profile');
const subjects = require('./routes/subject');
const dailyTips = require('./routes/dailyTips');
const subjectCode = require('./routes/subjectCode');
const homepage = require('./routes/homepage');
const mongoose = require('mongoose');

const cors = require('cors');


let dbConnection = false;

/* MongoDB Atlas*/

const uri = 'mongodb://pinnacle:Qwe12345@'+
	'cluster0-shard-00-00-js4og.mongodb.net:27017,'+
	'cluster0-shard-00-01-js4og.mongodb.net:27017,'+
	'cluster0-shard-00-02-js4og.mongodb.net:27017/test?'+
	'ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true'
mongoose.connect(uri, { useNewUrlParser: true }, function(err) {
	if (err) throw err;
	console.log('Connected to DB');
	dbConnection = true;
});

/* MongoDb Local */

// mongoose.connect(config.db.host + config.db.database, { useNewUrlParser: true }, function (err) {
//    if (err) throw err;
//    console.log('Connected to DB');
//    dbConnection = true;
// });

mongoose.set('useCreateIndex', true);

let db = mongoose.connection;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* Use Routes */

app.use('/users', user);
app.use('/auth', auth);
app.use('/profile', profile);
app.use('/subjects', subjects);
app.use('/tips', dailyTips);
app.use('/admin/subjects/codes', subjectCode);
app.use('/home', homepage);

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
   console.log(config.server.appname + ' Server is running on Port', config.server.port);
});