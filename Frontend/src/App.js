// App.js
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Customer Pages
import UserSignup from "./pages/Customer/UserSignup";
import UserLogin from "./pages/Customer/UserLogin";
import CustProduct from "./pages/Customer/CustProductList";
import CustomerOrder from "./pages/Customer/CustomerDirectOrderForm";
import ViewAllcart from "./pages/Customer/ViewAllcart";
import Profile from "./pages/Customer/Profile";
import Orderstatus from "./pages/Customer/MyOrders";
import AddToCartOrderForm from "./pages/Customer/AddToCartOrderForm";
// Other Components/Pages
import NavBarforuser from "./components/Navbarforuser";
import Home from "./components/Home";
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";
import Footer from "./components/Footer";
import TermsPage from "./components/TermsPage";
import PrivacyPage from "./components/PrivacyPage";
import RefundPage from "./components/RefundPage";
import PaymentSuccess from "./components/Payment/PaymentSuccess";
import PaymentCancel from "./components/Payment/PaymentCancel";

// Layout component for common routes and navbar logic
// Layout component for common routes and navbar logic
const Layout = () => {
  const location = useLocation();

  const hideNavBar =
    location.pathname === "/user/Login" || location.pathname === "/user/signup";

  const showFooter =
    location.pathname === "/" ||
    location.pathname === "/CustProductList" ||
    location.pathname === "/AboutUs" ||
    location.pathname === "/ContactUs" ||
    location.pathname === "/privacy" ||
    location.pathname === "/refund" ||
    location.pathname === "/terms";

  return (
    <>
      {!hideNavBar && <NavBarforuser />}
      <ToastContainer
        position="top-right"
        autoClose={1100}
        toastStyle={{
          backgroundColor: "#111",
          color: "#fff",
          borderRadius: "8px",
          fontFamily: "'Raleway', sans-serif",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.6)",
          padding: "16px",
        }}
      />

      <Routes>
        {/* Customer Routes */}
        <Route path="/user/Login" element={<UserLogin />} />
        <Route path="/user/signup" element={<UserSignup />} />
        <Route path="/CustProductList" element={<CustProduct />} />
        <Route path="/CustomerOrder" element={<CustomerOrder />} />
        <Route path="/ViewAllcart" element={<ViewAllcart />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/userorders" element={<Orderstatus />} />
        <Route path="/AddToCartOrderForm" element={<AddToCartOrderForm />} />

        {/* Other Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/ContactUs" element={<ContactUs />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/refund" element={<RefundPage />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />
      </Routes>
      {showFooter && <Footer />}
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
