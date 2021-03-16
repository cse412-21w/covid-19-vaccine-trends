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
})({"stackedStatesChart.js":[function(require,module,exports) {
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
    weekday: 'long'
  }).format(date);
  var currDate = "".concat(da, " ").concat(mo, " ").concat(ye);
  return currDate;
} // set the dimensions and margins of the graph


var margin = {
  top: 10,
  right: 60,
  bottom: 50,
  left: 60
},
    width = 1500 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom; // append the svg object to the body of the page

var svg = d3.select("#stackedStates").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"); // Parse the Data

d3.csv("us_state_vaccines.csv", function (data) {
  // List of subgroups = header of the csv files
  var subgroups = data.columns.slice(1); // format the data

  data.forEach(function (d) {
    d.date = parseTime(d.date);
  }); // List of groups

  var groups = d3.map(data, function (d) {
    return d.date;
  }).keys(); // Add X axis

  var x = d3.scaleBand().domain(data.map(function (d) {
    return d.date;
  })).range([0, width]).padding([0.2]);
  var xAxis = d3.axisBottom(x).tickValues(x.domain().filter(function (d, i) {
    return !(i % 3);
  })).tickFormat(function (d, i) {
    return dateWriter(d);
  });
  svg.append("g").attr("transform", "translate(0," + height + ")").call(xAxis); // Add Y axis

  var y = d3.scaleLinear().domain([0, 2200000]).range([height, 0]);
  var yAxis = d3.axisLeft(y).tickFormat(function (d, i) {
    return d / 1000000 + "M";
  });
  svg.append("g").call(yAxis); // color palette = one color per subgroup

  var color = d3.scaleOrdinal().domain(subgroups).range(['#073c92', '#F9910D', '#F41C1C', '#F379F9', '#94E576', '#3DBEEF', '#FADD23', '#9237C6', '#EA7C7F', '#4163FA', '#45CEBD']);
  var stackedData = d3.stack().keys(subgroups)(data);
  var tooltip = d3.select("div#bar-info").append("div").attr("class", "d3-tooltip").style("position", "absolute").style("z-index", "10").style("visibility", "hidden").style("padding", "15px").style("background", "rgba(0,0,0,0.6)").style("border-radius", "5px").style("color", "#fff").text("a simple tooltip"); // Show the bars

  svg.append("g").selectAll("g") // Enter in the stack data = loop key per key = group per group
  .data(stackedData).enter().append("g").attr("fill", function (d) {
    return color(d.key);
  }).selectAll("rect") // enter a second time = loop subgroup per subgroup to add all rectangles
  .data(function (d) {
    return d;
  }).enter().append("rect").attr("x", function (d) {
    return x(d.data.date);
  }).attr("y", function (d) {
    return y(d[1]);
  }).attr("height", function (d) {
    return y(d[0]) - y(d[1]);
  }).attr("width", x.bandwidth()).attr("stroke", "grey").attr("opacity", 0.75).on("mouseover", function (d, i) {
    var subgroupName = d3.select(this.parentNode).datum().key;
    var subgroupValue = d.data[subgroupName];
    tooltip.html("Date: " + dateWriter(d.data.date) + "<br>" + "State: " + subgroupName + "<br>" + "Vaccination Count: " + subgroupValue).style("visibility", "visible");
    d3.select(this).style("stroke", "black").style("opacity", 1);
  }).on("mousemove", function (event, d) {
    tooltip.style("top", event.pageY - 10 + "px").style("left", event.pageX + 10 + "px");
  }).on("mouseout", function () {
    tooltip.html("").style("visibility", "hidden");
    d3.select(this).style("stroke", "grey").style("opacity", 0.75);
  });
  svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(x).selectAll("text").style("text-anchor", "end").attr("dx", "-.8em").attr("dy", "-.55em").attr("transform", "rotate(-90)");
  svg.append("text").attr("transform", "translate(" + width / 2 + " ," + (height + margin.top + 30) + ")").style("text-anchor", "middle").text("Date"); // text label for the y axis

  svg.append("text").attr("transform", "rotate(-90)").attr("y", 0 - margin.left).attr("x", 0 - height / 2).attr("dy", "1em").style("text-anchor", "middle").text("Number of doses administered"); // Legend

  var legendRectSize = 18;
  var legendSpacing = 4;
  var legend = svg.selectAll('.legend').data(color.domain()).enter().append('g').attr('class', 'legend').attr('transform', function (d, i) {
    var height = legendRectSize + legendSpacing;
    var offset = height * color.domain().length / 2;
    var horz = -2 * legendRectSize;
    var vert = i * height - offset;
    return 'translate(' + horz + ',' + vert + ')';
  });
  legend.append('rect').attr("x", '100px').attr("y", '120px').attr('width', legendRectSize).attr('height', legendRectSize).style('fill', color).style('stroke', color).style('margin-left', '20px');
  legend.append('text').attr("x", '125px').attr("y", '133px').text(function (d) {
    return d;
  });
});
},{}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "49676" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","stackedStatesChart.js"], null)
//# sourceMappingURL=/stackedStatesChart.45ab54b7.js.map