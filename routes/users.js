/* Dependencies */
var express = require('express');
var router = express.Router();

/* Controllers */
const UserController = require('./controllers/UserController');
const SessionController = require('./controllers/SessionController');
const SubjectCodeController = require('./controllers/SubjectCodeController');

router.use('*', SessionController.validateApp);

/* Admin User management */
router.get('/', SessionController.validateAdminToken, UserController.getUsers);
router.post('/', SessionController.validateAdminToken, UserController.createUser);
router.get('/:userId', SessionController.validateAdminToken, UserController.getUser);
router.delete('/:userId', SessionController.validateAdminToken, UserController.deleteUser);
router.post('/:userId/reactivate', SessionController.validateAdminToken, UserController.reactivateUser);
router.put('/:userId', SessionController.validateAdminToken, UserController.updateUser);
router.post('/managements', UserController.createSuperUser);

module.exports = router;