//Model
const DailyTips = require('../../models/DailyTips');
const mongoose = require('mongoose');

const DailyTipsController = {

	createDailyTips: async (req, res) => {
		// Create new daily tip
		const _dailyTips = new DailyTips ({
			_id: new mongoose.Types.ObjectId(),
			tip: req.body.tip
		});

		try {
			const saveDailyTips = await _dailyTips.save();
			if (saveDailyTips) {
				res.status(200).json({
					message: 'New Daily Tips has been added.'
				});	
			}
		} catch(err) {
			res.status(500).json({
				message: 'Something went wrong.'
			});
		}
	},

	getTips: async (req, res) => {

		try {
			const tips = await DailyTips.find({});

			let newBody = {
				tips: [],
				total: tips.length
			};
			
			tips.forEach((tip)=>{
				newBody.tips.push({
					id: tip._id,
					tip: tip.tip,
					isArchive: tip.isArchive
				});
			});
			res.status(200).json(newBody);
		}catch (err) {
			res.status(500).json({
				message: 'Daily Tips not Found.'
			});
		}
	},

	getDailyTips: async (req, res) => {

		try {
			const tip = await DailyTips.aggregate([ 
				{ $match: { isArchive: false }},
				{ $sample: {size: 1} }			  
			]);

			let newBody = {
				id: tip[0]._id,
				tip: tip[0].tip
			};

			res.status(200).json(newBody);

		} catch (err) {
			res.status(500).json({
				message: 'Something went wrong.'
			});
		}
	},

	updateDailyTips: async (req, res) => {
		// Update Daily Tips
		try {

			const result = await DailyTips.findOneAndUpdate(
				{ _id: req.params.dailyTipsId }, 
				{"$set": req.body },
				{"new":true});

			if (!result) {
				res.status(400).json({
					message: "Daily tip does not exist."
				});

			} else {
				res.status(200).json({
					message: 'Daily Tip has been successfuly updated.'
				});
			}

		} catch (err) {
			res.status(400).json({
				message: 'Daily tip does not exist.'
			});
		}
	},

	archiveDailyTips: async (req, res) => {
		// Archive Daily Tips
		try {

			const result = await DailyTips.findOneAndUpdate(
				{ _id: req.params.dailyTipsId }, 
				{"$set": { isArchive: true } },
				{"new":true});

			if (!result) {
				res.status(500).json({
					message: "Daily tip does not exist."
				});
			} else {
				res.status(200).json({
					message: 'Daily Tip has been successfuly archived.'
				});
			}

		} catch (err) {

			res.status(400).json({
				message: 'Daily tip does not exist.'
			});
		}
	}
}

module.exports = DailyTipsController;