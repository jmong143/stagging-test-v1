const Config = {
	auth:{
		clients: process.env.CLIENT_IDS,
		secret: process.env.CLIENT_SECRET
	},
	server: {
		port: process.env.PORT,
		appname: process.env.APP_NAME
	},
	db: {
		host: process.env.DB_HOST,
		database: process.env.DB_DATABASE,
		username: process.env.DB_USER,
		password: process.env.DB_PASS,
		port: process.env.DB_PORT,
		atlasURI: process.env.DB_ATLAS_URI
	},
	mail: {
		host: process.env.MAIL_SERVICE,
		port: process.env.MAIL_PORT,
		secureConnection: process.env.MAIL_SECURE_CONNECTION,
		auth: {
			user: process.env.MAIL_USER,
			password: process.env.MAIL_PASSWORD
		}
	},
	questions: {
		choicesCount: process.env.QUESTION_CHOICES_COUNT,
		practiceCount: process.env.QUESTION_PRACTICE_COUNT,
		testCount: process.env.QUESTION_TEST_COUNT,
		mockCount: process.env.QUESTION_MOCK_COUNT
	},
	pagination: {
		defaultItemsPerPage: process.env.PAGINATION_DEFAULT
	},
	superAdminCount: process.env.SUPER_ADMIN_COUNT,
	superAdminPassword: process.env.SUPER_ADMIN_PASSWORD,
	digitalOcean: {
		id: process.env.DO_ID,
		secret: process.env.DO_SECRET,
		endpoint: process.env.DO_ENDPOINT,
		bucket: process.env.DO_BUCKET,
		useAccelerateEndpoint: process.env.DO_USE_ACCELERATE_ENDPOINT,
		acl: process.env.DO_FILES_ACL
	}
}

module.exports = Config;