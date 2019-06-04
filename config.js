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
	}
}

module.exports = Config;