/* Packages */
const express = require('express');
const router = express.Router();
const GridFSService = require('../services/GridFS');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');

/* Controllers */
const SessionController = require('./controllers/SessionController');

/* Setup */
const storage = GridFSService.storage;
const upload = multer({ storage });

// Local
// const mongoURI = 'mongodb://localhost/pinnacle';
// Atlas
const mongoURI = 'mongodb://pinnacle:Qwe12345@'+
   'cluster0-shard-00-00-js4og.mongodb.net:27017,'+
   'cluster0-shard-00-01-js4og.mongodb.net:27017,'+
   'cluster0-shard-00-02-js4og.mongodb.net:27017/test?'+
   'ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

/* Routes */

// Upload - Admin
router.post('/', SessionController.validateApp, SessionController.validateAdminToken, upload.single('file'), (req,res)=> {
	res.json({ file: req.file });
});	

// Get List of Files
router.get('/', SessionController.validateApp, (req,res) => {
	gfs.files.find().toArray((err, files) => {
	    if (!files || files.length === 0) {
	      	res.status(400).json({
	      		message: 'File Server is Empty.'
			});
	    } else {
	      	res.status(200).json(files);
	    }
  	});
});

// Get Single File
router.get('/:filename', (req, res) => {
	gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
		if (!file || file.length === 0) {
		  	return res.status(404).json({
		    	message: 'File Does not Exist.'
			});
		}
		console.log('[GET][FILE]: '+ JSON.stringify(file));
		let readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
        //res.status(200).json(file);	
	});
});

module.exports = router;