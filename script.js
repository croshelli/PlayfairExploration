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
var countryCodes;

var canvas = d3.select("#canvas").append("svg")
				.attr("class", "chart")
				.attr("width", width)
				.attr("height", height)
				.attr("overflow", "visible");

var xScale = d3.time.scale().range([0, width]);
var yScale = d3.scale.linear().range([height,0]);

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

var xAxis = d3.svg.axis()
			  .scale(xScale)
			  .orient("bottom");
var yAxis = d3.svg.axis()
			  .scale(yScale)
			  //.ticks(30)
			  //.tickFormat(function(d){return ieValFormat(d);})
			  .orient("right");

//background color rectangle
canvas.append("rect")
		.attr("class", "backgroundColor")
		.attr("height", bgHeight)
		.attr("width", bgWidth)
		.attr("fill","#FF4F4F")
		.attr("opacity", .1)
		.attr("transform", "translate(" + (margin.right-(bgWidth-width)/2+50) + "," + (margin.top-(bgHeight-height)/2) + ")");			  

//outline around graph
canvas.append("rect")
	   .attr("height", height)
	   .attr("width", width)
	   .attr("fill", "transparent")
	   .attr("stroke", "black")
	   .attr("stroke-width", 2)
	   .attr("transform", "translate("+ margin.right + "," + margin.top + ")");

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

canvas.append("g")
	  .attr("class", "x axis")
	  .attr("transform", "translate("+margin.right+"," + (height+margin.top) + ")")
	  .call(xAxis);

canvas.append("g")
	  .attr("class", "y axis")
	  .attr("transform", "translate("+ (width+margin.right) + "," + margin.top +")")
	  .call(yAxis);

canvas.append("text")
		.attr("class", "axisLabel")
		.attr("x", margin.right)
		.attr("y",(margin.top+height/2))
		.attr("transform", "rotate(270 "+  (margin.right-7)+ "," + (margin.top+height/2+10)+")")
		.attr("text-anchor", "middle")
		.text("Money");

canvas.append("text")
		.attr("class", "axisLabel")
		.attr("transform", "translate("+(margin.right+width/2)+"," + (margin.top-5) + ")")
		.attr("text-anchor", "middle")
		.text("Time");

var graph = canvas.append("g")
				  .attr("class", "graph")
				  .attr("transform", "translate(" + margin.right + "," + margin.top + ")");

//creates a new date object and returns it when passed a year.
function gd(year){
	var yearN= +year;
	var nDate= new Date(yearN, 1,15);
	return nDate;
}

function gd2(year, month){
	var yearN= +year;
	var nDate= new Date(yearN, month,15);
	return nDate;
}

d3.csv("all_import_export_country.csv", function(error,data){
	if(error){
			console.log(error);
	}
	else{
		allIEData = data;
		sortData(allIEData);
		addList();
		drawChart(12); //to draw the current chart selected, must imput ctyCode to drawChart function in Integer format, not as a string
	}
});

function addList(){
    var select = document.getElementById("country");
    for(var i = 0; i <= countryNames.length; ++i) {
	    var option = document.createElement('option');
	    option.text = option.value = countryNames[i];
	    select.add(option, 0);
      }
     }

function sortData(data){
	IEData= d3.nest().key(function(d){return d.CTYCODE;})
					 .key(function(d){return d.year;})
					 .sortKeys(d3.ascending)
					 .map(data,d3.map);

	countryNames= d3.nest().key(function(d){return d.CTYNAME;}).map(data,d3.map);
	countryNames = countryNames.keys();
	countryCodes= d3.nest().key(function(d){return d.CTYCODE;}).map(data,d3.map);
	countryCodes = countryCodes.keys();
}


function drawChart(ctyCode){
	//get array corresponding to specific IE data we will use.
	var currIEData = IEData.get(ctyCode);
	//find extent of dates for corresponding data
	var years=[];
	var keys=[];
	var IEValue=[];
	var IMonthVals=[];
	var EMonthVals=[];
	var ctyName;

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

	console.log(d3.max(IEValue));
	console.log(IMonthVals);
	console.log(EMonthVals);
	//set x and y scales
	xScale.domain(d3.extent(years));
 	yScale.domain([0, d3.max(IEValue)]);

 	canvas.select('.x.axis').transition()
 			.call(xAxis);
 	canvas.select('.y.axis').transition()
 			.call(yAxis);



 	var lineFunc = d3.svg.line()
					.x(function(d){
				 		return xScale(d.x);
				 	})
				 	.y(function(d){
				 		return yScale(+d.y);
				 	})
				 	.interpolate('basis');

	//add Import line
	graph.append("path")
			.attr("id", "currValue")
			.attr("d", lineFunc(IMonthVals))
			.attr("stroke", "#FFB332")
			.attr("opacity", .9)
			.attr("stroke-width", 4)
			.attr("fill", "none");
	//add Export line
	graph.append("path")
			.attr("id", "currValue")
			.attr("d", lineFunc(EMonthVals))
			.attr("stroke", "#FF4F4F")
			.attr("opacity", .9)
			.attr("stroke-width", 4)
			.attr("fill", "none");

	var ellipseX=200;
	var ellipseY=150;
	var textX=75;
	var textY=100;
	//add Label
	graph.append("ellipse")
			.attr("id", "currValue")
			.attr("cx", ellipseX)
			.attr("cy", ellipseY)
			.attr("rx", 170)
			.attr("ry",120)
			.attr("fill", "transparent")
			.attr("stroke", "black")
			.attr("stroke-width", 1);

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
	graph.append("text")
			.attr("id", "currValue")
			.attr("class", "titleText3")
			.attr("x", textX)
			.attr("y", textY+80)
			.text(ctyName);

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

}

$("#country").change(function(){
	$("#country option:selected").each(function(){

		var newCountry=$(this).text();
		var index= countryNames.indexOf(newCountry);
		d3.selectAll("#currValue").remove();
		drawChart(countryCodes[index]);
	})
	
})


});