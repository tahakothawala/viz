function piechart(attr1, attr2){
    // set the dimensions and margins of the graph
    var width = 450
    height = 450
    margin = 40

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    var radius = Math.min(width, height) / 2 - margin

    // append the svg object to the div called 'my_dataviz'
    var svg = d3.select("#piechart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        d3.json("http://127.0.0.1:5000/piechart?varX="+attr1+"&varY="+attr2, function(dataOld) {

        const data = {};

        dataOld.data.forEach((item, index) => {
        const key = Object.keys(item)[0]; // convert index to corresponding letter
        const value = Object.values(item)[0]; // extract the value from the object
        data[key] = value; // assign the value to the corresponding key
        
        });
        console.log(data)
// set the color scale
// var color = d3.scaleOrdinal()
//   .domain(data)
//   .range(d3.schemeSet2);
color = ["#800000", "#32a852"]

// Compute the position of each group on the pie:
var pie = d3.pie()
  .value(function(d) {return d.value; })
var data_ready = pie(d3.entries(data))
// Now I know that group A goes from 0 degrees to x degrees and so on.

// console.log(data_ready)// shape helper to build arcs:
var arcGenerator = d3.arc()
  .innerRadius(0)
  .outerRadius(radius)

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg
  .selectAll('mySlices')
  .data(data_ready)
  .enter()
  .append('path')
    .attr('d', arcGenerator)
    .attr('fill', function(d, i){ return(color[i]) })
    .attr("stroke", "black")
    .style("stroke-width", "1px")
    .style("opacity", 0.9)

// // Now add the annotation. Use the centroid method to get the best coordinates
svg
  .selectAll('mySlices')
  .data(data_ready)
  .enter()
  .append('text')
  .text(function(d){ return d.data.key})
  .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
  .style("text-anchor", "middle")
  .style("font-size", 22)
  })

// add a heading to the pie chart
svg.append("text")
   .attr("x", width/2)
   .attr("y", margin.top*2)
   .attr("text-anchor", "middle")
   .attr("font-size", "22px")
   .attr("transform", "translate(" + -215 + "," + 225 + ")")
   .text("Heart Stroke Distribution");
}