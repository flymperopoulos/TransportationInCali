var fs = require('fs');
var sqlite = require("sqlite3").verbose();

var file = "transportation.db";
var exists = fs.existsSync(file);

if (!exists) {
	console.log("No DB file.");
	process.exit(0);
}
var db = new sqlite.Database(file);

db.serialize(function() {
	var out = [];
	var index = [];
	db.all("SELECT * FROM counties WHERE county_name=(?)",['Yolo'], function(err, rows){
		for (var i = 0; i<rows.length; i++){
			var row = rows[i];
			if (row.pop_mode.match('ALL') === null && row.pop_total.match('ALL') === null) {
				// console.log(row);
				if (checkInList(index, row.reportyear) !== null) {
					var obj = out[checkInList(index, row.reportyear)];
					if (!obj[row.mode])
						obj[row.mode] = row.pop_mode;
					if (Number(obj.pop_total) !== Number(row.pop_total)) {
						// obj.pop_total = (obj.pop_total<row.pop_total) ? row.pop_total : obj.pop_total;
					}
				} else {
					index.push(row.reportyear);
					var obj = createCounty(row.county_name, row.reportyear, row.mode, row.pop_mode, row.pop_total)
					out.push(obj);
				}
			}
		}
		console.log(out);	
	})
})

var COLUMNS = [ "reportyear", "race_eth_name", "county_name", "mode", "pop_mode", "pop_total"];

function createCounty(name, year, mode, val, pop_total) {
	var obj = {};
	obj.name = name;
	obj.year = year;
	obj[mode] = val;
	obj.pop_total = pop_total;
	console.log(pop_total);
	return obj;
}

function checkInList(lst, str) {
	for (var i=0; i<lst.length; i++) {
		if (str.match(lst[i]) != null) {
			return i;
		}
	}

	return null;
}