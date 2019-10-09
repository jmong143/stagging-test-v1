/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const SessionController = require('./controllers/SessionController');
const ProgressController = require('./controllers/ProgressController');

router.use('*', SessionController.validateApp);

/* Progress Viewing - Admin */
router.get('/users/:userId', SessionController.validateAdminToken, ProgressController.getStudentProgress);

router.get('/overall', ProgressController.getOverallProgress);
router.get('/subjects/:subjectId', ProgressController.getProgressBySubject);
module.exports = router;