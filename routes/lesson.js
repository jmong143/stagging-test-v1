/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const SessionController = require('./controllers/SessionController');
const LessonController = require('./controllers/LessonController');

router.use('*', SessionController.validateApp);

/* Lessons Management - Admin */
router.post('/:topicId/lessons', SessionController.validateAdminToken, LessonController.createLesson);
router.put('/:topicId/lessons/:lessonId', SessionController.validateAdminToken, LessonController.updateLesson);
router.delete('/:topicId/lessons/:lessonId', SessionController.validateAdminToken, LessonController.archiveLesson);

/* Front & Admin Get Lessons */
router.get('/:topicId/lessons', LessonController.getLessons);
router.get('/:topicId/lessons/:lessonId', LessonController.getLesson);

module.exports = router;