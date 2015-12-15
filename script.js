var GLOBAL = {
	data : [],
	meansOfTransport : ["walk", "bus", "car"],
	colors : ["#3B5998", "#007bb6", "#9b6954"],
	years : [2000, 2006, 2010],
	dataRad : [100, 300, 433, 111, 222, 444]
}



window.addEventListener("load", run);


function computeSizes (svg) { 
    
    // get the size of the SVG element
    var height = svg.attr("height");
    var width = svg.attr("width");
    var margin = 10;

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
			renderGraphView(d.properties.fullName);
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
    setupGraphView(nameOfCounty);
    updateGraphView(nameOfCounty);
}

function setupGraphView(nameOfCounty){
    var s = computeSizes(graphSvg);
    var barWidth = s.chartWidth/(2*GLOBAL.years.length-1);

    // get rid of old view
    graphSvg.selectAll("g").remove();
    
    graphSvg.append("text")
    	.attr("id","title")
    	.attr("x",width/2)
     	.attr("y",10)
    	.attr("dy","0.3em")
    	.style("text-anchor","middle")
    	.text(nameOfCounty)

    sel = graphSvg.selectAll("g")
		.data(GLOBAL.years)
		.enter().append("g")
		.attr("transform",
	      function(d,i) { return "translate("+(s.margin+(i*2)*barWidth)+",0)"; });

    sel.append("rect")
		.attr("class","bar")
	    .attr("x",0)
		.attr("y",s.height-s.margin)
		.attr("width",barWidth)
		.attr("height",0);

    sel.append("text")
		.attr("class","value")
		.attr("x",barWidth/2)
	 	.attr("y",s.height-s.margin-20)
		.attr("dy","0.3em")
		.style("text-anchor","middle");

	// naming x-axis
    sel.append("text")
		.attr("class","label")
		.attr("x",barWidth/2)
		.attr("y",s.margin+s.chartHeight)
		.attr("dy","0.3em")
		.style("text-anchor","middle")
		.text(function(d) { return d; });

	// legend
	var legend = graphSvg.selectAll(".legend")
	     .data(GLOBAL.meansOfTransport)
	     .enter()
	     .append("g")
	     .attr("class", "legend");

    legend.append("rect")
       .attr("x", width - 110)
       .attr("y", function(d, i){ return i * 25 + 30;})
       .attr("width", 20)
       .attr("height", 20)
       .style("fill", function(d,i) { 
           return GLOBAL.colors[i];
       });

	legend.append("text")
	   .attr("x", width-80 )
	   .attr("y", function(d, i){ return i * 25 + 30*1.3;})
	   .attr("dy", ".35em")
	   .style("text-anchor", "start")
	   .text(function(d) { return d; });
}

function updateGraphView(nameOfCounty){
 //    var s = computeSizes(graphSvg);
 //    var barWidth = s.chartWidth/(2*GLOBAL.years.length-1);

 //    var SEGMENT_COLUMN = 
	// 	{"2000":"2000",
	// 	 "2006":"2005-2007",
	// 	 "2010":"2008-2010"
	// };

	// var METHOD = 
	//  	{"Car": "CAR",
	//  	 "Walking": "WALK",
	//  	 "Home": "ATHOME",
	//  	 "Bicycle": "BICYCLE",
	//  	 "Carpool": "CARPOOL",
	//  	 "Public Transportation": "PUBLICTR"
	// };

 //    var counts = [{},{},{}];
 //    var total_count = 0;
    
 //    // TODO: Make columns of total counts and get percentages

 //    d3.select("#span-base") 
	// 	.text(total_count);

 //    counts.forEach(function(c,i) { 
	// // first convert to an array of entries
	// 	var d = d3.entries(c);  
	//         // sort them
	// 	d.sort(function(a,b) { return d3.ascending(a.key,b.key); });
	// 	// then cumulate them
	// 	cumulate(d);
	// 	counts[i] = d;
 //    })

 //    var yPos = d3.scale.linear() 
	// 	.domain([0,total_count])
	// 	.range([s.height-s.margin,s.margin]);

 //    var height = d3.scale.linear() 
	// 	.domain([0,total_count])
	// 	.range([0,s.chartHeight]);

 //    sel = graphSvg.selectAll("g") 
	// 	.data(counts);

 //    var bars = sel.selectAll(".bar")
	// 	.data(function(d) { return d;});

 //    bars.enter().append("rect")
	// 	.attr("class","bar")
	// 	.style("fill",function(d,i) { return colors[d.key]; })
	// 	.attr("y",yPos(0))
	// 	.attr("height",0)
	// 	.attr("width",barWidth);

 //    bars.exit().remove()

 //    sel.selectAll(".bar")
	// 	.on("mouseover",function() { this.style.fill = "grey"; })
	// 	.on("mouseout",function(d,i) { this.style.fill = colors[d.key]; })
	// 	.transition()
	// 	.duration(1000)
	// 	.attr("y",function(d) { return yPos(d.cumulative+d.value); })
	// 	.attr("height",function(d) { return height(d.value); })
	// 	.style("fill",function(d,i) { return colors[d.key]; })

 //    var values = sel.selectAll(".value")
	// 	.data(function(d) { return d;});

 //    values.enter().append("text")
	// 	.attr("class","value")
	// 	.attr("x",barWidth/2)
	// 	.attr("y",s.height-s.margin)
	// 	.attr("dy","0.3em")
	// 	.style("text-anchor","middle")
	
	// values.exit().remove();

 //    sel.selectAll(".value")
	// 	.style("fill","white")
	// 	.transition()
	// 	.duration(1000)
	// 	.attr("y",function(d) { return yPos(d.cumulative+d.value/2); })
	// 	.text(function(d) { return Math.round(100*d.value/total_count)+"%"; });
}

function clearGraphView(){
	d3.selectAll("#title").remove();
	d3.selectAll(".legend").remove();
	d3.selectAll(".label").remove();

}
