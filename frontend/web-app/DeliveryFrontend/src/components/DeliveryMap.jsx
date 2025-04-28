import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function DeliveryMap({ delivery, role = 'customer' }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    if (role === 'customer') {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error('Geolocation error:', error),
        { enableHighAccuracy: true }
      );
    }
  }, [role]);

  useEffect(() => {
    if (!mapContainer.current || !delivery) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [delivery.pickupLocation.lng, delivery.pickupLocation.lat],
      zoom: 12,
    });

    // Custom marker creation function
    const createMarker = (icon, color, size = 32) => {
      const marker = document.createElement('div');
      marker.innerHTML = `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: ${size * 0.6}px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          border: 2px solid white;
        ">
          ${icon}
        </div>
      `;
      return marker;
    };

    map.current.on('load', async () => {
     
      const shopMarker = createMarker('🏪', '#FFA726', 36);
      new mapboxgl.Marker({ element: shopMarker })
        .setLngLat([delivery.pickupLocation.lng, delivery.pickupLocation.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">Pickup Location</h3>
            <p style="margin: 0; font-size: 12px;">${delivery.pickupLocation.address || ''}</p>
          </div>
        `))
        .addTo(map.current);

      
      const dropoffMarker = createMarker('🏠', '#4CAF50', 36); 
      new mapboxgl.Marker({ element: dropoffMarker })
        .setLngLat([delivery.deliveryLocation.lng, delivery.deliveryLocation.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">Delivery Location</h3>
            <p style="margin: 0; font-size: 12px;">${delivery.deliveryLocation.address || ''}</p>
          </div>
        `))
        .addTo(map.current);

      
      if (delivery.driverId?.currentLocation?.coordinates) {
        const [lng, lat] = delivery.driverId.currentLocation.coordinates;
        const bikeMarker = createMarker('🏍', '#2196F3', 36); 
        new mapboxgl.Marker({ element: bikeMarker })
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">Driver Location</h3>
              <p style="margin: 0; font-size: 12px;">${delivery.driverId.name || 'Driver'}</p>
            </div>
          `))
          .addTo(map.current);
      }

     

      // Add route (blue line) from Driver -> Pickup -> Dropoff
      const routeCoords = [
        delivery.driverId?.currentLocation?.coordinates, // Driver's location
        [delivery.pickupLocation.lng, delivery.pickupLocation.lat], // Pickup location
        [delivery.deliveryLocation.lng, delivery.deliveryLocation.lat] // Dropoff location
      ].filter(Boolean); // Remove any null/undefined coordinates

      if (routeCoords.length >= 2) {
        const route = await fetchRoute(routeCoords);
        if (route) {
          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: {
              type: 'geojson',
              data: route
            },
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#2196F3', // Blue color for the route
              'line-width': 4,
              'line-opacity': 0.8
            }
          });
        }
      }

      // Fit bounds to show all markers and route
      const bounds = new mapboxgl.LngLatBounds()
        .extend([delivery.pickupLocation.lng, delivery.pickupLocation.lat])
        .extend([delivery.deliveryLocation.lng, delivery.deliveryLocation.lat]);

      if (delivery.driverId?.currentLocation?.coordinates) {
        bounds.extend(delivery.driverId.currentLocation.coordinates);
      }

      if (currentLocation) {
        bounds.extend([currentLocation.lng, currentLocation.lat]);
      }

      map.current.fitBounds(bounds, { 
        padding: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        },
        maxZoom: 15
      });
    });

    return () => {
      if (map.current) map.current.remove();
    };
  }, [delivery, currentLocation, role]);

  // Fetch route from Mapbox Directions API
  const fetchRoute = async (coords) => {
    const [start, ...waypoints] = coords;
    const end = waypoints.pop();
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${waypoints.map(([lng, lat]) => `${lng},${lat}`).join(';')};${end[0]},${end[1]}?access_token=${mapboxgl.accessToken}&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();
    return data.routes[0]?.geometry;
  };

  return (
    <div 
      ref={mapContainer} 
      style={{ 
        height: '100%',
        width: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }} 
    />
  );
}