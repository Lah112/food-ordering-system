// frontend/order/src/pages/RestaurantPage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import OrderForm from '../components/OrderForm';

function RestaurantPage({ user }) {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/restaurants/${id}`)
      .then(res => res.json())
      .then(data => {
        setRestaurant(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching restaurant:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!restaurant) return <div style={styles.error}>Restaurant not found</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{restaurant.name}</h1>
      <p style={styles.status}>
        Status: <span style={restaurant.isOpen ? styles.open : styles.closed}>
          {restaurant.isOpen ? 'Open' : 'Closed'}
        </span>
      </p>
      
      {user ? (
        restaurant.isOpen ? (
          <OrderForm user={user} restaurant={restaurant} />
        ) : (
          <p style={styles.closedMessage}>This restaurant is currently closed.</p>
        )
      ) : (
        <p style={styles.loginMessage}>Please login to place an order.</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  loading: {
    padding: '20px',
    textAlign: 'center'
  },
  error: {
    padding: '20px',
    textAlign: 'center',
    color: 'red'
  },
  title: {
    color: '#333',
    marginBottom: '10px'
  },
  status: {
    fontSize: '1.1em',
    marginBottom: '20px'
  },
  open: {
    color: 'green',
    fontWeight: 'bold'
  },
  closed: {
    color: 'red',
    fontWeight: 'bold'
  },
  closedMessage: {
    padding: '20px',
    backgroundColor: '#fff3cd',
    borderRadius: '4px',
    textAlign: 'center'
  },
  loginMessage: {
    padding: '20px',
    backgroundColor: '#d4edda',
    borderRadius: '4px',
    textAlign: 'center'
  }
};

export default RestaurantPage;