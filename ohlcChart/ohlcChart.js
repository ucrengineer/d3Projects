function ohlcChart(selection) {
    height = 500,
        width = 500,
        margin = ({ top: 20, right: 50, bottom: 30, left: 10 })


    function chart(_selection) {
        _selection.each(function(_data) {
            data = _data;

            x = d3.scaleBand()
                .domain(d3.timeDay
                    .range(data[0].date, +data[data.length - 1].date + 1)
                    .filter(d => d.getDay() !== 0 && d.getDay() !== 6))
                .range([margin.left, width - margin.right])
                .padding(0.2)

            console.log(x)
            y = d3.scaleLog()
                .domain([d3.min(data, d => d.low), d3.max(data, d => d.high)])
                .rangeRound([height - margin.bottom, margin.top]);

            var svg = d3.select(".chart").append("svg")
                .attr("viewBox", [-40, 0, width, height]);

            svg.append("g")
                .call(xAxis);

            svg.append("g")
                .call(yAxis);

            svg.append("g")
                .attr("stroke-width", 2)
                .attr("fill", "none")
                .selectAll("path")
                .data(data)
                .join("path")
                .attr("d", d =>
                    `M${x(d.date)}, ${y(d.low)}V${y(d.high)}
            M${x(d.date)}, ${y(d.open)}h-4
            M${x(d.date)}, ${y(d.close)}h4
            `)
                .attr("stroke", d => d.open > d.close ? d3.schemeSet1[0] :
                    d.close > d.open ? d3.schemeSet1[2] :
                    d3.schemeSet1[8])
                .append("title")
                .text(d => `${formatDate(d.date)}
            Open : ${formatValue(d.open)}
            Close : ${formatValue(d.cluse)} (${formatChange(d.open, d.close)})
            Low : ${formatValue(d.low)}
            High : ${formatValue(d.high)}`);


        })
    }
    // xAxis = g => g
    //     .attr("transform", `translate(0,${height - margin.bottom})`)
    //     .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

    xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x)
            .tickValues(d3.timeMonday
                .every(width > 720 ? 1 : 2)
                .range(data[0].date, data[data.length - 1].date))
            .tickFormat(d3.timeFormat("%-m/%-d")))
        .call(g => g.select(".domain").remove())

    yAxis = g => g
        .attr("tranform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y)
            .tickFormat(d3.format("$~f"))
            .tickValues(d3.scaleLinear().domain(y.domain()).ticks()))
        .call(g => g.selectAll(".tick line").clone()
            .attr("stroke-opacity", 0.2)
            .attr("x2", width * 1.1 - margin.left - margin.right))
        .call(g => g.select(".domain").remove())


    formatDate = d3.timeFormat("%B %-d, %Y")
    formatValue = d3.format(".2f")

    function formatChange(y0, y1) {
        y = d3.format("+.2%");
        return (y0, y1) => f((y1 - y0) / y0);
    }

    return chart;
}