const bcrypt = require('bcrypt');
const config = require('../../config').auth; 
const jwt = require('jsonwebtoken');
const User = require('../../models/Users');
const mongoose = require('mongoose');

require('dotenv').config();

const SessionController = {
	
	validateToken: async (req, res, next) => {		
		let token = req.headers['token'];
		if (!token){
			return res.status(401).send({ message: 'Token is Required.' })
		};

		try {
			const decoded = await jwt.verify(token, config.secret);
			const user = await User.findOne({ _id: decoded._id });

			if (user.isAdmin === false) {
				next();
			} else {
				res.status(401).send({ 
					message: 'Unauthorized.' 
				});
			}

		} catch (e) {
			res.status(401).send({ 
				message: 'Unauthorized.' 
			});
		}
	},

	validateApp: (req, res, next) => {
		let clients = config.clients.split(',');
		let clientid = req.headers['x-client-id'];
		let clientsecret = req.headers['x-client-secret'];

		if (!clientid){
			return res.status(401).send({ 
				message: 'Client ID is missing.' 
			});
		};

		if (!clientsecret){
			return res.status(401).send({ 
				message: 'Client Secret is missing.' 
			});
		};

		if(clients.indexOf(clientid) == -1){
			return res.status(401).send({ 
				message: 'Client ID is invalid.' 
			});
		}

		if(config.secret !== clientsecret){
			return res.status(401).send({ 
				message: 'Client Secret is invalid.' 
			});
		}

		next();
	},

	validateAdminToken: async (req, res, next) => {		
		let token = req.headers['token'];
		if (!token){
			return res.status(401).send({ message: 'Token is Required.' })
		};

		try {
			const decoded = await jwt.verify(token, config.secret);
			const user = await User.findOne({ _id: decoded._id });

			if (user.isAdmin === true) {
				next();
			} else {
				res.status(401).send({ 
					message: 'Unauthorized.' 
				});
			}

		} catch (e) {
			res.status(401).send({ 
				message: 'Unauthorized.' 
			});
		}
	},
}

module.exports = SessionController;