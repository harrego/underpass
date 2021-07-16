const express = require("express")
const router = express.Router()

router.get("/", (req, res) => {
	res.sendStatus(403)
})

router.use("/:password", (req, res, next) => {
	if (req.params.password == req.app.get("password")) {
		next()
		return
	}
	res.sendStatus(403)
})

const password = require("./password")
router.use("/:password", password)

module.exports = router
