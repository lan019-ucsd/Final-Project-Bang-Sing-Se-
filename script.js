// ==========================
// TOOLTIP
// ==========================
const tooltip = d3.select("#globe-tooltip");

// ==========================
// GLOBE 1 SETUP
// ==========================
const svg = d3.select("#globe-svg");
const path = d3.geoPath();
const projection = d3.geoOrthographic().clipAngle(90);
let rotate = [0, -20];
let lastX, lastY;

// Draw globe sphere
svg.append("path")
    .datum({ type: "Sphere" })
    .attr("class", "globe-sphere")
    .attr("fill", "#000")
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5);

const countriesGroup = svg.append("g").attr("class", "countries");

// Load countries for Globe 1
d3.json("https://unpkg.com/world-atlas@2/countries-110m.json").then(worldData => {
    const countries = topojson.feature(worldData, worldData.objects.countries).features;

    countriesGroup.selectAll(".country")
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

    resizeGlobe();
});

// Drag Globe 1
svg.call(d3.drag()
    .on("start", event => { lastX = event.x; lastY = event.y; })
    .on("drag", event => {
        const dx = event.x - lastX;
        const dy = event.y - lastY;
        lastX = event.x; lastY = event.y;
        rotate[0] += dx * 0.7;
        rotate[1] -= dy * 0.7;
        rotate[1] = Math.max(-90, Math.min(90, rotate[1]));
        projection.rotate(rotate);
        svg.selectAll("path").attr("d", path);
    })
);

// Resize Globe 1
function resizeGlobe() {
    const containerWidth = svg.node().parentNode.getBoundingClientRect().width;
    svg.attr("width", containerWidth).attr("height", containerWidth);
    projection.translate([containerWidth / 2, containerWidth / 2])
              .scale(containerWidth / 2 * 0.9);
    path.projection(projection);
    svg.select(".globe-sphere").attr("d", path);
    svg.selectAll(".country").attr("d", path);
}
window.addEventListener("resize", resizeGlobe);


// ==========================
// GLOBE 2 SETUP (country detail page)
// ==========================
const svg2 = d3.select("#globe-svg-2");
const path2 = d3.geoPath();
const projection2 = d3.geoOrthographic().clipAngle(90);
let rotate2 = [0, -20];
let lastX2, lastY2;

// Draw globe 2 sphere
svg2.append("path")
    .datum({ type: "Sphere" })
    .attr("class", "globe-sphere")
    .attr("fill", "#000")
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5);

const countriesGroup2 = svg2.append("g").attr("class", "countries");
const countryMapSvg = d3.select("#country-map");

// Track selected country and connector
let selectedCountry = null;
let connectorSvg = null;

// Select the third-page section
const countryDetailSection = document.querySelector("#country-detail-section");
let resetButton = null;

// Create reset button
function createResetButton() {
    if (resetButton) return;

    resetButton = document.createElement("button");
    resetButton.textContent = "Reset Country";
    resetButton.id = "reset-button";
    Object.assign(resetButton.style, {
        position: "absolute",
        bottom: "10px",
        right: "10px",
        padding: "8px 12px",
        background: "#fff",
        border: "1px solid #000",
        cursor: "pointer"
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

    countryDetailSection.appendChild(resetButton);
}

// Show reset button only on third page
const observerButton = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            createResetButton();
            resetButton.style.display = "block";
        } else if (resetButton) {
            resetButton.style.display = "none";
        }
    });
}, { threshold: 0.1 });

observerButton.observe(countryDetailSection);

// Draw connector line
function drawConnector(centroid, globeRect, mapRect) {
    if (connectorSvg) connectorSvg.remove();

    connectorSvg = d3.select("body").append("svg")
        .attr("id", "connector-line")
        .style("position", "absolute")
        .style("top", 0)
        .style("left", 0)
        .style("width", "100%")
        .style("height", "100%")
        .style("pointer-events", "none");

    const line = connectorSvg.append("line")
        .attr("x1", globeRect.left + centroid[0])
        .attr("y1", globeRect.top + centroid[1])
        .attr("x2", globeRect.left + centroid[0])
        .attr("y2", globeRect.top + centroid[1])
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4 2");

    line.transition()
        .duration(1000)
        .attr("x2", mapRect.left + mapRect.width / 2)
        .attr("y2", mapRect.top + mapRect.height / 2);
}

// Remove connector if section scrolls out of view
const observerConnector = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting && connectorSvg) {
            connectorSvg.remove();
            connectorSvg = null;
        }
    });
}, { threshold: 0.1 });

observerConnector.observe(countryDetailSection);

// Load countries
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
            // Clear previous selection
            if (selectedCountry) {
                countriesGroup2.selectAll(".country")
                    .filter(c => c === selectedCountry)
                    .attr("fill", "#000");
            }

            // Highlight new country
            d3.select(event.currentTarget).attr("fill", "#ffb347");
            selectedCountry = d;

            d3.select("#country-name").text(d.properties.name);
            d3.select("#country-details").text(`You clicked on ${d.properties.name}.`);

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

            const centroid = projection2(d3.geoCentroid(d));
            const globeRect = svg2.node().getBoundingClientRect();
            const mapRect = countryMapSvg.node().getBoundingClientRect();

            drawConnector(centroid, globeRect, mapRect);
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
        if (connectorSvg) {
            connectorSvg.remove();
            connectorSvg = null;
        }
    })
);

// Resize Globe 2
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

window.addEventListener("scroll", () => {
    if (connectorSvg) {
        connectorSvg.remove();
        connectorSvg = null;
    }
});