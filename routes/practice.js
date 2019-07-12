/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const PracticeController = require('./controllers/PracticeController');
const SessionController = require('./controllers/SessionController');

router.use('*', SessionController.validateApp);

/* Practice Management - Admin */
router.post('/', SessionController.validateAdminToken, PracticeController.createPractice);
router.put('/topics/:topicId', SessionController.validateAdminToken, PracticeController.updatePractice);
router.delete('/topics/:topicId', SessionController.validateAdminToken, PracticeController.deletePractice);


router.get('/topics/:topicId', PracticeController.getByTopic); 
router.get('/subjects/:subjectId', PracticeController.getBySubject);

module.exports = router;