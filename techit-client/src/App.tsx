import React, { useEffect, useState } from "react";
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import store from './store/store';
import "./App.css";
import "react-toastify/dist/ReactToastify.css";

import Login from "./components/Login";
import Home from "./components/Home";
import Register from "./components/Register";
import Profile from "./components/Profile";
import PageNotFound from "./components/PageNotFound";
import Products from "./components/Products";
import ProductDetails from "./components/ProductDetails";
import Cart from "./components/Cart";
import About from "./components/About";
import Favorites from "./components/Favorites";

function App() {
  const [isAdmin, setIsAdmin] = useState<boolean>();
  
  useEffect(() => {
    // בדיקת הרשאות משתמש בעת טעינת האפליקציה
    try {
      if (localStorage.getItem("token")) {
        // ניתן להוסיף כאן לוגיקה נוספת
      }
    } catch (error) {
      // טיפול שקט בשגיאות
      localStorage.removeItem("token");
    }
  }, []);

  // Set the main content ID for accessibility
  useEffect(() => {
    document.body.setAttribute('dir', 'rtl');
    document.body.setAttribute('lang', 'he');
  }, []);

  return (
    <Provider store={store}>
      <div className="App" role="application" aria-label="TechIt - אפליקציית חנות טכנולוגיה">
        <Router>
          <main id="main-content" role="main">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/home" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:productId" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </main>
        </Router>
        
        {/* Toast notifications with accessibility */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={true}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          role="alert"
          aria-live="polite"
          aria-label="הודעות מערכת"
        />
        
        {/* Live region for dynamic content announcements */}
        <div 
          id="live-region" 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
        ></div>
      </div>
    </Provider>
  );
}

export default App;