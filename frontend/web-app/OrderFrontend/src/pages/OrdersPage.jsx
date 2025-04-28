import { useState, useEffect } from 'react';
import OrderStatusTable from '../components/OrderStatusTable';

function OrdersPage({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch('http://localhost:5000/api/orders/myorders', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setOrders(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching orders:', err);
          setLoading(false);
        });
    }
  }, [user]);

  if (!user) {
    return (
      <div style={styles.notLoggedIn}>
        <img 
          src="https://cdn-icons-png.flaticon.com/512/3580/3580148.png" 
          alt="Login required" 
          style={styles.notLoggedInIcon}
        />
        <h3>Please login to view your orders</h3>
        <p>Sign in to access your order history and track current orders</p>
      </div>
    );
  }

  if (loading) return (
    <div style={styles.loadingContainer}>
      <img 
        src="https://cdn-icons-png.flaticon.com/512/4216/4216217.png" 
        alt="Loading" 
        style={styles.loadingIcon}
      />
      <p style={styles.loadingText}>Loading your orders...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <img 
          src="https://cdn-icons-png.flaticon.com/512/3144/3144456.png" 
          alt="Orders" 
          style={styles.headerIcon}
        />
        <h1 style={styles.title}>Your Orders</h1>
      </div>
      
      {orders.length > 0 ? (
        <OrderStatusTable orders={orders} />
      ) : (
        <div style={styles.emptyState}>
          <img 
            src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" 
            alt="No orders" 
            style={styles.emptyStateIcon}
          />
          <h3 style={styles.emptyStateTitle}>No Orders Yet</h3>
          <p style={styles.emptyStateText}>You haven't placed any orders yet. Start exploring our menu!</p>
          <button 
            style={styles.exploreButton}
            onClick={() => window.location.href = '/'}
          >
            Explore Restaurants
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: "'Poppins', sans-serif",
    color: '#333'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #eee'
  },
  headerIcon: {
    width: '40px',
    height: '40px'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '600',
    margin: '0',
    color: '#2c3e50'
  },
  notLoggedIn: {
    maxWidth: '500px',
    margin: '2rem auto',
    padding: '2rem',
    textAlign: 'center',
    backgroundColor: '#fff8e1',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  notLoggedInIcon: {
    width: '80px',
    height: '80px',
    marginBottom: '1rem',
    opacity: '0.8'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    textAlign: 'center'
  },
  loadingIcon: {
    width: '60px',
    height: '60px',
    marginBottom: '1rem',
    animation: 'spin 1s linear infinite',
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' }
    }
  },
  loadingText: {
    fontSize: '1.2rem',
    color: '#7f8c8d'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    marginTop: '2rem'
  },
  emptyStateIcon: {
    width: '100px',
    height: '100px',
    marginBottom: '1.5rem',
    opacity: '0.6'
  },
  emptyStateTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    margin: '0 0 0.5rem',
    color: '#2c3e50'
  },
  emptyStateText: {
    fontSize: '1rem',
    color: '#7f8c8d',
    margin: '0 0 1.5rem',
    maxWidth: '400px'
  },
  exploreButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#e66142',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.2s',
    ':hover': {
      backgroundColor: '#d35400',
      transform: 'translateY(-2px)'
    }
  }
};

export default OrdersPage;