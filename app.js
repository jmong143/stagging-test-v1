/* Config */
require('dotenv').config();
const config = require('./config'); 

/* Packages */
const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');

const app = express();

/* Services */
const db = require('./services/db.js');

/* API Settings */
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('short'));

/* MongoDB */
let dbConnection = false;

/* Create Database Connection */
const connection = db.connection;

/* Use Routes */
app.use('/users', require('./routes/users'));
app.use('/auth', require('./routes/auth'));
app.use('/profile', require('./routes/profile'));
app.use('/subjects', require('./routes/subject'));
app.use('/tips', require('./routes/dailyTips'));
app.use('/admin/subjects/codes', require('./routes/subjectCode'));
app.use('/home', require('./routes/homepage'));
app.use('/news', require('./routes/news'));
app.use('/activities', require('./routes/activity'));
app.use('/subscriptions', require('./routes/subscription'));
app.use('/updates', require('./routes/subjectUpdates'));
app.use('/schools', require('./routes/school'));
app.use('/uploads', require('./routes/uploads'));
app.use('/questions', require('./routes/question'));
app.use('/practice', require('./routes/practice'));
app.use('/test', require('./routes/test'));
app.use('/goals', require('./routes/goal'));
app.use('/mock', require('./routes/mock'));
app.use('/progress', require('./routes/progress'));
app.use('/topics', require('./routes/lesson'));
app.use('/audit/trail', require('./routes/auditTrail'));
app.use('/v2/uploads', require('./routes/uploadsv2'));

/* API Status*/
app.get('/status', function(req, res){
   if (connection) {
      res.status(200).json({
         "message": "API is Running and DB Connection is Up."
      });   
   } else {
      res.status(500).json({
         "message": "Database Connection Error"
      });   
    }   
});

// Invalid endpoint error handler
app.use('*', (req, res)=> {

   res.status(404).json({
      message: 'Endpoint not found.'
   });
});

app.listen(config.server.port, function(){
   console.log('[API] '+config.server.appname + ' Server is running on Port', config.server.port);
});



/* Swagger Docs Attempt */
// var route, routes = [];


// app._router.stack.forEach(function(middleware){
//    let str = middleware.regexp.toString()
//       .replace(/\\\//g, '/')
//       .replace(/\/\^/g, '')
//       .replace();
//    console.log(str);
//     if(middleware.route){ // routes registered directly on the app
//         routes.push(middleware.route);
//     } else if(middleware.name === 'router'){ // router middleware 
//         middleware.handle.stack.forEach(function(handler){
//             route = handler.route;
//             route && routes.push(route);
//         });
//     }
// });

// console.log(routes);