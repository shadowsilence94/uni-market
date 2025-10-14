import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="header"
      >
        <div className="container">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="text-white">
              <motion.h1
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Uni-Market
              </motion.h1>
            </Link>
            
            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  type="search" 
                  placeholder="Search products & services..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', paddingRight: '3rem' }}
                />
                <button 
                  type="submit"
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                >
                  🔍
                </button>
              </div>
            </form>

            {/* Mobile: Search + User/Auth (always visible) */}
            <div className="md:hidden flex items-center space-x-2 flex-1 justify-center">
              <form onSubmit={handleSearch} className="flex-1 max-w-xs">
                <div style={{ position: 'relative' }}>
                  <input 
                    type="search" 
                    placeholder="Search..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', paddingRight: '2.5rem', fontSize: '0.875rem' }}
                  />
                  <button 
                    type="submit"
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    🔍
                  </button>
                </div>
              </form>
              
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <Link 
                    to="/profile" 
                    className="text-white text-xs whitespace-nowrap"
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(255,255,255,0.3)',
                      textDecoration: 'none'
                    }}
                  >
                    👤 {currentUser.name.split(' ')[0]}
                  </Link>
                  <button 
                    onClick={logout}
                    className="text-white text-xs"
                    style={{
                      background: '#6b7280',
                      padding: '0.4rem 0.7rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      fontWeight: '500'
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="text-white text-xs"
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      padding: '0.4rem 0.7rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(255,255,255,0.3)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      fontWeight: '500'
                    }}
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => setShowRegisterModal(true)}
                    className="text-white text-xs"
                    style={{
                      background: '#fbbf24',
                      color: '#1f2937',
                      padding: '0.4rem 0.7rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/" className="nav-btn">Home</Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/browse" className="nav-btn">Browse</Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/sell" className="nav-btn">Sell</Link>
              </motion.div>
              
              {currentUser ? (
                <div className="flex items-center space-x-3">
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Link to="/profile" className="nav-btn">
                      👤 {currentUser.name}
                      {currentUser.is_verified && <span style={{ marginLeft: '0.25rem' }}>✓</span>}
                    </Link>
                  </motion.div>
                  
                  {currentUser.role === 'admin' && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link to="/admin" className="btn btn-admin">
                        Admin
                      </Link>
                    </motion.div>
                  )}
                  
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    onClick={logout} 
                    className="btn logout-btn"
                  >
                    Logout
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowLoginModal(true)}
                    className="nav-btn"
                  >
                    Login
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowRegisterModal(true)} 
                    className="btn btn-secondary"
                  >
                    Register
                  </motion.button>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-white ml-4"
              style={{
                fontSize: '2rem',
                background: 'rgba(251, 191, 36, 0.2)',
                border: '2px solid #fbbf24',
                borderRadius: '0.5rem',
                padding: '0.25rem 0.5rem',
                fontWeight: 'bold'
              }}
            >
              {showMobileMenu ? '✕' : '☰'}
            </motion.button>
          </div>

          {/* Mobile Menu (Navigation only) */}
          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden pb-4 border-t border-white/20 mt-4 pt-4"
              >
                <div className="space-y-3">
                  <Link to="/" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)}>
                    🏠 Home
                  </Link>
                  <Link to="/browse" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)}>
                    🛒 Browse
                  </Link>
                  <Link to="/sell" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)}>
                    💰 Sell
                  </Link>
                  
                  {currentUser && currentUser.role === 'admin' && (
                    <Link to="/admin" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)}>
                      ⚙️ Admin Dashboard
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />

      <style jsx>{`
        .nav-btn {
          color: white;
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s;
          font-size: 0.875rem;
        }
        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
          color: #fbbf24;
        }
        .logout-btn {
          background: #6b7280 !important;
          color: white !important;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }
        .mobile-nav-link {
          display: block;
          color: white;
          text-decoration: none;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          transition: color 0.3s;
          background: none;
          border-left: none;
          border-right: none;
          border-top: none;
          cursor: pointer;
          font-size: 1rem;
        }
        .mobile-nav-link:hover {
          color: #fbbf24;
        }
      `}</style>
    </>
  );
};

export default Header;
