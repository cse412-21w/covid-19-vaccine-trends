require("regenerator-runtime/runtime");
const width = 975;
const height = 480;
const myDataLocation = require('../static/updated_rates.csv');

let svg = d3.select("#trial")
    .append("svg")
    .attr("viewBox", [0, 0, width, height]);

d3.csv(myDataLocation)
    .then(function (data) {
        createChart(data);
    });

async function createChart(data) {
    let barSize = 28;

    let margin = ({ top: 16, right: 6, bottom: 6, left: 0 });

    let n = 13;
    let duration = 45;

    let y = d3.scaleBand()
        .domain(d3.range(n + 1))
        .rangeRound([margin.top, margin.top + barSize * (n + 1 + 0.1)])
        .padding(0.1);


    let x = d3.scaleLinear([0, 1], [margin.left, width - margin.right]);

    let mapThing = d3.group(data, d => d.country);

    let countryArray = Array.from(mapThing.keys());
    var color = d3.scaleOrdinal()
        .range(d3.schemeTableau10)
        .domain(countryArray)

    let formatDate = d3.utcFormat("%B %d, %Y");
    let formatNumber = d3.format(",d");

    function ticker(svg) {
        const now = svg.append("text")
            .style("font", `bold ${barSize}px var(--sans-serif)`)
            .style("font-variant-numeric", "tabular-nums")
            .style("font-size", "30pt")
            .attr("text-anchor", "end")
            .attr("x", width - 6)
            .attr("y", margin.top + barSize * (n - 0.45))
            .attr("dy", "0.32em")
            .text(formatDate(keyframes[0][0]));

        return ([date], transition) => {
            transition.end().then(() => now.text(formatDate(date)));
        };
    }

    function axis(svg) {
        const g = svg.append("g")
            .attr("transform", `translate(0,${margin.top})`);

        const axis = d3.axisTop(x)
            .ticks(width / 160)
            .tickSizeOuter(0)
            .tickSizeInner(-barSize * (n + y.padding()));

        return (_, transition) => {
            g.transition(transition).call(axis);
            g.select(".tick:first-of-type text").remove();
            g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
            g.select(".domain").remove();
        };
    }

    function textTween(a, b) {
        const i = d3.interpolateNumber(a, b);
        return function (t) {
            this.textContent = formatNumber(i(t));
        };
    }

    function labels(svg) {
        let label = svg.append("g")
            .style("font", "bold 12px var(--sans-serif)")
            .style("font-variant-numeric", "tabular-nums")
            .attr("text-anchor", "end")
            .selectAll("text");

        return ([date, data], transition) => label = label
            .data(data.slice(0, n), d => d.country)
            .join(
                enter => enter.append("text")
                    .attr("transform", d => `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`)
                    .attr("y", y.bandwidth() / 2)
                    .attr("x", -6)
                    .attr("dy", "-0.25em")
                    .attr("font-size", "8px")
                    .text(d => d.country)
                    .call(text => text.append("tspan")
                        .attr("fill-opacity", 0.7)
                        .attr("font-weight", "normal")
                        .attr("font-size", "8px")
                        .attr("x", -6)
                        .attr("dy", "1.15em")),
                update => update,
                exit => exit.transition(transition).remove()
                    .attr("transform", d => `translate(${x((next.get(d) || d).value)},${y((next.get(d) || d).rank)})`)
                    .call(g => g.select("tspan").tween("text", d => textTween(d.value, (next.get(d) || d).value)))
            )
            .call(bar => bar.transition(transition)
                .attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
                .call(g => g.select("tspan").tween("text", d => textTween((prev.get(d) || d).value, d.value))));
    }

    function bars(svg) {
        let bar = svg.append("g")
            .attr("fill-opacity", 0.6)
            .selectAll("rect");

        return ([date, data], transition) => bar = bar
            .data(data.slice(0, n), d => d.country)
            .join(
                enter => enter.append("rect")
                    .attr("fill", d => color(d.country))
                    .attr("height", y.bandwidth())
                    .attr("x", x(0))
                    .attr("y", d => y((prev.get(d) || d).rank))
                    .attr("width", d => x((prev.get(d) || d).value) - x(0)),
                update => update,
                exit => exit.transition(transition).remove()
                    .attr("y", d => y((next.get(d) || d).rank))
                    .attr("width", d => x((next.get(d) || d).value) - x(0))
            )
            .call(bar => bar.transition(transition)
                .attr("y", d => y(d.rank))
                .attr("width", d => x(d.value) - x(0)));
    }

    let k = 35;

    let names = new Set(data.map(d => d.country));

    function rank(value) {
        const data = Array.from(names, country => ({ country, value: value(country) }));
        data.sort((a, b) => d3.descending(a.value, b.value));
        for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
        return data;
    }


    let datevalues = Array.from(d3.rollup(data, ([d]) => d.value, d => d.date, d => d.country))
        .map(([date, data]) => [new Date(date), data])
        .sort(([a], [b]) => d3.ascending(a, b))


    const keyframes = [];
    let ka, a, kb, b;
    for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
        for (let i = 0; i < k; ++i) {
            const t = i / k;
            keyframes.push([
                new Date(ka * (1 - t) + kb * t),
                rank(country => (a.get(country) || 0) * (1 - t) + (b.get(country) || 0) * t)
            ]);
        }
    }
    keyframes.push([new Date(kb), rank(country => b.get(country) || 0)]);
    // return keyframes;

    let nameframes = d3.groups(keyframes.flatMap(([, data]) => data), d => d.country);

    let next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)));

    let prev = new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])));

    console.log("charizard these mofos");

    const updateBars = bars(svg);
    const updateAxis = axis(svg);
    const updateLabels = labels(svg);
    const updateTicker = ticker(svg);

    // console.log(svg.node());

    await svg.node();

    for (const keyframe of keyframes) {
        const transition = svg.transition()
            .duration(duration)
            .ease(d3.easeLinear)


        // Extract the top bar’s value.
        x.domain([0, keyframe[1][0].value]);

        updateAxis(keyframe, transition);
        updateBars(keyframe, transition);
        updateLabels(keyframe, transition);
        updateTicker(keyframe, transition);

        // invalidation.then(() => svg.interrupt());
        await transition.end();
    }
}