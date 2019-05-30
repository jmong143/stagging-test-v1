/* Packages */
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const GridFsStorage = require('multer-gridfs-storage');

/* Dependencies */
const config = require('../config');
require('dotenv').config();

const uri = config.db.host + config.db.database;

/* Storage Engine */
exports.storage = new GridFsStorage({
  url: uri,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          content_type: file.mimetype,
          bucketName: 'uploads'
        };
        console.log("[FILE][STORAGE]: " + JSON.stringify(fileInfo))
        resolve(fileInfo);
      });
    });
  }
});
