const express = require('express');
const router = express.Router();
const SessionController = require('./controllers/SessionController');
const ProfileController = require('./controllers/ProfileController');

/* Profile Management */
router.get('/', SessionController.validateApp, SessionController.validateToken, ProfileController.getProfile);
router.put('/', SessionController.validateApp, SessionController.validateToken, ProfileController.updateProfile);

module.exports = router;