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
      // First save the order to database with paymentStatus 'pending'
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
          isPaid: order.paymentMethod === 'cash' // Mark as paid immediately for cash
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      if (order.paymentMethod === 'card') {
        // For card payments, redirect to payment page with order ID
        navigate('/mock-payment', { 
          state: { 
            orderId: data.data._id,
            amount: order.totalAmount 
          } 
        });
      } else {
        // For cash payments, redirect to orders page
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
      <h2 style={styles.title}>Place Your Order</h2>

      {error && (
        <div style={styles.errorBanner}>
          {error}
          <button onClick={() => setError(null)} style={styles.closeError}>
            &times;
          </button>
        </div>
      )}

      <div style={styles.menuSection}>
        <h3>🍽️ Menu Items</h3>

        <input
          type="text"
          placeholder="Search menu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ ...styles.input, marginBottom: '15px' }}
          disabled={isSubmitting}
        />

        <div style={styles.menuItems}>
          {filteredMenuItems.length === 0 ? (
            <p>No items match your search.</p>
          ) : (
            filteredMenuItems.map((item, index) => (
              <div key={index} style={styles.menuItem}>
                <span>{item.name} - ${item.price.toFixed(2)}</span>
                <button 
                  onClick={() => addToCart(item)}
                  style={styles.addButton}
                  disabled={isSubmitting}
                >
                  Add to Cart
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={styles.cartSection}>
        <h3>🛒 Your Cart</h3>
        {cart.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <>
            <ul style={styles.cartItems}>
              {cart.map((item, index) => (
                <li key={index} style={styles.cartItem}>
                  <span>
                    {item.quantity}x {item.name} - ${item.price.toFixed(2)}
                  </span>
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
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div style={styles.totalSection}>
              <strong>Total: ${order.totalAmount.toFixed(2)}</strong>
            </div>
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} style={styles.orderForm}>
        <div style={styles.formGroup}>
          <label>Delivery Address:</label>
          <input
            type="text"
            value={order.deliveryAddress}
            onChange={(e) => setOrder({ ...order, deliveryAddress: e.target.value })}
            required
            style={styles.input}
            disabled={isSubmitting}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Payment Method:</label>
          <select
            value={order.paymentMethod}
            onChange={(e) => setOrder({ ...order, paymentMethod: e.target.value })}
            style={styles.input}
            disabled={isSubmitting}
          >
            <option value="cash">Cash On Delivery</option>
            <option value="card">Credit/Debit Card</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label>Special Instructions:</label>
          <textarea
            value={order.specialInstructions}
            onChange={(e) => setOrder({ ...order, specialInstructions: e.target.value })}
            style={{ ...styles.input, minHeight: '80px' }}
            placeholder="Any special requests or delivery instructions"
            disabled={isSubmitting}
          />
        </div>

        <button 
          type="submit" 
          style={styles.submitButton}
          disabled={cart.length === 0 || isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  title: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#333'
  },
  errorBanner: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeError: {
    background: 'none',
    border: 'none',
    color: '#c62828',
    fontSize: '20px',
    cursor: 'pointer'
  },
  menuSection: {
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px'
  },
  cartSection: {
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f0f8ff',
    borderRadius: '8px'
  },
  menuItems: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '15px',
    marginTop: '15px'
  },
  menuItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  addButton: {
    padding: '8px 15px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  cartItems: {
    listStyle: 'none',
    padding: 0,
    margin: '15px 0'
  },
  cartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 15px',
    backgroundColor: 'white',
    borderRadius: '8px',
    marginBottom: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  cartControls: {
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
  removeButton: {
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  totalSection: {
    textAlign: 'right',
    padding: '10px',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  orderForm: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px'
  },
  formGroup: {
    marginBottom: '15px'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  },
  submitButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    ':disabled': {
      backgroundColor: '#cccccc',
      cursor: 'not-allowed'
    }
  }
};

export default OrderForm;