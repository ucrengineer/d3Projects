function ohlcChart(selection) {
    height = 500,
        width = 600,
        margin = ({ top: 20, right: 50, bottom: 30, left: 10 })

    function chart(_selection) {
        _selection.each(function(_data) {
            data = _data;

            formatDate = d3.timeFormat("%B %-d, %Y")
            formatValue = d3.format(".2f")

            function formatChange(y0, y1) {
                const f = d3.format("+.2f");
                var change = f(100 * (y1 - y0) / y0)
                return change;
            }
            var xMin = d3.min(data, d => {
                return d['date'];
            });
            var xMax = d3.max(data, d => {
                return d['date'];
            });

            const yMaxVolume = d3.max(data, d => {
                return Math.max(d.volume);
            });
            const yMinVolume = d3.min(data, d => {
                return Math.min(d.volume);
            });

            yVolumeScale = d3.scaleLinear()
                .domain([yMinVolume, yMaxVolume])
                .range([height, 0]);

            x = d3.scaleTime()
                .domain(
                    ([data[0].date, +data[data.length - 1].date + 1])
                )
                .range([margin.left, width - margin.right])


            y = d3.scaleLog()
                .domain([d3.min(data, d => d.low), d3.max(data, d => d.high)])
                .rangeRound([height - margin.bottom, margin.top])

            xAxis = g => g
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x)
                    .tickValues(d3.timeMonday
                        .every(width > 720 ? 1 : 8)
                        .range(xMin, xMax))
                    .tickFormat(d3.timeFormat("%b")))
                .call(g => g.select(".domain").remove())

            yAxis = g => g
                .attr("transform", `translate(${margin.left},10)`)
                .call(d3.axisLeft(y)
                    .tickFormat(d3.format("$~f"))
                    .tickValues(d3.scaleLinear().domain(y.domain()).ticks()))
                .call(g => g.selectAll(".tick line").clone()
                    .attr("stroke-opacity", 0.2)
                    .attr("x2", width - margin.left - margin.right))
                .call(g => g.select(".domain").remove())
            var svg = d3.select(".chart").append("svg")
                .attr("viewBox", [-40, 0, width, height]);

            svg.append("g")
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");

            svg.append("g")
                .call(yAxis)

            svg.append("text")
                .attr("x", ((width - margin.left) / 2.2))
                .attr("y", 20)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("text-decoration", "underline")
                .text(data[0].ticker);

            svg.append("g")
                .selectAll()
                .data(data)
                .enter()
                .append("rect")
                .attr("x", d => {
                    return x(d.date);
                })
                .attr("y", d => {
                    return yVolumeScale(d.volume);
                })
                .attr("fill", (d, i) => {
                    if (i === 0) {
                        return "#778899";
                    } else {
                        return data[i - 1].close > d.close ? "#778899" : "#778899";
                    }
                })
                .attr("width", 1)
                .attr("height", d => {
                    return height + margin.top - yVolumeScale(d.volume);
                })

            svg.append("g")
                .attr("stroke-width", 2)
                .attr("fill", "none")
                .selectAll("path")
                .data(data)
                .join("path")
                .attr("d", d => `
                      M${x(d.date)}, ${y(d.low)}V${y(d.high)}
                      M${x(d.date)}, ${y(d.open)}h-4
                      M${x(d.date)}, ${y(d.close)}h4
                `)
                .attr("stroke", d => d.open > d.close ? d3.schemeSet1[0] :
                    d.close > d.open ? d3.schemeSet1[2] :
                    d3.schemeSet1[8])
                .append("title")
                .text(d => `${formatDate(d.date)}
              Open: ${formatValue(d.open)}
              Close: ${formatValue(d.close)} (${formatChange(d.open, d.close)}%)
              Low: ${formatValue(d.low)}
              High: ${formatValue(d.high)}`);

        })

    }




    return chart;
}