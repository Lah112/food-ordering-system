import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';

// Create axios instance with default headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Payment service functions
export const createPaymentIntent = async (paymentData) => {
  try {
    const response = await api.post('/payments/create-payment-intent', paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const confirmPayment = async (paymentIntentId) => {
  try {
    const response = await api.post('/payments/confirm', { paymentIntentId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getPaymentByOrderId = async (orderId) => {
  try {
    const response = await api.get(`/payments/order/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};