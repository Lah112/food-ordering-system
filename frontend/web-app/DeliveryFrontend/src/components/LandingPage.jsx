import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DeliveryMap from './DeliveryMap';
import { getDelivery, getDriverDeliveries } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { useSocket } from '../context/SocketContext';

export default function LandingPage() {
  const [customerDelivery, setCustomerDelivery] = useState(null);
  const [driverDelivery, setDriverDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get first available delivery
        const deliveries = await getDriverDeliveries('68071138423852cdbefad1e8');
        if (deliveries.length > 0) {
          const delivery = await getDelivery(deliveries[0]._id);
          setCustomerDelivery(delivery);
          setDriverDelivery(deliveries[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Socket listeners for real-time updates
    if (socket) {
      socket.on('statusUpdate', (data) => {
        setCustomerDelivery(prev => prev ? {...prev, status: data.status} : null);
      });
      socket.on('locationUpdate', (data) => {
        setCustomerDelivery(prev => {
          if (!prev || !prev.driverId) return prev;
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
        socket.off('statusUpdate');
        socket.off('locationUpdate');
      }
    };
  }, [socket]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="landing-page">
      <h1>Delivery Tracking System</h1>
      
      <div className="map-container">
        <section className="tracking-section">
          <h2>Customer View</h2>
          {customerDelivery ? (
            <>
              <DeliveryMap delivery={customerDelivery} role="customer" />
              <div className="delivery-info">
                <p>Status: <strong>{customerDelivery.status}</strong></p>
                {customerDelivery.driverId && (
                  <p>Driver: <strong>{customerDelivery.driverId.name}</strong></p>
                )}
              </div>
              <Link to={`/track/${customerDelivery._id}`} className="btn">
                Open Full Tracker
              </Link>
            </>
          ) : (
            <p>No active deliveries found</p>
          )}
        </section>

        <section className="tracking-section">
          <h2>Driver View</h2>
          {driverDelivery ? (
            <>
              <DeliveryMap delivery={driverDelivery} role="driver" />
              <Link to={`/driver/${driverDelivery.driverId._id}`} className="btn">
                Open Driver Portal
              </Link>
            </>
          ) : (
            <p>No assigned deliveries</p>
          )}
        </section>
      </div>
    </div>
  );
}