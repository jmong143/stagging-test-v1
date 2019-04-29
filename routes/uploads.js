const express = require('express');
const router = express.Router();
const SessionController = require('./controllers/SessionController');
const UploadsController = require('./controllers/UploadsController');

/* Upload Routes - Admin */
router.post('/', SessionController.validateApp, SessionController.validateAdminToken, UploadsController.uploadSingle, UploadsController.sendFilename);
router.post('/:directory', SessionController.validateApp, SessionController.validateAdminToken, UploadsController.uploadSingle, UploadsController.sendFilename);

router.get('/:directory/:fileName', SessionController.validateApp, UploadsController.getFile);

module.exports = router;