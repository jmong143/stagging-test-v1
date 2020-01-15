'use strict';

const config = require('../config'); 
const AWS = require('aws-sdk');

let space = new AWS.S3({
	endpoint: config.digitalOcean.endpoint,
	useAccelerateEndpoint: false,
	credentials: new AWS.Credentials(config.digitalOcean.id, config.digitalOcean.secret, null)
});

const DigitalOcean = {
	upload: (file, folder) => {
		folder ? '' : folder = 'uncategorized';
		let uploadParameters = {
			Bucket: config.digitalOcean.bucket+'/'+folder,
			ContentType: file.mimetype, 
			Body: file.buffer,
			ACL: config.digitalOcean.acl,
			Key: `${Date.now()}_${file.originalname}` // Generate
		};

		return new Promise((resolve, reject) => {
			try {
				space.upload(uploadParameters, function (error, data) {
					if (error){
						reject(error) 
					}
					resolve(data)
				});
			} catch (e) {
				reject (e)
			}
		});
	},
}

module.exports = DigitalOcean;