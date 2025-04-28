import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DeliveryMap from './DeliveryMap';
import { getDelivery } from '../services/api';
import { useSocket } from '../context/SocketContext';
import LoadingSpinner from './LoadingSpinner';

export default function CustomerApp() {
  const { deliveryId } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();

  // Fetch delivery data and setup socket listeners
  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        const data = await getDelivery(deliveryId);
        setDelivery(data);
        
        // Join delivery room for real-time updates
        if (socket) {
          socket.emit('joinDeliveryRoom', deliveryId);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDelivery();

    // Socket event listeners
    if (socket) {
      socket.on('driverAssigned', (data) => {
        setDelivery(prev => ({
          ...prev,
          driverId: data.driverId,
          status: 'assigned'
        }));
      });

      socket.on('statusUpdate', (data) => {
        setDelivery(prev => ({ ...prev, status: data.status }));
      });

      socket.on('locationUpdate', (data) => {
        setDelivery(prev => {
          if (!prev?.driverId) return prev;
          return {
            ...prev,
            driverId: {
              ...prev.driverId,
              currentLocation: data.location
            }
          };
        });
      });
    }

    return () => {
      if (socket) {
        socket.off('driverAssigned');
        socket.off('statusUpdate');
        socket.off('locationUpdate');
      }
    };
  }, [deliveryId, socket]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="error">Error: {error}</div>;
  if (!delivery) return <div>Delivery not found</div>;

  return (
    <div className="customer-app">
      <h1>Your Delivery</h1>
      
      <div className="delivery-container">
        <DeliveryMap delivery={delivery} role="customer" />
        
        <div className="delivery-details">
          <h2>Delivery #{delivery._id.slice(-6)}</h2>
          <div className="status-badge" data-status={delivery.status}>
            {delivery.status.replace('_', ' ')}
          </div>
          
          <div className="info-card">
            <h3>Pickup Location</h3>
            <p>{delivery.pickupLocation.address || 'Address not specified'}</p>
          </div>
          
          <div className="info-card">
            <h3>Delivery Location</h3>
            <p>{delivery.deliveryLocation.address || 'Address not specified'}</p>
          </div>
          
          {delivery.driverId && (
            <div className="driver-card">
              <h3>Your Driver</h3>
              <p><strong>Name:</strong> {delivery.driverId.name}</p>
              <p><strong>Vehicle:</strong> {delivery.driverId.vehicleType}</p>
              {delivery.driverId.currentLocation && (
                <p><strong>Distance:</strong> {calculateDistance(
                  delivery.driverId.currentLocation,
                  delivery.pickupLocation
                )} km away</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate distance
function calculateDistance(loc1, loc2) {
  try {
    const lat1 = parseFloat(loc1?.lat?.$numberDouble);
    const lng1 = parseFloat(loc1?.lng?.$numberDouble);
    const lat2 = parseFloat(loc2?.lat?.$numberDouble);
    const lng2 = parseFloat(loc2?.lng?.$numberDouble);

    if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
      return 'Distance unavailable';
    }

    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    if (distanceKm < 1) {
      return (distanceKm * 1000).toFixed(0) + ' meters';
    } else {
      return distanceKm.toFixed(1) + ' km';
    }
  } catch (error) {
    console.error('Error calculating distance:', error);
    return 'Distance unavailable';
  }
}