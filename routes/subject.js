const express = require('express');
const router = express.Router();
const SessionController = require('./controllers/SessionController');
const SubjectController = require('./controllers/SubjectController');

/* Profile Management */
router.post('/', SessionController.validateApp, SessionController.validateAdminToken, SubjectController.createSubject);
router.get('/', SessionController.validateApp, SubjectController.getSubjects);
router.get('/:subjectId', SessionController.validateApp, SubjectController.getSubject);
/* Subject Management */

module.exports = router;