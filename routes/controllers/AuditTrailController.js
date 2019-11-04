/* Dependencies */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Config = require('../../config'); 

/* Models */
const AuditTrail = require('../../models/AuditTrail');
const mongoose = require('mongoose');
const User = require('../../models/Users');

const AuditTrailController = {
	
	addAuditTrail: async (log, token) => {
		let auditTrail, saveAuditTrail, decoded;	
		try {
			// Save recent activity

			decoded = await jwt.verify(token, Config.auth.secret);
			user = await User.findOne({ _id: decoded._id });
			auditTrail = new AuditTrail ({
				_id: new mongoose.Types.ObjectId(),
				userId: user._id,
				email: user.email,
				module: log.module,
				action: log.action,
				details: log.details,
				date: Date.now()
			});

			saveAuditTrail = await auditTrail.save();
			// console.log(saveAuditTrail);
		} catch (e) {
			console.log(e.message);
		}
	},

	getAuditTrail: async (req, res) => {
		let auditTrails;
		try {
			auditTrails = await AuditTrail.find().sort({ date: -1 });
			res.status(200).json({
				result: 'success',
				message: 'Successfully get audit trails',
				data: auditTrails
			});
		} catch(e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to get audit trails.',
				error: e.message
			});
		} 
	}
}


module.exports = AuditTrailController;