const express = require('express');
const router = express.Router();
const SessionController = require('./controllers/SessionController');
const SubjectCodeController = require('./controllers/SubjectCodeController');

/* SubjectCode Management Admin */
router.post('/generate', SessionController.validateApp, SessionController.validateAdminToken, SubjectCodeController.generateSubjectCode);
router.get('/', SessionController.validateApp, SessionController.validateAdminToken, SubjectCodeController.getSubjectCodes);
router.get('/:subjectCodeId', SessionController.validateApp, SessionController.validateAdminToken, SubjectCodeController.getSubjectCode);

module.exports = router;