const express = require('express');
const router = express.Router();
const AuthController = require('./controllers/AuthController');
const SessionController = require('./controllers/SessionController');

/* Front - Authentication Routes */
router.post('/login', SessionController.validateApp, AuthController.login);
router.post('/register', SessionController.validateApp, AuthController.register);
router.post('/password/reset', SessionController.validateApp, AuthController.resetPassword);
router.post('/password/change', SessionController.validateApp, AuthController.changePassword);
router.get('/sessions/validate', SessionController.validateApp, SessionController.validateToken, function (req ,res) {
	res.status(200).json({
		auth: true,
		message: 'Token is valid.'
	});
});

/* Admin - Authentication Routes */
router.post('/admin/register', SessionController.validateApp, SessionController.validateAdminToken, AuthController.adminRegister);
router.post('/admin/login', SessionController.validateApp, AuthController.adminLogin);
router.post('/admin/password/change', SessionController.validateApp, SessionController.validateAdminToken, AuthController.changePassword);
router.get('/admin/sessions/validate', SessionController.validateApp, SessionController.validateAdminToken, function (req, res) {
	res.status(200).json({
		auth: true,
		message: 'Admin Token is valid.'
	});
});

module.exports = router;