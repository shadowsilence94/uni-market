import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import AdminDashboard from './pages/AdminDashboard';
import SellPage from './pages/SellPage';
import ProfilePage from './pages/ProfilePage';
import ProductDetailPage from './pages/ProductDetailPage';
import HelpCenter from './pages/HelpCenter';
import SafetyGuidelines from './pages/SafetyGuidelines';
import AboutUs from './pages/AboutUs';
import EmailVerification from './pages/EmailVerification';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/safety" element={<SafetyGuidelines />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
              <Route path="/sell" element={<SellPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/item/:id" element={<ProductDetailPage />} />
            </Routes>
          </main>
          <Footer />
          <ChatWidget />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
