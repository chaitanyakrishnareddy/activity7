function scatter_plot(data,
     ax,
    title = "",
    xCol = "",
    yCol = "",
    rCol = "",
    legend = [],
    colorCol = "",
    margin = 50)
 {
    const X = data.map(d => +d[xCol]);
    const Y = data.map(d => +d[yCol]);
    const R = data.map(d => +d[rCol]);
    const colorCategories = [...new Set(data.map(d => d[colorCol]))];
    const color = d3.scaleOrdinal()
        .domain(colorCategories)
        .range(d3.schemeTableau10);

    const xExtent = d3.extent(X);
    const yExtent = d3.extent(Y);

    const xMargin = (xExtent[1] - xExtent[0]) * 0.05;
    const yMargin = (yExtent[1] - yExtent[0]) * 0.05;

    const xScale = d3.scaleLinear()
        .domain([xExtent[0] - xMargin, xExtent[1] + xMargin])
        .range([margin, 1000 - margin]);

    const yScale = d3.scaleLinear()
        .domain([yExtent[0] - yMargin, yExtent[1] + yMargin])
        .range([1000 - margin, margin]);

    const rScale = d3.scaleSqrt().domain(d3.extent(R)).range([4, 12]);

    const Fig = d3.select(ax);

    Fig.selectAll('.markers')
        .data(data)
        .join('g')
        .attr('transform', d => `translate(${xScale(d[xCol])}, ${yScale(d[yCol])})`)
        .append('circle')
        .attr("class", (d, i) => `cls_${i} ${d[colorCol]}`)
        .attr("id", (d, i) => `id_${i} ${d[colorCol]}`)
        .attr("r", d => rScale(d[rCol]))
        .attr("fill", d => color(d[colorCol]));

    const x_axis = d3.axisBottom(xScale).ticks(4);
    const y_axis = d3.axisLeft(yScale).ticks(4);

    Fig.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0, ${1000 - margin})`)
        .call(x_axis);

    Fig.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${margin}, 0)`)
        .call(y_axis);

    Fig.append("text")
        .attr("x", 500)
        .attr("y", 980)
        .attr("text-anchor", "middle")
        .text(xCol)
        .attr("class", "label")
        .attr("fill", "black");

    Fig.append("text")
        .attr("x", -500)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text(yCol)
        .attr("class", "label")
        .attr("fill", "black");

    Fig.append("text")
        .attr('x', 500)
        .attr('y', 80)
        .attr("text-anchor", "middle")
        .text(title)
        .attr("class", "title")
        .attr("fill", "black");

    const brush = d3.brush()
        .extent([[margin, margin], [1000 - margin, 1000 - margin]])
        .on("start", brushStart)
        .on("brush end", brushed);

    Fig.call(brush);

    function brushStart() {
        d3.selectAll("circle").classed("selected", false);
    }

    function brushed(event) {
        const selection = event.selection;
        if (!selection) return;

        const [[x0, y0], [x1, y1]] = selection;

        const X1 = xScale.invert(x0);
        const X2 = xScale.invert(x1);
        const Y1 = yScale.invert(y1);
        const Y2 = yScale.invert(y0);

        d3.selectAll("circle").classed("selected", d => {
            const x = +d[xCol];
            const y = +d[yCol];
            return x >= X1 && x <= X2 && y >= Y1 && y <= Y2;
        });
    }

    const legendContainer = Fig.append("g")
        .attr("transform", `translate(800, ${margin})`);

    if (legend.length === 0) legend = colorCategories;

    let selectedLegends = new Set();

    const legends_items = legendContainer.selectAll("legends")
        .data(legend)
        .join("g")
        .attr("transform", (d, i) => `translate(0, ${i * 45})`)
        .on("click", function (event, d) {
            if (selectedLegends.has(d)) {
                selectedLegends.delete(d);
            } else {
                selectedLegends.add(d);
            }

            d3.selectAll("circle")
                .style("opacity", circleData =>
                    selectedLegends.size === 0 || selectedLegends.has(circleData[colorCol]) ? 1 : 0.1
                );

            d3.selectAll(".legend-rect")
                .style("opacity", legend => selectedLegends.has(legend) ? 1 : 0.5);
        });

    legends_items.append("rect")
        .attr("fill", d => color(d))
        .attr("width", "40")
        .attr("height", "40")
        .attr("class", "legend-rect");

    legends_items.append("text")
        .text(d => d)
        .attr("dx", 45)
        .attr("dy", 25)
        .attr("class", "legend")
        .attr("fill", "black");
}
