const express = require('express');
const router = express.Router();
const SessionController = require('./controllers/SessionController');
const SubjectController = require('./controllers/SubjectController');
const SubjectCodeController = require('./controllers/SubjectCodeController');
const TopicController = require('./controllers/TopicController');
const LessonController = require('./controllers/LessonController');

/* Admin Exclusive Endpoints */
/* Subject Management */
router.post('/', SessionController.validateApp, SessionController.validateAdminToken, SubjectController.createSubject);
router.get('/enrollees/count', SessionController.validateApp, SessionController.validateAdminToken, SubjectController.getEnrolleesCount);
/* Topics Management */
router.post('/:subjectId/topics', SessionController.validateApp, SessionController.validateAdminToken, TopicController.createTopic);
router.put('/:subjectId/topics/:topicId', SessionController.validateApp, SessionController.validateAdminToken, TopicController.updateTopic);
router.post('/:subjectId/topics/:topicId/archive', SessionController.validateApp, SessionController.validateAdminToken, TopicController.archiveTopic)
/* Lesson Management */
router.post('/topics/:topicId/lessons', SessionController.validateApp, SessionController.validateAdminToken, LessonController.createLesson);
router.put('/topics/:topicId/lessons/:lessonId', SessionController.validateApp, SessionController.validateAdminToken, LessonController.updateLesson);
router.delete('/topics/:topicId/lessons/:lessonId', SessionController.validateApp, SessionController.validateAdminToken, LessonController.archiveLesson);

/* Subjects / Topics / Lessons routes for front and admin */
/* Subjects */ 
router.get('/:subjectId', SessionController.validateApp, SubjectController.getSubject);
router.get('/', SessionController.validateApp, SubjectController.getSubjects);
/* Topics */
router.get('/:subjectId/topics', SessionController.validateApp, TopicController.getTopics);
router.get('/:subjectId/topics/:topicId', SessionController.validateApp, TopicController.getTopic);
/* Lessons */
router.get('/topics/:topicId/lessons', SessionController.validateApp, LessonController.getLessons);
router.get('/topics/:topicId/lessons/:lessonId', SessionController. validateApp, LessonController.getLesson);

/* Front Exclusive Endpoints */
/* Subject Code Activation - Front*/
router.post('/codes/activate', SessionController.validateApp, SessionController.validateToken, SubjectCodeController.activateSubjectCode);


module.exports = router;