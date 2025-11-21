// ==========================
// TOOLTIP
// ==========================
const tooltip = d3.select("#globe-tooltip");

// ==========================
// PAGE 2: EARTH LAYERS PLOT
// ==========================

// JavaScript (D3)
const layers = [
  { name: "Crust", color: "#d2c6a4", description: "Earth’s outer crust: thin and rigid", innerRadius: 130, outerRadius: 150 },
  { name: "Lithosphere", color: "#8e8174", description: "Lithosphere: crust + upper mantle, rigid tectonic plates", innerRadius: 100, outerRadius: 130 },
  { name: "Asthenosphere", color: "#5b4c3d", description: "Asthenosphere: partially molten, flows slowly", innerRadius: 70, outerRadius: 100 },
  { name: "Mantle", color: "#3a3637", description: "Mantle: hot, convecting rock that makes up most of Earth’s volume", innerRadius: 20, outerRadius: 70 },
];

const width = 400;
const height = 400;

const svg = d3.select("#earth-structure-plot")
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("width", "100%")
  .attr("height", "100%")
  .append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2})`);

// Define arcs
layers.forEach((layer) => {
  const arc = d3.arc()
    .innerRadius(layer.innerRadius)
    .outerRadius(layer.outerRadius)
    .startAngle(-Math.PI / 2)
    .endAngle(Math.PI / 2);

  svg.append("path")
    .attr("d", arc())
    .attr("fill", layer.color)
    .attr("class", "layer-slice")
    .on("mouseover", (event) => {
      d3.select("#earth-layer-info")
        .html(`<strong>${layer.name}</strong><br>${layer.description}`);
      svg.selectAll(".layer-slice").attr("opacity", 0.6);
      d3.select(event.currentTarget).attr("opacity", 1);
    })
    .on("mouseout", () => {
      d3.select("#earth-layer-info").html("Hover over a layer to see details.");
      svg.selectAll(".layer-slice").attr("opacity", 1);
    });
  
  // Optionally add a text label
  const centroid = arc.centroid();
  svg.append("text")
    .attr("x", centroid[0] * 1.1)
    .attr("y", centroid[1] * 1.1)
    .attr("text-anchor", centroid[0] > 0 ? "start" : "end")
    .attr("alignment-baseline", "middle")
    .attr("fill", "#fff")
    .text(layer.name)
    .style("pointer-events", "none");
});


// ==========================
// PAGE 3: GLOBE 1
// ==========================
const svg1 = d3.select("#globe-svg");
const path1 = d3.geoPath();
const projection1 = d3.geoOrthographic().clipAngle(90);
let rotate1 = [0, -20];
let lastX1, lastY1;

svg1.append("path")
    .datum({ type: "Sphere" })
    .attr("class", "globe-sphere")
    .attr("fill", "#000")
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5);

const countriesGroup1 = svg1.append("g").attr("class", "countries");

d3.json("https://unpkg.com/world-atlas@2/countries-110m.json").then(worldData => {
    const countries = topojson.feature(worldData, worldData.objects.countries).features;

    countriesGroup1.selectAll(".country")
        .data(countries)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("fill", "#000")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .on("mouseover", (event, d) => {
            d3.select(event.currentTarget).attr("fill", "#2156e9ff");
            tooltip.text(d.properties.name)
                   .style("display", "block")
                   .style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY + 10) + "px");
        })
        .on("mousemove", event => {
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", event => {
            d3.select(event.currentTarget).attr("fill", "#000");
            tooltip.style("display", "none");
        });

    resizeGlobe1();
});

svg1.call(d3.drag()
    .on("start", event => { lastX1 = event.x; lastY1 = event.y; })
    .on("drag", event => {
        const dx = event.x - lastX1;
        const dy = event.y - lastY1;
        lastX1 = event.x; lastY1 = event.y;
        rotate1[0] += dx * 0.7;
        rotate1[1] -= dy * 0.7;
        rotate1[1] = Math.max(-90, Math.min(90, rotate1[1]));
        projection1.rotate(rotate1);
        svg1.selectAll("path").attr("d", path1);
    })
);

function resizeGlobe1() {
    const containerWidth = svg1.node().parentNode.getBoundingClientRect().width;
    svg1.attr("width", containerWidth).attr("height", containerWidth);
    projection1.translate([containerWidth / 2, containerWidth / 2])
               .scale(containerWidth / 2 * 0.9);
    path1.projection(projection1);
    svg1.select(".globe-sphere").attr("d", path1);
    svg1.selectAll(".country").attr("d", path1);
}
window.addEventListener("resize", resizeGlobe1);

// ==========================
// PAGE 4: GLOBE 2
// ==========================
const svg2 = d3.select("#globe-svg-2");
const path2 = d3.geoPath();
const projection2 = d3.geoOrthographic().clipAngle(90);
let rotate2 = [0, -20];
let lastX2, lastY2;

svg2.append("path")
    .datum({ type: "Sphere" })
    .attr("class", "globe-sphere")
    .attr("fill", "#000")
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5);

const countriesGroup2 = svg2.append("g").attr("class", "countries");
const countryMapSvg = d3.select("#country-map");

let selectedCountry = null;
let connectorSvg = null;

// Create reset button immediately
const resetButton = document.createElement("button");
resetButton.textContent = "Reset Country";
resetButton.id = "reset-button";
Object.assign(resetButton.style, {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    padding: "8px 12px",
    background: "#fff",
    border: "1px solid #000",
    cursor: "pointer",
    display: "none"
});
resetButton.addEventListener("click", () => {
    if (selectedCountry) {
        countriesGroup2.selectAll(".country")
            .filter(c => c === selectedCountry)
            .attr("fill", "#000");
        selectedCountry = null;
    }
    countryMapSvg.selectAll("*").remove();
    if (connectorSvg) connectorSvg.remove();
    connectorSvg = null;
    d3.select("#country-name").text("Click a country");
    d3.select("#country-details").text("Details about the selected country will appear here.");
});
document.querySelector("#country-detail-section").appendChild(resetButton);

// Intersection observer to show/hide reset button
const observerButton = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) resetButton.style.display = "block";
        else resetButton.style.display = "none";
    });
}, { threshold: 0.1 });
observerButton.observe(document.querySelector("#country-detail-section"));


// Load countries for Globe 2
d3.json("https://unpkg.com/world-atlas@2/countries-110m.json").then(worldData => {
    const countries = topojson.feature(worldData, worldData.objects.countries).features;

    countriesGroup2.selectAll(".country")
        .data(countries)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("fill", "#000")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .on("mouseover", (event, d) => {
            if (d !== selectedCountry) d3.select(event.currentTarget).attr("fill", "#2156e9ff");
            tooltip.text(d.properties.name)
                   .style("display", "block")
                   .style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY + 10) + "px");
        })
        .on("mousemove", event => {
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", (event, d) => {
            if (d !== selectedCountry) d3.select(event.currentTarget).attr("fill", "#000");
            tooltip.style("display", "none");
        })
        .on("click", (event, d) => {
    if (selectedCountry) {
        countriesGroup2.selectAll(".country")
            .filter(c => c.properties.name === selectedCountry.properties.name)
            .attr("fill", "#000");
    }

    d3.select(event.currentTarget).attr("fill", "#ffb347");
    selectedCountry = d;

    d3.select("#country-name").text(d.properties.name);
    d3.select("#country-details").text(`You clicked on ${d.properties.name}.`);

    // redraw the zoomed country map
    countryMapSvg.selectAll("*").remove();
    const width = countryMapSvg.node().getBoundingClientRect().width;
    const height = countryMapSvg.node().getBoundingClientRect().height;
    const countryProjection = d3.geoMercator().fitSize([width, height], d);
    const countryPath = d3.geoPath().projection(countryProjection);

    countryMapSvg.append("path")
        .datum(d)
        .attr("d", countryPath)
        .attr("fill", "#2156e9ff")
        .attr("stroke", "#000")
        .attr("stroke-width", 1);

});


    resizeGlobe2();
});

// Drag Globe 2
svg2.call(d3.drag()
    .on("start", event => { lastX2 = event.x; lastY2 = event.y; })
    .on("drag", event => {
        const dx = event.x - lastX2;
        const dy = event.y - lastY2;
        lastX2 = event.x; lastY2 = event.y;
        rotate2[0] += dx * 0.7;
        rotate2[1] -= dy * 0.7;
        rotate2[1] = Math.max(-90, Math.min(90, rotate2[1]));
        projection2.rotate(rotate2);
        svg2.selectAll("path").attr("d", path2);

        // Remove connector on rotate
        if (connectorSvg) { connectorSvg.remove(); connectorSvg = null; }
    })
);

function resizeGlobe2() {
    const containerWidth = svg2.node().parentNode.getBoundingClientRect().width;
    svg2.attr("width", containerWidth).attr("height", containerWidth);
    projection2.translate([containerWidth / 2, containerWidth / 2])
               .scale(containerWidth / 2 * 0.9);
    path2.projection(projection2);
    svg2.select(".globe-sphere").attr("d", path2);
    svg2.selectAll(".country").attr("d", path2);
}
window.addEventListener("resize", resizeGlobe2);

