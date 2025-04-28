import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.error || error.message;
    console.error('API Error:', errorMessage);
    return Promise.reject(errorMessage);
  }
);

// Delivery Endpoints
export const getDelivery = (id) => api.get(`/deliveries/${id}`);
export const getDriverDeliveries = (driverId) => api.get(`/deliveries/driver/${driverId}`);
export const updateDeliveryStatus = (deliveryId, status) => 
  api.patch(`/deliveries/${deliveryId}/status`, { status });

// Driver Endpoints
export const updateDriverLocation = (driverId, location) => 
  api.post(`/drivers/${driverId}/location`, location);

export const getAvailableDrivers = async () => {
  try {
    const response = await api.get('/drivers/available');
    return response.data;
  } catch (error) {
    console.error('Error fetching available drivers:', error);
    throw error;
  }
};
export const getCustomerDeliveries = async (customerId) => {
  try {
    const response = await api.get(`/deliveries/customer/${customerId}`);
    console.log('Full axios Response in api.js:', response); // Log the entire response
    return response; // Return the entire response object
  } catch (error) {
    console.error('Error fetching customer deliveries:', error);
    return { data: [] }; // Return an object with an empty data array on error
  }
};