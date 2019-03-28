//Model
const News = require('../../models/News');
const User = require('../../models/Users');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../config').auth; 

const DailyTipsController = {

	createNews: async (req, res) => {
		// Create News
		let token = req.headers['token'];
		let user, news, decoded, saveNews;

		try {

			decoded = await jwt.verify(token, config.secret);
			user = await User.findOne({ _id: decoded._id});

		} finally {
			if(!decoded) {
				res.status(401).json({
					message: 'Unauthorized'
				});
			} else if (decoded && user){
				news = new News({
					_id: new mongoose.Types.ObjectId(),
					title: req.body.title,
					description: req.body.description,
					createdBy: user.firstName + ' ' + user.lastName,
					isArchive: false
				});

				saveNews = await news.save();

				if(!saveNews) {
					res.status(500).json({
						message: 'Something went wrong.'
					});	
				} else {
					res.status(200).json({
						message: 'News has been successfully created.'
					});
				}
			} else {
				res.status(500).json({
					message: 'Something went wrong.'
				});	
			}
		}
	},

	getNews: async (req, res) => {
		let token = req.headers['token'];
		let news, user, decoded;
		let newBody = [];
		let query = {};

		try {
			decoded = await jwt.verify(token, config.secret);
			user = await User.findOne({ _id: decoded._id});
			
			// Show only unarchived news on non-admin users
			if (user.isAdmin === false) {
				query = { isArchive: false };
			}

			news = await News.find(query).sort({"createdAt": -1});
		} finally {
			if (!decoded){
					res.status(401).json({
					message: 'Unauthorized.'
				});
			}else if (news) {
				news.forEach((n) => {
					newBody.push({
						id: n._id,
						title: n.title,
						createdBy: n.createdBy,
						createdAt: n.createdAt
					});
				});
				res.status(200).json(newBody);
			} else {
				res.status(500).json({
					message: 'Something went wrong.'
				});
			}
		}
	},

	getNewsDetails: async (req, res) => {

		let news;

		try {
			
			news = await News.findOne({ _id: req.params.newsId });

		} finally {
			if (!news) {
				res.status(500).json({
					message: 'Something went wrong.'
				});
			} else {
				res.status(200).json({
					id: news._id,
					title: news.title,
					description: news.description,
					createdBy: news.createdBy,
					createdAt: news.createdAt,
					updatedAt: news.updatedAt
				})
			}
		}
	},

	updateNews: async (req, res) => {
		let news;
		try {
			news = await News.findOne({ _id: req.params.newsId });
		} finally {
			if(!news) {
				res.status(400).json({
					message: 'News does not exist.'
				});
			} else {
				await News.findOneAndUpdate(
					{ _id: req.params.newsId},
					{ $set: {
						title: req.body.title,
						description: req.body.description,
						updatedAt: Date.now(),
						isArchive: req.body.isArchive,

					}},
					{ new: true }
				);

				res.status(200).json({
					message: 'News details successfuly updated.'
				});
			}
		}
	},

	archiveNews: async (req, res) => {
		let news;
		try {
			news = await News.findOne({ _id: req.params.newsId });
		} finally {
			if(!news) {
				res.status(400).json({
					message: 'News does not exist.'
				});
			} else {
				await News.findOneAndUpdate(
					{ _id: req.params.newsId},
					{ $set: {
						updatedAt: Date.now(),
						isArchive: true,

					}},
					{ new: true }
				);

				res.status(200).json({
					message: 'News details successfuly archived.'
				});
			}
		}
	}
}

module.exports = DailyTipsController;