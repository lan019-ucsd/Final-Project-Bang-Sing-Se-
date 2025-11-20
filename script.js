// --- 3D Spinning Globe ---
const myGlobe = Globe()
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
    (document.getElementById('globe'));

// Auto-rotate
myGlobe.controls().autoRotate = false;
myGlobe.controls().autoRotateSpeed = 0.3;
myGlobe.controls().enableZoom = false;


// Optional: Add points (example earthquake locations)
const sampleQuakes = [
    { lat: 35, lng: 139, size: 0.5 },  // Japan
    { lat: 37, lng: -122, size: 0.4 }, // California
    { lat: -16, lng: -72, size: 0.6 }  // Peru
];

myGlobe
    .pointsData(sampleQuakes)
    .pointColor(() => 'red')
    .pointAltitude(d => d.size)
    .pointRadius(0.5);
