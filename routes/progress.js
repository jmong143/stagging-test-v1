/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const SessionController = require('./controllers/SessionController');
const ProgressController = require('./controllers/ProgressController');

router.use('*', SessionController.validateApp);

/* Progress Viewing - Admin */
router.get('/users/:userId', SessionController.validateAdminToken, ProgressController.getStudentProgress);

router.get('/mock/overall', ProgressController.getOverallMockProgress);
router.get('/mock/subjects/:subjectId', ProgressController.getMockProgressBySubject);

router.get('/test/overall', ProgressController.getOverallTestProgress);
router.get('/test/subjects/:subjectId', ProgressController.getProgressBySubject);
module.exports = router;