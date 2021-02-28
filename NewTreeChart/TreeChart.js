function TreeChart(selection) {

    function chart(_selection) {
        _selection.each(function(_data) {
            data = _data;
            margin = ({ top: 10, right: 120, bottom: 10, left: 40 });
            width = 1410;
            // length of the node connections
            dy = width / 6;
            // height of the node connections
            dx = 30;
            tree = d3.tree().nodeSize([dx, dy]);
            diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);

            const root = d3.hierarchy(data);

            root.x0 = dy / 2;
            root.y0 = 0;
            root.descendants().forEach((d, i) => {
                d.id = i;
                d._children = d.children;
                if (d.depth && d.data.name.length !== 7) d.children = null;
            });

            const svg = d3.select("body").append("svg")
                .attr("viewBox", [-margin.left, -margin.top, width, dx])
                .attr("transform", d => `translate(0,${width/4})`)
                .style("font", "10px sans-serif")
                .style("user-select", "none");

            const gLink = svg.append("g")
                .attr("transform", d => `translate(${width/6}, 0)`)
                .attr("fill", "none")
                .attr("stroke", "#555")
                .attr("stroke-opacity", 0.4)
                .attr("stroke-width", 1.5);

            const gNode = svg.append("g")
                .attr("transform", d => `translate(${width/6}, 0)`)
                .attr("cursor", "pointer")
                .attr("pointer-events", "all");

            function update(source) {
                const duration = d3.event && d3.event.altKey ? 2500 : 250;
                const nodes = root.descendants().reverse();
                const links = root.links();


                // conpute the new tree layout 
                tree(root);
                let left = root;
                let right = root;
                root.eachBefore(node => {
                    if (node.x < left.x) left = node;
                    if (node.x > right.x) right = node;
                });

                const height = right.x - left.x + margin.top + margin.bottom;

                const transition = svg.transition()
                    .duration(duration)
                    .attr("viewBox", [-margin.left, left.x - margin.top, width, height])
                    .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

                // update the nodes 
                const node = gNode.selectAll("g")
                    .data(nodes, d => d.id);

                // enter any new nodes at the parents previous position
                const nodeEnter = node.enter().append("g")
                    .attr("transform", d => `translate(${source.y0}, ${source.x0})`)
                    .attr("fill-opacity", 0)
                    .attr("stroke-opacity", 0)
                    .on("click", (event, d) => {
                        d.children = d.children ? null : d._children;
                        update(d);
                        click();

                    });

                nodeEnter.call(createShapes)

                // add texts to circles 
                nodeEnter.append("text")
                    .attr("dy", "0.31em")
                    .attr("x", d => d._children ? -6 : 6)
                    .attr("text-anchor", d => d._children ? "end" : "start")
                    .text(d => d.data.name)
                    .clone(true).lower()
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-width", 3)
                    .attr("stroke", "white")

                // transition nodes to their new position
                const nodeUpdate = node.merge(nodeEnter).transition(transition)
                    .attr("transform", d => `translate(${d.y}, ${d.x})`)
                    .attr("fill-opacity", 1)
                    .attr("stroke-opacity", 1);

                // transition exiting nodes to the parents new position

                const nodeExit = node.exit().transition(transition).remove()
                    .attr("transform", d => `translate(${source.y}, ${source.x})`)
                    .attr("fill-opacity", 0)
                    .attr("stroke-opacity", 0);

                // update the links 
                const link = gLink.selectAll("path")
                    .data(links, d => d.target.id);

                // enter any new links at the parents previous position
                const linkEnter = link.enter().append("path")
                    .attr("d", d => {
                        const o = { x: source.x0, y: source.y0 };
                        return diagonal({ source: o, target: o });
                    });

                // transition links to their new position
                link.merge(linkEnter).transition(transition)
                    .attr("d", diagonal);

                // transition exiting nodes to the parent's new position
                link.exit().transition(transition).remove()
                    .attr("d", d => {
                        const o = { x: source.x, y: source.y };
                        return diagonal({ source: o, target: o });
                    });

                // stash the old positions for transition
                root.eachBefore(d => {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });



            }
            update(root);


        })

        function click() {
            console.log("hi")
        }

        function wrap(text, width) {
            text.each(function() {
                var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.1, // ems
                    x = text.attr("x"),
                    y = text.attr("y"),
                    dy = 0, //parseFloat(text.attr("dy")),
                    tspan = text.text(null)
                    .append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", dy + "em");
                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
                    }
                }
            });
        }

        function createShapes(_selection) {

            _selection.each(function(d, i) {
                if (d.data.type == "ssr" || d.data.type == null) {
                    _selection.append("circle")
                        .attr("r", 3.5)
                        .attr("fill", determineColor(d.data.score))
                        .attr("stroke-width", 10)
                }
                if (d.data.type == "hlh") {
                    _selection.append("polygon")
                        .attr("width", d => d.data.type == "hlh" ? 400 : 0)
                        .attr("height", d => d.data.type == "hlh" ? 400 : 0)
                        .attr("points", d => d.data.type == "hlh" ? [
                            [0, -5],
                            [5, 0],
                            [0, 5],
                            [-5, 0],
                            [0, -5]
                        ] : [])
                        .style("stroke", determineColor(d.data.score))
                        .style("stroke-width", "2px")
                        .style("fill", "white")

                }
                if (d.data.type == "Safeguard") {
                    _selection.append("rect")
                        .attr("width", function(d) {
                            if (d.data.type == "Safeguard") {
                                return 10;
                            }
                        })
                        .attr("height", function(d) {
                            if (d.data.type == "Safeguard") {
                                return 10;
                            }
                        })
                        .attr("y", -5)
                        .attr("x", -5)
                        .style("stroke", determineColor(d.data.score))
                        .style("fill", "white")

                }
                if (d.data.type == "Mitigation") {
                    _selection.append("circle")
                        .attr("r", function(d) {
                            if (d.data.type == "Mitigation") return 5;
                            else return 0;
                        })
                        .attr("stroke", determineColor(d.data.score))
                        .attr("stroke-width", "2px")
                        .attr("fill", "white")
                }


            })

        }

        function determineColor(score) {
            if (score >= 0 && score <= 1) return "green";
            if (score > 1 && score <= 3) return "yellow";
            else return "red";

        }


    }
    return chart;
}