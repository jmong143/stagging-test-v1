var express = require('express');
var router = express.Router();
const UserController = require('./controllers/UserController');
const SessionController = require('./controllers/SessionController');

/* Admin User management */
router.get('/', SessionController.validateApp, SessionController.validateAdminToken, UserController.getUsers);
router.post('/', SessionController.validateApp, SessionController.validateAdminToken, UserController.createUser);
router.get('/:userId', SessionController.validateApp, SessionController.validateAdminToken, UserController.getUser);

module.exports = router;