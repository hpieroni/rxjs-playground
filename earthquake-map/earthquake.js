const map = L.map('map').setView([33.858631, -118.279602], 7);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

const EARTHQUAKE_URL =
  'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
const FETCH_INTERVAL = 5000;

const quakes = Rx.Observable
  .interval(FETCH_INTERVAL)
  .flatMap(() =>
    Rx.Observable
      .ajax({
        url: EARTHQUAKE_URL,
        responseType: 'json',
        crossDomain: true
      })
      .retry(3)
  )
  .flatMap(result => Rx.Observable.from(result.response.features))
  .distinct(quake => quake.properties.code)
  .map(quake => ({
    lat: quake.geometry.coordinates[1],
    lng: quake.geometry.coordinates[0],
    size: quake.properties.mag * 10000
  }));

quakes.subscribe(quake =>
  L.circle([quake.lat, quake.lng], quake.size).addTo(map)
);
