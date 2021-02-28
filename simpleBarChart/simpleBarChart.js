function barChart() {


    color = "steelblue",
        height = 250,
        width = 250,
        margin = ({ top: 30, right: 0, bottom: 30, left: 40 });

    function chart(_selection) {
        _selection.each(function(_data) {
            data = _data;
            x = d3.scaleBand()
                .domain(d3.range(data.length))
                .range([margin.left, width - margin.right])
                .padding(0.1);
            y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.value)]).nice()
                .range([height - margin.bottom, margin.top]);

            var svg = d3.select("#example").append("svg")
                .attr("viewBox", [0, 0, width * 2, height * 2]);
            console.log("got here");
            svg.append("g")
                .attr("fill", color)
                .selectAll("rect")
                .data(data)
                .join("rect")
                .attr("x", (d, i) => x(i))
                .attr("y", d => y(d.value))
                .attr("height", d => y(0) - y(d.value))
                .attr("width", x.bandwidth());

            svg.append("g")
                .call(xAxis);
            svg.append("g")
                .call(yAxis);
        })
    }
    chart.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };
    chart.width = function(_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(i => data[i].name).tickSizeOuter(0));

    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(null, data.format))
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("x", -margin.left)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(data.y));

    return chart;
}