import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PaymentPage() {
  const navigate = useNavigate();
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Mock payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      // Navigate after showing success message
      setTimeout(() => navigate('/my-orders'), 2000);
    }, 2000);
  };

  if (paymentSuccess) {
    return (
      <div style={styles.successContainer}>
        <div style={styles.successIcon}>✓</div>
        <h2>Payment Successful!</h2>
        <p>Your order has been placed successfully.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Stripe Payment</h1>
      <div style={styles.cardPreview}>
        <div style={styles.card}>
          <div style={styles.cardNumber}>
            {paymentInfo.cardNumber || '•••• •••• •••• ••••'}
          </div>
          <div style={styles.cardFooter}>
            <div style={styles.cardName}>
              {paymentInfo.name || 'CARDHOLDER NAME'}
            </div>
            <div style={styles.cardExpiry}>
              {paymentInfo.expiry || '••/••'}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label>Card Number</label>
          <input
            type="text"
            name="cardNumber"
            value={paymentInfo.cardNumber}
            onChange={handleInputChange}
            placeholder="1234 5678 9012 3456"
            maxLength="16"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Cardholder Name</label>
          <input
            type="text"
            name="name"
            value={paymentInfo.name}
            onChange={handleInputChange}
            placeholder="John Doe"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label>Expiry Date</label>
            <input
              type="text"
              name="expiry"
              value={paymentInfo.expiry}
              onChange={handleInputChange}
              placeholder="MM/YY"
              maxLength="5"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>CVC</label>
            <input
              type="text"
              name="cvc"
              value={paymentInfo.cvc}
              onChange={handleInputChange}
              placeholder="123"
              maxLength="3"
              required
              style={styles.input}
            />
          </div>
        </div>

        <button 
          type="submit" 
          style={styles.submitButton}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#fff5e6'// Light orange background for the entire page
  },
  header: {
    textAlign: 'center',
    color: '#32325d',
    marginBottom: '30px'
  },
  cardPreview: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '30px'
  },
  card: {
    width: '350px',
    height: '220px',
    borderRadius: '10px',
    background: 'linear-gradient(45deg,rgb(2, 3, 15), #7795f8)',
    color: 'white',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  cardNumber: {
    fontSize: '24px',
    letterSpacing: '2px',
    marginTop: '40px'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  cardName: {
    fontSize: '14px',
    textTransform: 'uppercase'
  },
  cardExpiry: {
    fontSize: '14px'
  },
  form: {
    backgroundColor: '#fff5e6', // Light orange background for form
    padding: '20px',
    borderRadius: '8px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  formRow: {
    display: 'flex',
    gap: '20px'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #e0e6eb',
    borderRadius: '4px',
    fontSize: '16px',
    boxSizing: 'border-box'
  },
  submitButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#e66142',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#5469d4'
    }
  },
  successContainer: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '40px',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif'
  },
  successIcon: {
    width: '80px',
    height: '80px',
    backgroundColor: '#28a745',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    margin: '0 auto 20px'
  }
};

export default PaymentPage;