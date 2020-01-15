/* Dependencies */
const DigitalOcean = require(process.cwd()+'/services/DigitalOcean');

/* models */

const tag = 'Uploads';

const UploadsController = {
	upload: async (req, res, next) => {
			let doUpload;
		try {
			// console.log(req.file);

			doUpload = await DigitalOcean.upload(req.file, req.query.folder);
			res.status(200).json({
				result: 'success',
				message: 'Succesfully uploaded a file.',
				data: {
					eTag: doUpload.ETag,
					url: doUpload.Location,
					key: doUpload.key,
					bucket: doUpload.Bucket
				}
			});

		} catch(e) {
			res.status(500).json({
				result: 'failed',
				message: 'Failed to upload file.',
				error: e.message
			});
		}	
	}
}

module.exports = UploadsController;