import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

  return (
    <div className="App">
      <Router>
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
      </Router>
    </div>
  );
}

export default App;