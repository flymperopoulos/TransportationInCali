var GLOBAL = {
	data : [],
	meansOfTransport : ["walk", "bus", "car"],
	colors : [
	'#1D77EF', '#D1EEFC', '#81F3FD', '#55EFCB', '#5BCAFF', '#5856D6'],
	years : [2000, 2006, 2010],
	dataRad : [100, 300, 433, 111, 222, 444]
}
var METHOD = 
			 	["CAR",
			 	 "WALK",
			 	 "ATHOME",
			 	 "BICYCLE",
			 	 "CARPOOL",
			 	 "PUBLICTR"];


window.addEventListener("load", run);


function computeSizes (svg) { 
    
    // get the size of the SVG element
    var height = svg.attr("height");
    var width = svg.attr("width");
    var margin = 20;

    // the chart lives in the svg surrounded by a margin of 100px

    return {height:height,
	    width: width,
	    margin: margin,
	    chartHeight: height-2*margin,
	    chartWidth: width-2*margin}
}    


function run () {   
    d3.json("caCountiesTopoJSON.json", function(error,topology) {
    	drawMap(topology);
    });
}
var width = 650,
	height = 600;

var projection = d3.geo.mercator()
		.scale(1000 * 2)
		.center([-120, 36])
		.translate([width/2, height/2]);

var path = d3.geo.path()
	.projection(projection);

var mapSvg = d3.select("#map").append("svg")
	.attr("width", width)
	.attr("height", height);

var graphSvg = d3.select("#map").append("svg")
	.attr("width", width)
	.attr("height", height);

function drawMap (ca){

	// creates path 
	mapSvg.append("path")
		.datum(topojson.feature(ca, ca.objects.subunits))
		.attr("class", "land")
		.attr("d", path);

	//bind feature data to the map
	mapSvg.selectAll(".subunit")
		.data(topojson.feature(ca, ca.objects.subunits).features)
		.enter()
		.append("path")
		.attr("class", function(d) { return "subunit " + d.properties.name; })
		.attr("d", path)
		.on("mouseover", function(d){ //tooltip
			div.transition()
				.duration(200)
				.style("opacity", .9);
			div.html(d.properties.fullName)
				.style("left", (d3.event.pageX) + 10 + "px")
				.style("top", (d3.event.pageY - 30) + "px"); 
			renderGraphView(d.properties.name);
		})
		.on("mouseout", function(d) { 
			div.transition()
				.duration(500)
				.style("opacity", 0.0);
			clearGraphView()
		});

	//exterior border
	mapSvg.append("path")
		.datum(topojson.mesh(ca, ca.objects.subunits, function(a, b) { return a === b;}))
		.attr("d", path)
		.attr("class", "exterior-boundary");

	//tooltip declaration
	var div = d3.select("#map").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);
}


function renderGraphView (nameOfCounty){
	console.log("DRAWING");
    updateGraphView(nameOfCounty);
}

function updateGraphView(nameOfCounty){
	console.log("COUNTY NAME: ",nameOfCounty);
    getData(nameOfCounty, function(err, dat){
    	if (!err) {
    		// console.log(dat);
    		var data = [];
    		for (var j = 0; j<dat.length; j++) {
    			var lst = [];
    			for (var l = 0; l<METHOD.length; l++){
    				var obj = {};
    				Object.assign(obj, dat[j]);
    				lst.push(obj);
    			}
    			data.push(lst);
    		}
    		for (var j = 0; j<data.length; j++){
    			cumulate(data[j]);
    		}

    		var s = computeSizes(graphSvg);
    		var barWidth = s.chartWidth/(2*dat.length-1);

		    var SEGMENT_COLUMN = 
				{"2000":"2000",
				 "2006":"2005-2007",
				 "2010":"2008-2010"
			};

			

    var yPos = d3.scale.linear() 
		.domain([0,1])
		.range([s.height-s.margin,s.margin]);

    var height = d3.scale.linear() 
		.domain([0,1])
		.range([0,s.chartHeight]);

	console.log(data);
	
	graphSvg.selectAll("g").remove();
	graphSvg.selectAll("text").remove();

	graphSvg.append("text")
    	.attr("id","title")
    	.attr("x",width/2)
     	.attr("y",10)
    	.attr("dy","0.3em")
    	.style("text-anchor","middle")
    	.text(nameOfCounty);
	
    var sel = graphSvg.selectAll("g") 
		.data(data)
		.enter().append("g")
		.attr("transform",
	      function(d,i) { return "translate("+(s.margin+(i*2)*barWidth)+",0)"; });;

	 sel.append("text")
		.attr("class","label")
		.attr("x",barWidth/2)
		.attr("y",1.5*s.margin+s.chartHeight)
		.attr("dy","0.3em")
		.style("text-anchor","middle")
		.text(function(d) { return d[0].year; });

	var bars = sel.selectAll(".bar").data(function(d) { return d;});

	bars.enter().append("rect")
		.attr("class","bar")
	    .attr("x",0)
		.attr("y",s.height-s.margin)
		.attr("width",barWidth)
		.attr("height",0)
		.style("fill", function(d,i) { return "white"; })
	bars.exit().remove();

    sel.selectAll(".bar")
		.on("mouseover",function() { this.style.fill = "grey"; })
		.on("mouseout",function(d,i) { this.style.fill = GLOBAL.colors[i]; })
		.transition()
		.duration(1000)
		.attr("y",function(d,i) { 
			console.log(i);
			return yPos(d.cumulative + Number(d[METHOD[i]]/d.pop_total)); 
		})
		.attr("height",function(d,i) { return height(d[METHOD[i]]/d.pop_total); })
		.style("fill",function(d,i) { return GLOBAL.colors[i]; })

    var values = sel.selectAll(".value")
		.data(function(d) {return d;});

    values.enter().append("text")
		.attr("class","value")
		.attr("x",barWidth/2)
		.attr("y",s.height-s.margin)
		.attr("dy","0.3em")
		.style("text-anchor","middle")
	
	values.exit().remove();

    sel.selectAll(".value")
		.style("fill","black")
		.transition()
		.duration(1000)
		.attr("y",function(d, i) { 
			// console.log(d.cumulative + Number(d[METHOD[i%METHOD.length]]/d.pop_total));
			return yPos(d.cumulative + Number(d[METHOD[i]]/d.pop_total)/2); })
		.text(function(d,i) { return Math.round(100*d[METHOD[i]]/d.pop_total)+"%"; });
    	
	var legend = graphSvg.selectAll(".legend")
	     .data(data[0])
	     .enter()
	     .append("g")
	     .attr("class", "legend");

    legend.append("rect")
       .attr("x", s.width-80)
       .attr("y", function(d, i){return i * 25 + 30;})
       .attr("width", 20)
       .attr("height", 20)
       .style("fill", function(d,i) { 
           return GLOBAL.colors[i];
       });

	legend.append("text")
	   .attr("x", s.width-100)
	   .attr("y", function(d, i){ return i * 25 + 30*1.3;})
	   .attr("dy", ".35em")
	   .style("text-anchor", "start")
	   .text(function(d,i) { return METHOD[i]; });

    	}


    })
	
	
}

function getData(name, callback) {
	var request = new XMLHttpRequest();
    request.open('GET', '/data/'+name, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
      var data = JSON.parse(request.responseText);
      return callback(null, data);
    } else {
      // We reached our target server, but it returned an error
      var err = new Error('Bad Request:' + request.status);
      return callback(err, null);
    }
  };

  request.onerror = function() {
    // There was a connection error of some sort
    var err = new Error('Bad Request: getting CAD');
    return callback(err, null)
  };

  request.send();
}

function clearGraphView(){
	d3.selectAll("#title").remove();
	d3.selectAll(".legend").remove();
	d3.selectAll(".label").remove();

}


function cumulate(arr) {
	var cumulatative = 0;
	for (var i=0; i<arr.length; i++){
		arr[i].cumulative = cumulatative;
		cumulatative += Number(arr[i][METHOD[i]])/Number(arr[i].pop_total);
	}
}