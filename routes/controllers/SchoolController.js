//Model
const School = require('../../models/School');
const User = require('../../models/Users');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../config').auth; 

const SchoolController = {

	addSchools: async (req, res) => {
		let saveSchools;
		let docs = [];
		req.body.forEach((school)=>{
			docs.push({
				_id: new mongoose.Types.ObjectId(),
				name: school,
				isArchive: false
			});
		});

		try {
			saveSchools = await School.insertMany(docs);
		} finally {
			if (!saveSchools) {
				res.status(500).json({
					message: 'Something went Wrong.'
				});
			} else {
				res.status(200).json({
					message: 'Schools successfully added.'
				});
			}
		}
	},

	updateSchool: async (req, res) => {
		let school, updateSchool
		try {
			school = await School.findOne({ _id: req.params.schoolId });
		} finally {
			if (!school) {
				res.status(400).json({
					message: 'School does not exist.'
				});
			} else {
				updateSchool = await School.findOneAndUpdate(
					{ _id: req.params.schoolId },
					{ $set: {
						name: req.body.name,
						isArchive: req.body.isArchive
					}},
					{ new: true }
				);
				if (!updateSchool) {
					res.status(500).json({
						message: 'Something went wrong.'
					});
				} else {
					res.status(200).json({
						message: 'School details successfully updated.'
					});
				}
			}
		}
	},

	getSchools: async (req, res) => {
		let schools;
		try {
			schools = await School.find();
		} finally {
			if(!schools) {
				res.status(500).json({
					message: 'Something went wrong'
				});
			} else {
				let newBody = [];
				schools.forEach((school)=> {
					newBody.push({
						_id: school.id,
						name: school.name,
						isArchive: school.isArchive
					});
				});
				res.status(200).json(newBody);
			}
		}
	}
};

module.exports = SchoolController;