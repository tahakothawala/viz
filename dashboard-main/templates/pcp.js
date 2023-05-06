function pcp(){
    var margin = { top: 70, right: 60, bottom: 0, left: 30 },
    width = 1700 - margin.left - margin.right;
    height = 530 - margin.top - margin.bottom;

var x = d3.scalePoint().range([0, width-margin.right-margin.left]),
    y = {},
    dragging = {};

var line = d3.line(),
    axis = d3.axisLeft(),
    background,
    foreground;

var svg = d3.select("#pcp").append("svg")
    .attr("width", width)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")    
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var num = ["Age","CigsPerDay","Total Cholestrol","Systolic BP","Diastolic BP","BMI","Heart Rate","Glucose"]
var cat = ["Gender", "Education", "Heart Stroke", "Prevalent Stroke"]
var cluster_array = [];
d3.json("http://127.0.0.1:5000/pcp", function (data) {
    cars = data.data;
    console.log(cars)
    cluster_array=[]
    for(let i = 0 ; i < cars.length ; i++ ){
        cluster_array.push(cars[i]['clusters'])
    }
    

    x.domain(dimensions = d3.keys(cars[0]).filter(function (d) {

        if (num.includes(d))
            return d != "Id2"  && (y[d] = d3.scaleLinear()
                .domain(d3.extent(cars, function (p) { return +p[d]; }))
                .range([height-80, 0]));
        if (cat.includes(d))
            return d != "Id2" && (y[d] = d3.scaleBand()
                .domain(cars.map(function (p) { return p[d]; }))
                .range([height - 80, 0])
                .padding(0.2));
    }));

    // Add grey background lines for context.
    background = svg.append("g")
        .attr("class", "background")
        .selectAll("path")
        .data(cars)
        .enter().append("path")
        .attr("d", path);

    // Add blue foreground lines for focus.
    foreground = svg.append("g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(cars)
        .enter().append("path")
        .attr("d", path)
        .style('stroke',function(d , i){
            if(cluster_array[i]=='No')
                return '#800000'
            else if(cluster_array[i]=='yes')
                return '#FFA500'
        });

    // Add a group element for each dimension.
    var g = svg.selectAll(".dimension")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
        .call(d3.drag()
            .on("drag", function (d) {
                dragging[d] = x(d);
                background.attr("visibility", "hidden");
            })
            .on("drag", function (d) {
                dragging[d] = Math.min(width, Math.max(0, d3.event.x));
                foreground.attr("d", path);
                dimensions.sort(function (a, b) { return position(a) - position(b); });
                x.domain(dimensions);
                g.attr("transform", function (d) { return "translate(" + position(d) + ")"; })
            })
            .on("end", function (d) {
                delete dragging[d];
                transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                transition(foreground).attr("d", path);
                background
                    .attr("d", path)
                    .transition()
                    .delay(500)
                    .duration(0)
                    .attr("visibility", null);
            }));

    // Add an axis and title.
    g.append("g")
        .attr("class", "axis")
        .each(function (d) { d3.select(this).call(axis.scale(y[d])); })
        .append("text")
        .attr("class", "axis-label")
        .style("fill", "black")
        .style("font-size", 12)
        .attr("x", function (d) { return d.length*2.50;})
        .attr("y", -20)
        .text(function (d) { return d; });

        // Add and store a brush for each axis.
    g.append("g")
        .attr("class", "brush")
        .each(function (d) {
            d3.select(this)
                .call(y[d].brush = d3.brushY().extent([[-10, 0], [10, height-margin.top-margin.bottom+30]])
                    .on("start", brushstart)
                    .on("brush", brush)
                    .on("end", brush))
        }).selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);

    });

    function position(d) {
        var v = dragging[d];
        return v == null ? x(d) : v;
    }

    function transition(g) {
        return g.transition().duration(500);
    }

    // Returns the path for a given data point.
    function path(d) {
        return line(dimensions.map(function (p) { 
            if(!num.includes(p))
                return [position(p), y[p](d[p]) + y[p].bandwidth()/2]
            return [position(p), y[p](d[p])]; 
        }));
    }

    function brushstart() {
        d3.event.sourceEvent.stopPropagation();
    }

    // Handles a brush event, toggling the display of foreground lines.
    function brush() {

        var actives = [];
        d3.selectAll(".brush")
            .filter(function (d) {
                return d3.brushSelection(this);
            })
            .each(function (key) {
                actives.push({
                    dimension: key,
                    extent: d3.brushSelection(this)
                });
            });
        if (actives.length === 0) {
            foreground.style("display", null);
        } else {
            foreground.style("display", function (d) {
                return actives.every(function (brushObj) {
                    if (!num.includes(brushObj.dimension)) {
                        return brushObj.extent[0] <= y[brushObj.dimension](d[brushObj.dimension]) + y[brushObj.dimension].bandwidth() / 2
                            && y[brushObj.dimension](d[brushObj.dimension]) + y[brushObj.dimension].bandwidth() / 2 <= brushObj.extent[1];
                    }
                    else {
                        return brushObj.extent[0] <= y[brushObj.dimension](d[brushObj.dimension])
                            && y[brushObj.dimension](d[brushObj.dimension]) <= brushObj.extent[1];
                    }
                }) ? null : "none";
            });
        }
    }

}