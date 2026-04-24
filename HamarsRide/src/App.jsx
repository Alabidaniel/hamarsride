import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
import LandingPage from '../pages/LandingPage';
import Login from '../pages/loginPage';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import ForgotPassword from '../pages/ForgotPassword';
import RestaurantsPage from '../pages/RestaurantsPage';
import RestaurantDetails from '../pages/RestaurantDetails';
import Profile from '../pages/Profile';
import Checkout from '../pages/CheckOut';
import Cart from '../pages/Cart';
import EditProfile from '../pages/EditProfile';
import Notifications from '../pages/Notifications';
import AddNewAddress from '../pages/AddNewAddress';
import OrderHistory from '../pages/OrderHistory';
import SavedAddresses from '../pages/SavedAddresses';
import DeliveredOrders from '../pages/DeliveredOrders';
import Payment from '../pages/Payment';
import AdminDashboard from '../pages/AdminDashboard';
import ChangePassword from '../pages/ChangePassword';
import PaymentSuccess from '../pages/PaymentSuccess';

export default function App() {
  return (
   <BrowserRouter>
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path='/Signup' element={<Signup />} />
      <Route path='/Login' element={<Login />} />
      <Route path='/Dashboard' element={<Dashboard />} />
      <Route path='/ForgotPassword' element={<ForgotPassword/>} />
      <Route path="/restaurants" element={<RestaurantsPage />} />
      <Route path='/restaurants/:id' element={<RestaurantDetails />} />
      <Route path="/shops" element={<RestaurantsPage />} />
      <Route path='/shops/:id' element={<RestaurantDetails />} />
      <Route path='/profile' element={<Profile />} />
      <Route path='/cart' element={<Cart />} />
      <Route path='/Checkout' element={<Checkout />} />
      <Route path='/EditProfile' element={<EditProfile />} />
      <Route path='/change-password' element={<ChangePassword />} />
      <Route path='/notifications' element={<Notifications />} />
      <Route path='/add-address' element={<AddNewAddress />} />
      <Route path='/order-history' element={<OrderHistory />} />
      <Route path='/saved-addresses' element={<SavedAddresses />} />
      <Route path='/delivered-orders' element={<DeliveredOrders />} />
      <Route path='/payment' element={<Payment />} />
      <Route path='/payment-success' element={<PaymentSuccess />} />
      <Route path='/admin-dashboard' element={<AdminDashboard />} />
    
    </Routes>
   </BrowserRouter>
  );
}
