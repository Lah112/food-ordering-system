// frontend/order/src/pages/AdminPage.jsx
import { useState, useEffect } from 'react';
import AdminOrderTable from '../components/AdminOrderTable';

function AdminPage({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.isAdmin) {
      fetch('http://localhost:5000/api/orders/all', {
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
          console.error('Error fetching all orders:', err);
          setLoading(false);
        });
    }
  }, [user]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await fetch('http://localhost:5000/api/orders/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      
      if (response.ok) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (!user) {
    return (
      <div style={styles.notLoggedIn}>
        Please login to access this page.
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div style={styles.notAdmin}>
        You don't have permission to access this page.
      </div>
    );
  }

  if (loading) return <div style={styles.loading}>Loading orders...</div>;

  return (
    <div>
      <h1 style={styles.title}>Admin Dashboard</h1>
      <AdminOrderTable 
        orders={orders} 
        onStatusUpdate={handleStatusUpdate} 
      />
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
  notAdmin: {
    padding: '20px',
    textAlign: 'center',
    backgroundColor: '#f8d7da',
    margin: '20px',
    borderRadius: '4px',
    color: '#721c24'
  },
  loading: {
    padding: '20px',
    textAlign: 'center'
  },
  title: {
    padding: '20px',
    color: '#333',
    margin: 0
  }
};

export default AdminPage;