const express = require('express');
const router = express.Router();
const AuthController = require('./controllers/AuthController');
const SessionController = require('./controllers/SessionController');

/* Authentication Routes */
router.post('/login', SessionController.validateApp, AuthController.login);
router.post('/register', SessionController.validateApp, AuthController.register);
//router.post('/logout', SessionController.validateApp, AuthController.logout);

/* Validate Session */
router.get('/sessions/validate', SessionController.validateApp, SessionController.validateToken, function (req ,res) {
	res.status(200).json({
		auth: true,
		message: 'Token is valid.'
	});
});

/* Admin - Auth Routes */
router.post('/admin/register', SessionController.validateApp, SessionController.validateAdminToken, AuthController.adminRegister);
router.get('/sessions/validate/admin', SessionController.validateApp, SessionController.validateAdminToken, function (req, res) {
	res.status(200).json({
		auth: true,
		message: 'Admin Token is valid.'
	});
});

module.exports = router;