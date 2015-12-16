var express = require("express");
var path = require("path");
var sqlite = require('sqlite3');
var fs = require('fs');


var app = express();
var PORT = process.env.PORT || 3000;

var file = "transportation.db";
var exists = fs.existsSync(file);

if (!exists) {
	console.log("No DB file.");
	process.exit(0);
}

var db = new sqlite.Database(file);

app.use(express.static(path.join(__dirname, "public")));

app.get("/data/:county", function(req, res) {
	// var fields = req.params.county;
	db.serialize(function() {
		console.log(req.params);
		var out = [];
		var index = [];
		db.all("SELECT * FROM counties WHERE county_name=(?)",[req.params.county], function(err, rows){
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
			var str = JSON.stringify(out);
			// console.log(str);
			res.send(str);	
		})
	})

	
});


app.listen(PORT);
console.log('Listening on Port', PORT);


function createCounty(name, year, mode, val, pop_total) {
	var obj = {};
	obj.name = name;
	obj.year = year;
	obj[mode] = val;
	obj.pop_total = pop_total;
	// console.log(pop_total);
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