import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import axios from 'axios';
import { API_BASE } from '../config';

const Header: React.FC<{ setHeaderHeight: (height: number) => void }> = ({ setHeaderHeight }) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const { currentUser, logout } = useAuth();
  const { showLoginModal, showRegisterModal, openLoginModal, closeLoginModal, openRegisterModal, closeRegisterModal } = useModal();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileCategoryMenu, setShowMobileCategoryMenu] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [categoryTags, setCategoryTags] = useState<Record<string, string[]>>({
    Products: [],
    Services: [],
    Food: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [headerRef, currentUser]);

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

  return (
    <>
      {/* Backdrop overlay when menu is open */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMobileMenu(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 99,
              backdropFilter: 'blur(2px)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Verification Banner for Unverified Users */}
      {currentUser && !currentUser.is_verified && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          color: '#78350f',
          padding: '0.75rem 1rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          fontWeight: '600',
          borderBottom: '2px solid #f59e0b',
          zIndex: 101
        }}>
          📧 Verify your email to unlock advanced features like chat and payments. Check your inbox! 
          <div className="verification-banner-button">
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
        </div>
      )}
      
      <motion.header 
        ref={headerRef}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="header"
        style={{
          top: currentUser && !currentUser.is_verified ? '48px' : '0',
        }}
      >
        <div className="container" style={{ position: 'relative' }}>
          <div className="flex items-center justify-between py-4 flex-wrap" style={{ gap: '1rem' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', minWidth: 'fit-content', flexShrink: 0 }}>
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
            </div>

            {/* Mobile Category Toggle Button - Will be positioned at right on mobile */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMobileCategoryMenu(!showMobileCategoryMenu)}
              className="mobile-category-toggle"
              style={{
                display: 'none', // Hidden on desktop
                padding: '0.5rem 1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                marginLeft: 'auto', // Push to right
              }}
            >
              {showMobileCategoryMenu ? '✕' : '☰'}
            </motion.button>

            {/* Category Buttons - Desktop only */}
            <div className="category-nav-desktop flex items-center gap-2 ml-4" style={{ flexShrink: 0 }}>
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
                    <span className="category-icon">📦</span> <span>Products</span>
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
                    <span className="category-icon">🛠️</span> <span>Services</span>
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
                    <span className="category-icon">🍜</span> <span>Food</span>
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
                    <span className="category-icon">ℹ️</span> <span>About Us</span>
                  </Link>
                                </motion.div>
                              </div>
                            
                            {/* Desktop User Menu Button */}
                            <div className="desktop-menu-button" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="flex items-center justify-center gap-2 hamburger-button"
                              >
                                <span className="hamburger-icon">{showMobileMenu ? '✕' : (currentUser ? '👤' : '🔑')}</span>
                                <span className="hamburger-text">
                                  {showMobileMenu ? 'Close' : (currentUser ? currentUser.name || 'Profile' : 'Login')}
                                </span>
                              </motion.button>
                            </div>

                            {/* Desktop Navigation - Hidden, replaced by hamburger */}
                            <nav className="hidden">
                              {/* User Section */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                
                                {/* Divider */}
                                {currentUser && (
                                  <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.3)' }}></div>
                                )}
                
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
                                      onClick={openLoginModal}
                                      className="nav-btn"
                                    >
                                      Login
                                    </motion.button>
                                    <motion.button 
                                      whileHover={{ scale: 1.05 }} 
                                      whileTap={{ scale: 0.95 }}
                                      onClick={openRegisterModal} 
                                      className="btn btn-secondary"
                                    >
                                      Register
                                    </motion.button>
                                  </div>
                                )}
                              </div>
                            </nav>
                          </div>

          {/* Mobile User Menu Float Button */}
          <div className="mobile-menu-button">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="flex items-center justify-center gap-2 hamburger-button"
            >
              <span className="hamburger-icon">{showMobileMenu ? '✕' : (currentUser ? '👤' : '🔑')}</span>
              <span className="hamburger-text">
                {showMobileMenu ? 'Close' : (currentUser ? currentUser.name || 'Profile' : 'Login')}
              </span>
            </motion.button>
          </div>

          {/* Mobile Category Menu Dropdown */}
          <AnimatePresence>
            {showMobileCategoryMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mobile-category-dropdown"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: '1rem',
                  marginTop: '0.5rem',
                  background: 'linear-gradient(135deg, #1a5f3f 0%, #15472e 100%)',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                  zIndex: 9999,
                  border: '2px solid rgba(251, 191, 36, 0.3)',
                  minWidth: '200px'
                }}
              >
                <div style={{ padding: '1rem' }} className="space-y-2">
                  {/* Products with tags */}
                  <div>
                    <Link 
                      to="/browse?category=Products" 
                      className="mobile-category-item"
                      onClick={() => setShowMobileCategoryMenu(false)}
                    >
                      📦 Products
                    </Link>
                    {categoryTags.Products.length > 0 && (
                      <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                        {categoryTags.Products.map(tag => (
                          <Link
                            key={tag}
                            to={`/browse?tag=${encodeURIComponent(tag)}`}
                            className="mobile-tag-item"
                            onClick={() => setShowMobileCategoryMenu(false)}
                            style={{
                              display: 'block',
                              padding: '0.5rem 0.75rem',
                              color: 'rgba(255,255,255,0.8)',
                              fontSize: '0.85rem',
                              textDecoration: 'none',
                              borderRadius: '0.375rem',
                              transition: 'all 0.2s'
                            }}
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Services with tags */}
                  <div>
                    <Link 
                      to="/browse?category=Services" 
                      className="mobile-category-item"
                      onClick={() => setShowMobileCategoryMenu(false)}
                    >
                      🛠️ Services
                    </Link>
                    {categoryTags.Services.length > 0 && (
                      <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                        {categoryTags.Services.map(tag => (
                          <Link
                            key={tag}
                            to={`/browse?tag=${encodeURIComponent(tag)}`}
                            className="mobile-tag-item"
                            onClick={() => setShowMobileCategoryMenu(false)}
                            style={{
                              display: 'block',
                              padding: '0.5rem 0.75rem',
                              color: 'rgba(255,255,255,0.8)',
                              fontSize: '0.85rem',
                              textDecoration: 'none',
                              borderRadius: '0.375rem',
                              transition: 'all 0.2s'
                            }}
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Food with tags */}
                  <div>
                    <Link 
                      to="/browse?category=Food" 
                      className="mobile-category-item"
                      onClick={() => setShowMobileCategoryMenu(false)}
                    >
                      🍜 Food
                    </Link>
                    {categoryTags.Food.length > 0 && (
                      <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                        {categoryTags.Food.map(tag => (
                          <Link
                            key={tag}
                            to={`/browse?tag=${encodeURIComponent(tag)}`}
                            className="mobile-tag-item"
                            onClick={() => setShowMobileCategoryMenu(false)}
                            style={{
                              display: 'block',
                              padding: '0.5rem 0.75rem',
                              color: 'rgba(255,255,255,0.8)',
                              fontSize: '0.85rem',
                              textDecoration: 'none',
                              borderRadius: '0.375rem',
                              transition: 'all 0.2s'
                            }}
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* About Us */}
                  <Link 
                    to="/about" 
                    className="mobile-category-item"
                    onClick={() => setShowMobileCategoryMenu(false)}
                  >
                    ℹ️ About Us
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hamburger Menu Dropdown - User Actions */}
          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="hamburger-menu-dropdown"
                style={{
                  position: 'fixed',
                  background: 'linear-gradient(135deg, #1a5f3f 0%, #15472e 100%)',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                  zIndex: 9998,
                  border: '2px solid rgba(251, 191, 36, 0.3)'
                }}
              >
                <div style={{ padding: '1rem' }} className="space-y-3">
                  {currentUser ? (
                    <>
                      {/* Profile */}
                      <Link 
                        to="/profile" 
                        className="hamburger-menu-item"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {currentUser.profile_picture ? (
                            <img 
                              src={currentUser.profile_picture} 
                              alt={currentUser.name}
                              style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '50%', 
                                objectFit: 'cover',
                                border: '2px solid white'
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: '2rem' }}>👤</span>
                          )}
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                              {currentUser.name}
                              {currentUser.is_verified && <span style={{ marginLeft: '0.25rem' }}>✓</span>}
                            </div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>View Profile</div>
                          </div>
                        </div>
                      </Link>
                      
                      {/* Divider */}
                      <div style={{ borderTop: '2px solid rgba(255,255,255,0.2)', margin: '0.5rem 0' }}></div>
                      
                      {/* Notifications */}
                      <Link 
                        to="/profile" 
                        className="hamburger-menu-item" 
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>🔔</span>
                            <span>Notifications</span>
                          </div>
                          {unreadCount > 0 && (
                            <span style={{
                              background: '#ef4444',
                              color: 'white',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold'
                            }}>
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </div>
                      </Link>
                      
                      {/* Sell */}
                      <Link 
                        to="/sell" 
                        className="hamburger-menu-item"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>💰</span>
                        Sell
                      </Link>
                      
                      {/* Admin Dashboard (if admin) */}
                      {currentUser.role === 'admin' && (
                        <Link 
                          to="/admin" 
                          className="hamburger-menu-item"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>⚙️</span>
                          Admin Dashboard
                        </Link>
                      )}
                      
                      {/* Divider */}
                      <div style={{ borderTop: '2px solid rgba(255,255,255,0.2)', margin: '0.5rem 0' }}></div>
                      
                      {/* Logout */}
                      <button 
                        onClick={() => {
                          logout();
                          setShowMobileMenu(false);
                        }}
                        className="hamburger-menu-item"
                        style={{ width: '100%', textAlign: 'left' }}
                      >
                        <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>⏻</span>
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Login Button */}
                      <button 
                        onClick={() => {
                          openLoginModal();
                          setShowMobileMenu(false);
                        }}
                        className="hamburger-menu-item"
                        style={{ width: '100%', textAlign: 'left' }}
                      >
                        <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>🔑</span>
                        Login
                      </button>
                      
                      {/* Register Button */}
                      <button 
                        onClick={() => {
                          openRegisterModal();
                          setShowMobileMenu(false);
                        }}
                        className="hamburger-menu-item"
                        style={{ width: '100%', textAlign: 'left' }}
                      >
                        <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>📝</span>
                        Register
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Old Mobile Menu - Hidden */}
          <AnimatePresence>
            {false && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="sm:hidden pb-4 border-t border-white/20 mt-4 pt-4"
              >
                <div className="space-y-3">
                  {/* Category Links */}
                  <Link to="/browse?category=Products" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)}>
                    📦 Products
                  </Link>
                  <Link to="/browse?category=Services" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)}>
                    🛠️ Services
                  </Link>
                  <Link to="/browse?category=Food" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)}>
                    🍜 Food
                  </Link>
                  <Link to="/about" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)}>
                    ℹ️ About Us
                  </Link>
                  
                  {/* Divider */}
                  <div style={{ borderTop: '2px solid rgba(255,255,255,0.2)', margin: '0.5rem 0' }}></div>
                  
                  {/* Notifications (only if logged in) */}
                  {currentUser && (
                    <Link to="/profile" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)} style={{ position: 'relative' }}>
                      🔔 Notifications
                      {unreadCount > 0 && (
                        <span style={{
                          position: 'absolute',
                          right: '0',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: '#ef4444',
                          color: 'white',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}>
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                  )}
                  
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
                      
                      {/* Divider */}
                      <div style={{ borderTop: '2px solid rgba(255,255,255,0.2)', margin: '0.5rem 0' }}></div>
                      
                      {/* Logout Button */}
                      <button 
                        onClick={() => {
                          logout();
                          setShowMobileMenu(false);
                        }}
                        className="mobile-nav-link"
                        style={{ width: '100%', textAlign: 'left' }}
                      >
                        ⏻ Logout
                      </button>
                    </>
                  )}
                  
                  {/* If not logged in, show Register button */}
                  {!currentUser && (
                    <button 
                      onClick={() => {
                        openRegisterModal();
                        setShowMobileMenu(false);
                      }}
                      className="mobile-nav-link"
                      style={{ width: '100%', textAlign: 'left' }}
                    >
                      📝 Register
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={closeLoginModal}
        onSwitchToRegister={() => {
          closeLoginModal();
          openRegisterModal();
        }}
      />
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={closeRegisterModal}
        onSwitchToLogin={() => {
          closeRegisterModal();
          openLoginModal();
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
        
        /* Hamburger Menu Item Styles */
        .hamburger-menu-item {
          display: flex;
          align-items: center;
          color: white;
          text-decoration: none;
          padding: 1rem;
          border-radius: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          width: 100%;
        }
        .hamburger-menu-item:hover {
          background: rgba(251, 191, 36, 0.3);
          border-color: #fbbf24;
          transform: translateX(5px);
        }
        
        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .nav-btn {
            padding: 0.4rem 0.75rem;
            font-size: 0.8rem;
          }
          .logout-btn {
            padding: 0.4rem 0.75rem;
            font-size: 0.8rem;
          }
        }
        
        @media (max-width: 768px) {
          .nav-btn {
            padding: 0.3rem 0.6rem;
            font-size: 0.75rem;
          }
          .logout-btn {
            padding: 0.3rem 0.6rem;
            font-size: 0.75rem;
          }
          .category-btn-full span {
            display: none;
          }
          .category-btn-full {
            padding: 0.4rem 0.6rem;
            font-size: 0.85rem;
          }
          .verification-banner-button {
            display: block;
            margin-top: 0.5rem;
          }
        }
        
        /* Default styling for hamburger button (Desktop/Tablet view) */
        .hamburger-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.5rem;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.3s;
          cursor: pointer;
        }
        .hamburger-button:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
          color: #fbbf24;
          transform: translateY(-2px);
        }
        .hamburger-icon {
          font-size: 1.25rem;
          display: none; /* Hide icon on desktop */
        }
        .hamburger-text {
          display: inline;
          font-weight: 600;
        }
        
        /* Category navigation styles */
        .category-icon {
          display: none; /* Hide icons on desktop */
        }
        
        .category-nav-desktop {
          display: flex; /* Show on desktop */
        }
        
        /* Mobile category toggle button - hidden on desktop */
        .mobile-category-toggle {
          display: none;
        }
        
        /* Mobile user menu button - hidden on desktop */
        .mobile-menu-button {
          display: none;
        }
        
        /* Desktop user menu button - visible on desktop */
        .desktop-menu-button {
          display: block;
        }
        
        /* Mobile category menu items */
        .mobile-category-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
          text-decoration: none;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 500;
        }
        .mobile-category-item:hover {
          background: rgba(251, 191, 36, 0.3);
          border-color: #fbbf24;
          transform: translateX(5px);
        }
        
        /* Mobile tag items */
        .mobile-tag-item:hover {
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
        }
        
        /* Desktop menu dropdown positioning */
        .hamburger-menu-dropdown {
          top: 80px;
          right: 1rem;
          min-width: 320px;
          max-width: 400px;
        }

        @media (max-width: 640px) {
          .nav-btn {
            padding: 0.25rem 0.5rem;
            font-size: 0.7rem;
          }
          .logout-btn {
            padding: 0.25rem 0.5rem;
            font-size: 0.7rem;
          }
          .category-btn-full {
            padding: 0.3rem 0.5rem;
            font-size: 0.8rem;
          }
        }

        @media (max-width: 768px) {
          /* Hide desktop category navigation on mobile */
          .category-nav-desktop {
            display: none !important;
          }
          
          /* Hide desktop user menu button on mobile */
          .desktop-menu-button {
            display: none !important;
          }
          
          /* Show mobile category toggle button */
          .mobile-category-toggle {
            display: block !important;
          }
          
          /* Show mobile user menu button as float */
          .mobile-menu-button {
            display: block !important;
            position: fixed !important;
            bottom: 2rem;
            left: 2rem;
            z-index: 100;
          }
          
          .hamburger-button {
            width: 60px;
            height: 60px;
            padding: 0;
            border-radius: 50%;
            background: linear-gradient(135deg, #1a5f3f, #15472e);
            border: 3px solid #fbbf24;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.3s;
          }
          
          .hamburger-button:hover {
            transform: scale(1.1);
            background: linear-gradient(135deg, #1a5f3f, #2d8659);
          }
          
          .hamburger-icon {
            font-size: 1.75rem;
            display: inline !important; /* Show icon on mobile */
          }
          
          /* Hide text on mobile */
          .hamburger-text {
            display: none !important;
          }
          
          /* Mobile menu dropdown positioning */
          .hamburger-menu-dropdown {
            bottom: 90px;
            left: 2rem;
            right: auto;
            top: auto;
            min-width: 320px;
            max-width: 400px;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
