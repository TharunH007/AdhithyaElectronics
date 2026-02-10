import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import ShippingScreen from './screens/ShippingScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import AdminRoute from './components/AdminRoute';
import ProductListScreen from './screens/admin/ProductListScreen';
import ProductEditScreen from './screens/admin/ProductEditScreen';
import OrderListScreen from './screens/admin/OrderListScreen';
import DashboardScreen from './screens/admin/DashboardScreen';
import CustomerListScreen from './screens/admin/CustomerListScreen';
import CustomerDetailScreen from './screens/admin/CustomerDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import SearchScreen from './screens/SearchScreen';
import AboutScreen from './screens/AboutScreen';
import FAQScreen from './screens/FAQScreen';
import TermsScreen from './screens/TermsScreen';
import ReturnPolicyScreen from './screens/ReturnPolicyScreen';
import ReturnListScreen from './screens/admin/ReturnListScreen';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Header />
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/about" element={<AboutScreen />} />
            <Route path="/faq" element={<FAQScreen />} />
            <Route path="/terms" element={<TermsScreen />} />
            <Route path="/return-policy" element={<ReturnPolicyScreen />} />
            <Route path="/search/:keyword" element={<SearchScreen />} />
            <Route path="/category/:category" element={<SearchScreen />} />
            <Route path="/category/:category/search/:keyword" element={<SearchScreen />} />
            <Route path="/search" element={<SearchScreen />} />
            <Route path="/product/:id" element={<ProductScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/verify-email/:token" element={<EmailVerificationScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/reset-password/:token" element={<ResetPasswordScreen />} />
            <Route path="/shipping" element={<ShippingScreen />} />
            <Route path="/placeorder" element={<PlaceOrderScreen />} />
            <Route path="/order/:id" element={<OrderScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route path="dashboard" element={<DashboardScreen />} />
              <Route path="productlist" element={<ProductListScreen />} />
              <Route path="product/:id/edit" element={<ProductEditScreen />} />
              <Route path="orderlist" element={<OrderListScreen />} />
              <Route path="returns" element={<ReturnListScreen />} />
              <Route path="customers" element={<CustomerListScreen />} />
              <Route path="customers/:id" element={<CustomerDetailScreen />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
