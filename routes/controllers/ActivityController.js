/* Dependencies */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../../config').auth; 

/* Models */
const Activity = require('../../models/Activity');
const mongoose = require('mongoose');
const User = require('../../models/Users');

const ActivityController = {
	
	addActivity: async (details, userId) => {
		let result, _recentActivity;	
		try {
			// Save recent activity
			_recentActivity = new Activity ({
				_id: new mongoose.Types.ObjectId(),
				userId: userId,
				details: details,
				date: Date.now()
			});

			await _recentActivity.save();
		} finally {
			if (!_recentActivity) {
				console.log('failed to log activity');
			} else {
				console.log("["+_recentActivity.date+"][userId: "+userId+"]["+JSON.stringify(details)+"]");
			}
		}
	},

	getRecentActivities: async (req, res) => {
		let recentActivity, decoded;
		let newBody = {
			
		};
		let token = req.headers['token'];

		try {
			decoded = await jwt.verify(token, config.secret);
			recentActivity = await Activity.find({ userId: decoded._id}).sort({"date": -1}).limit(10);
			
			res.status(200).json({
				result: "success",
				message: "Successfully get recent activities.",
				data: recentActivity
			});
		} catch(e) {
			res.status(500).json({
				result: "failed",
				message: 'Failed to get recent activities.',
				error: e.message
			});
		} 
	}
}


module.exports = ActivityController;