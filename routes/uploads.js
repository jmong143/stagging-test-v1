/* Packages */
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');

/* Config */
require('dotenv').config();
const config = require('../config'); 

/* Services */
const GridFSService = require('../services/GridFS');

/* Controllers */
const SessionController = require('./controllers/SessionController');

/* Setup - Storage Engine */
const storage = GridFSService.storage;
const upload = multer({ 
	storage: storage,
	fileFilter: GridFSService.fileFilter
}).single('file');

// Local
// const mongoURI = 'mongodb://localhost/pinnacle';
// Atlas
const mongoURI = config.db.atlasURI;

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
router.post('/', SessionController.validateApp, SessionController.validateAdminToken, (req,res)=> {
	upload(req, res, (err)=> {
		if(err) {
			res.status(400).json({
				message: err.message
			});
		} else {
			res.json({ file: req.file });
		}
	});
});	

// Delete File - Admin
router.delete('/:fileId', SessionController.validateApp, SessionController.validateAdminToken, (req, res) => {
	gfs.remove({ _id: req.params.fileId, root: 'uploads'}, (err, gridStore) => {
		if (err) {
			res.status(400).json({
				message: 'Failed to delete file.'
			});
		} else {
			res.status(200).json({
				message: 'File successfully deleted.'
			});
		}
	});
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
router.get('/:filename', SessionController.validateApp, (req, res) => {
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