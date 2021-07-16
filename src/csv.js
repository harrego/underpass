const log = require("./log")

function read(data) {
	var headers = []
	var parsed = {}
	const splitData = data.split("\n")
	for (const columnIndex in splitData) {
		const rows = splitData[columnIndex].split(",")
		for (const rowIndex in rows) {
			const row = rows[rowIndex]
			if (columnIndex == 0) {
				headers.push(row)
				if (parsed[row] != undefined) {
					log("csv warning", `duplicate header "${row}" (row ${rowIndex}), matching columns will be merged`)
					continue
				}
				parsed[row] = []
			} else {
				if (row.length <= 0) {
					continue
				}
				if (headers.length <= rowIndex) {
					log("csv warning", `"${row}" (col ${parseInt(columnIndex) + 1}, row ${parseInt(rowIndex) + 1}) doesn't have a header, ignoring`)
					continue
				}
				parsed[headers[rowIndex]].push(row)
			}
		}		
	}
	return parsed
}
exports.read = read

function write(data) {
	var buf = ""
	const headers = Object.keys(data)
	
	var maxIndex = 0
	for (const i in data) {
		maxIndex = Math.max(data[i].length, maxIndex)
	}
	
	for (var i = 0; i < maxIndex + 1; i++) {
		for (const headerIndex in headers) {
			const header = headers[headerIndex]
			if (i == 0) {
				buf += header || ""
			} else {
				buf += data[header][i - 1] || ""
			}
			if (headerIndex != headers.length - 1) {
				buf += ","
			}
		}
		if (i != maxIndex) {
			buf += "\n"
		}
	}
	return buf
}
exports.write = write
