import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import LoadingSpinner from './components/LoadingSpinner';

const Driverlogin = lazy(() => import('./components/driverLogin'));
const CustomerLandingPage = lazy(() => import('./components/CustomerLandingPage'));
const DriverLandingPage = lazy(() => import('./components/DriverLandingPage'));
const CustomerApp = lazy(() => import('./components/CustomerApp'));
const DriverApp = lazy(() => import('./components/DriverApp'));

export default function App() {
  return (
    <SocketProvider>
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          <Route path="/" element={<Driverlogin />} />
          <Route path="/customer" element={<CustomerLandingPage />} />
          <Route path="/driver" element={<DriverLandingPage />} />
          <Route path="/track/:deliveryId" element={<CustomerApp />} />
          <Route path="/driver/:driverId" element={<DriverApp />} />
        </Routes>
      </Suspense>
    </SocketProvider>
  );
}
