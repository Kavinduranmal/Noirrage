// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Customer Pages
import UserSignup from "./pages/Customer/UserSignup";
import UserLogin from "./pages/Customer/UserLogin";
import CustProduct from "./pages/Customer/CustProductList";
import CustomerOrder from "./pages/Customer/CustomerOrder";
import ViewAllcart from "./pages/Customer/ViewAllcart";
import Profile from "./pages/Customer/Profile";
import Orderstatus from "./pages/Customer/OrderStatus";

// Other Components/Pages
import NavBarforuser from "./components/Navbarforuser";
import Home from "./components/Home";
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";

// Stripe Components
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./pages/Customer/PaymentForm";

// Replace with your actual publishable key
const stripePromise = loadStripe("pk_test_51QvbnMRqDKD7gCFBoXQPbCKeKKaWNneQKpfcTMa0nKiC6dsUTO9Y4ilSLBPu74BJFDeXltxYMGwGYppzdo7m2tBx0027lVqT11");

// Layout component for common routes and navbar logic
const Layout = () => {
  const location = useLocation();
  // Hide navbar on login and signup pages
  const hideNavbar =
    location.pathname === "/user/Login" || location.pathname === "/user/signup";

  return (
    <>
      {!hideNavbar && <NavBarforuser />}
      <ToastContainer position="bottom-right" autoClose={1100} />
      <Routes>
        {/* Customer Routes */}
        <Route path="/user/Login" element={<UserLogin />} />
        <Route path="/user/signup" element={<UserSignup />} />
        <Route path="/CustProductList" element={<CustProduct />} />
        <Route path="/CustomerOrder" element={<CustomerOrder />} />
        <Route path="/ViewAllcart" element={<ViewAllcart />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/userorders" element={<Orderstatus />} />

        {/* Stripe Checkout Route */}
        <Route
          path="/checkout"
          element={
            <Elements stripe={stripePromise}>
              <CheckoutForm />
            </Elements>
          }
        />

        {/* Other Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/ContactUs" element={<ContactUs />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <Layout />
    </Router>
  );
};

export default App;
