/* Dependencies */
var express = require('express');
var router = express.Router();

/* Controllers */
const UserController = require('./controllers/UserController');
const SessionController = require('./controllers/SessionController');
const SubjectCodeController = require('./controllers/SubjectCodeController');

/* Admin User management */
router.get('/', SessionController.validateApp, SessionController.validateAdminToken, UserController.getUsers);
router.post('/', SessionController.validateApp, SessionController.validateAdminToken, UserController.createUser);
router.get('/:userId', SessionController.validateApp, SessionController.validateAdminToken, UserController.getUser);
router.delete('/:userId', SessionController.validateApp, SessionController.validateAdminToken, UserController.deleteUser);
router.post('/:userId/reactivate', SessionController.validateApp, SessionController.validateAdminToken, UserController.reactivateUser);


module.exports = router;