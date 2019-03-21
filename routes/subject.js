const express = require('express');
const router = express.Router();
const SessionController = require('./controllers/SessionController');
const SubjectController = require('./controllers/SubjectController');
const SubjectCodeController = require('./controllers/SubjectCodeController');

/* Subject Management */
router.post('/', SessionController.validateApp, SessionController.validateAdminToken, SubjectController.createSubject);

/* Subject routes for front and admin */
router.get('/:subjectId', SessionController.validateApp, SubjectController.getSubject);
router.get('/', SessionController.validateApp, SubjectController.getSubjects);

/* Subject Code Activation - Front*/
router.post('/codes/activate', SessionController.validateApp, SessionController.validateToken, SubjectCodeController.activateSubjectCode);


module.exports = router;