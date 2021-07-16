// imports
const log = require("./src/log")

const v3 = require("node-hue-api").v3,
      hueApi = v3.api

const auth = require("./src/auth")

const express = require("express")
const router = require("./routes/index")

// credential config
let hueUsername = process.env.HUEUSER
let password = process.env.PASSWORD
if (!password) {
	const randomPassword = require("crypto").randomBytes(5).toString("hex")
	password = randomPassword
	log("warning", `missing PASSWORD environment variable, use temp password "${randomPassword}"`)
}

if (!hueUsername) {
	log("warning", "missing HUEUSER environment variable, looking for credentials.csv")
	auth.readCsv().then(csvCreds => {
		if (csvCreds.username) {
			log("status", "using credentials from credentials.csv")
			hueUsername = csvCreds.username
			run()
			return
		}
		log("warning", "no credentials found in credentials.csv")
		
		auth.discoveryAuth()
		.then(auth => {
			if (!auth) {
				log("error", "setup auth failed")
				process.exit(1)
			}
			hueUsername = auth.username
			run()
		})
		.catch(err => {
			console.error(err)
			process.exit(1)
		})
	})
} else {
	run()
}

function run() {
	const app = express()
	app.set("password", password)
	app.set("view engine", "ejs")
	app.use("/", router)

	auth.discoverBridge()
	.then(ipAddress => {
		hueApi.createLocal(ipAddress).connect(hueUsername)
		.then(api => {
			app.set("hue", api)
			
			const port = process.env.PORT || 3000
			app.listen(port, () => {
				log("server", `running on port ${port}`)
			})
		}).catch(err => {
			log("error", "failed to connect to hue bridge, invalid username?")
			throw new Error(err)
		})
	}).catch(err => {
		log("error", "failed to get hue bridge ip address")
		throw new Error(err)
	})
}
