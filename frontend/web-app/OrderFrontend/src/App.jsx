// frontend/order/src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RestaurantPage from './pages/RestaurantPage';
import OrdersPage from './pages/OrdersPage';
import AdminPage from './pages/AdminPage';
import PaymentPage from './components/PaymentPage';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) setUser(storedUser);
  }, []);

  return (
    <div style={styles.app}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage user={user} setUser={setUser} />} />
          <Route path="/restaurants/:id" element={<RestaurantPage user={user} />} />
          <Route path="/my-orders" element={<OrdersPage user={user} />} />
          <Route path="/admin" element={<AdminPage user={user} />} />
          <Route path="/mock-payment" element={<PaymentPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

const styles = {
  app: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  }
};

export default App;