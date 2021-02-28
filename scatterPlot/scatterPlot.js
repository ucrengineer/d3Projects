function scatterPlot(selection) {

    height = 300,
        width = 500,
        margin = ({ top: 20, right: 30, bottom: 30, left: 40 })



    function chart(_selection) {
        _selection.each(function(_data) {
            data = _data;

            x = d3.scaleLinear()
                .domain(d3.extent(data, d => d.x)).nice()
                .range([margin.left, width - margin.right])

            y = d3.scaleLinear()
                .domain(d3.extent(data, d => d.y)).nice()
                .range([height - margin.bottom, margin.top])

            var svg = d3.select("body").append("svg")
                .attr("viewBox", [0, 0, width * 2, height * 2]);
            svg.append("g")
                .call(xAxis);
            svg.append("g")
                .call(yAxis);

            svg.append("g")
                .selectAll("dot")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", d => x(d.x))
                .attr("cy", d => y(d.y))
                .attr("r", 1.5)
                .style("fill", "#69b3a2")

        })
    }

    xAxis = g => g
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("x", width - margin.right)
            .attr("y", -4)
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .text(data.x))

    yAxis = g => g
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 4)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(data.y))

    return chart;
}