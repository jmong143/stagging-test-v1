const express = require('express');
const router = express.Router();
const SessionController = require('./controllers/SessionController');
const DailyTipsController = require('./controllers/DailyTipsController');

/* Daily Tips Management - Admin */
router.post('/', SessionController.validateApp, SessionController.validateAdminToken, DailyTipsController.createDailyTips);
router.get('/', SessionController.validateApp, SessionController.validateAdminToken, DailyTipsController.getTips);
router.put('/:dailyTipsId', SessionController.validateApp, SessionController.validateAdminToken, DailyTipsController.updateDailyTips);

/* Front Get Daily Tips */
router.get('/random', SessionController.validateApp, SessionController.validateToken, DailyTipsController.getDailyTips);

module.exports = router;