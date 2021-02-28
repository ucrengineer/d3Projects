function OrgChart(selection) {

    function chart(_selection) {
        _selection.each(function(_data) {
            data = _data;
            margin = ({ top: 0, right: 10, bottom: 0, left: 150 });
            diagonal = d3.linkVertical().x(d => d.x).y(d => d.y);
            height = 430 - margin.top - margin.bottom;
            width = height * 3;
            const root = d3.hierarchy(data);

            root.x0 = 0;
            root.y0 = 0;
            root.descendants().forEach((d, i) => {
                d.id = i;
                d._children = d.children;
                if (d.depth > 1) d.children = null;
            });

            const nodeWidth = 120;
            const nodeHeight1 = nodeWidth / 2; // Used to nodes of depth 0 and 1
            const nodeHeight2 = nodeHeight1 / 1.5; // Used to nodes of depth > 1
            const marginX = nodeWidth * 0.15;
            const marginY = nodeHeight1 * 0.3;
            const nodeRadius = nodeWidth * 0.06;

            // Returns the SVG commands to connect the nodes
            const drawPath = function(link, entering) {
                var x1, x2, x3, x4, y1, y2, y3, y4;

                var pathCommands = d3.line()
                    .x(function(d) { return d.x; })
                    .y(function(d) { return d.y; });

                if (entering) {
                    if (link.source.depth == 0) {
                        x1 = link.source.x0;
                        y1 = link.source.y0 + nodeHeight1 / 2;
                        x2 = x1;
                        y2 = y1 + (link.target.y0 - nodeHeight1 / 2 - (link.source.y0 + nodeHeight1 / 2)) / 2;
                        x3 = link.target.x0;
                        y3 = y2;
                        x4 = x3;
                        y4 = link.target.y0 + nodeHeight1 / 2;

                        let lineData = [{ "x": x1, "y": y1 }, { "x": x2, "y": y2 },
                            { "x": x2, "y": y2 }, { "x": x3, "y": y3 },
                            { "x": x3, "y": y3 }, { "x": x4, "y": y4 }
                        ];

                        return pathCommands(lineData);

                    } else {
                        x1 = (link.source.x0 - nodeWidth / 2) + marginX / 2;
                        y1 = link.source.y0;
                        x2 = x1;
                        y2 = link.target.y0;
                        x3 = link.target.x0 - nodeWidth / 2;
                        y3 = y2;
                        let lineData = [{ "x": x1, "y": y1 }, { "x": x2, "y": y2 },
                            { "x": x2, "y": y2 }, { "x": x3, "y": y3 }
                        ];

                        return pathCommands(lineData);
                    }

                } else {

                    if (link.source.depth == 0) {
                        x1 = link.source.x;
                        y1 = link.source.y + nodeHeight1 / 2;
                        x2 = x1;
                        y2 = y1 + (link.target.y - nodeHeight1 / 2 - (link.source.y + nodeHeight1 / 2)) / 2;
                        x3 = link.target.x;
                        y3 = y2;
                        x4 = x3;
                        y4 = link.target.y / 2 + nodeHeight1;

                        let lineData = [{ "x": x1, "y": y1 }, { "x": x2, "y": y2 },
                            { "x": x2, "y": y2 }, { "x": x3, "y": y3 },
                            { "x": x3, "y": y3 }, { "x": x4, "y": y4 }
                        ];

                        return pathCommands(lineData);

                    } else {
                        x1 = (link.source.x - nodeWidth / 2) + marginX / 2;
                        y1 = link.source.y * 1.15;
                        x2 = x1;
                        y2 = link.target.y;
                        x3 = link.target.x - nodeWidth / 2;
                        y3 = y2;
                        let lineData = [{ "x": x1, "y": y1 }, { "x": x2, "y": y2 },
                            { "x": x2, "y": y2 }, { "x": x3, "y": y3 }
                        ];

                        return pathCommands(lineData);

                    }
                }
            }

            //Function which set position of the Node
            const setPosition = function(node, last, delta) {
                // Defining position to depth 0
                if (node.depth == 0) { // To get root
                    node.x = 0;
                    node.y = 100;
                    // Defining position to depth 1
                } else if (node.depth == 1) {
                    node.x = node.parent.x + ((2 * node.id - 1) - delta.length) * (nodeWidth / 2 + marginX) + delta[node.id - 1] * marginX;
                    node.y = node.parent.y + nodeHeight1 + marginY;
                    // Defining position to depth > 1
                } else {
                    node.x = node.parent.x + marginX;
                    if (node.parent.descendants()[1].id == node.id && node.depth == 2) { // Check if node is the first descendant below depth 1
                        node.y = last.y + nodeHeight1 + marginY;
                    } else {
                        node.y = last.y + nodeHeight2 + marginY;
                    }
                }
            }

            // POSITION CALCULATION STARTS HERE
            // j stores the quantity of nodes at depth 1
            // loDesc and delta are used to set the positions of nodes at depth 1
            // loDesc stores the depth of the deepest descendant (and rightmost) of which node at depth 1
            // The size of the loDesc and delta arrays will depend of the number of nodes at the depth 1
            let loDesc = [];
            let delta = [];
            let j = 0;

            root.eachBefore(node => {
                if (node.depth == 1) {
                    loDesc[j] = 0;
                    delta[j] = 0;
                    j++; // Counts the number of nodes at depth 1
                }
                if (node.depth > 1) {
                    loDesc[j - 1] = Math.max(loDesc[j - 1], node.depth - 1); // Depth is subtracted by 1 because loDesc take Depth 1 as reference (not Depth 0)
                }
            });

            // Accumulating symmetrically on delta the values of loDesc 
            if (loDesc.length % 2 != 0) { // if loDesc.length is odd
                delta[Math.floor(loDesc.length / 2)] = 0; // Central index receives 0
            }

            for (var m = Math.floor(loDesc.length / 2) - 1; m >= 0; m--) {
                if (m == Math.floor(loDesc.length / 2) - 1) { // Assigning the first value at the left
                    delta[m] = loDesc[m] * -1;
                }
                delta[m] = delta[m + 1] + loDesc[m] * -1;
            }
            for (var n = Math.floor(loDesc.length / 2) + 1; n < loDesc.length; n++) {
                if (n == Math.floor(loDesc.length / 2) + 1) { // Assigning the first value at the right
                    delta[n] = loDesc[n - 1];
                }
                delta[n] = delta[n - 1] + loDesc[n - 1];
            }

            // Setting position of nodes
            let last = root;
            root.eachBefore(node => {
                setPosition(node, last, delta);
                last = node;
            });

            // POSITION CALCULATION ENDS HERE

            const svg = d3.select("body").append("svg")
                // .attr("width", width * 2)
                // .attr("height", height * 2)
                .attr("viewBox", [-margin.left, -margin.top, width, height])
                .style("font", "10px sans-serif")
                .style("user-select", "none")
                .style("margin-left", "10em")
                .style("margin-right", "10em");

            const gLink = svg.append("g")
                .attr("fill", "none")
                .attr("stroke", "#555")
                .attr("stroke-opacity", 0.4)
                .attr("stroke-width", 1.5);

            const gNode = svg.append("g")
                .attr("cursor", "pointer")
                .attr("pointer-events", "all")

            function update(source) {
                const duration = d3.event && d3.event.altKey ? 2500 : 250;
                const nodes = root.descendants().reverse();
                const links = root.links();

                // Compute the new tree layout.
                //tree(root);
                // POSITION CALCULATION STARTS HERE
                // j stores the quantity of nodes at depth 1
                // loDesc and delta are used to set the positions of nodes at depth 1
                // The size of the loDesc and delta arrays will depend of the number of nodes at the depth 1
                let loDesc = [];
                let delta = [];
                let j = 0;

                root.eachBefore(node => {
                    if (node.depth == 1) {
                        loDesc[j] = 0;
                        delta[j] = 0;
                        j++; // Counts the number of nodes at level 1
                    }
                    if (node.depth > 1) {
                        loDesc[j - 1] = Math.max(loDesc[j - 1], node.depth - 1); // Depth is subtracted by 1 because loDesc take Depth 1 as reference (not Depth 0)
                    }
                });

                // Accumulating symmetrically on delta the values of loDesc 
                if (loDesc.length % 2 != 0) { // if loDesc.length is odd
                    delta[Math.floor(loDesc.length / 2)] = 0; // Central index receives 0
                }

                for (var m = Math.floor(loDesc.length / 2) - 1; m >= 0; m--) {
                    if (m == Math.floor(loDesc.length / 2) - 1) { // Assigning the first value at the left
                        delta[m] = loDesc[m] * -1;
                    }
                    delta[m] = delta[m + 1] + loDesc[m] * -1;
                }
                for (var n = Math.floor(loDesc.length / 2) + 1; n < loDesc.length; n++) {
                    if (n == Math.floor(loDesc.length / 2) + 1) { // Assigning the first value at the right
                        delta[n] = loDesc[n - 1];
                    }
                    delta[n] = delta[n - 1] + loDesc[n - 1];
                }

                // Setting position of nodes
                let last = root;
                root.eachBefore(node => {
                    setPosition(node, last, delta);
                    last = node;
                });

                // POSITION CALCULATION ENDS HERE

                //Left receives the leftmost object (node)
                //Right receives the rightmost object (node)
                let left = root;
                let right = root;
                root.eachBefore(node => {
                    if (node.x < left.x) left = node;
                    if (node.x > right.x) right = node;
                });

                //Low receives the lowest object (node)
                let low = root;
                root.eachBefore(node => {
                    if (node.y > low.y) low = node;
                });

                //const height = right.x - left.x + margin.top + margin.bottom;
                const width = right.x - left.x + margin.right + margin.left;

                //const height = low.y - root.y + margin.top + margin.bottom;

                const transition = svg.transition()
                    .duration(duration)
                    //.attr("viewBox", [-margin.left, left.x - margin.top, width, height])
                    .attr("viewBox", [left.x - margin.right * 10, -margin.top, width * 1, height * 2])
                    .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));


                // Update the nodes…
                // d => d.id is the "key function" used to resort the nodes by the id.
                const node = gNode.selectAll("g")
                    .data(nodes, d => d.id);

                // Enter any new nodes at the parent's previous position.
                // Note: At the beginning source is the root node. Afterwards is the node you click on.
                const nodeEnter = node.enter().append("g")
                    .append("a")
                    .attr("asp-controller", "Dashboard")
                    .attr("asp-action", "PlatformHLH")
                    .attr("asp-route-id", "1")
                    .attr("transform", d => `translate(${source.x0 - nodeWidth/2},${source.y0 - nodeHeight1/2})`) // (${source.y0},${source.x0})`) // (width/2) and (height/2) are used to center the rects
                    .attr("fill-opacity", 0)
                    .attr("stroke-opacity", 0)
                    .on("click", click)

                // .on("click", d => {
                //     d.children = d.children ? null : d._children;
                //     update(d);
                // });

                //nodeEnter.append("circle")
                //    .attr("r", 3)
                //    .attr("fill", d => d._children ? "#555" : "#999")
                //    .attr("stroke-width", 10);

                // here i can change the color based on the status
                nodeEnter.append("rect")
                    .attr("width", nodeWidth)
                    .attr("height", function(d) {
                        if (d.depth > 1) return nodeHeight2;
                        else return nodeHeight1;
                    })
                    .attr("opacity", .1)
                    .attr("rx", nodeRadius)
                    .attr("fill", d => d._children ? "white" : "white")
                    .attr("stroke-width", 3)
                    .attr("stroke", d => d._children ? "red" : "green")

                nodeEnter.append("text")
                    .attr("dy", function(d) {
                        if (d.depth > 1) return "-3.25em";
                        else return "-4.5em";

                    })
                    .attr("x", nodeWidth / 2)
                    .attr("y", function(d) {
                        if (d.depth > 1) return nodeHeight2;
                        else return nodeHeight1;
                    })
                    .style("font-size", "9px")
                    .style("font-weight", "bold")
                    .attr("text-anchor", d => d._children ? "middle" : "middle")
                    .text(d => d._children ? "KFA" : "HLH")

                nodeEnter.append("text")
                    .attr("dy", function(d) {
                        if (d.depth > 1) return "-.5em";
                        else return "-.5em"
                    })
                    .attr("x", nodeWidth / 2)
                    .attr("y", function(d) {
                        if (d.depth > 1) return nodeHeight2;
                        else return nodeHeight1;
                    })
                    .style("font-size", "9px")
                    .attr("text-anchor", d => d._children ? "middle" : "middle")
                    .text(function(nodes, i) {
                        return ("(" + nodes.data.status + ")")

                    })

                // size and qualities of the text
                nodeEnter.append("text")
                    .attr("dy", "0.31em")
                    //.attr("x", d => d._children ? -6 : 6)
                    .attr("x", nodeWidth / 2) // Positioning text at the center (width/2)
                    // Positioning text at the center (height/2). This attribute was not set in the original script
                    .attr("y", function(d) {
                        if (d.depth > 1) return nodeHeight2 / 2;
                        else return nodeHeight1 / 2;
                    })
                    .style("font-size", "9px")
                    //.attr("text-anchor", d => d._children ? "end" : "start")
                    .attr("text-anchor", d => d._children ? "middle" : "middle") // Positioning text at the center
                    .text(d => d.data.name)
                    .clone(true).lower()
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-width", 3)
                    .attr("stroke", "white");

                // Transition nodes to their new position.
                const nodeUpdate = node.merge(nodeEnter).transition(transition)
                    .attr("transform", d => `translate(${d.x - nodeWidth/2},${d.y - nodeHeight1/2})`) // (${d.y},${d.x}) // (width/2) and (height/2) are used to center the rects
                    .attr("fill-opacity", 1)
                    .attr("stroke-opacity", 1);

                // Transition exiting nodes to the parent's new position.
                const nodeExit = node.exit().transition(transition).remove()
                    .attr("transform", d => `translate(${source.x - nodeWidth/2},${source.y - nodeHeight1/2})`) // (${source.y},${source.x}) // (width/2) and (height/2) are used to center the rects
                    .attr("fill-opacity", 0)
                    .attr("stroke-opacity", 0);

                // Update the links…
                const link = gLink.selectAll("path")
                    .data(links, d => d.target.id);
                //.data(nodes);

                // Enter any new links at the parent's previous position.
                const linkEnter = link.enter().append("path")
                    //.attr("d", d => {
                    //const o = {x: source.x0, y: source.y0};
                    //return diagonal({source: o, target: o});
                    //});
                    .attr("d", function(d) {
                        const o = d;
                        o.target.x0 = d.source.x0;
                        o.target.y0 = d.source.y0;
                        let entering = true;
                        return drawPath(o, entering);
                    });

                // Transition links to their new position.
                link.merge(linkEnter).transition(transition)
                    //.attr("d", diagonal); // This is the same that .attr("d", function(d) { return diagonal(d); })
                    .attr("d", function(d) { return drawPath(d); });

                // Transition exiting nodes to the parent's new position.
                link.exit().transition(transition).remove()
                    //.attr("d", d => {
                    //const o = {x: source.x, y: source.y};
                    //return diagonal({source: o, target: o});
                    //});
                    .attr("d", function(d) {
                        const o = d;
                        o.target.x = d.source.x;
                        o.target.y = d.source.y;
                        let entering = false;
                        return drawPath(o);
                    });

                // Stash the old positions for transition.
                root.eachBefore(d => {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });
            }

            function click(d) {
                console.log(d.data.name);

            }

            update(root);


        })
    }
    return chart;
}