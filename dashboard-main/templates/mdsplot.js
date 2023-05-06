function mdsplot() {
    let x_value ; 
    let y_value ;  
    let width = 700;
    let height = 450;
    const margin_left = 90;
    const margin_right = 30;
    const margin_top = 15;
    const margin_bottom = 105;
    const margin_width = width - margin_left - margin_right;
    const margin_height = height - margin_top - margin_bottom;
    //let mds_variable_reference = useRef(null);
    let mdsVariable, mds_variable_reference;
    //const [mdsVariable, setMdsVariable] = useState();
    var pcp=[];

    // useEffect(()=>{
    //     axios.get('http://localhost:5000/mds_variable').then((res) => {
    //         const response = res.data;
    //         var json_data = JSON.parse(response);
    //         var ste = {'xvalue':json_data['xvalue'], 'yvalue':json_data['yvalue'], 'name':json_data['name']};
    //         setMdsVariable(ste);
    //         clearMdsVariable();
    //         plotMdsVariable();
    //   });
    //     clearMdsVariable();
    // },[]);
    d3.json("http://127.0.0.1:5000/mds", function (response) {
            var json_data = JSON.parse(response);
            var ste = {'xvalue':json_data['xvalue'], 'yvalue':json_data['yvalue'], 'name':json_data['name']};
            mdsVariable = ste;
            // clearMdsVariable();
            plotMdsVariable();
    })

    // useEffect(()=>{
    //     clearMdsVariable();
    //     plotMdsVariable();
    // },[mdsVariable])

    const plotMdsVariable =() =>{
        if(mdsVariable!=undefined){
            x_value = mdsVariable.xvalue;
            y_value = mdsVariable.yvalue;
        }
        if(x_value != undefined && y_value != undefined){
            const mds_ref = d3.select("#mds").append("svg").attr("height", height)
                                    .attr("width", width).append("g")
                                    .attr("transform", "translate(" + margin_left + "," + margin_top + ")");

            var x_axis= d3.scaleLinear()
                        .domain([d3.min(Object.keys(x_value), function(data) { return 1.25 * x_value[data]}), 
                        d3.max(Object.keys(x_value), function(data) { return 1.25 * x_value[data]})])
                        .range([0, margin_width]);
            
            mds_ref.append("g").attr("transform", "translate(0," + margin_height + ")").call(d3.axisBottom(x_axis)).call(g => g.append("text").style("font-size", "19px")
                        .attr("x", margin_width/1.9)
                        .attr("y", - margin_top + 79)
                        .attr("fill", "black")
                        .text("Coordinate 1"));
            
            var y_axis = d3.scaleLinear()
                    .domain([d3.min(Object.keys(y_value),
                        function(data) { return 1.25 * y_value[data]}), d3.max(Object.keys(y_value),
                        function(data) { return 1.25 * y_value[data]})])
                    .range([ margin_height, 0]);

            mds_ref.append("g").call(d3.axisLeft(y_axis)).call(g => g.append("text").style("font-size", "19px").attr("x", -margin_height/2+100).attr("y", -margin_left + 25)
                    .attr("fill", "black")
                    .attr("transform", "rotate(-90)")
                    .text("Coordinate 2"));
            
            let mdsPlot = mds_ref.append('g');

                mdsPlot.selectAll("dot").data(Object.keys(x_value)).enter().append("circle")
                    .attr("cx", function (data) { return x_axis(x_value[data])})
                    .attr("cy", function (data) { return y_axis(y_value[data])})
                    .attr("r", 5)
                    .style("fill", function (data) { return "green"})
                    .on('click', function (data, index) {
                        d3.select(this).transition().duration('40').style("fill","purple");
                        pcp.push(mdsVariable.name[data]);
                        //mds_var_props.plotPCP(pcp);

                        // Add linking code here
                        piechart("Heart Stroke", pcp[pcp.length-1]);
                        if(pcp.length >= 2) {
                            scatterplot(pcp[pcp.length-1], pcp[pcp.length-2], "Heart Stroke")
                        }
                    });

                mdsPlot.selectAll("text").data(Object.keys(mdsVariable.name)).enter().append("text").style("font-size", "13px").attr("x", function (data) { return x_axis(x_value[data])+11})
                    .attr("y", function (data) { return y_axis(y_value[data])+5})
                    .attr("fill", "black")
                    .text(function(d){return mdsVariable.name[d]});
        }
}

    // return(
    //     <div>
    //         <br/>
    //         <br/>{
    //           mdsVariable ? <div>
    //         <h3>MDS Variable Plot</h3>
    //         <svg ref={mds_variable_reference}></svg></div> : <div/>
    //         }
    //     </div>
    // );
}