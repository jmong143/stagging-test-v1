/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const GoalController = require('./controllers/GoalController');
const SessionController = require('./controllers/SessionController');
router.use('*', SessionController.validateApp);

/* Goal Management - Admin */
router.get('/', GoalController.getAllPreGoal);
router.post('/', SessionController.validateAdminToken, GoalController.addPreGoal);
router.post('/create', SessionController.validateAdminToken, GoalController.addGoal);
router.post('/update', SessionController.validateAdminToken, GoalController.updateGoalProgress);

/* Goal Management - User */
// router.post('/goals', GoalController.createGoal);

module.exports = router;