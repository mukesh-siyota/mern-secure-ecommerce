import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import AuthPage from './pages/AuthPage.jsx';
import CartPage from './pages/CartPage.jsx';
import ProductCatalog from './pages/ProductCatalog.jsx';
import ProductDetails from './pages/ProductDetails.jsx';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<ProductCatalog />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/product/:id" element={<ProductDetails />} />
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
