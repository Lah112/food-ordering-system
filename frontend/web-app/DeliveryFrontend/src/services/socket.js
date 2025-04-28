import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

let socket;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true
    });
  }
  return socket;
};

export const joinDeliveryRoom = (deliveryId) => {
  if (socket) socket.emit('joinDeliveryRoom', deliveryId);
};

export const sendLocationUpdate = (deliveryId, location) => {
  if (socket) socket.emit('driverLocationUpdate', { deliveryId, location });
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};