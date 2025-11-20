const width = 600;
const height = 600;

const svg = d3.select("#globe-svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "linear-gradient(to bottom, #202839, #030a16)"); // black background

const projection = d3.geoOrthographic()
    .scale(250)
    .translate([width / 2, height / 2])
    .clipAngle(90);

const path = d3.geoPath().projection(projection);

// Draw the globe sphere
svg.append("path")
    .datum({type: "Sphere"})
    .attr("d", path)
    .attr("fill", "#000")        // black globe
    .attr("stroke", "#fff")      // white outline
    .attr("stroke-width", 0.5);

// Load world data
d3.json("https://unpkg.com/world-atlas@2/countries-110m.json").then(worldData => {
    const countries = topojson.feature(worldData, worldData.objects.countries);

    svg.selectAll(".country")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", "#000")         // black country fill
        .attr("stroke", "#fff")       // white outline
        .attr("stroke-width", 0.5)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "#1e90ff"); // blue on hover
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("fill", "#000");    // back to black
        });
});

// Keep track of rotation for dragging
let rotate = [0, -20];
let lastX, lastY;

svg.call(d3.drag()
    .on("start", function(event) {
        lastX = event.x;
        lastY = event.y;
    })
    .on("drag", function(event) {
        const dx = event.x - lastX;
        const dy = event.y - lastY;
        lastX = event.x;
        lastY = event.y;

        rotate[0] += dx * 0.5;
        rotate[1] -= dy * 0.5;
        rotate[1] = Math.max(-90, Math.min(90, rotate[1]));

        projection.rotate(rotate);

        svg.selectAll("path").attr("d", path);
    })
);
