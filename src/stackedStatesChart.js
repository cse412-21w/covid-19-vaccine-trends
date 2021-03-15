var d3 = d3v4

var parseTime = d3.timeParse("%d-%b-%y");

function dateWriter(date) {
  const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
  const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
  const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
  const wd = new Intl.DateTimeFormat('en', { weekday: 'long' }).format(date);
  var currDate = `${da} ${mo} ${ye}`
  return currDate
}

// set the dimensions and margins of the graph
var margin = {top: 10, right: 60, bottom: 50, left: 60}, 
    width = 1500 - margin.left - margin.right, 
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#stackedStates")
            .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("us_state_vaccines.csv", function(data) {

  // List of subgroups = header of the csv files
  var subgroups = data.columns.slice(1)

  // format the data
  data.forEach(function(d) {
    d.date = parseTime(d.date);
  });

  // List of groups
  var groups = d3.map(data, function(d){return(d.date)}).keys()

  // Add X axis
  var x = d3.scaleBand()
            .domain(data.map(function(d) { return d.date; }))
            .range([0, width])
            .padding([0.2])
  var xAxis = d3.axisBottom(x)
                .tickValues(x.domain().filter(function(d,i){ return !(i%3)}))
                .tickFormat((d, i) => {return dateWriter(d)})
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)

  // Add Y axis
  var y = d3.scaleLinear()
            .domain([0, 2200000])
            .range([ height, 0 ]);
  var yAxis = d3.axisLeft(y)
                .tickFormat((d, i) => {return d/1000000 + "M"})
  svg.append("g")
      .call(yAxis);

  // color palette = one color per subgroup
  var color = d3.scaleOrdinal()
                .domain(subgroups)
                .range(['#073c92', '#F9910D', '#F41C1C', '#F379F9', '#94E576', '#3DBEEF', 
                        '#FADD23', '#9237C6', '#EA7C7F', '#4163FA', '#45CEBD'])

  var stackedData = d3.stack()
                      .keys(subgroups)
                      (data)

  const tooltip = d3.select("div#bar-info")
                    .append("div")
                      .attr("class","d3-tooltip")
                      .style("position", "absolute")
                      .style("z-index", "10")
                      .style("visibility", "hidden")
                      .style("padding", "15px")
                      .style("background", "rgba(0,0,0,0.6)")
                      .style("border-radius", "5px")
                      .style("color", "#fff")
                      .text("a simple tooltip");

  // Show the bars
  svg.append("g")
      .selectAll("g")
      // Enter in the stack data = loop key per key = group per group
      .data(stackedData)
      .enter().append("g")
        .attr("fill", function(d) { return color(d.key); })
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function(d) { return d; })
        .enter().append("rect")
          .attr("x", function(d) { return x(d.data.date); })
          .attr("y", function(d) { return y(d[1]); })
          .attr("height", function(d) { return y(d[0]) - y(d[1]); })
          .attr("width",x.bandwidth())
          .attr("stroke", "grey")
          .attr("opacity", 0.75)
      .on("mouseover", function(d, i) {
          var subgroupName = d3.select(this.parentNode).datum().key;
          var subgroupValue = d.data[subgroupName];
          tooltip.html("Date: " + dateWriter(d.data.date) + "<br>" + "State: " + subgroupName + "<br>" + "Vaccination Count: " + subgroupValue).style("visibility", "visible");
          d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
        })
      .on("mousemove", function(event, d){
          tooltip.style("top", (event.pageY-10)+"px")
                 .style("left",(event.pageX+10)+"px");
        })
      .on("mouseout", function() {
          tooltip.html(``).style("visibility", "hidden");
          d3.select(this)
            .style("stroke", "grey")
            .style("opacity", 0.75)
        });

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(x)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)" );

  svg.append("text")             
      .attr("transform",
            "translate(" + (width/2) + " ," + 
                           (height + margin.top + 30) + ")")
      .style("text-anchor", "middle")
      .text("Date");

  // text label for the y axis
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - (margin.left))
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Number of doses administered");

  // Legend
  var legendRectSize = 18;
  var legendSpacing = 4;       
  var legend = svg.selectAll('.legend')
                  .data(color.domain())
                  .enter()
                  .append('g')
                  .attr('class', 'legend')
                  .attr('transform', function(d, i) {
                    var height = legendRectSize + legendSpacing;
                    var offset =  height * color.domain().length / 2;
                    var horz = -2 * legendRectSize;
                    var vert = i * height - offset;
                    return 'translate(' + horz + ',' + vert + ')';
                  });

  legend.append('rect')
        .attr("x", '100px')
        .attr("y", '120px')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color)
        .style('margin-left', '20px');

  legend.append('text')
        .attr("x", '125px')
        .attr("y", '133px')
        .text(function(d) { return d; });   
})