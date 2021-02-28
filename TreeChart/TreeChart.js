function TreeChart(selection) {


    function chart(_selection) {
        _selection.each(function(_data) {
            data = _data;
            var margin = { top: 20, right: 120, bottom: 20, left: 50 },
                width = 1000 - margin.right - margin.left + 500,
                height = 700 - margin.top - margin.bottom;

            var i = 0,
                duration = 750,
                root;

            var tree = d3.layout.tree()
                .size([height, width])

            var diagonal = function link(d) {
                return "M" + d.source.y + "," + d.source.x +
                    "C" + (d.source.y + d.target.y) / 2 + "," + d.source.x +
                    " " + (d.source.y + d.target.y) / 2 + "," + d.target.x +
                    " " + d.target.y + "," + d.target.x;
            };

            // var diagonal = d3.svg.diagonal()
            //     .projection(function(d) {
            //         return [d.y, d.x];
            //     });

            var svg = d3.select(".hierarchy").append("svg")
                .attr("width", width + margin.right + margin.left)
                .attr("height", height + margin.top + margin.bottom + 25)
                .append("g")
                .attr("transform", "translate(" + margin.left / .15 + "," + margin.top + ")");

            root = data[0];
            root.x0 = height / 2;
            root.y0 = 0;

            root.children.forEach(collapse);

            update(root);

            d3.select(self.frameElement).style("height", "500px");

            function update(source) {

                // compute the new tree layout

                var nodes = tree.nodes(root).reverse(),
                    links = tree.links(nodes);

                // normalize for fixed-depth 
                nodes.forEach(function(d) {
                    d.y = d.depth * 120;
                });

                // update the nodes
                var node = svg.selectAll("g.node")
                    .data(nodes, function(d) {
                        return d.id || (d.id = ++i);
                    })

                // enter any new nodes at the parents previous position
                var nodeEnter = node.enter().append("g")
                    .attr("class", "node")
                    .attr("transform", function(d) {
                        return "translate(" + source.y0 + "," + source.x0 + ")";
                    })
                    .on("click", click);

                // create different shapes for the nodes
                nodeEnter.append("polygon")
                    .attr("width", function(d) {
                        if (d.type == "hlh") {
                            return 400;
                        }
                    })
                    .attr("height", function(d) {
                        if (d.type == "hlh") {
                            return 400;
                        }
                    })
                    .attr("points", function(d) {
                        if (d.type == "hlh") {
                            return [
                                [0, -10],
                                [10, 0],
                                [0, 10],
                                [-10, 0],
                                [0, -10]
                            ];
                        }
                    })
                    .style("stroke", function(d) {
                        if (d.score >= 0 && d.score <= 1) return "green";
                        if (d.score > 1 && d.score <= 3) return "yellow";
                        else return "red";
                    })
                    .style("stroke-width", "2px")
                    .style("fill", "white")

                nodeEnter.append("rect")
                    .attr("width", function(d) {
                        if (d.type == "Safeguard") {
                            return 20;
                        }
                    })
                    .attr("height", function(d) {
                        if (d.type == "Safeguard") {
                            return 20;
                        }
                    })
                    .attr("y", -10)
                    .attr("x", -10)
                    .style("stroke", function(d) {
                        if (d.score >= 0 && d.score <= 1) return "green";
                        if (d.score > 1 && d.score <= 3) return "yellow";
                        else return "red";
                    })
                    .style("fill", "white")

                nodeEnter.append("circle")
                    .attr("r", function(d) {
                        if (d.type == "Mitigation") return 1e-6;
                        else return 0;
                    })
                    .style("stroke", function(d) {
                        if (d.score >= 0 && d.score <= 1) return "green";
                        if (d.score > 1 && d.score <= 3) return "yellow";
                        else return "red";
                    })

                nodeEnter.append("text")
                    .attr("x", function(d) {
                        return d.children || d._children ? -13 : 13;
                    })
                    .attr("dy", function(d) {
                        if (d.type == null && d.parent.children.length == 3) {
                            return "1.8em"
                        } else return ".35em"
                    })

                .attr("text-anchor", function(d) {
                        return d.children || d._children ? "end" : "start";
                    })
                    .text(function(d) {
                        return d.name;
                    })
                    .style("fill-opacity", 1e-6);

                // transition nodes
                var nodeUpdate = node.transition()
                    .duration(duration)
                    .attr("transform", function(d) {
                        return "translate(" + d.y + "," + d.x + ")";
                    });

                nodeUpdate.select("circle")
                    .attr("r", function(d) {
                        if (d.type != "Safeguard" && d.type != "hlh") {
                            return 10;
                        }
                    })
                    .style("fill", function(d) {
                        return d._children ? "lightsteelblue" : "#fff";
                    });
                nodeUpdate.select("rect")
                    .style("fill", function(d) {
                        return d._children ? "lightsteelblue" : "#fff";
                    })
                nodeUpdate.select("polygon")
                    .style("fill", function(d) {
                        return d._children ? "lightsteelblue" : "#fff";
                    })
                nodeUpdate.select("text")
                    .style("fill-opacity", 1);

                // transition exiting nodes to the parents new position

                var nodeExit = node.exit().transition()
                    .duration(duration)
                    .attr("transform", function(d) {
                        return "translate(" + source.y + "," + source.x + ")";
                    })
                    .remove();

                nodeExit.select("circle")
                    .attr("r", 1e-6);

                nodeExit.select("text")
                    .style("fill-opacity", 1e-6);

                // update the links.. 

                var link = svg.selectAll("path.link")
                    .data(links, function(d) {
                        return d.target.id;
                    });

                // enter any new links at the parents previous position

                link.enter().insert("path", "g")
                    .attr("class", "link")
                    .attr("d", function(d) {
                        var o = {
                            x: source.x0,
                            y: source.y0
                        };
                        return diagonal({
                            source: o,
                            target: o
                        });
                    });

                // transition links tot heir new position
                link.transition()
                    .duration(duration)
                    .attr("d", diagonal);

                // transition exiting nodes to the paretns new position

                link.exit().transition()
                    .duration(duration)
                    .attr("d", function(d) {
                        var o = {
                            x: source.x,
                            y: source.y
                        };
                        return diagonal({
                            source: o,
                            target: o
                        });
                    })
                    .remove();

                // stash the old positions for the transition
                nodes.forEach(function(d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });

            }
            // Toggle children on click.
            function click(d) {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                // add type to data model: ssr, fsf, etc.
                if (d.type == "ssr") {

                    d3.select("#myNav")
                        .style("width", "100%")

                    d3.select(".overlay-content")
                        .select(".top")
                        .append("h3")
                        .style("color", "white")
                        .text("SSR Role:" + " " + d.name)

                    d3.select(".overlay-content")
                        .select(".top")
                        .append("h2")
                        .style("color", "white")
                        .text("System:" + d.system)

                    d3.select(".overlay-content")
                        .select(".top")
                        .append("h3")
                        .style("color", "white")
                        .text("Level :" + d.score)
                        .append("a")
                        .attr("href", "/Forms")
                        .text("Active Forms")


                    d.formid.forEach(function(d, i) {
                        d3.select(".objecttable")
                            .append("tr")
                            .attr("class", "data-" + i)
                            .attr("id", "data-rows")
                            .append("td")
                            .append("a")
                            .attr("href", "/Forms/edit/" + d)
                            .text(d)

                    })

                    d.casrepDfsNo.forEach(function(d, i) {
                        d3.select(".objecttable")
                            .select(".data-" + i)
                            .append("td")
                            .append("a")
                            .attr("href", "#")
                            .text(d)
                    })
                    d.eventType.forEach(function(d, i) {
                        d3.select(".objecttable")
                            .select(".data-" + i)
                            .append("td")
                            .append("a")
                            .text(d)

                    })
                    d.status.forEach(function(d, i) {
                        d3.select(".objecttable")
                            .select(".data-" + i)
                            .append("td")
                            .append("a")
                            .text(d)

                    })
                    d.level.forEach(function(d, i) {
                        d3.select(".objecttable")
                            .select(".data-" + i)
                            .append("td")
                            .append("a")
                            .attr("href", "#")
                            .text(d)
                    })

                }
                update(d);
                update(root);
            }

            function collapse(d) {
                if (d.children) {
                    d._children = d.children;
                    d._children.forEach(collapse);
                    d.children = null;
                }
            }





            update(root);


        })
    }
    return chart;
}