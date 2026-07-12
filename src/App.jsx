import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import Layout from './components/Layout';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Services from './pages/Services';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import { FAQ, Contact, Terms, Privacy, Refund, Blog, NotFound } from './pages/StaticPages';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* صفحة الدخول بدون هيدر/فوتر */}
        <Route path="/auth" element={<Auth />} />
        {/* باقي الصفحات داخل Layout */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/services" element={<Layout><Services /></Layout>} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/wallet" element={<Layout><Wallet /></Layout>} />
        <Route path="/faq" element={<Layout><FAQ /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/terms" element={<Layout><Terms /></Layout>} />
        <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
        <Route path="/refund" element={<Layout><Refund /></Layout>} />
        <Route path="/blog" element={<Layout><Blog /></Layout>} />
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </AuthProvider>
  );
}
