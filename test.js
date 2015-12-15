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
	db.each("SELECT county_name, reportyear, race_eth_name, pop_mode, pop_total FROM counties LIMIT 10", function(err, row){
		console.log(row);
	})
})