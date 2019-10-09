/* Dependencies */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../config'); 

/* Model */
const SubjectCode = require('../../models/SubjectCode');
const Subject = require('../../models/Subject');
const User = require('../../models/Users');
const MockRecords = require('../../models/MockResults');
const TestRecords = require('../../models/ExamRecords');
const Topic = require('../../models/Topic');

const ProgressController = {
	/* Admin */
	getStudentProgress: async (req, res, next) => {
		let user, subjectCode, subjects, mocks, progress;
		let tmpSubjects = [];

		try {
			user = await User.findOne({ _id: req.params.userId });
			subjectCode = await SubjectCode.findOne({ subjectCode: user.subjectCode}) || { subjects: [] };
			mocks = await MockRecords.find({ userId: user._id });

			subjectCode.subjects.forEach((subject) => {
				let subjectMockScore = 0;
				let mockAttempts = 0;
				let score = 0;
				let totalNumberQuestions = 0;

				mocks.forEach((mock) => {
					if(mock.subjectId == subject.subjectId) {
						mockAttempts++;
						score += mock.score;
						totalNumberQuestions += mock.numberOfQuestions;
					}
				});

				tmpSubjects.push({
					subjectId: subject.subjectId,
					name: subject.name,
					mockAttempts: mockAttempts,
					totalScore: score,
					totalNumberQuestions: totalNumberQuestions,
					average: score / totalNumberQuestions || 0
				});
			});

			// Compute for GWA

			let totalAverage = 0;

			tmpSubjects.forEach((subject)=> {
				totalAverage += subject.average;
			});

			let gwa = 100 * totalAverage / tmpSubjects.length;

			progress = {
				gwa: gwa,
				details: {
					subjects: tmpSubjects
				}
			};

			res.status(200).json({
				result: 'success',
				message: `Successfully get overall progress for ${user.firstName} ${user.lastName}`,
				data: progress
			});

		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to get overall progress.',
				error: e.message
			});
		}
	},


	/* Front */
	getOverallProgress: async (req, res,next) => {
		let token = req.headers['token'];
		let user, subjectCode, subjects, mocks, progress;
		let tmpSubjects = [];

		try {
			decoded = await jwt.verify(token, config.auth.secret);
			user = await User.findOne({ _id: decoded._id });
			subjectCode = await SubjectCode.findOne({ subjectCode: user.subjectCode}) || { subjects: [] };
			mocks = await MockRecords.find({ userId: user._id });

			subjectCode.subjects.forEach((subject) => {
				let subjectMockScore = 0;
				let mockAttempts = 0;
				let score = 0;
				let totalNumberQuestions = 0;

				mocks.forEach((mock) => {
					if(mock.subjectId == subject.subjectId) {
						mockAttempts++;
						score += mock.score;
						totalNumberQuestions += mock.numberOfQuestions;
					}
				});

				tmpSubjects.push({
					subjectId: subject.subjectId,
					name: subject.name,
					mockAttempts: mockAttempts,
					totalScore: score,
					totalNumberQuestions: totalNumberQuestions,
					average: score / totalNumberQuestions || 0
				});
			});

			// Compute for GWA

			let totalAverage = 0;

			tmpSubjects.forEach((subject)=> {
				totalAverage += subject.average;
			});

			let gwa = 100 * totalAverage / tmpSubjects.length;

			progress = {
				gwa: gwa,
				details: {
					subjects: tmpSubjects
				}
			};

			res.status(200).json({
				result: 'success',
				message: 'Successfully get overall progress',
				data: progress
			});

		} catch (e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to get overall progress.',
				error: e.message
			});
		}

	},

	getProgressBySubject: async (req, res, next) => {
		let token = req.headers['token'];
		let user, subjectCode, topics, tests, progress, subject;
		let tmpTopics = [];

		try {
			decoded = await jwt.verify(token, config.auth.secret);
			user = await User.findOne({ _id: decoded._id });
			subject = await Subject.findOne({ _id: req.params.subjectId });
			topics = await Topic.find({ subjectId: req.params.subjectId });
			tests = await TestRecords.find({ userId: user._id });

			let ave = 0;

			topics.forEach((topic) => {
				let topicExamRecords = 0; // Attempts 
				let topicExamScore = 0; 
				let totalNumberQuestions = 0;
				let attempts = 0;
				tests.forEach((test)=> {
					if(test.topicId == topic._id) {
						topicExamRecords++;
						topicExamScore += test.score;
						totalNumberQuestions += test.numberOfQuestions;
					}
				})

				tmpTopics.push({
					topicId: topic._id,
					topicNumber: topic.topicNumber,
					attempts: topicExamRecords,
					totalScore: topicExamScore,
					totalNumberQuestions: totalNumberQuestions,
					average: topicExamScore / totalNumberQuestions
				});
				ave += topicExamScore / totalNumberQuestions;
			});

			// compute for grade

			let subjectProgress = {
				subjectId: subject._id,
				code: subject.code,
				name: subject.name,
				grade: 100 * ave / tmpTopics.length,
				topics: tmpTopics
			};

			res.status(200).json(subjectProgress);
		} catch(e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to get progress by subject.',
				error: e.message
			});
		}
	}
};

module.exports = ProgressController;