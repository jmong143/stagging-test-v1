const bcrypt = require('bcrypt');
const config = require('../../config').auth; 
const jwt = require('jsonwebtoken');
const User = require('../../models/Users');
const mongoose = require('mongoose');

require('dotenv').config();

const SessionController = {
	validateToken: function(req, res, next){		
		let token = req.headers['token'];
		let clientid = req.headers['x-client-id'];
		let clientsecret = req.headers['x-client-secret'];

		if (!token){
			return res.status(401).send({ auth: false, message: 'Missing token.' })
		};

		jwt.verify(token, config.secret, function(err, decoded) {
			if (err) {
				return res.status(500).send({ 
					auth: false, 
					message: 'Failed to authenticate token.' 
				});
			}else {
				User.findOne({ _id: decoded._id }).then(function (user) {
					if ( user.isAdmin === false) {
						//console.log(user);
						next();
					} else {
						res.status(500).send({ 
							auth: false, 
							message: 'Unauthorized.' 
						});
					}
				});
			}
		});
	},

	validateApp: function(req, res, next){
		require('dotenv').config();
		let clients = config.clients.split(',');

		let clientid = req.headers['x-client-id'];
		let clientsecret = req.headers['x-client-secret'];

		if (!clientid){
			return res.status(401).send({ 
				auth: false, 
				message: 'Client ID is missing.' 
			});
		};

		if (!clientsecret){
			return res.status(401).send({ 
				auth: false, 
				message: 'Client Secret is missing.' 
			});
		};

		if(clients.indexOf(clientid) == -1){
			return res.status(401).send({ 
				auth: false, 
				message: 'Client ID is invalid.' 
			});
		}

		if(config.secret !== clientsecret){
			return res.status(401).send({ 
				auth: false, 
				message: 'Client Secret is invalid.' 
			});
		}

		next();
	},
	validateAdminToken: function(req, res, next){		
		let token = req.headers['token'];
		let clientid = req.headers['x-client-id'];
		let clientsecret = req.headers['x-client-secret'];

		if (!token){
			return res.status(401).send({ auth: false, message: 'No token provided.' })
		};

		jwt.verify(token, config.secret, function(err, decoded) {
			if (err) {
				return res.status(500).send({ 
					auth: false, 
					message: 'Failed to authenticate token.' 
				});
			}else {
				User.findOne({ _id: decoded._id }).then(function (user) {
					if ( user.isAdmin === true) {
						//console.log(user);
						next();
					} else {
						res.status(500).send({ 
							auth: false, 
							message: 'Unauthorized.' 
						});
					}
				});
			}
		});
	},
}

module.exports = SessionController;