import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';

// Inline placeholder implementations of screens to ensure it builds out of the box
const HomeScreen = () => <div className="p-6"><h1 className="text-2xl font-bold">Welcome to MERN Shop</h1><p className="mt-2 text-gray-600">Browse our unique collections.</p></div>;
const LoginScreen = () => <div className="p-6"><h1 className="text-2xl font-bold">Login</h1></div>;
const CartScreen = () => <div className="p-6"><h1 className="text-2xl font-bold">Shopping Cart</h1></div>;

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomeScreen />} exact />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/cart" element={<CartScreen />} />
          </Routes>
        </main>
        <footer className="bg-gray-800 text-white text-center py-4 text-sm">
          &copy; {new Date().getFullYear()} MERN eCommerce Portfolio Project.
        </footer>
      </div>
    </Router>
  );
}

export default App;
