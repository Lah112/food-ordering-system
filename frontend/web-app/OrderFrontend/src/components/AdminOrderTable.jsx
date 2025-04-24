// frontend/order/src/components/AdminOrderTable.jsx
import { useState } from 'react';

function AdminOrderTable({ orders, onStatusUpdate }) {
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await onStatusUpdate(orderId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>All Orders</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Customer</th>
            <th style={styles.th}>Restaurant</th>
            <th style={styles.th}>Items</th>
            <th style={styles.th}>Total</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id} style={styles.tr}>
              <td style={styles.td}>
                <div>{order.customerName}</div>
                <div style={styles.email}>{order.email}</div>
              </td>
              <td style={styles.td}>{order.restaurant?.name || 'Unknown'}</td>
              <td style={styles.td}>
                <ul style={styles.list}>
                  {order.items.map((item, idx) => (
                    <li key={idx} style={styles.listItem}>
                      {item.quantity}x {item.name} (${item.price.toFixed(2)})
                    </li>
                  ))}
                </ul>
              </td>
              <td style={styles.td}>${order.totalAmount.toFixed(2)}</td>
              <td style={styles.td}>
                <span style={getStatusStyle(order.status)}>
                  {order.status}
                </span>
              </td>
              <td style={styles.td}>
                {new Date(order.placedAt).toLocaleString()}
              </td>
              <td style={styles.td}>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                  disabled={updatingId === order._id}
                  style={styles.select}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  title: {
    marginBottom: '20px',
    color: '#333'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  th: {
    padding: '12px 15px',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #ddd'
  },
  tr: {
    borderBottom: '1px solid #eee',
    ':hover': {
      backgroundColor: '#f5f5f5'
    }
  },
  td: {
    padding: '12px 15px',
    verticalAlign: 'top'
  },
  list: {
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },
  listItem: {
    marginBottom: '4px'
  },
  email: {
    fontSize: '0.8em',
    color: '#666'
  },
  select: {
    padding: '6px 10px',
    borderRadius: '4px',
    border: '1px solid #ddd'
  }
};

export default AdminOrderTable;