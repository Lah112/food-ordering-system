import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getDriverDeliveries, updateDeliveryStatus } from '../services/api';
import { useSocket } from '../context/SocketContext';
import LoadingSpinner from './LoadingSpinner';
import { FaMotorcycle, FaCheck, FaStore, FaHome, FaArrowRight, FaBiking, FaChevronLeft } from 'react-icons/fa';

export default function DriverApp() {
  const { driverId } = useParams();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const socket = useSocket();

  // Styles object
  const styles = {
    driverApp: {
      maxWidth: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f8f9fa',
      fontFamily: "'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
      alignItems: 'center'
    },
    driverHeader: {
      backgroundColor: '#ffffff',
      padding: '15px 20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      zIndex: 10,
      width: '100%',
      position: 'relative'
    },
    backButton: {
      position: 'absolute',
      left: '20px',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '1.2rem',
      color: '#42A5F5',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px'
    },
    headerContent: {
      maxWidth: '400px',
      margin: '0 auto',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative'
    },
    headerTitle: {
      margin: 0,
      fontSize: '1.2rem',
      color: '#333',
      fontWeight: 600
    },
    driverInfo: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end'
    },
    driverName: {
      fontWeight: 600,
      fontSize: '0.9rem'
    },
    driverVehicle: {
      fontSize: '0.8rem',
      color: '#666',
      background: '#f1f1f1',
      padding: '2px 8px',
      borderRadius: '10px',
      marginTop: '3px'
    },
    deliveryContainer: {
      flex: 1,
      padding: '15px',
      overflowY: 'auto',
      width: '100%',
      maxWidth: '400px'
    },
    deliveryCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      marginBottom: '20px',
      minHeight: '500px' // Increased card height
    },
    deliveryId: {
      display: 'flex',
      justifyContent: 'space-between',
      paddingBottom: '15px',
      marginBottom: '15px',
      borderBottom: '1px solid #eee',
      fontSize: '0.9rem',
      color: '#666'
    },
    deliveryIdStrong: {
      color: '#333',
      fontWeight: 600
    },
    addressSection: {
      display: 'flex',
      marginBottom: '20px',
      alignItems: 'flex-start'
    },
    pickupIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '15px',
      flexShrink: 0,
      fontSize: '1.1rem',
      backgroundColor: '#FFF3E0',
      color: '#FFA726'
    },
    dropoffIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '15px',
      flexShrink: 0,
      fontSize: '1.1rem',
      backgroundColor: '#E8F5E9',
      color: '#66BB6A'
    },
    addressContent: {
      flex: 1
    },
    addressTitle: {
      margin: '0 0 5px 0',
      fontSize: '1rem',
      color: '#333',
      fontWeight: 600
    },
    addressText: {
      margin: 0,
      fontSize: '0.9rem',
      color: '#666',
      lineHeight: 1.4
    },
    statusTracker: {
      margin: '30px 0',
      position: 'relative'
    },
    statusSteps: {
      display: 'flex',
      justifyContent: 'space-between',
      position: 'relative',
      marginBottom: '10px'
    },
    progressBar: {
      height: '4px',
      backgroundColor: '#eee',
      borderRadius: '2px',
      position: 'relative',
      margin: '0 15px'
    },
    progress: {
      position: 'absolute',
      height: '100%',
      backgroundColor: '#999', 
      borderRadius: '2px',
      transition: 'width 0.3s ease'
    },
    step: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      zIndex: 2,
      width: '33%'
    },
    stepIcon: {
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      backgroundColor: '#eee',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '8px',
      color: '#999',
      fontSize: '0.8rem'
    },
    activeStepIcon: {
      backgroundColor: '#42A5F5',
      color: 'white'
    },
    stepLabel: {
      fontSize: '0.7rem',
      textAlign: 'center',
      color: '#999',
      fontWeight: 500,
      textTransform: 'uppercase'
    },
    activeStepLabel: {
      color: '#333',
      fontWeight: 600
    },
    statusSlider: {
      position: 'relative',
      height: '50px',
      backgroundColor: '#f5f5f5',
      borderRadius: '25px',
      overflow: 'hidden',
      cursor: 'pointer',
      userSelect: 'none',
      touchAction: 'none',
      border: '1px solid #e0e0e0',
      maxWidth: '300px',
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: '80px'
    },
    sliderTrack: {
      position: 'absolute',
      height: '100%',
      backgroundColor: '#FFA726',
      transition: 'width 0.1s ease'
    },
    sliderThumb: {
      position: 'absolute',
      width: '40px',
      height: '40px',
      backgroundColor: 'white',
      borderRadius: '50%',
      top: '5px',
      left: '5px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      transition: 'left 0.1s ease',
      zIndex: 2,
      color: '#FFA726'
    },
    sliderLabel: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 500,
      color: '#555',
      zIndex: 1,
      fontSize: '0.9rem',
      gap: '8px'
    },
    noDeliveries: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '20px',
      maxWidth: '400px',
      width: '100%',
      minHeight: '500px'
    },
    noDeliveryTitle: {
      marginBottom: '10px',
      color: '#333'
    },
    noDeliveryText: {
      color: '#666',
      marginBottom: '20px'
    },
    btn: {
      padding: '12px 24px',
      backgroundColor: '#42A5F5',
      color: 'white',
      border: 'none',
      borderRadius: '30px',
      fontWeight: 500,
      textDecoration: 'none',
      cursor: 'pointer',
      fontSize: '0.9rem',
      boxShadow: '0 2px 8px rgba(66, 165, 245, 0.3)'
    },
    driverError: {
      padding: '20px',
      color: '#d32f2f',
      textAlign: 'center',
      background: '#ffebee',
      borderRadius: '8px',
      margin: '20px',
      maxWidth: '400px',
      width: '100%',
      minHeight: '500px'
    }
  };

  // Fetch driver's active delivery
  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        const deliveries = await getDriverDeliveries(driverId);
        const activeDelivery = deliveries.find(d => !['delivered', 'cancelled'].includes(d.status));
        setDelivery(activeDelivery || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDelivery();
  }, [driverId]);

  // Handle status updates
  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateDeliveryStatus(delivery._id, newStatus);
      setDelivery(prev => ({ ...prev, status: newStatus }));
      
      // Refresh if delivered
      if (newStatus === 'delivered') {
        setTimeout(() => navigate(`/driver/${driverId}`), 2000);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Slider interaction handlers
  const handleSliderStart = () => {
    setIsSliding(true);
  };

  const handleSliderMove = (e) => {
    if (!isSliding) return;
    
    const slider = e.currentTarget;
    const rect = slider.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    setSliderPosition(Math.min(Math.max(pos, 0), 0.9));
  };

  const handleSliderEnd = () => {
    if (sliderPosition > 0.7) {
      const nextStatus = getNextStatus(delivery.status);
      if (nextStatus) handleStatusUpdate(nextStatus);
    }
    setSliderPosition(0);
    setIsSliding(false);
  };

  const getNextStatus = (currentStatus) => {
    switch(currentStatus) {
      case 'assigned': return 'picked_up';
      case 'picked_up': return 'in_transit';
      case 'in_transit': return 'delivered';
      default: return null;
    }
  };

  const getStatusInfo = () => {
    if (!delivery) return null;
    
    const statusInfo = {
      assigned: {
        icon: <FaStore />,
        label: 'Pick Up',
        next: 'Slide to confirm pickup',
        color: '#FFA726'
      },
      picked_up: {
        icon: <FaBiking />,
        label: 'Start Delivery',
        next: 'Slide to start delivery',
        color: '#42A5F5'
      },
      in_transit: {
        icon: <FaHome />,
        label: 'Deliver',
        next: 'Slide to confirm delivery',
        color: '#66BB6A'
      }
    };
    
    return statusInfo[delivery.status] || null;
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div style={styles.driverError}>Error: {error}</div>;

  return (
    <div style={styles.driverApp}>
      <header style={styles.driverHeader}>
        <div style={styles.backButton} onClick={() => navigate('/driver')}>
          <FaChevronLeft />
        </div>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>Delivery Status</h1>
          {delivery?.driverId && (
            <div style={styles.driverInfo}>
              <span style={styles.driverName}>{delivery.driverId.name}</span>
              <span style={styles.driverVehicle}>{delivery.driverId.vehicleType}</span>
            </div>
          )}
        </div>
      </header>

      {delivery ? (
        <div style={styles.deliveryContainer}>
          <div style={styles.deliveryCard}>
            <div style={styles.deliveryId}>
              <span>Order #:</span>
              <strong style={styles.deliveryIdStrong}>{delivery._id.slice(-8).toUpperCase()}</strong>
            </div>
            
            <div style={styles.addressSection}>
              <div style={styles.pickupIcon}>
                <FaStore />
              </div>
              <div style={styles.addressContent}>
                <h3 style={styles.addressTitle}>Pickup Location</h3>
                <p style={styles.addressText}>{delivery.pickupLocation.address || 'Address not specified'}</p>
              </div>
            </div>
            
            <div style={styles.addressSection}>
              <div style={styles.dropoffIcon}>
                <FaHome />
              </div>
              <div style={styles.addressContent}>
                <h3 style={styles.addressTitle}>Delivery Location</h3>
                <p style={styles.addressText}>{delivery.deliveryLocation.address || 'Address not specified'}</p>
              </div>
            </div>
            
            <div style={styles.statusTracker}>
              <div style={styles.statusSteps}>
                <div style={styles.step}>
                  <div style={{
                    ...styles.stepIcon,
                    ...(['picked_up', 'in_transit', 'delivered'].includes(delivery.status) ? styles.activeStepIcon : {}),
                    backgroundColor: ['picked_up', 'in_transit', 'delivered'].includes(delivery.status) ? '#42A5F5' : '#eee'
                  }}>
                    {['picked_up', 'in_transit', 'delivered'].includes(delivery.status) ? <FaCheck /> : <FaStore />}
                  </div>
                  <div style={{
                    ...styles.stepLabel,
                    ...(delivery.status === 'picked_up' ? styles.activeStepLabel : {})
                  }}>Picked Up</div>
                </div>
                
                <div style={styles.step}>
                  <div style={{
                    ...styles.stepIcon,
                    ...(['in_transit', 'delivered'].includes(delivery.status) ? styles.activeStepIcon : {}),
                    backgroundColor: ['in_transit', 'delivered'].includes(delivery.status) ? '#42A5F5' : '#eee'
                  }}>
                    {['in_transit', 'delivered'].includes(delivery.status) ? <FaCheck /> : <FaBiking />}
                  </div>
                  <div style={{
                    ...styles.stepLabel,
                    ...(delivery.status === 'in_transit' ? styles.activeStepLabel : {})
                  }}>On The Way</div>
                </div>
                
                <div style={styles.step}>
                  <div style={{
                    ...styles.stepIcon,
                    ...(delivery.status === 'delivered' ? styles.activeStepIcon : {}),
                    backgroundColor: delivery.status === 'delivered' ? '#42A5F5' : '#eee'
                  }}>
                    <FaHome />
                  </div>
                  <div style={{
                    ...styles.stepLabel,
                    ...(delivery.status === 'delivered' ? styles.activeStepLabel : {})
                  }}>Delivered</div>
                </div>
              </div>
              <div style={styles.progressBar}>
                <div 
                  style={{
                    ...styles.progress,
                    width: delivery.status === 'picked_up' ? '0%' : 
                           delivery.status === 'in_transit' ? '50%' : 
                           '100%',
                    backgroundColor: delivery.status === 'picked_up' ? '#999' : 
                                   delivery.status === 'in_transit' ? '#42A5F5' : 
                                   '#66BB6A'
                  }}
                ></div>
              </div>
            </div>
            
            {getStatusInfo() && (
              <div 
                style={{
                  ...styles.statusSlider,
                  '--slider-color': getStatusInfo().color
                }}
                onMouseDown={handleSliderStart}
                onMouseMove={handleSliderMove}
                onMouseUp={handleSliderEnd}
                onMouseLeave={handleSliderEnd}
                onTouchStart={handleSliderStart}
                onTouchMove={handleSliderMove}
                onTouchEnd={handleSliderEnd}
              >
                <div 
                  style={{
                    ...styles.sliderTrack,
                    width: `${sliderPosition * 100}%`,
                    backgroundColor: getStatusInfo().color
                  }}
                ></div>
                <div 
                  style={{
                    ...styles.sliderThumb,
                    left: `${sliderPosition * 100}%`,
                    color: getStatusInfo().color
                  }}
                >
                  <FaArrowRight />
                </div>
                <div style={styles.sliderLabel}>
                  {sliderPosition > 0.1 ? getStatusInfo().next : (
                    <>
                      {getStatusInfo().icon}
                      <span>{getStatusInfo().label}</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={styles.noDeliveries}>
          <h2 style={styles.noDeliveryTitle}>No Active Deliveries</h2>
          <p style={styles.noDeliveryText}>You currently don't have any assigned deliveries.</p>
          <Link to="/" style={styles.btn}>
            Go to Customer View
          </Link>
        </div>
      )}
    </div>
  );
}