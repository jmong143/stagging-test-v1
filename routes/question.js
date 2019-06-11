/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const QuestionController = require('./controllers/QuestionController');
const SessionController = require('./controllers/SessionController');

/* News Management - Admin */
router.post('/', SessionController.validateApp, SessionController.validateAdminToken, QuestionController.addQuestion);
router.get('/', SessionController.validateApp, SessionController.validateAdminToken, QuestionController.getQuestions);
router.put('/:questionId', SessionController.validateApp, SessionController.validateAdminToken, QuestionController.updateQuestion);
router.delete('/:questionId', SessionController.validateApp, SessionController.validateAdminToken, QuestionController.deleteQuestion);

module.exports = router;