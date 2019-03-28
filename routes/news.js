const express = require('express');
const router = express.Router();
const SessionController = require('./controllers/SessionController');
const NewsController = require('./controllers/NewsController');

/* News Management - Admin */
router.post('/', SessionController.validateApp, SessionController.validateAdminToken, NewsController.createNews);
router.put('/:newsId', SessionController.validateApp, SessionController.validateAdminToken, NewsController.updateNews);
router.delete('/:newsId', SessionController.validateApp, SessionController.validateAdminToken, NewsController.archiveNews);

/* Front & Admin Get News */
router.get('/', SessionController.validateApp, NewsController.getNews);
router.get('/:newsId', SessionController.validateApp, NewsController.getNewsDetails);

module.exports = router;