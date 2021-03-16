var d3 = d3v4
d3.csv("vaccines_by_state.csv", function(data) {

    var diameter = 850;
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    data = { 'children': data}

    var bubble = d3.pack(data)
        .size([diameter, diameter])
        .padding(1.5);

    var svg = d3.select("#bubbleChart")
        .append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .attr("margin-right", "1000px")
        .attr("class", "bubble");

    console.log(data)

    var nodes = d3.hierarchy(data)
        .sum(function(d) { 
            return d.Count; 
        });

    var node = svg.selectAll(".node")
        .data(bubble(nodes).descendants())
        .enter()
        .filter(function(d){
            return  !d.children
        })
        .append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    node.append("title")
        .text(function(d) {
            return d.Name + ": " + d.Count;
        });

    node.append("circle")
        .attr("r", function(d) {
            return d.r;
        })
        .style("fill", function(d,i) {
            return color(i);
        });

node.append("text")
        .attr("dy", "2em")
        .style("text-anchor", "middle")
        .text(function(d) {
            return d.data.Count;
        })
        .attr("font-family",  "sans-serif")
        .attr("font-size", function(d){
            return d.r/4;
        })
        .attr("fill", "black");

    node.append("text")
        .attr("dy", ".2em")
        .style("text-anchor", "middle")
        .text(function(d) {
            return d.data.Name.substring(0, d.r / 3);
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", function(d){
            return d.r/4;
        })
        .attr("fill", "black");

    d3.select(self.frameElement)
        .style("height", diameter + "px");
});
