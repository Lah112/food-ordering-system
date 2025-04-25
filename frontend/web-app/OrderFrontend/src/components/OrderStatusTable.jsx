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
      <div style={styles.header}>
        <img 
          src="https://cdn-icons-png.flaticon.com/512/3144/3144456.png" 
          alt="Orders" 
          style={styles.headerIcon}
        />
        <h2 style={styles.title}>Your Order History</h2>
      </div>
      
      {orders.length === 0 ? (
        <div style={styles.emptyState}>
          <img 
            src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" 
            alt="No orders" 
            style={styles.emptyStateIcon}
          />
          <h3 style={styles.emptyStateTitle}>No Orders Found</h3>
          <p style={styles.emptyStateText}>You haven't placed any orders yet</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeader}>
                  <div style={styles.headerCell}>
                    <img src="https://cdn-icons-png.flaticon.com/512/2784/2784487.png" alt="Restaurant" style={styles.headerIconSmall} />
                    <span>Restaurant</span>
                  </div>
                </th>
                <th style={styles.tableHeader}>
                  <div style={styles.headerCell}>
                    
                    <span> 🍔 Items</span>
                  </div>
                </th>
                <th style={styles.tableHeader}>
                  <div style={styles.headerCell}>
                    
                    <span>💵 Total</span>
                  </div>
                </th>
                <th style={styles.tableHeader}>
                  <div style={styles.headerCell}>
                    
                    <span>⏳ Status</span>
                  </div>
                </th>
                <th style={styles.tableHeader}>
                  <div style={styles.headerCell}>
                    
                    <span>📆 Date & Time</span>
                  </div>
                </th>
                <th style={styles.tableHeader}>
                  <div style={styles.headerCell}>
                    
                    <span>Edit or Delete</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    <div style={styles.restaurantCell}>
                      <img 
                        src={order.restaurant?.image || 'https://cdn-icons-png.flaticon.com/512/2784/2784487.png'} 
                        alt={order.restaurant?.name} 
                        style={styles.restaurantImage}
                      />
                      <span>{order.restaurant?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <ul style={styles.itemsList}>
                      {order.items.map((item, idx) => (
                        <li key={idx} style={styles.item}>
                          <span style={styles.itemQuantity}>{item.quantity}x</span>
                          <span style={styles.itemName}>{item.name}</span>
                          <span style={styles.itemPrice}>Rs.{item.price.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={styles.totalAmount}>Rs.{order.totalAmount.toFixed(2)}</span>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={getStatusStyle(order.status)}>
                      {order.status}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    {new Date(order.placedAt).toLocaleString()}
                  </td>
                  <td style={styles.tableCell}>
                    {order.status === 'Pending' && (
                      <div style={styles.actionButtons}>
                        <button 
                          onClick={() => handleEditClick(order)} 
                          style={styles.editButton}
                        >
                          <img 
                            src="https://cdn-icons-png.flaticon.com/512/1828/1828911.png" 
                            alt="Edit" 
                            style={styles.buttonIcon}
                          />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          style={styles.deleteButton}
                        >
                          <img 
                            src="https://cdn-icons-png.flaticon.com/512/1214/1214428.png" 
                            alt="Delete" 
                            style={styles.buttonIcon}
                          />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingOrder && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Edit Order</h3>
              <button 
                onClick={() => setEditingOrder(null)} 
                style={styles.closeButton}
              >
                &times;
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/2838/2838694.png" 
                    alt="Address" 
                    style={styles.formIcon}
                  />
                  Delivery Address
                </label>
                <input
                  type="text"
                  value={editedAddress}
                  onChange={(e) => setEditedAddress(e.target.value)}
                  required
                  style={styles.formInput}
                />
              </div>
              
              <h4 style={styles.itemsTitle}>
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/3174/3174885.png" 
                  alt="Items" 
                  style={styles.sectionIcon}
                />
                Order Items
              </h4>
              
              <div style={styles.editItemsContainer}>
                {editedItems.map((item, index) => (
                  <div key={index} style={styles.editItem}>
                    <div style={styles.itemInfo}>
                      <img 
                        src={item.image || 'https://cdn-icons-png.flaticon.com/512/1147/1147805.png'} 
                        alt={item.name} 
                        style={styles.editItemImage}
                      />
                      <div>
                        <div style={styles.editItemName}>{item.name}</div>
                        <div style={styles.editItemPrice}>Rs.{item.price.toFixed(2)}</div>
                      </div>
                    </div>
                    <div style={styles.quantityControls}>
                      <button 
                        type="button" 
                        onClick={() => handleItemQuantityChange(index, item.quantity - 1)} 
                        style={styles.quantityButton}
                      >
                        -
                      </button>
                      <span style={styles.quantityDisplay}>{item.quantity}</span>
                      <button 
                        type="button" 
                        onClick={() => handleItemQuantityChange(index, item.quantity + 1)} 
                        style={styles.quantityButton}
                      >
                        +
                      </button>
                      <button 
                        onClick={() => handleRemoveItem(index)} 
                        style={styles.removeButton}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={styles.totalContainer}>
                <span style={styles.totalLabel}>Order Total:</span>
                <span style={styles.totalValue}>Rs.{calculatedTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button 
                onClick={() => setEditingOrder(null)} 
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveChanges} 
                style={styles.saveButton}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusStyle(status) {
  const baseStyle = {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
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
    case 'cancelled':
      return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24' };
    default:
      return { ...baseStyle, backgroundColor: '#e2e3e5', color: '#383d41' };
  }
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: '#fff5e6'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e0e0e0'
  },
  headerIcon: {
    width: '40px',
    height: '40px'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '600',
    margin: 0,
    color: '#2c3e50'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    textAlign: 'center',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
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
    margin: 0
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeaderRow: {
    backgroundColor: '#f8f9fa'
  },
  tableHeader: {
    padding: '1rem',
    textAlign: 'left',
    fontWeight: '600',
    color: '#495057',
    borderBottom: '1px solid #e0e0e0'
  },
  headerCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  headerIconSmall: {
    width: '20px',
    height: '20px',
    opacity: '0.7'
  },
  tableRow: {
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f9f9f9'
    }
  },
  tableCell: {
    padding: '1rem',
    verticalAlign: 'top'
  },
  restaurantCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  restaurantImage: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  itemsList: {
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.25rem 0'
  },
  itemQuantity: {
    fontWeight: '600',
    color: '#e66142'
  },
  itemName: {
    flex: 1
  },
  itemPrice: {
    color: '#6c757d',
    fontSize: '0.9rem'
  },
  totalAmount: {
    fontWeight: '600',
    color: '#2c3e50'
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem'
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#0069d9'
    }
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#c82333'
    }
  },
  buttonIcon: {
    width: '16px',
    height: '16px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column'
  },
  modalHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#2c3e50'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#6c757d',
    padding: '0 0.5rem'
  },
  modalBody: {
    padding: '1.5rem',
    overflowY: 'auto',
    flex: 1
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  formLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: '#495057'
  },
  formIcon: {
    width: '20px',
    height: '20px',
    opacity: '0.7'
  },
  formInput: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '1rem',
    transition: 'border-color 0.3s',
    ':focus': {
      outline: 'none',
      borderColor: '#007bff'
    }
  },
  itemsTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    margin: '1.5rem 0 1rem',
    color: '#2c3e50'
  },
  sectionIcon: {
    width: '24px',
    height: '24px'
  },
  editItemsContainer: {
    margin: '1rem 0'
  },
  editItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 0',
    borderBottom: '1px solid #f0f0f0'
  },
  itemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: 1
  },
  editItemImage: {
    width: '50px',
    height: '50px',
    borderRadius: '8px',
    objectFit: 'cover'
  },
  editItemName: {
    fontWeight: '500'
  },
  editItemPrice: {
    color: '#e66142',
    fontWeight: '600',
    fontSize: '0.9rem'
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  quantityButton: {
    width: '30px',
    height: '30px',
    backgroundColor: '#f8f9fa',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#e9ecef'
    }
  },
  quantityDisplay: {
    minWidth: '20px',
    textAlign: 'center'
  },
  removeButton: {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#ff6b6b',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#ff5252'
    }
  },
  totalContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f0f0f0'
  },
  totalLabel: {
    fontWeight: '500',
    fontSize: '1.1rem'
  },
  totalValue: {
    fontWeight: '600',
    fontSize: '1.2rem',
    color: '#2c3e50'
  },
  modalFooter: {
    padding: '1.5rem',
    borderTop: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem'
  },
  cancelButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#5a6268'
    }
  },
  saveButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#218838'
    }
  }
};

export default OrderStatusTable;