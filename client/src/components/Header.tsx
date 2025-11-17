import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import axios from 'axios';
import { API_BASE } from '../config';

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [categoryTags, setCategoryTags] = useState<Record<string, string[]>>({
    Products: [],
    Services: [],
    Food: []
  });
  const navigate = useNavigate();

  // Fetch category tags
  useEffect(() => {
    fetchCategoryTags();
  }, []);

  const fetchCategoryTags = async () => {
    try {
      const [productsRes, servicesRes, foodRes] = await Promise.all([
        axios.get(`${API_BASE}/tags?category=Products`),
        axios.get(`${API_BASE}/tags?category=Services`),
        axios.get(`${API_BASE}/tags?category=Food`)
      ]);
      
      setCategoryTags({
        Products: productsRes.data,
        Services: servicesRes.data,
        Food: foodRes.data.length > 0 ? foodRes.data : ['Meals', 'Snacks', 'Beverages']
      });
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  // Fetch notifications
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      
      // Refresh when window gains focus
      const handleFocus = () => fetchNotifications();
      window.addEventListener('focus', handleFocus);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const response = await axios.get(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
      {/* Verification Banner for Unverified Users */}
      {currentUser && !currentUser.is_verified && (
        <div style={{
          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          color: '#78350f',
          padding: '0.75rem 1rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          fontWeight: '600',
          borderBottom: '2px solid #f59e0b'
        }}>
          📧 Verify your email to unlock advanced features like chat and payments. Check your inbox! 
          <button 
            onClick={() => window.location.href = '/profile'}
            style={{
              marginLeft: '1rem',
              padding: '0.25rem 0.75rem',
              background: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              color: '#1a5f3f',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Verify Now
          </button>
        </div>
      )}
      
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="header"
      >
        <div className="container">
          <div className="flex justify-between items-center py-4">
            {/* Logo + Category Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/" className="text-white" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <motion.img
                  src="/logo.png"
                  alt="Uni-Market Logo"
                  style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                <motion.h1
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  Uni-Market
                </motion.h1>
              </Link>

              {/* Category Buttons - Always visible with text and dropdowns */}
              <div className="flex items-center gap-2 ml-2 md:ml-4">
                {/* Products with Dropdown */}
                <motion.div 
                  className="category-dropdown-wrapper"
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={() => setOpenDropdown('Products')}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link 
                    to="/browse?category=Products"
                    className="category-btn-full"
                    title="Browse Products"
                  >
                    📦 <span>Products</span>
                  </Link>
                  <AnimatePresence>
                    {openDropdown === 'Products' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="category-dropdown"
                      >
                        {categoryTags.Products.map(tag => (
                          <Link
                            key={tag}
                            to={`/browse?tag=${encodeURIComponent(tag)}`}
                            className="category-dropdown-item"
                            onClick={() => setOpenDropdown(null)}
                          >
                            {tag}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Services with Dropdown */}
                <motion.div 
                  className="category-dropdown-wrapper"
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={() => setOpenDropdown('Services')}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link 
                    to="/browse?category=Services"
                    className="category-btn-full"
                    title="Browse Services"
                  >
                    🛠️ <span>Services</span>
                  </Link>
                  <AnimatePresence>
                    {openDropdown === 'Services' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="category-dropdown"
                      >
                        {categoryTags.Services.map(tag => (
                          <Link
                            key={tag}
                            to={`/browse?tag=${encodeURIComponent(tag)}`}
                            className="category-dropdown-item"
                            onClick={() => setOpenDropdown(null)}
                          >
                            {tag}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Food with Dropdown */}
                <motion.div 
                  className="category-dropdown-wrapper"
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={() => setOpenDropdown('Food')}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link 
                    to="/browse?category=Food"
                    className="category-btn-full"
                    title="Browse Food"
                  >
                    🍜 <span>Food</span>
                  </Link>
                  <AnimatePresence>
                    {openDropdown === 'Food' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="category-dropdown"
                      >
                        {categoryTags.Food.map(tag => (
                          <Link
                            key={tag}
                            to={`/browse?tag=${encodeURIComponent(tag)}`}
                            className="category-dropdown-item"
                            onClick={() => setOpenDropdown(null)}
                          >
                            {tag}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                
                {/* Divider */}
                <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.3)', margin: '0 0.5rem' }}></div>
                
                {/* About Us Button (no dropdown) */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/about"
                    className="category-btn-full"
                    title="About Us"
                  >
                    ℹ️ <span>About Us</span>
                  </Link>
                </motion.div>
              </div>
            </div>
            
            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  type="search" 
                  placeholder="Search here!!" 
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

            {/* Mobile: Right Side - Search, User, Menu */}
            <div className="md:hidden flex items-center gap-2">
              {/* Search Button Toggle */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                style={{
                  fontSize: '1.5rem',
                  background: showMobileSearch ? 'rgba(251, 191, 36, 0.5)' : 'rgba(251, 191, 36, 0.2)',
                  border: '2px solid #fbbf24',
                  borderRadius: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  color: 'white'
                }}
              >
                {showMobileSearch ? '✕' : '🔍'}
              </motion.button>
              
              {/* User/Auth Buttons - Floating style */}
              {currentUser ? (
                <div className="flex items-center gap-2">
                  {/* Notifications */}
                  <Link 
                    to="/profile"
                    style={{
                      fontSize: '1.2rem',
                      background: 'rgba(251, 191, 36, 0.2)',
                      border: '2px solid #fbbf24',
                      borderRadius: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      color: 'white',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      position: 'relative'
                    }}
                  >
                    🔔
                    {unreadCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        fontSize: '0.65rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  
                  {/* Profile */}
                  <Link 
                    to="/profile"
                    style={{
                      fontSize: '1.5rem',
                      background: 'rgba(251, 191, 36, 0.2)',
                      border: '2px solid #fbbf24',
                      borderRadius: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      color: 'white',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {currentUser.profile_picture ? (
                      <img 
                        src={currentUser.profile_picture} 
                        alt={currentUser.name}
                        style={{ 
                          width: '28px', 
                          height: '28px', 
                          borderRadius: '50%', 
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      '👤'
                    )}
                  </Link>
                  
                  <button 
                    onClick={logout}
                    style={{
                      fontSize: '1.5rem',
                      background: 'rgba(220, 38, 38, 0.2)',
                      border: '2px solid #dc2626',
                      borderRadius: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    ⏻
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    style={{
                      fontSize: '0.875rem',
                      background: 'rgba(251, 191, 36, 0.3)',
                      border: '2px solid #fbbf24',
                      borderRadius: '0.5rem',
                      padding: '0.25rem 0.75rem',
                      color: 'white',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => setShowRegisterModal(true)}
                    style={{
                      fontSize: '0.875rem',
                      background: '#fbbf24',
                      border: '2px solid #fbbf24',
                      borderRadius: '0.5rem',
                      padding: '0.25rem 0.75rem',
                      color: '#1a5f3f',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Join
                  </button>
                </div>
              )}
              
              {/* Mobile Menu Button (Navigation) */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                style={{
                  fontSize: '1.5rem',
                  background: 'rgba(251, 191, 36, 0.2)',
                  border: '2px solid #fbbf24',
                  borderRadius: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}
              >
                {showMobileMenu ? '✕' : '☰'}
              </motion.button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {/* Main Navigation Links */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/" className="nav-btn">Home</Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/browse" className="nav-btn">Browse</Link>
              </motion.div>
              
              {currentUser && (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/sell" className="nav-btn">Sell</Link>
                  </motion.div>
                  
                  {currentUser.role === 'admin' && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link to="/admin" className="nav-btn">Admin Dashboard</Link>
                    </motion.div>
                  )}
                </>
              )}

              {/* User Section - Right Side */}
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '1rem', marginLeft: '1rem' }}>
                {currentUser ? (
                  <div className="flex items-center space-x-3">
                    {/* Notifications */}
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      style={{ position: 'relative' }}
                      onMouseEnter={() => setShowNotifications(true)}
                      onMouseLeave={() => setShowNotifications(false)}
                    >
                      <button
                        className="nav-btn"
                        style={{ position: 'relative', padding: '0.5rem 0.75rem' }}
                      >
                        🔔
                        {unreadCount > 0 && (
                          <span style={{
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            background: '#ef4444',
                            color: 'white',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            fontSize: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold'
                          }}>
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </button>
                      
                      {/* Notifications Dropdown */}
                      <AnimatePresence>
                        {showNotifications && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{
                              position: 'absolute',
                              top: 'calc(100% + 0.5rem)',
                              right: 0,
                              background: 'white',
                              borderRadius: '0.5rem',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                              minWidth: '300px',
                              maxWidth: '350px',
                              maxHeight: '400px',
                              overflowY: 'auto',
                              zIndex: 9999
                            }}
                          >
                            <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                                Notifications
                              </h3>
                            </div>
                            {notifications.length === 0 ? (
                              <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                No notifications
                              </div>
                            ) : (
                              notifications.slice(0, 10).map((notif) => (
                                <div
                                  key={notif.id}
                                  style={{
                                    padding: '1rem',
                                    borderBottom: '1px solid #f3f4f6',
                                    background: notif.read ? 'white' : '#f0fdf4',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => {
                                    setShowNotifications(false);
                                    navigate('/profile');
                                  }}
                                >
                                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                                    {notif.title}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                    {notif.message}
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                    {new Date(notif.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              ))
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Profile */}
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Link to="/profile" className="nav-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {currentUser.profile_picture ? (
                          <img 
                            src={currentUser.profile_picture} 
                            alt={currentUser.name}
                            style={{ 
                              width: '30px', 
                              height: '30px', 
                              borderRadius: '50%', 
                              objectFit: 'cover',
                              border: '2px solid white'
                            }}
                          />
                        ) : (
                          <span>👤</span>
                        )}
                        {currentUser.name}
                        {currentUser.is_verified && <span style={{ marginLeft: '0.25rem' }}>✓</span>}
                      </Link>
                    </motion.div>
                    
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
              </div>
            </nav>
          </div>

          {/* Mobile Search Box */}
          <AnimatePresence>
            {showMobileSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden pb-4 border-t border-white/20 mt-4 pt-4"
              >
                <form onSubmit={handleSearch} className="w-full">
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input 
                      type="search" 
                      placeholder="Search here!!" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '0.75rem 3rem 0.75rem 1rem',
                        borderRadius: '0.5rem',
                        border: '2px solid #fbbf24',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '1rem'
                      }}
                    />
                    <button 
                      type="submit"
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '1.5rem'
                      }}
                    >
                      🔍
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

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
                  <Link to="/about" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)}>
                    ℹ️ About Us
                  </Link>
                  
                  {currentUser && (
                    <>
                      <Link to="/sell" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)}>
                        💰 Sell
                      </Link>
                      
                      {currentUser.role === 'admin' && (
                        <Link to="/admin" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)}>
                          ⚙️ Admin Dashboard
                        </Link>
                      )}
                    </>
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

      <style>{`
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
        
        .mobile-search-input {
          width: 100%;
          padding-right: 2.5rem;
          font-size: 0.875rem;
          margin-right: 0.75rem;
        }
        
        .mobile-search-button {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: white;
          cursor: pointer;
        }
        
        .mobile-user-button {
          background: rgba(255,255,255,0.15);
          padding: 0.4rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(255,255,255,0.3);
          text-decoration: none;
          color: white;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 2rem;
          height: 2rem;
        }
        
        .mobile-logout-button {
          background: #6b7280;
          padding: 0.4rem;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          color: white;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 2rem;
          height: 2rem;
        }
        
        .mobile-auth-button {
          background: rgba(255,255,255,0.2);
          padding: 0.3rem 0.5rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(255,255,255,0.3);
          cursor: pointer;
          color: white;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
        }
        
        .mobile-register-button {
          background: #fbbf24;
          color: #1f2937;
          border: none;
          font-weight: 600;
        }
        
        @media (max-width: 480px) {
          .mobile-auth-button {
            padding: 0.25rem 0.4rem;
            font-size: 0.7rem;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
