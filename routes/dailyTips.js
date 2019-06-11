/* Dependencies */
const express = require('express');
const router = express.Router();

/* Controllers */
const SessionController = require('./controllers/SessionController');
const DailyTipsController = require('./controllers/DailyTipsController');

/* Daily Tips Management - Admin */
router.post('/', SessionController.validateApp, SessionController.validateAdminToken, DailyTipsController.createDailyTips);
router.get('/', SessionController.validateApp, SessionController.validateAdminToken, DailyTipsController.getTips);
router.put('/:dailyTipsId', SessionController.validateApp, SessionController.validateAdminToken, DailyTipsController.updateDailyTips);
router.delete('/:dailyTipsId', SessionController.validateApp, SessionController.validateAdminToken, DailyTipsController.archiveDailyTips);

/* Front Get Daily Tips */
router.get('/random', SessionController.validateApp, DailyTipsController.getDailyTips);

module.exports = router;