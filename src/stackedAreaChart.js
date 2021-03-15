var d3 = d3v4
var parseTime = d3.timeParse("%d-%b-%y");

function dateWriter(date) {
  const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
  const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
  const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
  const wd = new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date);
  var currDate = `${da} ${mo} ${ye} (${wd})`
  return currDate
}

// set the dimensions and margins of the graph
var margin = {top: 20, right: 50, bottom: 50, left: 60},
    width = 1500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#stackedChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("us_daily_vaccines.csv", 

  // Now I can use this dataset:
  function(data) {

  // List of groups = header of the csv file
  var keys = data.columns.slice(1)

  // format the data
  data.forEach(function(d) {
    d.date = parseTime(d.date);
  });

  // Add X axis
  var x = d3.scaleTime()
            .domain(d3.extent(data, function(d) { return d.date; }))
            .range([ 0, width ]);
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(10));

  // Add Y axis
  var y = d3.scaleLinear()
            .domain([0, 60000000])
            .range([ height, 0 ]);
  var yAxis = d3.axisLeft(y)
                .tickFormat((d, i) => {return d/1000000 + "M"})
  svg.append("g")
      .call(yAxis);

  // color palette
  var color = d3.scaleOrdinal()
                .domain(keys)
                .range(['#4A98E8','#0F57A0'])

  //stack the data
  var stackedData = d3.stack()
                      .keys(keys)
                      (data)

  // This allows to find the closest X index of the mouse:
  var bisect = d3.bisector(function(d) { return d.date; }).left;
  // Create the circle that travels along the curve of chart
  var focus = svg.append('g')
                  .append('circle')
                  .style("fill", "none")
                  .attr("stroke", "black")
                  .attr('r', 8.5)
                  .style("opacity", 0)
    
  // Create the text that travels along the curve of chart
  var focusText = svg.append('g')
                      .append('text')
                      .style("opacity", 0)
                      .attr("text-anchor", "left")
                      .attr("alignment-baseline", "middle")

  const tooltip = d3.select("div#chart-info")
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

  // Show the areas
  svg.selectAll("mylayers")
      .data(stackedData)
      .enter()
      .append("path")
      .style("fill", function(d) { console.log(d.key) ; return color(d.key); })
      .attr("d", d3.area()
      .x(function(d, i) { return x(d.data.date); })
      .y0(function(d) { return y(d[0]); })
      .y1(function(d) { return y(d[1]); }))

  // Vertical line on mouseover
  var mouseG = svg.append("g")
                  .attr("class", "mouse-over-effects");
  mouseG.append("path")
        .attr("class", "mouse-line")
        .style("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", "0")

  svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", function() {
        focus.style("display", null);
        d3.select(".mouse-line")
          .style("opacity", "1");
      })
      .on("mouseout", function() {
        tooltip.html(``).style("visibility", "hidden");
        d3.select(".mouse-line")
          .style("opacity", "0");
      })
      .on("mousemove", mousemove);

  function mousemove() {
    var bisectDate = d3.bisector(function(d) {
                        return d.date;
                      }).left;

    var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d= x0 - d0.date > d1.date - x0 ? d1 : d0;
    var depl=parseFloat(d['pv'])
    sum = parseInt(d.pv) + parseInt(d.pfv)
    tooltip.html("As of " + dateWriter(d.date) + ", " + sum + " people have been <br> vaccinated, of which " +  d.pfv + " are fully vaccinated.").style("visibility", "visible");

    var mouse = d3.mouse(this);

    // move the vertical line
    d3.select(".mouse-line")
      .attr("d", function() {
        var d = "M" + mouse[0] + "," + height;
        d += " " + mouse[0] + "," + 0;
        return d;
      });
  }

  svg.append("circle").attr("cx",820).attr("cy",20).attr("r", 6).style("fill", '#0F57A0')
  svg.append("circle").attr("cx",820).attr("cy",50).attr("r", 6).style("fill", '#4A98E8')
  svg.append("text").attr("x", 840).attr("y", 20).text("People Vaccinated").style("font-size", "15px").attr("alignment-baseline","middle")
  svg.append("text").attr("x", 840).attr("y", 50).text("People Fully Vaccinated").style("font-size", "15px").attr("alignment-baseline","middle")

  svg.append("text")             
      .attr("transform",
        "translate(" + (width/2) + " ," + 
                       (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Date");

  // text label for the y axis
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - (margin.left))
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Number of People");
})