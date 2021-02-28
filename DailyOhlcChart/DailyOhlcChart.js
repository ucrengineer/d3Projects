function ohlcChart(selection) {
    height = 1000,
        width = 2000,
        margin = ({ top: 20, right: 50, bottom: 30, left: 10 })


    function chart(_selection) {

        _selection.each(function(_data) {
            data = _data;

            // find data range 
            var xMin = d3.min(data, d => {
                return d['date'];
            });
            var xMax = d3.max(data, d => {
                return d['date'];
            });

            var yMin = d3.min(data, d => {
                return d['close'];
            })
            var yMax = d3.max(data, d => {
                return d['close'];
            });

            const yMaxVolume = d3.max(data, d => {
                return Math.max(d['volume']);
            });
            const yMinVolume = d3.min(data, d => {
                return Math.min(d['volume']);
            });
            const yVolumeScale = d3.scaleLinear()
                .domain([yMinVolume, yMaxVolume])
                .range([height, 0]);

            // scales for the charts 
            var xScale = d3.
            scaleBand()
                .domain(d3.timeDay
                    .range(xMin, +xMax + 1)
                    .filter(d => d.getDay() !== 0 && d.getDay() !== 6))
                .range([margin.left, width - margin.right])
                .padding(0.2)

            var yScale = d3.
            scaleLinear()
                .domain([yMin - 5, yMax])
                .range([height, 0])


            var svg = d3.select(".chart").append("svg")
                .attr("viewBox", [40, -50, width, height * 1.3]);


            var xDomain = d3.extent(data, function(d) {
                return d[0];
            });
            var yDomain = d3.extent(data, function(d) {
                return d[1];
            });
            svg.append("g")
                .attr('id', 'xAxis')
                .attr('transform', `translate(0, ${height})`)
                .call(d3.axisBottom(xScale)
                    .tickValues(d3.timeMonday
                        .every(width > 720 ? 1 : 5)
                        .range(xMin, xMax))
                    .tickFormat(d3.timeFormat("%-m/%-d")))
                .selectAll("text")
                .style("text-anchor", "end")
                .style("font-weight", "bold")
                .style("font-size", "Small")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");

            svg.append("g")
                .attr('id', 'yAxis')
                .attr('transform', `translate(${width},0)`)
                .call(d3.axisRight(yScale))
                .style("font-weight", "bold")
                .style("font-size", "Small")
                .call(g => g.selectAll(".tick line").clone()
                    .attr("stroke-opacity", 0.2)
                    .attr("x2", -width))
                .call(g => g.select(".domain").remove())

            svg.append("g")
                .selectAll()
                .data(data)
                .enter()
                .append("rect")
                .attr("x", d => {

                    return xScale(d.date);
                })
                .attr("y", d => {
                    return yVolumeScale(d.volume);
                })
                .attr("fill", (d, i) => {
                    if (i === 0) {
                        return "#000099";
                    } else {
                        return data[i - 1].close > d.close ? "#000099" : "#000099";
                    }
                })
                .attr("width", 5)
                .attr("height", d => {
                    return height * .98 + margin.top - yVolumeScale(d.volume);
                })
                .attr("opacity", ".3")


            svg.append("g")
                .attr("stroke-width", 2)
                .attr("fill", "none")
                .selectAll("path")
                .data(data)
                .join("path")
                .attr("d", d =>
                    `M${xScale(d.date)}, ${yScale(d.low)}V${yScale(d.high)}
            M${xScale(d.date)}, ${yScale(d.open)}h-4
            M${xScale(d.date)}, ${yScale(d.close)}h4
            `)
                .attr("stroke", d => d.open > d.close ? d3.schemeSet1[0] :
                    d.close > d.open ? d3.schemeSet1[2] :
                    d3.schemeSet1[8])
                .append("title")
                .text(d => `${formatDate(d.date)}
            Open : ${formatValue(d.open)}
            Close : ${formatValue(d.close)} (${formatChange(d.open, d.close)})
            Low : ${formatValue(d.low)}
            High : ${formatValue(d.high)}`);

            //chart extras 

            xScale.invert = function(x) { return d3.scaleQuantize().domain(this.range()).range(this.domain())(x); }

            var g = svg.append('g');
            var label = g.append("text")
                .attr('x', width / 5)
                .attr('y', height / 20)
                .style("font-size", "medium")
                .style("font-weight", "bold")
                .style("text-anchor", "end");



            // create crosshairs
            var crosshair = g.append("g")
                .attr("class", "line");

            // create horizontal line
            crosshair.append("line")
                .attr("id", "crosshairX")
                .attr("class", "crosshair");

            // create vertical line
            crosshair.append("line")
                .attr("id", "crosshairY")
                .attr("class", "crosshair");

            var xy0,
                path,
                keep = false,
                count = 1,
                on = []
            line = d3.line()
                .x(function(d) { return d[0]; })
                .y(function(d) { return d[1]; });

            g.append("rect")
                .attr("class", "overlay")
                .attr("width", width)
                .attr("height", height)
                .on("mousedown", (event) => {
                    keep = true;
                    on.push(count)
                    console.log(event.timeStamp)


                    var mouse = d3.pointer(event);
                    xy0 = mouse;
                    path = d3.select("svg")
                        .append("path")
                        .attr("id", "trendline")
                        .attr("d", line([xy0, xy0]))
                        .style("stroke", "black")
                        .style("stroke-width", "1px")
                    count++;


                })
                .on("mouseup", function() {
                    keep = false;
                })
                .on("mouseover", function() {
                    crosshair.style("display", null)


                })
                .on("mouseout", function() {
                    crosshair.style("display", "none");
                    label.text("");
                })
                .on("mousemove", (event) => {
                    var mouse = d3.pointer(event);
                    var x = mouse[0];
                    var y = mouse[1];
                    // draw trendline
                    if (keep == false && on[on.length - 1] % 2) {
                        Line = line([xy0, mouse.map(function(x) { return x - 1; })])
                        path.attr("d", Line)
                    }
                    // brush the data to zoom in
                    // if (keep == true) {
                    //     Line = line([xy0, mouse.map(function(x) { return x - 1; })])
                    //     path.attr("d", Line)
                    // }


                    crosshair.select('#crosshairX')
                        .attr("x1", mouse[0])
                        .attr("y1", yScale(0))
                        .attr("x2", mouse[0])
                        .attr("y2", yScale(yMax * 2))

                    crosshair.select('#crosshairY')
                        .attr("x1", xScale(xMin))
                        .attr("y1", mouse[1])
                        .attr("x2", xScale(xMax))
                        .attr("y2", mouse[1])
                    label.text(function() {
                        return "Date: " + formatDate(xScale.invert(x)) + ", Price:" + formatValue(yScale.invert(y));
                    });
                })
                .on("click", (event) => {
                    if (event.detail === 2) {
                        d3.selectAll("#trendline").remove()
                    }
                })







        })
    }

    formatDate = d3.timeFormat("%B %-d, %Y")
    formatValue = d3.format(".2f")

    function formatChange(y0, y1) {
        y = d3.format("+.2%");
        return (y0, y1) => f((y1 - y0) / y0);

    }

    function draw(selection) {
        var xy0,
            path,
            keep = false,
            line = d3.line()
            .x(function(d) { return d[0]; })
            .y(function(d) { return d[1]; });

        selection
            .on("mousedown", (event) => {
                console.log("mouse down")
                var keep = true;
                var mouse = d3.pointer(event);
                xy0 = mouse;
                path = d3.select("svg")
                    .append("path")
                    .attr("d", line([xy0, xy0]))
                    .style("stroke", "black")
                    .style("stroke-width", "1px");
            })
            .on("mouseup", (event) => {
                var keep = false;
                console.log("mouse up")
            })
            .on("mousemove", (event) => {
                console.log("Mouse move")
                console.log(keep)
                var mouse = d3.pointer(event);
                if (keep) {
                    Line = line([xy0, mouse.map(function(x) { return x - 1; })])
                    console.log(Line);
                    path.attr("d", Line)
                }
            });

    }




    return chart;
}