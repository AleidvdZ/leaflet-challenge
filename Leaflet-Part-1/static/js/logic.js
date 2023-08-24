let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place, time, magnitude, and depth of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><p>${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
  };

  function markerColor(feature) {
    if (feature.geometry.coordinates[2] > 300) return "red";
    else if (feature.geometry.coordinates[2] > 70) return "orange";
    else if (feature.geometry.coordinates[2] > 5) return "yellow";
    else return "green";
  };

// Create a GeoJSON layer that contains the features array on the earthquakeData object.
// Run the onEachFeature function once for each piece of data in the array.
let earthquakes = L.geoJSON(earthquakeData, {
  pointToLayer: function (feature, latlng) {
    return new L.CircleMarker(latlng, {
      color: markerColor(feature),
      radius: feature.properties.mag * 5,
      fillOpacity: 0.85
    });
  },
  onEachFeature: onEachFeature
});

// Send our earthquakes layer to the createMap function/
createMap(earthquakes);
};

// Create the map with the earthquake info
function createMap(earthquakes) {

  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control and pass it the baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Set up the legend.
  let legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {

    let div = L.DomUtil.create('div', 'info legend');
    labels = ['<strong>All Earthquakes from the Past Day<strong><p><strong>Circle Size indicates Magnitude<strong><p><strong>Earthquake Depth</strong>'],
    categories = ['green: up to 5 km', 'yellow: between 5 - 70 km (shallow)', 'orange: between 70 - 300 km (intermediate)', 'red: greater than 300 km (deep)'];
    color = ["green", "yellow", "orange", "red"];

    for (let i = 0; i < categories.length; i++) {

            div.innerHTML += 
            labels.push(
                '<i class="circle" style="background:' + color + '"></i> ' +
            (categories[i] ? categories[i] : '+'));

        }
        div.innerHTML = labels.join('<br>');
    return div;
    };
    
    legend.addTo(myMap);

};
