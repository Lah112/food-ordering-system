// frontend/order/src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import RestaurantList from '../components/RestaurantList';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

function HomePage({ user, setUser }) {
  const [restaurants, setRestaurants] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/restaurants')
      .then(res => res.json())
      .then(data => setRestaurants(data))
      .catch(err => console.error('Error fetching restaurants:', err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Food Delivery App</h1>
        {user ? (
          <div style={styles.userControls}>
            <span>Welcome, {user.name}</span>
            {user.isAdmin && (
              <a href="/admin" style={styles.adminLink}>Admin Panel</a>
            )}
            <a href="/my-orders" style={styles.link}>My Orders</a>
            <button onClick={handleLogout} style={styles.button}>Logout</button>
          </div>
        ) : (
          <div style={styles.authControls}>
            <button onClick={() => setShowLogin(true)} style={styles.button}>Login</button>
            <button onClick={() => setShowRegister(true)} style={styles.button}>Register</button>
          </div>
        )}
      </header>

      {showLogin && (
        <LoginForm 
          onClose={() => setShowLogin(false)} 
          setUser={setUser} 
        />
      )}
      {showRegister && (
        <RegisterForm 
          onClose={() => setShowRegister(false)} 
          setUser={setUser} 
        />
      )}

      <RestaurantList restaurants={restaurants} />
    </div>
  );
}

const styles = {
  container: {
    paddingBottom: '50px'
  },
  header: {
    backgroundColor: '#333',
    color: 'white',
    padding: '20px',
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  userControls: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  },
  authControls: {
    display: 'flex',
    gap: '10px'
  },
  button: {
    padding: '8px 15px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline'
    }
  },
  adminLink: {
    color: '#ffcc00',
    textDecoration: 'none',
    marginRight: '10px',
    ':hover': {
      textDecoration: 'underline'
    }
  }
};

export default HomePage;