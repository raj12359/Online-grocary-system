import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiHome, FiUsers, FiBox, FiList, FiLayers, FiSettings, FiLogOut, FiMenu } from 'react-icons/fi';
import { logout, reset } from '../features/authSlice';

const AdminLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You do not have permission to view this page.</p>
          <Link to="/" className="btn-primary">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-dark text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-primary">Fresh<span className="text-secondary">Mart</span> Admin</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            <li>
              <Link to="/admin" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                <FiHome className="h-5 w-5 mr-3" /> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/products" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                <FiBox className="h-5 w-5 mr-3" /> Products
              </Link>
            </li>
            <li>
              <Link to="/admin/categories" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                <FiList className="h-5 w-5 mr-3" /> Categories
              </Link>
            </li>
            <li>
              <Link to="/admin/subcategories" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                <FiLayers className="h-5 w-5 mr-3" /> Sub Categories
              </Link>
            </li>
            <li>
              <Link to="/admin/offers" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                <FiBox className="h-5 w-5 mr-3" /> Offers
              </Link>
            </li>
            <li>
              <Link to="/admin/coupons" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                <FiList className="h-5 w-5 mr-3" /> Coupons
              </Link>
            </li>
            <li>
              <Link to="/admin/orders" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                <FiList className="h-5 w-5 mr-3" /> Orders
              </Link>
            </li>
            <li>
              <Link to="/admin/users" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                <FiUsers className="h-5 w-5 mr-3" /> Users
              </Link>
            </li>
            <li>
              <Link to="/admin/settings" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                <FiSettings className="h-5 w-5 mr-3" /> Settings
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center px-4 py-2 bg-gray-800 hover:bg-red-500 text-white rounded-lg transition-colors">
            <FiLogOut className="mr-2" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
          <button className="md:hidden text-gray-500 hover:text-gray-900 focus:outline-none">
            <FiMenu className="h-6 w-6" />
          </button>
          <div className="flex-1 flex justify-end">
            <Link to="/" className="text-sm font-medium text-primary hover:underline">View Store</Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
