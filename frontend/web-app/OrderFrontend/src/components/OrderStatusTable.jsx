import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function OrderStatusTable({ orders, onOrderUpdate }) {
  const navigate = useNavigate();
  const [editingOrder, setEditingOrder] = useState(null);
  const [editedItems, setEditedItems] = useState([]);
  const [editedAddress, setEditedAddress] = useState('');
  const [calculatedTotal, setCalculatedTotal] = useState(0);

  useEffect(() => {
    const total = editedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCalculatedTotal(total);
  }, [editedItems]);

  const handleEditClick = (order) => {
    setEditingOrder(order);
    setEditedItems([...order.items]);
    setEditedAddress(order.deliveryAddress);
  };

  const handleMakePayment = (order) => {
    console.log('Make payment clicked for order:', order._id);
  };

  const handleItemQuantityChange = (index, quantity) => {
    const newItems = [...editedItems];
    newItems[index].quantity = Math.max(0, quantity);
    setEditedItems(newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...editedItems];
    newItems.splice(index, 1);
    setEditedItems(newItems);
  };

  const handleSaveChanges = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.token) throw new Error('Please login again');

      const response = await fetch(`http://localhost:5000/api/orders/update/${editingOrder._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          items: editedItems,
          deliveryAddress: editedAddress
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Update failed');

      if (typeof onOrderUpdate === 'function') {
        onOrderUpdate(data);
      }

      setEditingOrder(null);
    } catch (error) {
      console.error('Update error:', error.message);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.token) throw new Error('Please login again');

      const response = await fetch(`http://localhost:5000/api/orders/delete/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Delete failed');

      if (typeof onOrderUpdate === 'function') {
        onOrderUpdate(orderId);
      }
    } catch (error) {
      console.error('Delete error:', error.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Your Orders</h2>
      <table style={styles.table}>
        <thead>
          <tr>
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
                {order.status === 'Pending' && (
                  <>
                    <button onClick={() => handleEditClick(order)} style={styles.editButton}>
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      style={{ ...styles.editButton, backgroundColor: '#dc3545', marginLeft: '10px' }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingOrder && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Place Your Order</h3>
            <div style={styles.formGroup}>
              <label style={styles.label}>Delivery Address:</label>
              <input
                type="text"
                value={editedAddress}
                onChange={(e) => setEditedAddress(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            <h4>Items:</h4>
            <div style={styles.menuItems}>
              {editedItems.map((item, index) => (
                <div key={index} style={styles.menuItem}>
                  <span>{item.name} - ${item.price.toFixed(2)}</span>
                  <div style={styles.quantityControls}>
                    <button type="button" onClick={() => handleItemQuantityChange(index, item.quantity - 1)} style={styles.quantityButton}>-</button>
                    <span style={styles.quantity}>{item.quantity}</span>
                    <button type="button" onClick={() => handleItemQuantityChange(index, item.quantity + 1)} style={styles.quantityButton}>+</button>
                    <button onClick={() => handleRemoveItem(index)} style={{ ...styles.quantityButton, backgroundColor: '#ff6b6b' }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
              Total: ${calculatedTotal.toFixed(2)}
            </div>
            <div style={styles.modalButtons}>
              <button onClick={() => setEditingOrder(null)} style={styles.cancelButton}>Cancel</button>
              <button onClick={handleSaveChanges} style={styles.saveButton}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusStyle(status) {
  const baseStyle = {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.9em',
    fontWeight: 'bold',
    display: 'inline-block'
  };

  switch (status.toLowerCase()) {
    case 'pending':
      return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404' };
    case 'confirmed':
      return { ...baseStyle, backgroundColor: '#d4edda', color: '#155724' };
    case 'ready':
      return { ...baseStyle, backgroundColor: '#ffe5b4', color: '#8a4b08' };
    case 'delivered':
      return { ...baseStyle, backgroundColor: '#e2d5f9', color: '#5e3e99' };
    default:
      return baseStyle;
  }
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
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
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #ddd',
    textAlign: 'left'
  },
  tr: {
    borderBottom: '1px solid #eee'
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
  editButton: {
    padding: '6px 12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  modal: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto'
  },
  formGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold'
  },
  input: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  menuItems: {
    margin: '15px 0'
  },
  menuItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #eee'
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  quantityButton: {
    padding: '5px 10px',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  quantity: {
    minWidth: '20px',
    textAlign: 'center'
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px'
  },
  saveButton: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default OrderStatusTable;
