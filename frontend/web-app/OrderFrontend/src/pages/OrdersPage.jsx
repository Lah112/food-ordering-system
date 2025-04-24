// frontend/order/src/pages/OrdersPage.jsx
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
        Please login to view your orders.
      </div>
    );
  }

  if (loading) return <div style={styles.loading}>Loading your orders...</div>;

  return (
    <div>
      <h1 style={styles.title}>My Orders</h1>
      {orders.length > 0 ? (
        <OrderStatusTable orders={orders} />
      ) : (
        <p style={styles.noOrders}>You haven't placed any orders yet.</p>
      )}
    </div>
  );
}

const styles = {
  notLoggedIn: {
    padding: '20px',
    textAlign: 'center',
    backgroundColor: '#fff3cd',
    margin: '20px',
    borderRadius: '4px'
  },
  loading: {
    padding: '20px',
    textAlign: 'center'
  },
  title: {
    padding: '20px',
    color: '#333',
    margin: 0
  },
  noOrders: {
    padding: '20px',
    textAlign: 'center'
  }
};

export default OrdersPage;