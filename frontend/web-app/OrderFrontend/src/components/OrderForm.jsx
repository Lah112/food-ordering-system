import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function OrderForm({ user, restaurant }) {
  const navigate = useNavigate();
  const [order, setOrder] = useState({
    items: [],
    deliveryAddress: '',
    customerName: user?.name || '',
    email: user?.email || '',
    totalAmount: 0,
    paymentMethod: 'cash',
    specialInstructions: ''
  });
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (restaurant?.menu) {
      setOrder(prev => ({
        ...prev,
        items: restaurant.menu.map(item => ({
          ...item,
          quantity: 0
        }))
      }));
    }
  }, [restaurant]);

  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setOrder(prev => ({ ...prev, totalAmount: total }));
  }, [cart]);

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem._id === item._id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem._id === item._id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== itemId));
  };

  const updateCartItemQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/orders/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          restaurantId: restaurant._id,
          items: cart,
          deliveryAddress: order.deliveryAddress,
          customerName: order.customerName,
          email: order.email,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          specialInstructions: order.specialInstructions,
          isPaid: order.paymentMethod === 'cash'
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      if (order.paymentMethod === 'card') {
        navigate('/mock-payment', { 
          state: { 
            orderId: data.data._id,
            amount: order.totalAmount 
          } 
        });
      } else {
        setCart([]);
        navigate('/my-orders');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMenuItems = order.items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Place Your Order</h1>
        <p style={styles.subtitle}>{restaurant?.name || 'Restaurant'}</p>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <div style={styles.errorContent}>
            <svg style={styles.errorIcon} viewBox="0 0 24 24">
              <path fill="currentColor" d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M13,17h-2v-2h2V17z M13,13h-2V7h2V13z"/>
            </svg>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} style={styles.closeError}>
            &times;
          </button>
        </div>
      )}

      <div style={styles.contentWrapper}>
        <div style={styles.leftColumn}>
          <div style={styles.menuSection}>
            <div style={styles.sectionHeader}>
              
              <h2 style={styles.sectionTitle}> 🍔 Menu Items</h2>
            </div>

            <div style={styles.searchContainer}>
              <svg style={styles.searchIcon} viewBox="0 0 24 24">
                <path fill="#999" d="M15.5,14h-0.8l-0.3-0.3c1-1.1,1.6-2.6,1.6-4.2C16,6.9,13.1,4,9.5,4S3,6.9,3,10.5S5.9,17,9.5,17c1.6,0,3.1-0.6,4.2-1.6l0.3,0.3v0.8l5,5l1.5-1.5L15.5,14z M9.5,14c-2,0-3.5-1.5-3.5-3.5S7.5,7,9.5,7S13,8.5,13,10.5S11.5,14,9.5,14z"/>
              </svg>
              <input
                type="text"
                placeholder="Search menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
                disabled={isSubmitting}
              />
            </div>

            <div style={styles.menuItems}>
              {filteredMenuItems.length === 0 ? (
                <div style={styles.emptyState}>
                  <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No items" style={styles.emptyStateIcon} />
                  <p>No items match your search.</p>
                </div>
              ) : (
                filteredMenuItems.map((item, index) => (
                  <div key={index} style={styles.menuItem}>
                    <div style={styles.menuItemImage}>
                      <img 
                        src={item.image || 'https://cdn-icons-png.flaticon.com/512/1147/1147805.png'} 
                        alt={item.name} 
                        style={styles.itemImage}
                      />
                    </div>
                    <div style={styles.menuItemDetails}>
                      <h3 style={styles.itemName}>{item.name}</h3>
                      <p style={styles.itemDescription}>{item.description || 'Delicious menu item'}</p>
                      <div style={styles.itemFooter}>
                        <span style={styles.itemPrice}>Rs.{item.price.toFixed(2)}</span>
                        <button 
                          onClick={() => addToCart(item)}
                          style={styles.addButton}
                          disabled={isSubmitting}
                        >
                          <svg style={styles.addIcon} viewBox="0 0 24 24">
                            <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                          </svg>
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <br></br>

        <div style={styles.rightColumn}>
          <div style={styles.cartSection}>
            <div style={styles.sectionHeader}>
              <img src="https://cdn-icons-png.flaticon.com/512/3737/3737372.png" alt="Cart" style={styles.sectionIcon} />
              <h2 style={styles.sectionTitle}>Your Cart</h2>
            </div>
            
            {cart.length === 0 ? (
              <div style={styles.emptyState}>
                <img src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png" alt="Empty cart" style={styles.emptyStateIcon} />
                <p>Your cart is empty</p>
              </div>
            ) : (
              <>
                <ul style={styles.cartItems}>
                  {cart.map((item, index) => (
                    <li key={index} style={styles.cartItem}>
                      <div style={styles.cartItemImage}>
                        <img 
                          src={item.image || 'https://cdn-icons-png.flaticon.com/512/1147/1147805.png'} 
                          alt={item.name} 
                          style={styles.cartImage}
                        />
                      </div>
                      <div style={styles.cartItemDetails}>
                        <div style={styles.cartItemHeader}>
                          <h3 style={styles.cartItemName}>{item.name}</h3>
                          <span style={styles.cartItemPrice}>Rs.{item.price.toFixed(2)}</span>
                        </div>
                        <div style={styles.cartControls}>
                          <button
                            onClick={() => updateCartItemQuantity(item._id, item.quantity - 1)}
                            style={styles.quantityButton}
                            disabled={isSubmitting}
                          >
                            -
                          </button>
                          <span style={styles.quantity}>{item.quantity}</span>
                          <button
                            onClick={() => updateCartItemQuantity(item._id, item.quantity + 1)}
                            style={styles.quantityButton}
                            disabled={isSubmitting}
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            style={styles.removeButton}
                            disabled={isSubmitting}
                          >
                            <svg style={styles.removeIcon} viewBox="0 0 24 24">
                              <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div style={styles.totalSection}>
                  <div style={styles.totalLine}>
                    <span>Subtotal:</span>
                    <span>Rs.{order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div style={{...styles.totalLine, ...styles.grandTotal}}>
                    <span>Total:</span>
                    <span>Rs.{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} style={styles.orderForm}>
            <div style={styles.sectionHeader}>
              <img src="https://cdn-icons-png.flaticon.com/512/2983/2983788.png" alt="Delivery" style={styles.sectionIcon} />
              <h2 style={styles.sectionTitle}>Delivery Information</h2>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Delivery Address</label>
              <div style={styles.inputContainer}>
                <svg style={styles.inputIcon} viewBox="0 0 24 24">
                  <path fill="#999" d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
                </svg>
                <input
                  type="text"
                  value={order.deliveryAddress}
                  onChange={(e) => setOrder({ ...order, deliveryAddress: e.target.value })}
                  required
                  style={styles.formInput}
                  placeholder="Enter your full address"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Payment Method</label>
              <div style={styles.inputContainer}>
                <svg style={styles.inputIcon} viewBox="0 0 24 24">
                  <path fill="#999" d="M20,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6A2,2 0 0,0 20,4M20,18H4V12H20V18M20,8H4V6H20V8Z"/>
                </svg>
                <select
                  value={order.paymentMethod}
                  onChange={(e) => setOrder({ ...order, paymentMethod: e.target.value })}
                  style={styles.formInput}
                  disabled={isSubmitting}
                >
                  <option value="cash">Cash On Delivery</option>
                  <option value="card">Credit/Debit Card</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Special Instructions</label>
              <div style={styles.inputContainer}>
                <svg style={styles.inputIcon} viewBox="0 0 24 24">
                  <path fill="#999" d="M12,3C17.5,3 22,6.58 22,11C22,15.42 17.5,19 12,19C10.76,19 9.57,18.82 8.47,18.5C7.55,18.18 6.75,17.76 6,17.29V15.72C6.71,16.24 7.56,16.66 8.5,16.94C9.44,17.22 10.44,17.36 11.5,17.36C16.36,17.36 20,14.43 20,11C20,7.57 16.36,4.64 11.5,4.64C10.34,4.64 9.23,4.82 8.19,5.15C7.12,5.5 6.1,6.04 5.19,6.72L3.29,4.82C4.68,3.61 6.38,2.77 8.35,2.35C9.8,2.03 11.36,1.86 13,1.86C17.5,1.86 21.45,3.69 23,6.5V4.5H25V11C25,15.5 21.13,19.26 16.25,19.93V22C18.8,21.43 21.17,19.97 22.64,17.84L20.21,15.41C19.17,17 17.27,18.14 15.05,18.5C13.92,18.71 12.77,18.86 11.5,18.86C6.5,18.86 2,15.14 2,11C2,6.86 6.5,3.14 12,3M12,7V9H16V7H12M12,11V13H16V11H12M12,15V17H16V15H12Z"/>
                </svg>
                <textarea
                  value={order.specialInstructions}
                  onChange={(e) => setOrder({ ...order, specialInstructions: e.target.value })}
                  style={{...styles.formInput, ...styles.textarea}}
                  placeholder="Any special requests or delivery instructions"
                  disabled={isSubmitting}
                  rows="3"
                />
              </div>
            </div>

            <button 
              type="submit" 
              style={{
                ...styles.submitButton,
                backgroundColor: cart.length === 0 ? '#ccc' : '#e66142',
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
              }}
              disabled={cart.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg style={styles.spinner} viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="5"></circle>
                  </svg>
                  Processing...
                </>
              ) : (
                'Place Order'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '2rem',
    width: '1100px',
    boxSizing: 'border-box',
    fontFamily: "'Poppins', sans-serif",
    color: '#333',
    backgroundColor: '#f9f9f9',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  header: {
    textAlign: 'center',
    marginBottom: '1rem'
  },
  title: {
    color: '#2c3e50',
    fontSize: '2.5rem',
    fontWeight: '600',
    margin: '0'
  },
  subtitle: {
    color: '#7f8c8d',
    fontSize: '1.1rem',
    margin: '0.5rem 0 0',
    fontWeight: '400'
  },
  errorBanner: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  errorContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  errorIcon: {
    width: '20px',
    height: '20px'
  },
  closeError: {
    background: 'none',
    border: 'none',
    color: '#c62828',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0',
    lineHeight: '1'
  },
  contentWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    alignItems: 'flex-start',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%'
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  menuSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  cartSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    width: '1000px'
  },
  orderForm: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem'
  },
  sectionIcon: {
    width: '28px',
    height: '28px'
  },
  sectionTitle: {
    color: '#2c3e50',
    fontSize: '1.5rem',
    fontWeight: '600',
    margin: '0'
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '1.5rem'
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '20px',
    height: '20px'
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'border-color 0.3s',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'Poppins', sans-serif"
  },
  menuItems: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1rem'
  },
  menuItem: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }
  },
  menuItemImage: {
    flexShrink: '0'
  },
  itemImage: {
    width: '80px',
    height: '80px',
    borderRadius: '8px',
    objectFit: 'cover'
  },
  menuItemDetails: {
    flexGrow: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  itemName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    margin: '0 0 0.25rem',
    color: '#2c3e50'
  },
  itemDescription: {
    fontSize: '0.9rem',
    color: '#7f8c8d',
    margin: '0 0 0.5rem',
    lineHeight: '1.4'
  },
  itemFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemPrice: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#e66142'
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#218838'
    }
  },
  addIcon: {
    width: '18px',
    height: '18px'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    textAlign: 'center',
    color: '#7f8c8d'
  },
  emptyStateIcon: {
    width: '80px',
    height: '80px',
    marginBottom: '1rem',
    opacity: '0.6'
  },
  cartItems: {
    listStyle: 'none',
    padding: '0',
    margin: '0 0 1.5rem',
    maxHeight: '400px',
    overflowY: 'auto'
  },
  cartItem: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    marginBottom: '0.75rem',
    transition: 'transform 0.2s'
  },
  cartItemImage: {
    flexShrink: '0'
  },
  cartImage: {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    objectFit: 'cover'
  },
  cartItemDetails: {
    flexGrow: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  cartItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem'
  },
  cartItemName: {
    fontSize: '1rem',
    fontWeight: '600',
    margin: '0',
    color: '#2c3e50'
  },
  cartItemPrice: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#e66142'
  },
  cartControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  quantityButton: {
    width: '30px',
    height: '30px',
    backgroundColor: '#ddd',
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
      backgroundColor: '#d0d0d0'
    }
  },
  quantity: {
    minWidth: '20px',
    textAlign: 'center',
    fontWeight: '500'
  },
  removeButton: {
    width: '30px',
    height: '30px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#c82333'
    }
  },
  removeIcon: {
    width: '18px',
    height: '18px'
  },
  totalSection: {
    borderTop: '1px solid #e0e0e0',
    paddingTop: '1rem'
  },
  totalLine: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
    fontSize: '1rem'
  },
  grandTotal: {
    fontWeight: '600',
    fontSize: '1.2rem',
    marginTop: '0.5rem',
    color: '#2c3e50'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  formLabel: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: '#2c3e50'
  },
  inputContainer: {
    position: 'relative'
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '20px',
    height: '20px'
  },
  formInput: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'border-color 0.3s',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'Poppins', sans-serif",
    ':focus': {
      borderColor: '#e66142'
    }
  },
  textarea: {
    minHeight: '100px',
    resize: 'vertical'
  },
  submitButton: {
    width: '100%',
    padding: '1rem',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    ':hover': {
      transform: 'translateY(-2px)'
    },
    ':active': {
      transform: 'translateY(0)'
    }
  },
  spinner: {
    width: '20px',
    height: '20px',
    animation: 'spin 1s linear infinite',
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' }
    }
  }
};

export default OrderForm;