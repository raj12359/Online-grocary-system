import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductsManagement from './pages/admin/ProductsManagement';
import CategoriesManagement from './pages/admin/CategoriesManagement';
import SubCategoriesManagement from './pages/admin/SubCategoriesManagement';
import OrdersManagement from './pages/admin/OrdersManagement';
import UsersManagement from './pages/admin/UsersManagement';
import OffersManagement from './pages/admin/OffersManagement';
import CouponsManagement from './pages/admin/CouponsManagement';
import DeliveryLayout from './layouts/DeliveryLayout';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import ProfileLayout from './layouts/ProfileLayout';
import ProfileDashboard from './pages/profile/ProfileDashboard';
import PersonalInfo from './pages/profile/PersonalInfo';
import Addresses from './pages/profile/Addresses';
import MyOrders from './pages/profile/MyOrders';
import OrderDetails from './pages/profile/OrderDetails';
import Settings from './pages/profile/Settings';
import Invoice from './pages/Invoice';
import Contact from './pages/cms/Contact';
import About from './pages/cms/About';
import FAQ from './pages/cms/FAQ';
import PrivacyPolicy from './pages/cms/PrivacyPolicy';
import Terms from './pages/cms/Terms';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="offers" element={<Shop offersOnly={true} />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="invoice/:id" element={<Invoice />} />
          
          {/* CMS Routes */}
          <Route path="contact" element={<Contact />} />
          <Route path="about" element={<About />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<Terms />} />
          
          {/* User Profile Routes */}
          <Route path="profile" element={<ProfileLayout />}>
            <Route index element={<ProfileDashboard />} />
            <Route path="info" element={<PersonalInfo />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="settings" element={<Settings />} />
            {/* Other profile routes will go here */}
          </Route>
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsManagement />} />
          <Route path="categories" element={<CategoriesManagement />} />
          <Route path="subcategories" element={<SubCategoriesManagement />} />
          <Route path="offers" element={<OffersManagement />} />
          <Route path="coupons" element={<CouponsManagement />} />
          <Route path="orders" element={<OrdersManagement />} />
          <Route path="users" element={<UsersManagement />} />
        </Route>

        {/* Delivery Routes */}
        <Route path="/delivery" element={<DeliveryLayout />}>
          <Route index element={<DeliveryDashboard />} />
          <Route path="orders" element={<DeliveryDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
