const v3 = require("node-hue-api").v3,
      hueApi = v3.api
      
function parseScene(scene) {
	return {
		id: scene.id,
		name: scene.name,
		lightIds: scene.lights
	}
}

async function allScenes(api) {
	const scenes = await api.scenes.getAll()
	const parsedScenes = scenes.map(parseScene)
	return parsedScenes
}
exports.allScenes = allScenes

function parseLight(light) {
	return {
		id: light.id,
		name: light.name,
		state: light.state
	}
}

async function allLights(api) {
	const lights = await api.lights.getAll()
	const parsedLights = lights.map(parseLight)
	return parsedLights
}
exports.allLights = allLights

async function parseRoom(api, room) {
	const lights = await Promise.all(room.lights.map(async x => await api.lights.getLight(x)))
	const parsedLights = lights.map(parseLight)
	return {
		id: room.id,
		name: room.name,
		state: room.state,
		lights: parsedLights
	}
}

async function allRooms(api) {
	const groups = await api.groups.getAll()
	const rooms = groups.filter(group => group.type == "Room")
	
	const parsedRooms = await Promise.all(rooms.map(async x => await parseRoom(api, x)))
	return parsedRooms
}
exports.allRooms = allRooms

function sortScenesToRooms(scenes, rooms) {
	for (const scene of scenes) {
		for (const lightId of scene.lightIds) {
			const room = rooms.find(room => {
				const matchingLight = room.lights.find(light => light.id == lightId)
				return matchingLight
			})
			if (!room.scenes) {
				room.scenes = []
			}
			const existingScene = room.scenes.find(existingScene => existingScene.id == scene.id)
			if (!existingScene) {
				room.scenes.push(scene)
			}
		}
	}
	return rooms
}
exports.sortScenesToRooms = sortScenesToRooms

async function allRoomsWithScenes(api) {
	const rooms = await allRooms(api)
	const scenes = await allScenes(api)
	return sortScenesToRooms(scenes, rooms)
}
exports.allRoomsWithScenes = allRoomsWithScenes
