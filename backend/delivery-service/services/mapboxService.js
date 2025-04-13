const MapboxClient = require('@mapbox/mapbox-sdk/services/directions');
require('dotenv').config();

const directionsClient = MapboxClient({ accessToken: process.env.MAPBOX_ACCESS_TOKEN });

module.exports = {
  getRoute: async (start, end) => {
    const response = await directionsClient.getDirections({
      waypoints: [
        { coordinates: [start.lng, start.lat] },
        { coordinates: [end.lng, end.lat] }
      ],
      profile: 'driving',
      geometries: 'geojson'
    }).send();

    return response.body.routes[0];
  }
};
