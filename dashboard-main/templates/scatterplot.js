function scatterplot(attr1, attr2, attr3){
  d3.select("#scatterplot svg").remove();

    // set the dimensions and margins of the graph
var margin = {top: 60, right: 30, bottom: 60, left: 60},
width = 460 - margin.left - margin.right,
height = 450 - margin.top - margin.bottom;

// append the svg object to the body of the page
var Svg = d3.select("#scatterplot")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.json("http://127.0.0.1:5000/scatterplot?varX="+attr1+"&varY="+attr2+"&varZ="+attr3, function(data) {

// Calculate the domain for X axis
var xDomain = d3.extent(data.data, function(d) { return d.x_axis; });

// Add X axis
var x = d3.scaleLinear()
    .domain(xDomain)
    .range([0, width*2]);
    
    
var xAxis = Svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

// Calculate the domain for Y axis
var yDomain = d3.extent(data.data, function(d) { return d.y_axis; });

// Add Y axis
var y = d3.scaleLinear()
    .domain(yDomain)
    .range([height, 0]);
var yAxis = Svg.append("g")
    .call(d3.axisLeft(y));

    // Add X axis label
Svg.append("text")
.attr("text-anchor", "middle")
.attr("font-size", "22px")
.attr("x", width / 2)
.attr("y", height + margin.top)
.text(attr1);
// Add Y axis label
Svg.append("text")
.attr("font-size", "22px")
.attr("text-anchor", "middle")
.attr("transform", "rotate(-90)")
.attr("x", width / 2 + margin.left-425)
.attr("y", -margin.left + 20)
.text(attr2);


// Add a clipPath: everything out of this area won't be drawn.
var clip = Svg.append("defs").append("svg:clipPath")
  .attr("id", "clip")
  .append("svg:rect")
  .attr("width", width )
  .attr("height", height )
  .attr("x", 0)
  .attr("y", 0);

// Color scale: give me a specie name, I return a color
var color = d3.scaleOrdinal()
.domain(["yes", "No"])
.range([ "#440154ff", "#21908dff"])

// Add brushing
var brush = d3.brushX()                 // Add the brush feature using the d3.brush function
  .extent( [ [0,0], [width,height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
  .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function

// Create the scatter variable: where both the circles and the brush take place
var scatter = Svg.append('g')
.attr("clip-path", "url(#clip)")

// Add circles
scatter
.selectAll("circle")
.data(data.data)
.enter()
.append("circle")
  .attr("cx", function (d) { return x(d.x_axis); } )
  .attr("cy", function (d) { return y(d.y_axis); } )
  .attr("r", 2)
  .style("fill", function (d) { return color(d['Heart Stroke']) } )
  .style("opacity", 0.5)

// Add the brushing
scatter
.append("g")
  .attr("class", "brush")
  .call(brush);

// A function that set idleTimeOut to null
var idleTimeout
function idled() { idleTimeout = null; }

// A function that update the chart for given boundaries
function updateChart() {

extent = d3.event.selection

// If no selection, back to initial coordinate. Otherwise, update X axis domain
if(!extent){
  if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
  x.domain(xDomain)
}else{
  x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
  scatter.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
}

// Update axis and circle position
xAxis.transition().duration(1000).call(d3.axisBottom(x))
scatter
  .selectAll("circle")
  .transition().duration(1000)
  .attr("cx", function (d) { return x(d.x_axis); } )
  .attr("cy", function (d) { return y(d.y_axis); } )

  svg.append("text")
  .attr("text-anchor", "end")
  .attr("x", width/2)
  .attr("y", height + margin.top + 25)
  .text(attr1);


svg.append("text")
  .attr("text-anchor", "end")
  .attr("transform", "rotate(-90)")
  .attr("y", -margin.left+25)
  .attr("x", -margin.top*4)
  .text(attr2)
}


})

}

   