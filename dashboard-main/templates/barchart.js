function barchart(attr1, attr2) {
    d3.json("http://127.0.0.1:5000/barchart?varX="+attr1+"&varY="+attr2, function(data) {
    
    var margin = {top: 30, right: 30, bottom: 90, left: 90},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
    
    var svg = d3.select("#barchart")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");
    
    
    var x = d3.scaleBand()
      .range([ 0, width ])
      .domain(data.data.map(function(d) { return d.x_axis; }))
      .padding(0.2);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    
    var y = d3.scaleLinear()
      .domain([0, d3.max(data.data, function(d) { return d.y_axis; })])
      .range([ height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y));
    
    svg.selectAll("mybar")
      .data(data.data)
      .enter()
      .append("rect")
        .attr("x", function(d) { return x(d.x_axis); })
        .attr("width", x.bandwidth())
        .attr("fill", "#69b3a2")
        .attr("height", function(d) { return height - y(0); }) // always equal to 0
        .attr("y", function(d) { return y(0); })
    
    svg.selectAll("rect")
      .transition()
      .duration(800)
      .attr("y", function(d) { return y(d.y_axis); })
      .attr("height", function(d) { return height - y(d.y_axis); })
      .delay(function(d,i){console.log(i) ; return(i*100)})
    
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width/2)
        .attr("y", height + margin.top + 25)
        .text(data.x_axis);
    
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left+25)
        .attr("x", -margin.top*4)
        .text(data.y_axis)
    
      svg.append("text")
            .attr("x", (width / 2))             
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .style("text-decoration", "underline")  
            .text(data.x_axis + " v/s " + data.y_axis);
    // console.log(data)
    })    
}