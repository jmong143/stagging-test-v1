/* Dependencies */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../config').auth;

/* Models Required */
const Profile = require('../../models/Profile');
const SubjectCode = require('../../models/SubjectCode');
const User = require('../../models/Users');
const News = require('../../models/News')
const Activity = require('../../models/Activity');
const Questions = require('../../models/Question');
const Mock = require('../../models/Mock');

const Subject = require('../../models/Subject');

const HomepageController = {

	getHomepage: async (req, res) => {

		let token = req.headers['token'];
		let decoded, user, profile, subjectCode, recent, news, subjects, questions, mocks;
		let questionIds = {};
		let mockObj = {};
		// Homepage Get
		try {
			decoded = await jwt.verify(token, config.secret);
			user = await User.findOne({ _id: decoded._id });
			profile = await Profile.findOne({ userId: decoded._id}) || {};
			subjectCode = await SubjectCode.findOne({ subjectCode: user.subjectCode}) || { subjects: [] };
			recent =  await Activity.find( { userId: decoded._id } ).sort({date: -1}).limit(9) || [];
			news = await News.find({isArchive: false}).sort( { updatedAt: -1 } ).limit(9) || [];
			subjects = await Subject.find();
			questions = await Questions.find({ isArchive: false });
			mocks = await Mock.find();

			questions.forEach((question)=> {
				questionIds[question.subjectId] ? questionIds[question.subjectId]++ : questionIds[question.subjectId] = 1;
			});

			mocks.forEach((mock) => {
				mockObj[mock.subjectId] ? mockObj[mock.subjectId]++ : mockObj[mock.subjectId] = 1; 
			});

		} finally {
			// console.log(mockObj);
			if (!decoded) {
				res.status(401).json({
					message: "Unauthorized"
				});
			} else {
				let _recent = [];
				let _news = [];
				let _subjects = [];

				recent.forEach((rcnt)=>{
					
					let name;
					if (rcnt.details.module == 'Lessons') {
						name = rcnt.details.subject;
					} else if (rcnt.details.module == 'Subscription') {
						name = 'Activated Subject Code';
					} else {
						name = '';
					}
					_recent.push({
						id: rcnt._id,
						name: name,
						date: rcnt.date
					});
				});

				subjectCode.subjects.forEach((subject)=> {
					subjects.forEach((s)=> {
						if (s.id == subject.subjectId){
							_subjects.push({
								id: s._id,
								code: s.code,
								name: s.name,
								numberOfQuestions: questionIds[s._id] || 0,
								hasMock: mockObj[s._id] ? true : false,
								imageUrl: s.imageUrl,
								createdAt: s.createdAt
							});
						}
					});
				});
				news.forEach((n)=>{
					_news.push({
						id: n._id,
						title: n.title,
						description: n.description,
						author: n.author,
						imageUrl: n.imageUrl,
						createdBy: n.createdBy,
						createdAt: n.createdAt,
						updatedAt: n.updatedAt,
						isArchive: n.isArchive
					});

				});

				await res.status(200).json({
					user: {
						id: user._id,
						email: user.email,
						firstName: user.firstName,
						lastName: user.lastName,
						birthDate: profile.birthDate || '',
						mobileNumber: profile.mobileNumber || '',
						gender: profile.gender || '',
						school: profile.school || '',
						updatedAt: profile.updatedAt || '',
					},
					subjects: {
						subjectCode: subjectCode.subjectCode || '',
						list: _subjects || [], //// ETO YUN
						activatedAt: subjectCode.activatedAt || '',
						expiresAt: subjectCode.expiresAt || ''
					},
					recentActivities: _recent,
					news: _news
				});	
			}
			
		};
	}	
}

module.exports = HomepageController;