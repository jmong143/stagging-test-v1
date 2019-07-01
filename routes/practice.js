/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const PracticeController = require('./controllers/PracticeController');
const SessionController = require('./controllers/SessionController');

/* News Management - Admin */
router.get('/topics/:topicId', SessionController.validateApp, PracticeController.generatePractice);

module.exports = router;