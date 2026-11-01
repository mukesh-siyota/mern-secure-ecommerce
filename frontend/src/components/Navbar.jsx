import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice.js';
import { ShoppingCart, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <nav className="bg-white shadow-md border-b border-gray-100">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-indigo-600">
          MERN_SHOP
        </Link>
        <div className="flex items-center space-x-6">
          <Link to="/cart" className="relative flex items-center text-gray-600 hover:text-indigo-600 transition">
            <ShoppingCart className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline">Cart</span>
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.reduce((acc, item) => acc + item.qty, 0)}
              </span>
            )}
          </Link>
          {userInfo ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Hi, {userInfo.name}</span>
              <button
                onClick={() => dispatch(logout())}
                className="flex items-center text-gray-600 hover:text-red-500 transition text-sm"
              >
                <LogOut className="w-4 h-4 mr-1" /> Log Out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="flex items-center text-gray-600 hover:text-indigo-600 transition">
                <User className="w-5 h-5 mr-1" /> Login
              </Link>
              <Link to="/register" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
