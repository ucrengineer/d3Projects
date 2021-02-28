function analyticsDashboard() {
    var element = d3.select('.chart-1').node();

    color = "steelblue",
        height = 250,
        //width = 200,
        width = parseInt(window.getComputedStyle(element).width) / 3;
    margin = ({ top: 30, right: 0, bottom: 0, left: 40 });

    var names = ["morning", "midday", "close"]

    function dashboard(_selection) {

        _selection.each(function(_data) {
            data = _data;
            // set objects for each chart
            var tradedata = [
                { "morning": data[data.length - 1].morning },
                { "midday": data[data.length - 1].midday },
                { "close": data[data.length - 1].close }
            ]

            var tradepercent = [
                { "time": "morning", "value": calcmean(data[data.length - 1].morningpercent) },
                { "time": "midday", "value": calcmean(data[data.length - 1].middaypercent) },
                { "time": "close", "value": calcmean(data[data.length - 1].closepercent) }
            ]

            var gainloss = [
                { "name": "gain", "value": avgGain(data, true) },
                { "name": "loss", "value": avgGain(data, false) }
            ]

            var patterns = [
                { "name": "Sym Triangle", "value": patterninfo(data, 0, false), "outcome": +patterninfo(data, 0, true), },
                { "name": "Asc Triangle", "value": patterninfo(data, 1, false), "outcome": +patterninfo(data, 1, true) },
                { "name": "Desc Triangle", "value": patterninfo(data, 2, false), "outcome": +patterninfo(data, 2, true) },
                { "name": "Falling Wedge", "value": patterninfo(data, 3, false), "outcome": +patterninfo(data, 3, true) },
                { "name": "Rising Wedge", "value": patterninfo(data, 4, false), "outcome": +patterninfo(data, 4, true) },
                { "name": "Flag", "value": patterninfo(data, 5, false), "outcome": +patterninfo(data, 5, true) },
                { "name": "Pennant", "value": patterninfo(data, 6, false), "outcome": +patterninfo(data, 6, true) },
                { "name": "H & S", "value": patterninfo(data, 7, false), "outcome": +patterninfo(data, 7, true) },
                { "name": "Double Bottom", "value": patterninfo(data, 8, false), "outcome": +patterninfo(data, 8, true) },
                { "name": "Double Top", "value": patterninfo(data, 9, false), "outcome": +patterninfo(data, 9, true) },
                { "name": "Rounding Bottom", "value": patterninfo(data, 10, false), "outcome": +patterninfo(data, 10, true) },
                { "name": "Rounding Top", "value": patterninfo(data, 11, false), "outcome": +patterninfo(data, 11, true) },
                { "name": "Rectangle", "value": patterninfo(data, 12, false), "outcome": +patterninfo(data, 12, true) },
                { "name": "Trendline", "value": patterninfo(data, 13, false), "outcome": +patterninfo(data, 13, true) }

            ]




            xtrades = d3.scaleBand()
                .domain(d3.range(names.length))
                .range([margin.left, width * 3 - margin.right * 3])
                .padding(0.1);
            ytrades = d3.scaleLinear()
                .domain([0, 1])
                .range([height - margin.bottom, margin.top])
                .nice()

            var svg1 = d3.select(".chart-1")
                .append("svg")
                .attr("width", width * 3)
                .attr("height", height - margin.bottom + margin.top + 15)
                // y axis
            svg1.append("g")
                .attr("class", "x-axis")
                .call(xAxis);
            // x label
            svg1.append("text")
                .attr("transform",
                    "translate(" + (xtrades.bandwidth() * 2) + " ," +
                    (height + +margin.top + 10) + ")")
                .style("text-anchor", "middle")
                .text("Time");
            // y axis
            svg1.append("g")
                .call(yAxis);

            // y label 
            svg1.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left / 10)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("font-size", ".75em")
                .text("Frequency");

            // bars    
            svg1.append("g")
                .attr("fill", color)
                .selectAll("rect")
                .data(tradedata)
                .join("rect")
                .attr("x", (d, i) => xtrades(i))
                .attr("y", (d, i) => ytrades(d[Object.keys(d)[0]]))
                .attr("height", (d, i) => ytrades(0) - ytrades(d[Object.keys(d)[0]]))
                .attr("width", xtrades.bandwidth());

            // title 
            svg1.append("g")
                .append("text")
                .text("Time of Entry Trades")
                .attr("x", width * 1.1)
                .attr("y", margin.top - 10);

            /* next chart formation*/
            // collect values in a array

            x = d3.scaleLinear()
                .domain(d3.extent(tradepercent, d => d.value))
                .rangeRound([margin.left, width * 3 - 37]);

            y = d3.scaleBand()
                .domain(d3.range(tradepercent.length))
                .rangeRound([margin.top * 2, height - margin.bottom])
                .padding(0.1);


            xAxis2 = g => g
                .attr("transform", `translate(0,${margin.top*2})`)
                .call(d3.axisTop(x).ticks(width / 20).tickFormat(d => d + "%"))
                .call(g => g.select(".domain").remove())


            yAxis2 = g => g
                .attr("transform", `translate(${x(0)},0)`)
                .call(d3.axisLeft(y).tickFormat(i => tradepercent[i].time).tickSize(0).tickPadding(6))
                .call(g => g.selectAll(".tick text").filter(i => tradepercent[i].value < 0)
                    .attr("text-anchor", "start")
                    .attr("x", 6))



            var svg2 = d3.select(".chart-2")
                .append("svg")
                .attr("width", width * 3)
                .attr("height", height - margin.bottom + margin.top + 15)

            svg2.append("g")
                .selectAll("rect")
                .data(tradepercent)
                .join("rect")
                .attr("fill", d => d3.schemeSet1[d.value > 0 ? 1 : 0])
                .attr("x", d => x(Math.min(d.value, 0)))
                .attr("y", (d, i) => y(i))
                .attr("width", d => Math.abs(x(d.value) - x(0)))
                .attr("height", y.bandwidth());

            svg2.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 10)
                .selectAll("text")
                .data(tradepercent)
                .join("text")
                .attr("text-anchor", d => d.value < 0 ? "end" : "start")
                .attr("x", d => x(d.value) + Math.sign(d.value - 0) * 4)
                .attr("y", (d, i) => y(i) + y.bandwidth() / 2)
                .attr("dy", ".35em")
                .text((d, i) => d.value + "%");

            svg2.append("g")
                .call(xAxis2);

            svg2.append("g")
                .call(yAxis2)


            svg2.append("g")
                .append("text")
                .text("Outcome of Trades vs Time of Entry (Gain/Loss %)")
                .attr("x", width * .5)
                .attr("y", margin.top - 10);

            // next chart 

            x3 = d3.scaleLinear()
                .domain(d3.extent(gainloss, d => d.value))
                .rangeRound([margin.left, width * 3 - 37]);

            y3 = d3.scaleBand()
                .domain(d3.range(gainloss.length))
                .rangeRound([margin.top * 2, height - margin.bottom])
                .padding(0.1);


            xAxis3 = g => g
                .attr("transform", `translate(0,${margin.top*2})`)
                .call(d3.axisTop(x3).ticks(width / 20).tickFormat(d => d + "%"))
                .call(g => g.select(".domain").remove());


            yAxis3 = g => g
                .attr("transform", `translate(${x3(0)},0)`)
                .call(d3.axisLeft(y3).tickFormat(i => gainloss[i].name).tickSize(0).tickPadding(6))
                .call(g => g.selectAll(".tick text").filter(i => gainloss[i].value < 0)
                    .attr("text-anchor", "start")
                    .attr("x", 6));


            var svg3 = d3.select(".chart-3")
                .append("svg")
                .attr("width", width * 3)
                .attr("height", height - margin.bottom + margin.top + 15)

            svg3.append("g")
                .selectAll("rect")
                .data(gainloss)
                .join("rect")
                .attr("fill", d => d3.schemeSet1[d.value > 0 ? 1 : 0])
                .attr("x", d => x3(Math.min(d.value, 0)))
                .attr("y", (d, i) => y3(i))
                .attr("width", d => Math.abs(x3(d.value) - x3(0)))
                .attr("height", y3.bandwidth());

            svg3.append("g")
                .call(xAxis3);

            svg3.append("g")
                .call(yAxis3);

            svg3.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 10)
                .selectAll("text")
                .data(gainloss)
                .join("text")
                .attr("text-anchor", d => d.value < 0 ? "end" : "start")
                .attr("x", d => x3(d.value) + Math.sign(d.value - 0) * 4)
                .attr("y", (d, i) => y3(i) + y3.bandwidth() / 2)
                .attr("dy", ".35em")
                .text((d, i) => d.value + "%");


            svg3.append("g")
                .append("text")
                .text("Average Gain/Loss %")
                .attr("x", width * 1.1)
                .attr("y", margin.top - 10);


            // next chart 

            xpatterns = d3.scaleBand()
                .domain(d3.range(patterns.length))
                .range([margin.left, width * 3 - margin.right * 3])
                .padding(0.1);
            ypatterns = d3.scaleLinear()
                .domain([0, findmax(patterns, false)])
                .range([height - margin.bottom, margin.top])
                .nice()

            xAxisPatterns = g => g
                .attr("transform", `translate(0,${height -  margin.bottom})`)
                .call(d3.axisBottom(xpatterns).tickFormat(i => patterns[i].name).ticks(3))
            yAxisPatterns = g => g
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(ypatterns).ticks(null))
                .call(g => g.selectAll(".tick line").clone()
                    .attr("stroke-opacity", 0.2)
                    .attr("x2", width * 3 - margin.left - margin.right))
                .call(g => g.select(".domain").remove())


            var svg4 = d3.select(".chart-4")
                .append("svg")
                .attr("width", width * 3)
                .attr("height", height - margin.bottom + margin.top + 15)
                // x axis
            svg4.append("g")
                .attr("class", "x-axis")
                .call(xAxisPatterns)
                .selectAll("text")
                .style("text-anchor", "end")
                .style("font-weight", "bold")
                .style("font-size", ".9em")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-25)");

            // y axis
            svg4.append("g")
                .call(yAxisPatterns);

            // y label 
            svg4.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left / 10)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("font-size", ".75em")
                .text("# of Trades");

            // bars    
            svg4.append("g")
                .attr("fill", color)
                .selectAll("rect")
                .data(patterns)
                .join("rect")
                .attr("x", (d, i) => xpatterns(i))
                .attr("y", (d, i) => ypatterns(d.value))
                .attr("height", (d, i) => ypatterns(0) - ypatterns(d.value))
                .attr("width", xpatterns.bandwidth());

            // title 
            svg4.append("g")
                .append("text")
                .text("Patterns Traded")
                .attr("x", width * 1.3)
                .attr("y", margin.top - 10);


            // next chart


            x4 = d3.scaleLinear()
                .domain(d3.extent(patterns, d => d.outcome))
                .rangeRound([margin.left + 5, width * 3 - 37]);

            y4 = d3.scaleBand()
                .domain(d3.range(patterns.length))
                .rangeRound([margin.top * 2, height - margin.bottom])
                .padding(0.1);


            xAxis4 = g => g
                .attr("transform", `translate(0,${margin.top*2})`)
                .call(d3.axisTop(x4).ticks(width / 20).tickFormat(d => d + " %"))
                .call(g => g.select(".domain").remove());


            yAxis4 = g => g
                .attr("transform", `translate(${x4(0)},0)`)
                .call(d3.axisLeft(y4).tickFormat(i => patterns[i].name).tickSize(0).tickPadding(6))
                .call(g => g.selectAll(".tick text").filter(i => patterns[i].outcome < 0)
                    .attr("text-anchor", "start")
                    .attr("x", 6));


            var svg5 = d3.select(".chart-5")
                .append("svg")
                .attr("width", width * 3)
                .attr("height", height - margin.bottom + margin.top + 15)

            svg5.append("g")
                .selectAll("rect")
                .data(patterns)
                .join("rect")
                .attr("fill", d => d3.schemeSet1[d.outcome > 0 ? 1 : 0])
                .attr("x", d => x4(Math.min(d.outcome, 0)))
                .attr("y", (d, i) => y4(i))
                .attr("width", d => Math.abs(x4(d.outcome) - x4(0)))
                .attr("height", y4.bandwidth());

            svg5.append("g")
                .call(xAxis4);

            svg5.append("g")
                .call(yAxis4);

            svg5.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 10)
                .selectAll("text")
                .data(patterns)
                .join("text")
                .attr("text-anchor", d => d.outcome < 0 ? "end" : "start")
                .attr("x", d => x4(d.outcome) + Math.sign(d.outcome - 0) * 4)
                .attr("y", (d, i) => y4(i) + y4.bandwidth() / 2)
                .attr("dy", ".35em")
                .text((d, i) => d.outcome + "%");


            svg5.append("g")
                .append("text")
                .text("Average Gain/Loss % per Pattern")
                .attr("x", width * .8)
                .attr("y", margin.top - 10);

            // next chart

            x5 = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.reactionPercentage) * 1.2])
                .range([margin.left, width * 3 - margin.right * 3 - 40]);

            y5 = d3.scaleLinear()
                .domain(d3.extent(data, d => d.percentageChange))
                .range([height - margin.bottom, margin.top])
                .nice();

            xAxis5 = g => g
                .attr("transform", `translate(0,${height -  margin.bottom})`)
                .call(d3.axisBottom(x5))
                .call(g => g.select(".domain").remove())


            yAxis5 = g => g
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y5))
                .call(g => g.select(".domain").remove())
                .call(g => g.select(".tick:last-of-type text").clone()
                    .attr("transform", "rotate(-90)")
                    .attr("y", 0 - margin.left)
                    .attr("x", 0 - (height / 2))
                    .attr("dy", "1em")
                    .style("text-anchor", "middle")
                    .style("font-size", "1.5em")
                    .text("% Gain"));

            var colorScale = d3.scaleOrdinal()
                .domain(patterns)
                .range(d3.schemeSet1);
            var div = d3.select(".chart-6").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);
            var svg6 = d3.select(".chart-6")
                .append("svg")
                .attr("width", width * 3)
                .attr("height", height - margin.bottom + margin.top + 15)

            svg6.append("g")
                .call(xAxis5);
            svg6.append("g")
                .call(yAxis5);

            svg6.append("g")
                .attr("stroke", "#000")
                .attr("stroke-opacity", .02)
                .selectAll("circle")
                .data(data)
                .join("circle")
                .attr("cx", function(d) {
                    if (d.reactionPercentage != null) {
                        return x5(d.reactionPercentage)
                    }
                })
                .attr("cy", function(d) {
                    if (d.percentageChange != null) {
                        return y5(d.percentageChange)
                    }
                })
                .attr("fill", d => d3.color(colorScale(d.pattern)))
                .attr("r", function(d) {

                    if (d.reactionPercentage == null ||
                        d.percentageChange == null) {
                        return 0
                    } else {
                        return 3.5
                    }
                })
                .append("title")
                .text(d => `Pattern: ${patterns[d.pattern].name}`)





            // x label
            svg6.append("text")
                .attr("transform",
                    "translate(" + (xtrades.bandwidth() * 2) + " ," +
                    (height + +margin.top + 10) + ")")
                .style("text-anchor", "middle")
                .text("% Reaction");

            svg6.append("g")
                .append("text")
                .text("Reaction % vs Gain % per Pattern")
                .attr("x", width * .8)
                .attr("y", margin.top - 10);


            // chart 7


            xline = d3.scaleLinear()
                .domain([1, data.length])
                .range([margin.left, width * 3 - margin.right * 3 - 40]);

            yline = d3.scaleLinear()
                .domain([d3.min(data, d => d.netoutcome) * 2, d3.max(data, d => d.netoutcome)]).nice()
                .range([height - margin.bottom, margin.top])

            xAxisLine = g => g
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(xline).ticks(width / 20).tickSizeOuter(0))

            yAxisLine = g => g
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(yline))
                .call(g => g.select(".domain").remove())
                .call(g => g.select(".tick:last-of-type text").clone()
                    .attr("x", 3)
                    .attr("text-anchor", "start")
                    .attr("font-weight", "bold")
                    .text(data.netoutcome))
                .call(g => g.select(".tick:last-of-type text").clone()
                    .attr("transform", "rotate(-90)")
                    .attr("y", 0 - margin.left - 3)
                    .attr("x", 0 - (height / 2.5))
                    .attr("dy", "1em")
                    .style("text-anchor", "middle")
                    .style("font-size", "1.3em")
                    .text("$"));


            outcomearray = [];
            line = d3.line()
                .defined(d => !isNaN(d.netoutcome))
                .x((d, i) => xline(i + 1))
                .y(function(d) {
                    outcomearray.push(d.netoutcome);
                    return yline(d3.sum(outcomearray));
                })

            var svg7 = d3.select(".chart-7")
                .append("svg")
                .attr("width", width * 3)
                .attr("height", height - margin.bottom + margin.top + 15)

            svg7.append("g")
                .call(xAxisLine)

            svg7.append("g")
                .call(yAxisLine)

            svg7.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("d", line);
            outcomearray = [];
            svg7.append("g")
                .attr("stroke", "black")
                .attr("stroke-opacity", .02)
                .selectAll("circle")
                .data(data)
                .join("circle")
                .attr("cx", (d, i) => xline(i + 1))
                .attr("cy", function(d) {
                    outcomearray.push(d.netoutcome);
                    return yline(d3.sum(outcomearray));
                })
                .attr("fill", "black")
                .attr("r", 3.5)
                .append("title")
                .text(d => `Entry Date: ${ d3.timeFormat("%B %d, %Y")(d.entrydate)} ~ Exit Date: ${d3.timeFormat("%B %d, %Y")(d.exitdate)}`)



            // x label
            svg7.append("text")
                .attr("transform",
                    "translate(" + (xtrades.bandwidth() * 2) + " ," +
                    (height + +margin.top + 10) + ")")
                .style("text-anchor", "middle")
                .style("font-size", ".8em")
                .text("Trade #");

            svg7.append("g")
                .append("text")
                .text("Equity Curve")
                .attr("x", width * 1.3)
                .attr("y", margin.top - 10);









        })
    }

    function findmax(list, bool) {
        newlist = [];
        outcome = [];
        list.forEach(element => {
            newlist.push(element.value);
            outcome.push(element.outcome);
        });
        if (bool) {
            return calcmean(outcome);
        } else {
            return d3.max(newlist);

        }
    }

    function patterninfo(data, id, bool) {
        i = 0;
        newlist = [];
        data.forEach(element => {
            if (element.pattern == id) {
                if (element.percentageChange != null) {
                    newlist.push(element.percentageChange)
                }
                i++;
            }
        });
        if (bool && newlist.length > 0) {
            return calcmean(newlist);
        } else if (bool && newlist.length == 0) {
            return 0;
        } else {
            return i;
        }


    }


    function avgGain(list, bool) {
        gainlist = [];
        losslist = [];
        list.forEach(element => {
            if (element.percentageChange > 0 && element.percentageChange != null) {
                gainlist.push(element.percentageChange);
            } else if (element.percentageChange < 0 && element.percentageChange != null) {
                losslist.push(element.percentageChange);
            }
        });
        if (bool) {
            return calcmean(gainlist);
        } else {
            return calcmean(losslist);
        }


    }


    function calcmean(list) {
        return d3.mean(list).toFixed(2);
    }





    xAxis = g => g
        .attr("transform", `translate(0,${height -  margin.bottom})`)
        .call(d3.axisBottom(xtrades).tickFormat(i => names[i]).ticks(3))

    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(ytrades).ticks(null))
        .call(g => g.selectAll(".tick line").clone()
            .attr("stroke-opacity", 0.2)
            .attr("x2", width * 3 - margin.left - margin.right))
        .call(g => g.select(".domain").remove())



    return dashboard;
}