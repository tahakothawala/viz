function heatmap(attr1, attr2, attr3) {
    // set the dimensions and margins of the graph
var margin = {top: 60, right: 5, bottom: 60, left: 90},
width = 450 - margin.left - margin.right,
height = 450 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#heatmap")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.json("http://127.0.0.1:5000/heatmap?varX="+attr1+"&varY="+attr2+"&varZ="+attr3, function(data) {

// Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
var myGroups = d3.map(data.data, function(d){return d.group;}).keys()
var myVars = d3.map(data.data, function(d){return d.variable;}).keys()

myVars.sort((a, b) => a - b);
myGroups.sort((a, b) => a - b);

// Build X scales and axis:
var x = d3.scaleBand()
  .range([ 0, width ])
  .domain(myGroups)
  .padding(0.05);
svg.append("g")
  .style("font-size", 15)
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x).tickSize(0).tickFormat(function(d) { 
    var a = (parseInt(d)+5)*5
    var b = parseInt(a)+5
    // console.log(d)
    return a + "-" + b
  }))
  .select(".domain").remove()

// Build Y scales and axis:
var y = d3.scaleBand()
  .range([ height, 0 ])
  .domain(myVars)
  .padding(0.05);
svg.append("g")
  .style("font-size", 15)
  .call(d3.axisLeft(y).tickSize(0).tickFormat(function(d) {
    var a = (parseInt(d)+2)*5
    var b = parseInt(a)+5
    // console.log(d)
    return a + "-" + b 
  }))
  .select(".domain").remove()

// Build color scale
var myColor = d3.scaleSequential()
  .interpolator(d3.interpolateInferno)
  .domain([d3.max(data.data, function(d){ return d.value; }), d3.min(data.data, function(d){ return d.value; })])

// create a tooltip
var tooltip = d3.select("#heatmap")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px")

// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function(d) {
  tooltip
    .style("opacity", 1)
  d3.select(this)
    .style("stroke", "black")
    .style("opacity", 1)
}
var mousemove = function(d) {
  tooltip
    .html("Avg. cigerattes per day - " + parseInt(d.value))
    .style("left", (d3.mouse(this)[0]+70) + "px")
    .style("top", (d3.mouse(this)[1]) + "px")
}
var mouseleave = function(d) {
  tooltip
    .style("opacity", 0)
  d3.select(this)
    .style("stroke", "none")
    .style("opacity", 0.8)
}

// add the squares
svg.selectAll()
  .data(data.data, function(d) {return d.group+':'+d.variable;})
  .enter()
  .append("rect")
    .attr("x", function(d) { return x(d.group) })
    .attr("y", function(d) { return y(d.variable) })
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("width", x.bandwidth() )
    .attr("height", y.bandwidth() )
    .style("fill", function(d) { return myColor(d.value)} )
    .style("stroke-width", 4)
    .style("stroke", "none")
    .style("opacity", 0.8)
  .on("mouseover", mouseover)
  .on("mousemove", mousemove)
  .on("mouseleave", mouseleave)
})

  // Add x axis label
  svg.append("text")
  .attr("class", "x label")
  .attr("text-anchor", "end")
  .attr("font-size", "22px")
  .attr("x", width-170)
  .attr("y", height + margin.bottom-10)
  .text("Age");

// Add y axis label
svg.append("text")
  .attr("class", "y label")
  .attr("text-anchor", "end")
  .attr("font-size", "22px")
  .attr("y", -margin.left +15)
  .attr("x", -margin.top-80)
  .attr("dy", ".75em")
  .attr("transform", "rotate(-90)")
  .text("BMI");

}