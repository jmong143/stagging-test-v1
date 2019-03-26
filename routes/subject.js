const express = require('express');
const router = express.Router();
const SessionController = require('./controllers/SessionController');
const SubjectController = require('./controllers/SubjectController');
const SubjectCodeController = require('./controllers/SubjectCodeController');
const TopicController = require('./controllers/TopicController');

/* Admin Exclusive Endpoints */
/* Subject Management */
router.post('/', SessionController.validateApp, SessionController.validateAdminToken, SubjectController.createSubject);

/* Topics Management */
router.post('/:subjectId/topics', SessionController.validateApp, SessionController.validateAdminToken, TopicController.createTopic);
router.put('/:subjectId/topics/:topicId', SessionController.validateApp, SessionController.validateAdminToken, TopicController.updateTopic);
router.post('/:subjectId/topics/:topicId/archive', SessionController.validateApp, SessionController.validateAdminToken, TopicController.archiveTopic)

/* Subjects / Topics / Lessons routes for front and admin */
/* Subjects */ 
router.get('/:subjectId', SessionController.validateApp, SubjectController.getSubject);
router.get('/', SessionController.validateApp, SubjectController.getSubjects);

/* Topics */
router.get('/:subjectId/topics', SessionController.validateApp, TopicController.getTopics);
router.get('/:subjectId/topics/:topicId', SessionController.validateApp, TopicController.getTopic);


/* Front Exclusive Endpoints */
/* Subject Code Activation - Front*/
router.post('/codes/activate', SessionController.validateApp, SessionController.validateToken, SubjectCodeController.activateSubjectCode);



module.exports = router;