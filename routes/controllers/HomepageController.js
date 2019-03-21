/* Dependencies */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../config').auth;

/* Models Required */
const Profile = require('../../models/Profile');
const SubjectCode = require('../../models/SubjectCode');
const User = require('../../models/Users');


const HomepageController = {

	getHomepage: async (req, res) => {

		let token = req.headers['token'];
		let decoded, user, profile, subjectCode, recent, announcements, updates;
		// Homepage Get
		try {
			decoded = await jwt.verify(token, config.secret);
			user = await User.findOne({ _id: decoded._id });
			profile = await Profile.findOne({ userId: decoded._id}) || {};
			subjectCode = await SubjectCode.findOne({ userId: decoded._id}) || {};
			// To Follow:
			recent = {};
			announcements = {};
			updates = {};

		}catch(err){
			res.status(500).json({
				message: 'Something went wrong.'
			});
		} finally {
			res.status(200).json({
				user: {
					id: user._id,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					age: profile.age || '',
					gender: profile.gender || '',
					school: profile.school || '',
					updatedAt: profile.updatedAt || '',
				},
				subjects: {
					subjectCode: subjectCode.subjectCode || '',
					list: subjectCode.subjects || '',
					activatedAt: subjectCode.activatedAt || '',
					expiresAt: subjectCode.expiresAt || ''
				},
				recentActivities: recent,
				announcements: announcements,
				updates: updates
			});
		};
	}	
}

module.exports = HomepageController;