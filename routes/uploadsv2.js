'use strict';
/* Controller */
const UploadsController = require(process.cwd()+'/routes/controllers/UploadsControllerv2');
const SessionController = require(process.cwd()+'/routes/controllers/SessionController');
/* Packages */
const express = require('express');
const router = express.Router();

/* Multer Middleware */
const multer  = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', SessionController.validateAdminToken, upload.single('file'), UploadsController.upload);

module.exports = router;