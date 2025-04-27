import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DriverAuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    vehicleType: 'car',
    currentLocation: { lat: 0, lng: 0 }
  });
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const navigate = useNavigate();

  // Styles object
  const styles = {
    pageContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box'
    },
    authCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      padding: '40px',
      width: '100%',
      maxWidth: '450px',
      transition: 'all 0.3s ease'
    },
    title: {
      color: '#2d3748',
      fontSize: '28px',
      fontWeight: '700',
      marginBottom: '30px',
      textAlign: 'center'
    },
    errorBox: {
      backgroundColor: '#fff5f5',
      borderLeft: '4px solid #fc8181',
      padding: '12px 16px',
      borderRadius: '6px',
      marginBottom: '24px',
      color: '#e53e3e',
      fontSize: '14px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      color: '#4a5568',
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'all 0.2s ease',
      outline: 'none',
      boxSizing: 'border-box'
    },
    inputFocus: {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '16px',
      backgroundColor: 'white',
      appearance: 'none',
      backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234a5568%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 0.7rem top 50%',
      backgroundSize: '0.65rem auto'
    },
    locationStatus: {
      display: 'flex',
      alignItems: 'center',
      marginTop: '12px',
      fontSize: '14px'
    },
    locationSuccess: {
      color: '#38a169',
      fontWeight: '600'
    },
    locationError: {
      color: '#e53e3e'
    },
    submitButton: {
      width: '100%',
      padding: '14px',
      backgroundColor: '#4f46e5',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginTop: '10px'
    },
    submitButtonHover: {
      backgroundColor: '#4338ca'
    },
    toggleText: {
      textAlign: 'center',
      color: '#718096',
      fontSize: '14px',
      marginTop: '24px'
    },
    toggleButton: {
      color: '#4f46e5',
      fontWeight: '600',
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      padding: '0',
      marginLeft: '4px'
    }
  };

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('driverToken');
      if (!token) {
        setIsVerifying(false);
        return;
      }
      try {
        const response = await axios.get('/api/drivers/verify-token', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.valid) {
          setIsAuthenticated(true);
        } else {
          clearAuthData();
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        clearAuthData();
      } finally {
        setIsVerifying(false);
      }
    };

    const clearAuthData = () => {
      localStorage.removeItem('driverToken');
      localStorage.removeItem('driverData');
    };

    verifyToken();

    if (!isLogin && navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            currentLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
          setLocationLoading(false);
        },
        (err) => {
          console.error("Location error:", err);
          setError('Location access is required for registration');
          setLocationLoading(false);
        }
      );
    }
  }, [isLogin]);

  useEffect(() => {
    if (isAuthenticated && !isVerifying) {
      navigate('/driver');
    }
  }, [isAuthenticated, isVerifying, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin ? '/api/drivers/login' : '/api/drivers/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(endpoint, payload);

      const { token, driverId, email, name } = response.data;

      localStorage.setItem('driverToken', token);
      localStorage.setItem('driverData', JSON.stringify({ driverId, email, name }));

      setIsAuthenticated(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred during authentication');
    }
  };

  if (isVerifying) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.authCard}>
          <h2 style={styles.title}>Verifying session...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.authCard}>
        <h2 style={styles.title}>
          {isLogin ? 'Driver Login' : 'Driver Registration'}
        </h2>

        {error && (
          <div style={styles.errorBox}>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength="6"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {!isLogin && (
            <>
              <div style={styles.formGroup}>
                <label htmlFor="name" style={styles.label}>Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="vehicleType" style={styles.label}>Vehicle Type</label>
                <select
                  id="vehicleType"
                  name="vehicleType"
                  required
                  value={formData.vehicleType}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="van">Van</option>
                </select>
              </div>

              <div style={styles.locationStatus}>
                {locationLoading ? (
                  <span>Getting your location...</span>
                ) : formData.currentLocation.lat !== 0 ? (
                  <span style={styles.locationSuccess}>
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      style={{ marginRight: '8px', verticalAlign: 'middle' }}
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Location obtained
                  </span>
                ) : (
                  <span style={styles.locationError}>
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      style={{ marginRight: '8px', verticalAlign: 'middle' }}
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    Location not available
                  </span>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={!isLogin && locationLoading}
            style={styles.submitButton}
          >
            {isLogin ? 'Sign in' : 'Register'}
          </button>
        </form>

        <p style={styles.toggleText}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={styles.toggleButton}
          >
            {isLogin ? 'Create a new account' : 'Sign in instead'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default DriverAuthPage;