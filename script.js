$( document ).ready(function() {

var margin= {top:100, bottom:50, right:50, left:50};
var bgWidth = 1300,
	bgHeight= 780;
var width= 1000,
	height= 600;
var allIEData;
var IEData;
var IECache= [];
var IEPoints;
var countryNames;
var countryNames1;


//create a canvas to draw on
var canvas = d3.select("#canvas").append("svg")
				.attr("class", "chart")
				.attr("width", width)
				.attr("height", height)
				.attr("overflow", "visible");

//create the x scale and y scale (x scale is a time scale)
var xScale = d3.time.scale().range([0, width]);
var yScale = d3.scale.linear().range([height,0]);

//currently not used. Might use to format the values along the y axis
var ieValFormat = d3.format(function(d){
	if(d<1000){
		return (d/100);
	}
	else if(d<1000000){
		return (d/1000);
	}
	else{
		return (d/1000000);
	}
});


function make_x_axis(scale) {        
    return d3.svg.axis()
        .scale(scale)
         .orient("bottom")
         .ticks(10)
}

function make_y_axis(scale) {        
    return d3.svg.axis()
        .scale(scale)
        .orient("right")
        .ticks(10)
}


//append x axis to canvas, .tickSize of -height makes the ticks go across the graph like a grid.
canvas.append("g")         
        .attr("class", "x axis", "grid")
        .attr("transform", "translate("+margin.right+"," + (height+margin.top) + ")")
        .call(make_x_axis(xScale)
            .tickSize(-height, 0, 0)
            .tickFormat("")
        )

//append y axis.
canvas.append("g")         
        .attr("class", "y axis", "grid")
        .attr("transform", "translate("+ (width+margin.right) + "," + margin.top +")")
        .call(make_y_axis(yScale)
            .tickSize(-width, 0, 0)
            .tickFormat("")
        )
// var xAxis = d3.svg.axis()
// 			  .scale(xScale)
// 			  .orient("bottom")
// 			  .ticks(5)
// 			  .tickSize(-height,0);
// var yAxis = d3.svg.axis()
// 			  .scale(yScale)
// 			  .ticks(10)
// 			  .tickSize(-width,0,0)
// 			 // .tickFormat("")
// 			  //.tickFormat(function(d){return ieValFormat(d);})
// 			  .orient("right");

//background color rectangle
canvas.append("rect")
		.attr("class", "backgroundColor")
		.attr("height", bgHeight)
		.attr("width", bgWidth)
		.attr("fill","#FF4F4F")
		.attr("opacity", .1)
		.attr("transform", "translate(" + (margin.right-(bgWidth-width)/2+50) + "," + (margin.top-(bgHeight-height)/2) + ")");			 
//outline around graph and y axis
canvas.append("rect")
	   .attr("height", height)
	   .attr("width", width+100)
	   .attr("fill", "transparent")
	   .attr("stroke", "black")
	   .attr("stroke-width", 2)
	   .attr("transform", "translate("+ margin.right + "," + margin.top + ")");
//3rd rect outline
canvas.append("rect")
	   .attr("height", height+100)
	   .attr("width", width+200)
	   .attr("fill", "transparent")
	   .attr("stroke", "black")
	   .attr("stroke-width", 2)
	   .attr("transform", "translate("+ (margin.right-50) + "," + (margin.top-50) + ")");
//4th rect outline
canvas.append("rect")
	   .attr("height", height+120)
	   .attr("width", width+220)
	   .attr("fill", "transparent")
	   .attr("stroke", "black")
	   .attr("stroke-width", 5)
	   .attr("transform", "translate("+ (margin.right-60) + "," + (margin.top-60) + ")");
// canvas.append("g")
// 	  .attr("class", "x axis", "grid")
// 	  .attr("transform", "translate("+margin.right+"," + (height+margin.top) + ")")
// 	  .call(xAxis);

// canvas.append("g")
// 	  .attr("class", "y axis", "grid")
// 	  .attr("transform", "translate("+ (width+margin.right) + "," + margin.top +")")
// 	  .call(yAxis);
//Axis label for Y
canvas.append("text")
		.attr("class", "axisLabel")
		.attr("x", margin.right)
		.attr("y",(margin.top+height/2))
		.attr("transform", "rotate(270 "+  (margin.right-7)+ "," + (margin.top+height/2+10)+")")
		.attr("text-anchor", "middle")
		.text("Money");
//Axis label for X
canvas.append("text")
		.attr("class", "axisLabel")
		.attr("transform", "translate("+(margin.right+width/2)+"," + (margin.top-5) + ")")
		.attr("text-anchor", "middle")
		.text("Time");
//creates a group called graph which will be what the lines and fill are attached to.
var graph = canvas.append("g")
				  .attr("class", "graph")
				  .attr("transform", "translate(" + margin.right + "," + margin.top + ")");

//creates a new date object and returns it when passed a year.
function gd(year){
	var yearN= +year;
	var nDate= new Date(yearN, 1,15);
	return nDate;
}
//creates a new date object and returns it when passed year and month
function gd2(year, month){
	var yearN= +year;
	var nDate= new Date(yearN, month,15);
	return nDate;
}

//here, export all of the data.
d3.csv("all_import_export_country.csv", function(error,data){
	if(error){
			console.log(error);
	}
	else{
		allIEData = data; //store data
		sortData(allIEData); //sort data
		addList(); //add all country names to dropdown option list.
		drawChart(9); //to draw the current chart (right now the chart will display the country with ctyCode #9)
	}
});

//creates a list for the dropdown options bar out of all of the different country names.
function addList(){
    var select = document.getElementById("country");
    for(var i = 0; i <= countryNames.length; ++i) {
	    var option = document.createElement('option');
	    option.text = option.value = countryNames[i];
	    select.add(option, 0);
      }
     }

//sorts allIEData variable by first organizing eachdata object by the citycode and then by the year.
function sortData(data){
	IEData= d3.nest().key(function(d){return d.CTYCODE;})
					 .key(function(d){return d.year;})
					 .sortKeys(d3.ascending)
					 .map(data,d3.map);

	countryNames1= d3.nest().key(function(d){return d.CTYNAME;}).sortKeys(d3.ascending).map(data,d3.map);
	countryNames = countryNames1.keys();
}



//when a new country is selected, this function removes all objects with the id "currValue" and calls drawChart with the ctycode of the country selected.
$("#country").change(function(){
	$("#country option:selected").each(function(){
		var newCountry=$(this).text();
		var index= countryNames.indexOf(newCountry);
		d3.selectAll("#currValue").remove();
		drawChart(countryNames1.get(newCountry)[0].CTYCODE);
	})
	
})

//a function that wraps the text for the label inside the Graph title circle. 
function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 30, // ems
        y = text.attr("y"),
        dy = 10,
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy);
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy).text(word);
      }
    }
  });
}



//where I draw the chart. This is called each time a different country is selected. The ctyCode of the country must be input.
function drawChart(ctyCode){
	//get array corresponding to specific IE data we will use.
	var currIEData = IEData.get(ctyCode);
	//find extent of dates for corresponding data
	var years=[];
	var keys=[];
	var IEValue=[];
	var IMonthVals=[]; //Import monthly values 2D array. Format is [{y:monthvalue, x:date}, ....]
	var EMonthVals=[];
	var combineMonthVals=[]; // combines all import and export values into one array.
	var ctyName;

//this is totally not the best way to format the data, but I just kindof brute forced it into the format that I wanted.
	currIEData.forEach(function(d){
		ctyName = currIEData.get(d)[0].CTYNAME;
		var yr=currIEData.get(d)[0].year;
		keys.push(yr);
		years.push(gd2(currIEData.get(d)[0].year,12));
		years.push(gd2(currIEData.get(d)[0].year,1));
		IMonthVals.push({y:currIEData.get(d)[0].IJAN, x:gd2(yr,1)});
		EMonthVals.push({y:currIEData.get(d)[0].EJAN, x:gd2(yr,1)});
		IMonthVals.push({y:currIEData.get(d)[0].IFEB, x:gd2(yr,2)});
		EMonthVals.push({y:currIEData.get(d)[0].EFEB, x:gd2(yr,2)});
		IMonthVals.push({y:currIEData.get(d)[0].IMAR, x:gd2(yr,3)});
		EMonthVals.push({y:currIEData.get(d)[0].EMAR, x:gd2(yr,3)});
		IMonthVals.push({y:currIEData.get(d)[0].IAPR, x:gd2(yr,4)});
		EMonthVals.push({y:currIEData.get(d)[0].EAPR, x:gd2(yr,4)});
		IMonthVals.push({y:currIEData.get(d)[0].IMAY, x:gd2(yr,5)});
		EMonthVals.push({y:currIEData.get(d)[0].EMAY, x:gd2(yr,5)});
		IMonthVals.push({y:currIEData.get(d)[0].IJUN, x:gd2(yr,6)});
		EMonthVals.push({y:currIEData.get(d)[0].EJUN, x:gd2(yr,6)});
		IMonthVals.push({y:currIEData.get(d)[0].IJUL, x:gd2(yr,7)});
		EMonthVals.push({y:currIEData.get(d)[0].EJUL, x:gd2(yr,7)});
		IMonthVals.push({y:currIEData.get(d)[0].IAUG, x:gd2(yr,8)});
		EMonthVals.push({y:currIEData.get(d)[0].EAUG, x:gd2(yr,8)});
		IMonthVals.push({y:currIEData.get(d)[0].ISEP, x:gd2(yr,9)});
		EMonthVals.push({y:currIEData.get(d)[0].ESEP, x:gd2(yr,9)});
		IMonthVals.push({y:currIEData.get(d)[0].IOCT, x:gd2(yr,10)});
		EMonthVals.push({y:currIEData.get(d)[0].EOCT, x:gd2(yr,10)});
		IMonthVals.push({y:currIEData.get(d)[0].INOV, x:gd2(yr,11)});
		EMonthVals.push({y:currIEData.get(d)[0].ENOV, x:gd2(yr,11)});
		IMonthVals.push({y:currIEData.get(d)[0].IDEC, x:gd2(yr,12)});
		EMonthVals.push({y:currIEData.get(d)[0].EDEC, x:gd2(yr,12)});
		
	});

	IMonthVals.forEach(function(d){
		IEValue.push(+d.y);
	})
	EMonthVals.forEach(function(d){
		IEValue.push(+d.y);
	})

	//set x and y scales
	xScale.domain(d3.extent(years)); // this makes the x axis adjust to the years with available data for each country
 	yScale.domain([0, d3.max(IEValue)]); // this makes the height of the y axis change based off of the largest import or export value.

 	canvas.select('.x.axis').transition()
 			.call(make_x_axis(xScale)
            	.tickSize(-height, 0, 0));
 	canvas.select('.y.axis').transition()
 			.call(make_y_axis(yScale)
            .tickSize(-width, 0, 0));


//)******************************************CREATE GRAPH LABEL*************************************//
var ellipseX=200;
	var ellipseY=150;
	var textX=75;
	var textY=110;
	//add Label
	graph.append("ellipse")
			.attr("id", "currValue")
			.attr("cx", ellipseX)
			.attr("cy", ellipseY)
			.attr("rx", 170)
			.attr("ry",120)
			.attr("fill", "white")
			.attr("stroke", "black")
			.attr("stroke-width", 1);
	graph.append("ellipse")
			.attr("id", "currValue")
			.attr("cx", ellipseX)
			.attr("cy", ellipseY)
			.attr("rx", 170)
			.attr("ry",120)
			.attr("fill","#FF4F4F")
			.attr("opacity", .1)
			.attr("stroke-width", 0);

	graph.append("text")
			.attr("id", "currValue")
			.attr("class", "titleText")
			.attr("x", textX)
			.attr("y", textY)
			.text("EXPORTS & IMPORTS");
	graph.append("text")
			.attr("id", "currValue")
			.attr("class", "titleText2")
			.attr("x", textX+50)
			.attr("y", textY+40)
			.text("to and from all");
	graph.append("g")
			.attr("id", "currValue")
			.attr("class", "titleText3")
			.attr("transform", "translate(55,0)")
			.append("text")
			.attr("x", (textX+150))
			.attr("y", (textY+60))
			.text(ctyName)
			.call(wrap, 330);


//*********************************************CREATE LINES************************************//
 	//line function that takes data from the IMonthValue or EMonthValue arrays created above and creates a line by accessing each x and y value.
 	var lineFunc = d3.svg.line()
					.x(function(d){
				 		return xScale(d.x);
				 	})
				 	.y(function(d){
				 		return yScale(+d.y);
				 	})
				 	.interpolate('basis');

	var exportLine = d3.svg.line()
						.x(function(d){return xScale(d.x);})
						.y(function(d){return yScale(+d.exportY);})
						.interpolate('basis');
	var importLine = d3.svg.line()
						.x(exportLine.x())
						.y(function(d){return yScale(+d.exportX);})
						.interpolate('basis');

//****************************CREATE AREA BETWEEN LINES************************************//

	var areaAboveImportLine = d3.svg.area()
								.x(lineFunc.x())
								.y0(lineFunc.y())
								.y1(0)
								.interpolate("basis");
	var areaBelowImportLine = d3.svg.area()
								.x(lineFunc.x())
								.y0(lineFunc.y())
								.y1(height-3)
								.interpolate("basis");
	var areaAboveExportLine = d3.svg.area()
								.x(lineFunc.x())
								.y0(lineFunc.y())
								.y1(0)
								.interpolate("basis");
	var areaBelowExportLine = d3.svg.area()
								.x(lineFunc.x())
								.y0(lineFunc.y())
								.y1(height-3)
								.interpolate("basis");
	
	var defs = graph.append('defs').attr("id", "currValue");

	defs.append("clipPath")
		.attr("id", "clip-import","currValue")
		.append("path")
		.datum(IMonthVals)
		.attr("d", areaAboveImportLine);

	defs.append("clipPath")
		.attr("id", "clip-export","currValue")
		.append("path")
		.datum(EMonthVals)
		.attr("d", areaAboveExportLine);

	graph.append("path")
			.datum(IMonthVals)
			.attr("d", areaBelowImportLine)
			.attr("id", "currValue")
			.attr("clip-path", "url(#clip-export)")
			.attr("fill", "red") //fill color when imports>export
			.attr("opacity", .5);

	graph.append("path")
			.datum(EMonthVals)
			.attr("d", areaBelowExportLine)
			.attr("id", "currValue")
			.attr("clip-path", "url(#clip-import)")
			.attr("fill", "green") //where fill color between import and export (when we are exporting more) is set.
			.attr("opacity", .5);


//*********************************************CREATE LINES************************************//

	//add Import line
	var importLine=graph.append("path")
			.attr("id", "currValue")
			.attr("class", "importLine")
			.attr("d", lineFunc(IMonthVals))
			.attr("stroke", "#FFB332") // this is where the color for the import line is set
			.attr("opacity", .8) // here is opacity for import line
			.attr("stroke-width", 5)
			.attr("fill", "none");
	//add Import inner line
	var importLine2=graph.append("path")
			.attr("id", "currValue")
			.attr("class", "importLine")
			.attr("d", lineFunc(IMonthVals))
			.attr("stroke", "#000000") // this is the inner line for the import line
			.attr("opacity", .9)
			.attr("stroke-width", 1)
			.attr("fill", "none");
	//add Export line
	var exportLine=graph.append("path")
			.attr("id", "currValue")
			.attr("class", "exportLine")
			.attr("d", lineFunc(EMonthVals))
			.attr("stroke", "#FF4F4F") //color of export line
			.attr("opacity", .8)
			.attr("stroke-width", 4)
			.attr("fill", "none");
	//add export inner line
	var exportLine2=graph.append("path")
			.attr("id", "currValue")
			.attr("class", "exportLine")
			.attr("d", lineFunc(EMonthVals))
			.attr("stroke", "#000000")
			.attr("opacity", .9)
			.attr("stroke-width", 1)
			.attr("fill", "none");


	
//outline around graph
canvas.append("rect")
	   .attr("height", height)
	   .attr("width", width)
	   .attr("fill", "transparent")
	   .attr("stroke", "black")
	   .attr("stroke-width", 2)
	   .attr("transform", "translate("+ margin.right + "," + margin.top + ")");
 	
}

});


///////////////////////////////////////OLD CODE OPTIONS, MOSTLY IRRELEVANT NOW///////////////////////////////////////////////////
// //option to create points
 	// IEPoints = graph.selectAll(".IEPoints")
 	// 								.data(keys);

 	// console.log(IEPoints);
 	// IEPoints.enter()
 	// 		.append("g")
 	// 		.attr("class", "IEPoints")
 	// 		.append("circle")
 	// 		.attr("class", "points");

 	// console.log("part 2");

 	// console.log(IEPoints);

 	// IEPoints.select(".points")
 	// 		.attr("cx", function(d){
 	// 			console.log(d);
 	// 			return xScale(gd(currIEData.get(d)[0].year));
 	// 		})
 	// 		.attr("cy", function(d){
 	// 			return yScale(currIEData.get(d)[0].IYR);
 	// 		})
 	// 		.attr("r", 5)
 	// 		.attr("fill", "blue");

 	// IEPoints.exit().remove();
 	// console.log("part3");

// function drawChart(ctyCode){
// 	//get array corresponding to specific IE data we will use.
// 	var currIEData = IEData.get(ctyCode);
// 	//find extent of dates for corresponding data
// 	var years=[];
// 	var keys=[];
// 	var IEValue=[];
// 	var IMonthVals=[];
// 	var EMonthVals=[];
// 	var combineMonthVals=[];
// 	var ctyName;

// 	currIEData.forEach(function(d){
// 		ctyName = currIEData.get(d)[0].CTYNAME;
// 		var yr=currIEData.get(d)[0].year;
// 		keys.push(yr);
// 		years.push(gd2(currIEData.get(d)[0].year,12));
// 		years.push(gd2(currIEData.get(d)[0].year,1));
// 		combineMonthVals.push({importY:currIEData.get(d)[0].IJAN, exportY:currIEData.get(d)[0].EJAN, x:gd2(yr,1)});
// 		combineMonthVals.push({importY:currIEData.get(d)[0].IFEB, exportY:currIEData.get(d)[0].EFEB, x:gd2(yr,2)});
// 		combineMonthVals.push({importY:currIEData.get(d)[0].IMAR, exportY:currIEData.get(d)[0].EMAR, x:gd2(yr,3)});
// 		combineMonthVals.push({importY:currIEData.get(d)[0].IAPR, exportY:currIEData.get(d)[0].EAPR, x:gd2(yr,4)});
// 		combineMonthVals.push({importY:currIEData.get(d)[0].IMAY, exportY:currIEData.get(d)[0].EMAY, x:gd2(yr,5)});
// 		combineMonthVals.push({importY:currIEData.get(d)[0].IJUN, exportY:currIEData.get(d)[0].EJUN, x:gd2(yr,6)});
// 		combineMonthVals.push({importY:currIEData.get(d)[0].IJUL, exportY:currIEData.get(d)[0].EJUL, x:gd2(yr,7)});
// 		combineMonthVals.push({importY:currIEData.get(d)[0].IAUG, exportY:currIEData.get(d)[0].EAUG, x:gd2(yr,8)});
// 		combineMonthVals.push({importY:currIEData.get(d)[0].ISEP, exportY:currIEData.get(d)[0].ESEP, x:gd2(yr,9)});
// 		combineMonthVals.push({importY:currIEData.get(d)[0].IOCT, exportY:currIEData.get(d)[0].EOCT, x:gd2(yr,10)});
// 		combineMonthVals.push({importY:currIEData.get(d)[0].INOV, exportY:currIEData.get(d)[0].ENOV, x:gd2(yr,11)});
// 		combineMonthVals.push({importY:currIEData.get(d)[0].IDEC, exportY:currIEData.get(d)[0].EDEC, x:gd2(yr,12)});		
// 	});

// 	combineMonthVals.forEach(function(d){
// 		IEValue.push(+d.importY);
// 		IEValue.push(+d.exportY);
// 	});

// 	//set x and y scales
// 	xScale.domain(d3.extent(years));
//  	yScale.domain([0, d3.max(IEValue)]);

//  	canvas.select('.x.axis').transition()
//  			.call(xAxis);
//  	canvas.select('.y.axis').transition()
//  			.call(yAxis);

// //*********************************************CREATE LINES************************************//
//  	//line function.
//  	var lineFunc = d3.svg.line()
// 					.x(function(d){
// 				 		return xScale(d.x);
// 				 	})
// 				 	.y(function(d){
// 				 		return yScale(+d.y);
// 				 	})
// 				 	.interpolate('basis');

// 	var exportLine = d3.svg.line()
// 						.x(function(d){return xScale(d.x);})
// 						.y(function(d){return yScale(+d.exportY);})
// 						.interpolate('basis');
// 	var importLine = d3.svg.line()
// 						.x(function(d){return xScale(d.x);})
// 						.y(function(d){return yScale(+d.importY);})
// 						.interpolate('basis');

// //****************************CREATE AREA BETWEEN LINES************************************//

// 	var areaAboveImportLine = d3.svg.area()
// 								.x(importLine.x())
// 								.y0(importLine.y())
// 								.y1(0)
// 								.interpolate("basis");
// 	var areaBelowImportLine = d3.svg.area()
// 								.x(importLine.x())
// 								.y0(importLine.y())
// 								.y1(height-1)
// 								.interpolate("basis");
// 	var areaAboveExportLine = d3.svg.area()
// 								.x(exportLine.x())
// 								.y0(exportLine.y())
// 								.y1(0)
// 								.interpolate("basis");
// 	var areaBelowExportLine = d3.svg.area()
// 								.x(exportLine.x())
// 								.y0(exportLine.y())
// 								.y1(height-1)
// 								.interpolate("basis");
	
// 	var defs = graph.append('defs');

// 	defs.append("clipPath")
// 		.attr("id", "clip-import")
// 		.append("path")
// 		.datum(combineMonthVals)
// 		.attr("d", areaAboveImportLine);

// 	defs.append("clipPath")
// 		.attr("id", "clip-export")
// 		.append("path")
// 		.datum(combineMonthVals)
// 		.attr("d", areaAboveExportLine);

// 	graph.append("path")
// 			.datum(combineMonthVals)
// 			.attr("d", areaBelowImportLine)
// 			.attr("id", "currValue")
// 			.attr("clip-path", "url(#clip-export)")
// 			.attr("fill", "red")
// 			.attr("opacity", .5);

// 	graph.append("path")
// 			.datum(combineMonthVals)
// 			.attr("d", areaBelowExportLine)
// 			.attr("id", "currValue")
// 			.attr("clip-path", "url(#clip-import)")
// 			.attr("fill", "green")
// 			.attr("opacity", .5);


// //*********************************************CREATE LINES************************************//

// 	//add Import line
// 	var importLine=graph.append("path")
// 			.attr("id", "currValue")
// 			.attr("class", "importLine")
// 			.attr("d", importLine(combineMonthVals))
// 			.attr("stroke", "#FFB332")
// 			.attr("opacity", .8)
// 			.attr("stroke-width", 5)
// 			.attr("fill", "none");
// 	//add Import inner line
// 	// var importLine2=graph.append("path")
// 	// 		.attr("id", "currValue")
// 	// 		.attr("class", "importLine2")
// 	// 		.attr("d", importLine(combineMonthVals))
// 	// 		.attr("stroke", "#000000")
// 	// 		.attr("opacity", .9)
// 	// 		.attr("stroke-width", 1)
// 	// 		.attr("fill", "none");
// 	//add Export line
// 	var exportLine=graph.append("path")
// 			.attr("id", "currValue")
// 			.attr("class", "exportLine")
// 			.attr("d", exportLine(combineMonthVals))
// 			.attr("stroke", "#FF4F4F")
// 			.attr("opacity", .9)
// 			.attr("stroke-width", 4)
// 			.attr("fill", "none");
// 	//add export inner line
// 	// var exportLine2=graph.append("path")
// 	// 		.attr("id", "currValue")
// 	// 		.attr("class", "exportLine2")
// 	// 		.attr("d", exportLine(combineMonthVals))
// 	// 		.attr("stroke", "#000000")
// 	// 		.attr("opacity", .9)
// 	// 		.attr("stroke-width", 1)
// 	// 		.attr("fill", "none");


// 	var ellipseX=200;
// 	var ellipseY=150;
// 	var textX=75;
// 	var textY=110;
// 	//add Label
// 	graph.append("ellipse")
// 			.attr("id", "currValue")
// 			.attr("cx", ellipseX)
// 			.attr("cy", ellipseY)
// 			.attr("rx", 170)
// 			.attr("ry",120)
// 			.attr("fill", "transparent")
// 			.attr("stroke", "black")
// 			.attr("stroke-width", 1);

// 	graph.append("text")
// 			.attr("id", "currValue")
// 			.attr("class", "titleText")
// 			.attr("x", textX)
// 			.attr("y", textY)
// 			.text("EXPORTS & IMPORTS");
// 	graph.append("text")
// 			.attr("id", "currValue")
// 			.attr("class", "titleText2")
// 			.attr("x", textX+50)
// 			.attr("y", textY+40)
// 			.text("to and from all");
// 	graph.append("g")
// 			.attr("id", "currValue")
// 			.attr("class", "titleText3")
// 			.attr("transform", "translate(55,0)")
// 			.append("text")
// 			.attr("x", (textX+150))
// 			.attr("y", (textY+60))
// 			.text(ctyName)
// 			.call(wrap, 300);

//  	// //option to create points
//  	// IEPoints = graph.selectAll(".IEPoints")
//  	// 								.data(keys);

//  	// console.log(IEPoints);
//  	// IEPoints.enter()
//  	// 		.append("g")
//  	// 		.attr("class", "IEPoints")
//  	// 		.append("circle")
//  	// 		.attr("class", "points");

//  	// console.log("part 2");

//  	// console.log(IEPoints);

//  	// IEPoints.select(".points")
//  	// 		.attr("cx", function(d){
//  	// 			console.log(d);
//  	// 			return xScale(gd(currIEData.get(d)[0].year));
//  	// 		})
//  	// 		.attr("cy", function(d){
//  	// 			return yScale(currIEData.get(d)[0].IYR);
//  	// 		})
//  	// 		.attr("r", 5)
//  	// 		.attr("fill", "blue");

//  	// IEPoints.exit().remove();
//  	// console.log("part3");

// }