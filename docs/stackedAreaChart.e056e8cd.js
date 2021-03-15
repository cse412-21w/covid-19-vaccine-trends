// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"F1CS":[function(require,module,exports) {
var d3 = d3v4;
var parseTime = d3.timeParse("%d-%b-%y");

function dateWriter(date) {
  var ye = new Intl.DateTimeFormat('en', {
    year: 'numeric'
  }).format(date);
  var mo = new Intl.DateTimeFormat('en', {
    month: 'short'
  }).format(date);
  var da = new Intl.DateTimeFormat('en', {
    day: '2-digit'
  }).format(date);
  var wd = new Intl.DateTimeFormat('en', {
    weekday: 'short'
  }).format(date);
  var currDate = "".concat(da, " ").concat(mo, " ").concat(ye, " (").concat(wd, ")");
  return currDate;
} // set the dimensions and margins of the graph


var margin = {
  top: 20,
  right: 50,
  bottom: 50,
  left: 60
},
    width = 1500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom; // append the svg object to the body of the page

var svg = d3.select("#stackedChart").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"); // Parse the Data

d3.csv("us_daily_vaccines.csv", // Now I can use this dataset:
function (data) {
  // List of groups = header of the csv file
  var keys = data.columns.slice(1); // format the data

  data.forEach(function (d) {
    d.date = parseTime(d.date);
  }); // Add X axis

  var x = d3.scaleTime().domain(d3.extent(data, function (d) {
    return d.date;
  })).range([0, width]);
  svg.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x).ticks(10)); // Add Y axis

  var y = d3.scaleLinear().domain([0, 60000000]).range([height, 0]);
  var yAxis = d3.axisLeft(y).tickFormat(function (d, i) {
    return d / 1000000 + "M";
  });
  svg.append("g").call(yAxis); // color palette

  var color = d3.scaleOrdinal().domain(keys).range(['#4A98E8', '#0F57A0']); //stack the data

  var stackedData = d3.stack().keys(keys)(data); // This allows to find the closest X index of the mouse:

  var bisect = d3.bisector(function (d) {
    return d.date;
  }).left; // Create the circle that travels along the curve of chart

  var focus = svg.append('g').append('circle').style("fill", "none").attr("stroke", "black").attr('r', 8.5).style("opacity", 0); // Create the text that travels along the curve of chart

  var focusText = svg.append('g').append('text').style("opacity", 0).attr("text-anchor", "left").attr("alignment-baseline", "middle");
  var tooltip = d3.select("div#chart-info").append("div").attr("class", "d3-tooltip").style("position", "absolute").style("z-index", "10").style("visibility", "hidden").style("padding", "15px").style("background", "rgba(0,0,0,0.6)").style("border-radius", "5px").style("color", "#fff").text("a simple tooltip"); // Show the areas

  svg.selectAll("mylayers").data(stackedData).enter().append("path").style("fill", function (d) {
    console.log(d.key);
    return color(d.key);
  }).attr("d", d3.area().x(function (d, i) {
    return x(d.data.date);
  }).y0(function (d) {
    return y(d[0]);
  }).y1(function (d) {
    return y(d[1]);
  })); // Vertical line on mouseover

  var mouseG = svg.append("g").attr("class", "mouse-over-effects");
  mouseG.append("path").attr("class", "mouse-line").style("stroke", "black").style("stroke-width", "2px").style("opacity", "0");
  svg.append("rect").attr("class", "overlay").attr("width", width).attr("height", height).on("mouseover", function () {
    focus.style("display", null);
    d3.select(".mouse-line").style("opacity", "1");
  }).on("mouseout", function () {
    tooltip.html("").style("visibility", "hidden");
    d3.select(".mouse-line").style("opacity", "0");
  }).on("mousemove", mousemove);

  function mousemove() {
    var bisectDate = d3.bisector(function (d) {
      return d.date;
    }).left;
    var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    var depl = parseFloat(d['pv']);
    sum = parseInt(d.pv) + parseInt(d.pfv);
    tooltip.html("As of " + dateWriter(d.date) + ", " + sum + " people have been <br> vaccinated, of which " + d.pfv + " are fully vaccinated.").style("visibility", "visible");
    var mouse = d3.mouse(this); // move the vertical line

    d3.select(".mouse-line").attr("d", function () {
      var d = "M" + mouse[0] + "," + height;
      d += " " + mouse[0] + "," + 0;
      return d;
    });
  }

  svg.append("circle").attr("cx", 820).attr("cy", 20).attr("r", 6).style("fill", '#0F57A0');
  svg.append("circle").attr("cx", 820).attr("cy", 50).attr("r", 6).style("fill", '#4A98E8');
  svg.append("text").attr("x", 840).attr("y", 20).text("People Vaccinated").style("font-size", "15px").attr("alignment-baseline", "middle");
  svg.append("text").attr("x", 840).attr("y", 50).text("People Fully Vaccinated").style("font-size", "15px").attr("alignment-baseline", "middle");
  svg.append("text").attr("transform", "translate(" + width / 2 + " ," + (height + margin.top + 20) + ")").style("text-anchor", "middle").text("Date"); // text label for the y axis

  svg.append("text").attr("transform", "rotate(-90)").attr("y", 0 - margin.left).attr("x", 0 - height / 2).attr("dy", "1em").style("text-anchor", "middle").text("Number of People");
});
},{}]},{},["F1CS"], null)
//# sourceMappingURL=https://cse412-21w.github.io/covid-19-vaccine-trends/stackedAreaChart.e056e8cd.js.map