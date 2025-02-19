import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

//Admin imports
import AdminSignup from "./pages/Admin/AdminSignup";
import AdminLogin from "./pages/Admin/AdminLogin";
import AddProduct from "./pages/Admin/AddProduct";
import ProductList from "./pages/Admin/ProductList";
import AdminDashboard from "./pages/Admin/AdminDashboard";

// Customer Imports
import UserSignup from "./pages/Customer/UserSignup";
import UserLogin from "./pages/Customer/UserLogin";
import CustProduct from "./pages/Customer/CustProductList";
import CustomerOrder from "./pages/Customer/CustomerOrder";
import ViewAllcart from "./pages/Customer/ViewAllcart";
import Profile from "./pages/Customer/Profile";
import Orderstatus from "./pages/Customer/OrderStatus";
import Myorders from "./pages/Customer/Myorders";

// Other Imports
import NavBarforuser from "./components/Navbarforuser";
import Home from "./components/Home";
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";
import { IoMdPower } from "react-icons/io";

const Layout = () => {
  const location = useLocation();

  // Hide navbar on login and signup pages
  const hideNavbar =
    location.pathname === "/user/Login" ||
    location.pathname === "/" ||
    location.pathname === "/user/signup" ||
    location.pathname === "/admin/signup";

  return (
    <>
      {!hideNavbar && <NavBarforuser />}
      <ToastContainer position="bottom-right" autoClose={1100} />
      <Routes>
        {/* Admin Routes */}
        <Route path="/" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/admin/ProductAdd" element={<AddProduct />} />
        <Route path="/admin/ProductList" element={<ProductList />} />
        <Route path="/admin/AdminDashboard" element={<AdminDashboard />} />

        {/* Customer Routes */}
        <Route path="/user/Login" element={<UserLogin />} />
        <Route path="/user/signup" element={<UserSignup />} />
        <Route path="/CustProductList" element={<CustProduct />} />
        <Route path="/CustomerOrder" element={<CustomerOrder />} />
        <Route path="/ViewAllcart" element={<ViewAllcart />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/Myorders" element={<Myorders />} />
        <Route path="/userorders" element={<Orderstatus />} />

        {/* Other Routes */}
        <Route path="/home" element={<Home />} />
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
