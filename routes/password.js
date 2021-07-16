const express = require("express")
const router = express.Router()

const get = require("../src/get")

router.get("/", async (req, res) => {
	const hueApi = req.app.get("hue")
	const rooms = await get.allRoomsWithScenes(hueApi)
	
	res.render("hue", { linkPrefix: `/${req.app.get("password")}`, rooms: rooms })
})

router.use("/api/**/:id/**", (req, res, next) => {
	let id
	try {
		id = parseInt(req.params["id"])
		req.paramId = id
	} catch (err) {
		res.sendStatus(500)
		return
	}
	next()
})

router.use("/api/**/:status", (req, res, next) => {
	const status = req.params["status"]
	if (status.toLowerCase() == "on") {
		req.paramStatus = true
	} else if (status.toLowerCase() == "off") {
		req.paramStatus = false
	}
	next()
})

router.get("/api/light/:id/:status", (req, res) => {
	const lightOn = req.paramStatus
	const lightId = req.paramId

	const hueApi = req.app.get("hue")
	hueApi.lights.setLightState(lightId, { on: lightOn })
	res.redirect(`/${req.app.get("password")}`)
})

router.get("/api/room/:id/:status", async (req, res) => {
	const roomOn = req.paramStatus
	const roomId = req.paramId
	
	const hueApi = req.app.get("hue")
	
	let rawRoom
	try {
		rawRoom = await hueApi.groups.getGroup(roomId)
	} catch (err) {
		console.log(err)
		res.sendStatus(500)
		return
	}
	for (const lightId of rawRoom.lights) {
		hueApi.lights.setLightState(lightId, { on: roomOn })
	}
	res.redirect(`/${req.app.get("password")}`)
})

router.get("/api/scene/:sceneId/activate", (req, res) => {
	const sceneId = req.params["sceneId"]
	
	const hueApi = req.app.get("hue")
	hueApi.scenes.activateScene(sceneId)
	res.redirect(`/${req.app.get("password")}`)
})

module.exports = router
