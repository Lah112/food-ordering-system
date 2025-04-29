import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomerDeliveries } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { FaUserAlt, FaStore, FaMotorcycle, FaHome, FaCheckCircle } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';
import DeliveryMap from '../components/DeliveryMap';

export default function CustomerLandingPage() {
  const [customerDelivery, setCustomerDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getCustomerDeliveries('1');

        if (response && Array.isArray(response) && response.length > 0) {
          setCustomerDelivery(response[0]);
        } else {
          setCustomerDelivery(null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    if (socket) {
      socket.on('statusUpdate', data => {
        setCustomerDelivery(prev =>
          prev && prev._id === data.deliveryId ? { ...prev, status: data.status } : prev
        );
      });

      socket.on('locationUpdate', data => {
        setCustomerDelivery(prev => {
          if (!prev || prev._id !== data.deliveryId || !prev.driverId) return prev;
          return {
            ...prev,
            driverId: {
              ...prev.driverId,
              currentLocation: data.location,
            },
          };
        });
      });
    }

    return () => {
      isMounted = false;
      if (socket) {
        socket.off('statusUpdate');
        socket.off('locationUpdate');
      }
    };
  }, [socket]);

  const statusMilestones = [
    { id: 'assigned', label: 'Driver Assigned', icon: <FaUserAlt /> },
    { id: 'picked_up', label: 'Picked Up', icon: <FaStore /> },
    { id: 'in_transit', label: 'On The Way', icon: <FaMotorcycle /> },
    { id: 'delivered', label: 'Delivered', icon: <FaHome /> },
  ];

  const currentStatusIndex = customerDelivery
    ? statusMilestones.findIndex(m => m.id === customerDelivery.status)
    : -1;

  const calculateDistanceBetweenPoints = (loc1, loc2) => {
    const lat1 = parseFloat(loc1?.lat?.$numberDouble);
    const lng1 = parseFloat(loc1?.lng?.$numberDouble);
    const lat2 = parseFloat(loc2?.lat?.$numberDouble);
    const lng2 = parseFloat(loc2?.lng?.$numberDouble);

    if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
      return null;
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
    return distanceKm.toFixed(1);
  };

  const isValidLocation = (location) => {
    return (
      location &&
      typeof location.lat?.$numberDouble === 'string' &&
      typeof location.lng?.$numberDouble === 'string' &&
      !isNaN(parseFloat(location.lat.$numberDouble)) &&
      !isNaN(parseFloat(location.lng.$numberDouble))
    );
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="customer-page">
      <header className="page-header">
        <h1 className="page-title">Your Delivery</h1>
        
      </header>

      <main className="delivery-container">
        {customerDelivery ? (
          <div className="delivery-card">
            <div className="map-wrapper">
              <DeliveryMap
                delivery={customerDelivery}
                role="customer"
                showRoute={true}
                showPickup={true}
                showDropoff={true}
                showDriverLocation={true}
                showCustomerLocation={false}
              />
            </div>

            <div className="status-tracker">
              <div className="milestones">
                {statusMilestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className={`milestone ${index <= currentStatusIndex ? 'active' : ''}`}
                  >
                    <div className="milestone-icon">
                      {index < currentStatusIndex ? (
                        <FaCheckCircle className="check-icon" />
                      ) : (
                        React.cloneElement(milestone.icon, {
                          className: index === currentStatusIndex ? 'current-icon' : '',
                        })
                      )}
                    </div>
                    <span className="milestone-label">{milestone.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="delivery-info">
              <div className="info-row">
                <span className="info-label">Delivery ID:</span>
                <span className="info-value">
                  {customerDelivery?._id?.slice(-8)?.toUpperCase()}
                </span>
              </div>

              {customerDelivery?.pickupLocation && customerDelivery?.deliveryLocation ? (
                <>
                  {customerDelivery?.driverId && (
                    <>
                      <div className="info-row">
                        <span className="info-label">Driver:</span>
                        <span className="info-value">{customerDelivery.driverId?.name}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Vehicle:</span>
                        <span className="info-value">
                          {customerDelivery.driverId?.vehicleType}
                        </span>
                      </div>
                    </>
                  )}
                  {isValidLocation(customerDelivery.pickupLocation) &&
                    isValidLocation(customerDelivery.deliveryLocation) ? (
                    <div className="info-row">
                      <span className="info-label">Estimated Distance:</span>
                      <span className="info-value">
                        {calculateDistanceBetweenPoints(
                          customerDelivery.pickupLocation,
                          customerDelivery.deliveryLocation
                        ) ? `${calculateDistanceBetweenPoints(
                          customerDelivery.pickupLocation,
                          customerDelivery.deliveryLocation
                        )} km` : 'Calculating...'}
                      </span>
                    </div>
                  ) : (
                    <div className="info-row">
                      <span className="info-label">Estimated Distance:</span>
                      <span className="info-value">Calculating...</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="info-row">
                  <span className="info-label">Estimated Distance:</span>
                  <span className="info-value">Calculating...</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <h3 className="empty-title">No active deliveries</h3>
            <p className="empty-message">
              When you place an order, you'll be able to track it here.
            </p>
          </div>
        )}
      </main>

      <style jsx>{`
        .customer-page {
          max-width: 100%;
          min-height: 100vh;
          padding: 24px;
          background-color: #f8f9fa;
          font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: #2d3748;
          margin: 0;
        }

        .driver-portal-btn {
          padding: 10px 16px;
          border: 1px solid #f97316;
          border-radius: 8px;
          color: #f97316;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .driver-portal-btn:hover {
          background-color: #fff7ed;
        }

        .delivery-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .delivery-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .map-wrapper {
          height: 300px;
          width: 100%;
          position: relative;
        }

        .status-tracker {
          padding: 24px;
        }

        .milestones {
          display: flex;
          justify-content: space-between;
          position: relative;
          z-index: 2;
        }

        .milestone {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
        }

        .milestone-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          color: #9ca3af;
          font-size: 16px;
          transition: all 0.3s ease;
          border: 2px solid #f3f4f6;
        }

        .milestone.active .milestone-icon {
          background: #fff;
          color: #f97316;
          border-color: #f97316;
        }

        .current-icon {
          color: #f97316 !important;
        }

        .check-icon {
          color: #f97316;
          font-size: 18px;
        }

        .milestone-label {
          text-align: center;
          font-size: 14px;
          color: #9ca3af;
          font-weight: 500;
          padding: 0 5px;
        }

        .milestone.active .milestone-label {
          color: #1f2937;
          font-weight: 600;
        }

        .delivery-info {
          padding: 24px;
          border-top: 1px solid #f1f5f9;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f1f5f9;
        }

        .info-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .info-label {
          color: #6b7280;
          font-size: 14px;
        }

        .info-value {
          color: #1f2937;
          font-weight: 500;
        }

        .empty-state {
          background: white;
          border-radius: 16px;
          padding: 48px 24px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }

        .empty-title {
          font-size: 20px;
          color: #2d3748;
          margin-bottom: 12px;
        }

        .empty-message {
          color: #6b7280;
          margin: 0;
        }

        .error-message {
          padding: 24px;
          background: #fff5f5;
          border-radius: 8px;
          color: #dc2626;
          text-align: center;
          max-width: 600px;
          margin: 40px auto;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .milestones {
            flex-wrap: wrap;
            gap: 16px;
          }

          .milestone {
            flex: 0 0 calc(50% - 8px);
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
}