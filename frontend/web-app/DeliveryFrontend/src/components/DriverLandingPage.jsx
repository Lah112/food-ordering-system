import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DeliveryMap from './DeliveryMap';
import { getDelivery, getDriverDeliveries } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { useSocket } from '../context/SocketContext';

export default function DriverLandingPage() {
  const [driverDelivery, setDriverDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();
  const [driverId, setDriverId] = useState('');
  const navigate = useNavigate();
  const [driverToken, setDriverToken] = useState('');
  const [locationMessage, setLocationMessage] = useState(''); // State for location message

  // Styles object
  const styles = {
    landingPage: {
      maxWidth: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f8f9fa',
      fontFamily: "'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
      boxSizing: 'border-box',
      position: 'relative'
    },
    header: {
      textAlign: 'center',
      padding: '15px 0',
      color: '#333',
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      zIndex: 10,
      position: 'sticky',
      top: 0
    },
    mapSection: {
      flex: 1,
      position: 'relative',
      overflow: 'hidden'
    },
    mapContainer: {
      position: 'absolute',
      top: 10,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%'
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px',
      maxWidth: '400px',
      margin: '0 auto'
    },
    btn: {
      padding: '15px 24px',
      backgroundColor: '#42A5F5',
      color: 'white',
      border: 'none',
      borderRadius: '30px',
      fontWeight: 600,
      textDecoration: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      boxShadow: '0 4px 12px rgba(66, 165, 245, 0.3)',
      textAlign: 'center',
      width: '100%',
      transition: 'transform 0.2s ease-in-out, opacity 0.3s ease-in-out, bottom 0.3s ease-in-out'
    },
    customerBtn: {
      backgroundColor: '#66BB6A',
      boxShadow: '0 4px 12px rgba(102, 187, 106, 0.3)'
    },
    noDeliveries: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#666',
      padding: '20px',
      textAlign: 'center'
    },
    error: {
      padding: '20px',
      color: '#d32f2f',
      textAlign: 'center',
      background: '#ffebee',
      borderRadius: '8px',
      margin: '20px'
    },
    locationMessage: {
      position: 'fixed',
      bottom: '20px',
      right: '20px', 
      
      color: '#aaa', 
      padding: '10px 20px',
      borderRadius: '8px',
      zIndex: 1000,
      opacity: 1,
      transition: 'opacity 0.3s ease-in-out, bottom 0.3s ease-in-out' 
    },
    locationMessageHidden: {
      opacity: 0,
      bottom: '-50px'
    }
  };

  useEffect(() => {
    const storedDriverData = localStorage.getItem('driverData');
    const storedDriverToken = localStorage.getItem('driverToken');

    if (storedDriverData && storedDriverToken) {
      try {
        const driverData = JSON.parse(storedDriverData);
        setDriverId(driverData.driverId);
        setDriverToken(storedDriverToken);
      } catch (e) {
        console.error("Error parsing driverData from localStorage", e);
        setError("Invalid driver data in localStorage. Please log in again.");
        localStorage.removeItem('driverToken');
        localStorage.removeItem('driverData');
        navigate('/driver/login');
        return;
      }
    } else {
      setError("No driver data found. Please log in.");
      setLoading(false);
      localStorage.removeItem('driverToken');
      localStorage.removeItem('driverData');
      navigate('/driver/login');
      return;
    }

    const fetchData = async () => {
      try {
        const deliveries = await getDriverDeliveries(driverId);
        if (deliveries.length > 0) {
          const delivery = await getDelivery(deliveries[0]._id);
          setDriverDelivery(delivery);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (driverId) {
      fetchData();
    }

    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            
            fetch(`http://localhost:3001/api/drivers/${driverId}/location`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${driverToken}`
              },
              body: JSON.stringify({ lat: latitude, lng: longitude })
            })
              .then(response => {
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
              })
              .then(data => {
                if (data.success) {
                  // Emit the location update to the server
                  if (socket) {
                    socket.emit('updateLocation', {
                      driverId: driverId,
                      location: { lat: latitude, lng: longitude }
                    });
                  }
                  // Show message
                  setLocationMessage(`Location updated: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                  // Clear message after 3 seconds
                  setTimeout(() => {
                    setLocationMessage('');
                  }, 3000);
                } else {
                  console.error("Failed to update location:", data.message);
                  setError("Failed to update location: " + data.message);
                }
              })
              .catch(error => {
                console.error("Error updating driver location:", error);
                setError("Failed to update location. Please check your connection. Error: " + error.message);
              });
          },
          (error) => {
            let errorMessage = "Could not retrieve your location. Please ensure location services are enabled.";
            if (error.code === error.PERMISSION_DENIED) {
              errorMessage += " Please allow location access for this app.";
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              errorMessage += " Location information is unavailable.";
            } else if (error.code === error.TIMEOUT) {
              errorMessage += " The request to get user location timed out.";
            }
            console.error("Error getting location:", error);
            setError(errorMessage);
          },
          {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 5000
          }
        );
      } else {
        setError("Geolocation is not supported by your browser.");
      }
    };

    
    const locationIntervalId = setInterval(updateLocation, 10000);

    if (socket) {
      socket.on('statusUpdate', data => {
        setDriverDelivery(prev => prev ? { ...prev, status: data.status } : null);
      });

      socket.on('locationUpdate', data => {
        setDriverDelivery(prev => {
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
      clearInterval(locationIntervalId);
      if (socket) {
        socket.off('statusUpdate');
        socket.off('locationUpdate');
      }
    };
  }, [socket, driverId, navigate, driverToken]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div style={styles.error}>Error: {error}</div>;

  return (
    <div style={styles.landingPage}>
      <header style={styles.header}>
        <h1>Driver Delivery View</h1>
      </header>
      <section style={styles.mapSection}>
        {driverDelivery ? (
          <div style={styles.mapContainer}>
            <DeliveryMap delivery={driverDelivery} role="driver" />
          </div>
        ) : (
          <div style={styles.noDeliveries}>
            <p>No assigned deliveries</p>
          </div>
        )}
      </section>

      <div style={styles.buttonSection}>
        <div style={styles.buttonContainer}>
          

          {driverDelivery && (
            <Link
              to={`/driver/${driverDelivery.driverId._id}`}
              style={styles.btn}
            >
              Open Driver Portal
            </Link>
          )}
        </div>
      </div>
      <div
        style={locationMessage ? styles.locationMessage : styles.locationMessageHidden}
      >
        {locationMessage}
      </div>
    </div>
  );
}
