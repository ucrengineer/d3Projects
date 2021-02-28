function HierarchicalBarChart() {

    color = d3.scaleOrdinal([true, false], ["steelblue", "#aaa"]),
        barStep = 27,
        barPadding = 3 / barStep,
        duration = 750,
        height = 894,
        width = 894,
        margin = ({ top: 30, right: 30, bottom: 0, left: 100 });



    function chart(_selection) {
        _selection.each(function(_data) {
            data = _data;
            root = d3.hierarchy(data)
                .sum(d => d.value)
                .sort((a, b) => b.value - a.value)
                .eachAfter(d => d.index = d.parent ? d.parent.index = d.parent.index + 1 || 0 : 0);

            x = d3.scaleLinear().range([margin.left, width - margin.right]);
            var svg = d3.select("#example").append("svg")
                .attr("width", width)
                .attr("height", height);

            x.domain([0, root.value]);

            svg.append("rect")
                .attr("class", "background")
                .attr("fill", "none")
                .attr("pointer-events", "all")
                .attr("width", width)
                .attr("height", height)
                .attr("cursor", "pointer")
                .on("click", (event, d) => up(svg, d));

            svg.append("g")
                .call(xAxis);
            svg.append("g")
                .call(yAxis);

            down(svg, root);


        })
    }

    xAxis = g => g
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${margin.top})`)
        .call(d3.axisTop(x).ticks(width / 80, "s"))
        .call(g => (g.selection ? g.selection() : g).select(".domain").remove())


    yAxis = g => g
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left + 0.5},0)`)
        .call(g => g.append("line")
            .attr("stroke", color)
            .attr("y1", margin.top)
            .attr("y2", height - margin.bottom))

    function bar(svg, down, d, selector) {
        var g = svg.insert("g", selector)
            .attr("class", "enter")
            .attr("transform", `translate(0,${margin.top + barStep * barPadding})`)
            .attr("text-anchor", "end")
            .style("font", "10px sans-serif");

        var bar = g.selectAll("g")
            .data(d.children)
            .join("g")
            .attr("cursor", d => !d.children ? null : "pointer")
            .on("click", (event, d) => down(svg, d));

        bar.append("text")
            .attr("x", margin.left - 6)
            .attr("y", barStep * (1 - barPadding) / 2)
            .attr("dy", ".35em")
            .text(d => d.data.name);

        bar.append("rect")
            .attr("x", x(0))
            .attr("width", d => x(d.value) - x(0))
            .attr("height", barStep * (1 - barPadding));

        return g;
    }

    function down(svg, d) {
        if (!d.children || d3.active(svg.node())) return;

        // rebind the current node to the background.
        svg.select(".background").datum(d);

        // define two sequenced transitions.
        var transition1 = svg.transition().duration(duration);
        var transition2 = transition1.transition();

        // mark any currently displayed bars as exiting
        var exit = svg.selectAll(".enter")
            .attr("class", "exit");

        // entering nodes immediately obscure the clicked-on bar, so hide it
        exit.selectAll("rect")
            .attr("fill-opacity", p => p === d ? 0 : null);

        //transition exiting bars to fade out
        exit.transition(transition1)
            .attr("fill-opacity", 0)
            .remove();

        // enter the new bars for the clicke on data
        // per above, entering bars are immediatrely visable
        var enter = bar(svg, down, d, ".y-axis")
            .attr("fill-opacity", 0);

        // have the text fade in, even though the bars are visible

        enter.transition(transition1)
            .attr("fill-opacity", 1);

        //transition entering bars to their new y position
        enter.selectAll("g")
            .attr("transform", stack(d.index))
            .transition(transition1)
            .attr("transform", stagger());

        //update the x-scale domain
        x.domain([0, d3.max(d.children, d => d.value)]);

        //update the x axis
        svg.selectAll(".x-axis").transition(transition2)
            .call(xAxis);

        // transition entering bars to the new  x scale
        enter.selectAll("g").transition(transition2)
            .attr("transform", (d, i) => `translate(0, ${barStep * i})`);

        // color the bars as parents; they will fade to children if appropriate
        enter.selectAll("rect")
            .attr("fill", color(true))
            .attr("fill-opacity", 1)
            .transition(transition2)
            .attr("fill", d => color(!!d.children))
            .attr("width", d => x(d.value) - x(0));

    }

    function up(svg, d) {
        if (!d.parent || !svg.selectAll(".exit").empty()) return;

        //rebind the current node tot he background
        svg.select(".background").datum(d.parent);

        // define two sequencted transitions
        var transition1 = svg.transition().duration(duration);
        var transition2 = transition1.translation();

        // mark any currently displayed bars as exiting.
        var exit = svg.selectAll(".enter")
            .attr("class", "exit");

        // update the x scale domain
        x.domain([0, d3.max(d.parent.children, d => d.value)]);

        // update the x axis 
        svg.selectAll(".x-axis").transition(transition1)
            .call(xAxis);

        // transition exiting bars to the new x scale
        exit.selectAll("g").transition(transition1)
            .attr("transform", stagger());

        // transition exiting bars tot he parent positon
        exit.selectAll("g").transition(transition2)
            .attr("transform", stack(d.index));

        // transition exiting rects tot he new scale and fade to parent color 
        exit.selectAll("rect").transition(transition1)
            .attr("width", d => x(d.value) - x(0))
            .attr("fill", color(true));

        // transition exiting text to fade out 
        // remove exiting nodes 
        exit.transition(transition2)
            .attr("fill-opacity", 0)
            .remove();

        // enter the new bars for the clicked on datas parent 
        var enter = bar(svg, down, d.parent, ".exit")
            .attr("fill-opacity", 0);
        enter.selectAll("g")
            .attr("transform", (d, i) => `translate(0, ${barStep * i})`);

        // transition entering bars to fade in over the full duration
        enter.transition(transition2)
            .attr("fill-opacity", 1);

        // color the bars as appropriate
        // exiting nodes will obscure the parent bar, so hide it 
        // transistion entering rects to the new x-scale
        // when the entering parent rect is done, make it visible

        enter.selectAll("rect")
            .attr("fill", d => color(!!d.children))
            .attr("fill-opacity", p => p == d ? 0 : null)
            .transition(transition2)
            .attr("width", d => x(d.value) - x(0))
            .on("end", function(p) { d3.select(this).attr("fill-opacity", 1); });
    }

    function stack(i) {
        let value = 0;
        return d => {
            var t = `translate(${x(value) - x(0)},${barStep * i})`;
            value += d.value;
            return t;
        };
    }

    function stagger() {
        let value = 0;
        return (d, i) => {
            var t = `translate(${x(value) - x(0)},${barStep * i})`;
            value += d.value;
            return t;
        }
    }

    return chart;
}