//Data set has number of a race in a county and the number that use a specific transportation. 
//Table Counties: 
//COLUMNS: 2000 working population, 2000 population using each transportation, 
//        2006 " ", 2006 " " ", 2010 " ", 2010 " " ", 
var fs = require('fs');
var sqlite = require("sqlite3");

var file = "transportation.db";
var exists = fs.existsSync(file);
var CSV = {};
var COLUMNS = [ "reportyear", "race_eth_name", "county_name", "mode", "pop_mode", "pop_total"];

if(process.argv.length > 2){
  if (!exists) {
    console.log("Creating DB file.");
    fs.openSync(file, "w");
  }
  var db = new sqlite.Database(file);

  db.serialize(function() {
    if (exists) {
      db.run("DROP TABlE IF EXISTS counties");
    } 
    console.log("Creating Table counties");
    var str = COLUMNS.join(' TEXT,\n');
    str = str+" TEXT";
    console.log(str,'\n');
    db.run("CREATE TABLE counties ("+str+")",[], function (err){
      if (err)
        console.log("Creating Table error: ",err);
    });
  
    var stmt = db.prepare("INSERT INTO counties VALUES (?,?,?,?,?,?)", [], function(err){
      if (err)
        console.log('FUCK', err);
    });
    
    // var stmt = "INSERT INTO 'counties' "

    for (var i=2; i<process.argv.length; i++) {
      console.log('Started adding: ' + process.argv[i]);
      createDB(db, process.argv[i], stmt, done);
    }
  });

} else {
  console.log("Usage: node app.js filepath1 filepath2 ...");
  process.exit(1);
}

function createDB(db, path, stmt, callback) {
  fs.open(path, 'r', function(err, fd) {
    if (err) {
      return callback(err);
    }
    var read_length = 1000;
    var buffer = new Buffer(read_length);
    fs.read(fd, buffer, 0, read_length, null, function(err, bytesRead, buff) {
      if (err) {
        console.log("Error: ", err);
        process.exit(0);
      }

      var str = buff.toString('ascii');
      var strArray = str.split(',');
      var nextLine = '';

      for (var i=0; i<strArray.length; i++) {
        if (strArray[i].match(/\n/) == null){
          CSV[strArray[i]] = i;
        } else {
          nextLine = strArray[i].split('\n');
          CSV[nextLine[0]] = i;
          break;
        }
      }
      console.log(CSV);
      var index;
      var ind = i;
      var row = [];

      while (ind+i<strArray.length) {
        row = [];
        for (var j=0; j<COLUMNS.length; j++){
          index = CSV[COLUMNS[j]];
          console.log(COLUMNS[j], ': ', strArray[ind+index]);
          if (strArray[ind+index].match('"') != null) {
            ind += 2;
          }
          if (strArray[ind+index] == '') {
            strArray[ind+index] = 'ALL';
          }
          row.push(strArray[ind+index]);
        }
        if (strComp(row[1],'Total')) {
          stmt.run(row, function(err){
            // console.log("RUNNING STATEMENT");
            if (err)
              console.log(err);
            if (this.lastID%100 == 0)
              console.log(this.lastID);
          });
          // if (stmt.length-1 == ' ') {
          //   stmt += "\nSELECT "
          //   for (var n=0; n<row.length-1; n++) {
          //     stmt += row[n] + ' AS ' + COLUMNS[n] +','
          //   }
          //   stmt += row[n] + ' AS ' + COLUMNS[n]
          // } else {
          //   stmt += "\nUNION ALL SELECT "
          //   var str = row.join(', ');
          //   stmt += str;
          // }
        }

        ind += i;
      }

      var remainder = strArray.splice(ind, strArray.length-ind);
      // console.log(remainder[remainder.length-1]);
      
      // callback(null, db, stmt);
      if (bytesRead != read_length){
        console.log("DONE After 1");
        return done(null)
      }

      read_and_update(fd, db, stmt, buffer, read_length, i, remainder, callback);
    });
  });
}

function done(err, db, stmt) {
  console.log("DONE");
  stmt.finalize(function(err){
    if (err)
      console.log("FUCK YOU SQL", err)
  });
  // console.log(stmt);
  // db.run(stmt, function(err){
  //   if(err)
  //     console.log(err);
  //   console.log(this.lastID);
  // });
  db.each("SELECT county_name, race_eth_name, pop_mode, pop_total FROM counties LIMIT 10", function(err, row){
    if (err)
      console.log("ERROR: line 122 ",err);
    console.log(row);
  })

  db.close(function(err){
    if (err)
      console.log('Really?', err);
  });
}

function read_and_update(fd, db, stmt, buffer, read_length, i, arr, callback) {
  fs.read(fd, buffer, 0, read_length, null, function(err, bytesRead, buff) {
    if (err) {
      console.log("Error: ", err);
      process.exit(0);
    }    

    var str = buff.toString('ascii');
    var strArray = str.split(',');
    for (var num=0; num<strArray.length; num++) {
      if (strArray[num].match(/\n/) != null){
        break;
      }
    }
    arr[arr.length-1] = arr[arr.length-1] + strArray[0];

    // console.log(strArray.length, arr.length);
    var newArray = arr.concat(strArray.splice(1,strArray.length-1));
    // console.log(newArray.length);

    var index;
    var ind = 0;
    var row = [];

    while (ind+i<newArray.length) {
      row = [];
      for (var j=0; j<COLUMNS.length; j++){
        index = CSV[COLUMNS[j]];
        // console.log(COLUMNS[j], ': ', newArray[i+index]);
        if (newArray[ind+index].match('"') != null) {
          ind += 2;
        }
        if (strComp(newArray[ind+index], 'Truck')) {
          newArray[ind+index]= newArray[ind+index+2];
        }
        if (newArray[ind+index] == '') {
          newArray[ind+index] = 'ALL';
        }
        row.push(newArray[ind+index]);
      }
      
      if (strComp(row[1],'Total')) {
        stmt.run(row, function(err){
          // console.log("RUNNING STATEMENT");
          if (err)
            console.log(err);
          if (this.lastID%100 == 0)
            console.log(this.lastID);
        });
        // stmt += "\nUNION ALL SELECT "
        // var str = row.join(', ');
        // stmt += str;
      }

      ind += i;
    }

    var remainder = newArray.splice(ind, newArray.length-ind);
    // console.log(remainder[remainder.length-1]);
    if (bytesRead != read_length){
      // console.log(bytesRead);
      // console.log("DONE READING");
      return callback(null, db, stmt);
    }

    read_and_update(fd, db, stmt, buffer, read_length, i, remainder, callback);
  })
}

function strComp(str1, str2) {
  return !!str1.match(str2);
}