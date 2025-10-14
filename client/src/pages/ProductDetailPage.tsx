import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

interface Item {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  views: number;
  created_at: string;
  updated_at: string;
  image_url?: string;
  seller?: {
    id: number;
    name: string;
    email: string;
    is_verified: boolean;
    nationality: string;
  };
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/items/${id}`);
      setItem(response.data);
    } catch (err) {
      setError('Item not found');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleContactClick = () => {
    if (!currentUser) {
      setShowLoginModal(true);
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <div className="spinner"></div>
      </motion.div>
    );
  }

  if (error || !item) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="error">
          {error || 'Item not found'}
        </div>
        <Link to="/browse" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Browse
        </Link>
      </motion.div>
    );
  }

  const isEdited = item.updated_at && item.created_at && item.updated_at !== item.created_at;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <img
              src={item.image_url || 'https://via.placeholder.com/600x400?text=No+Image'}
              alt={item.title}
              style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '1rem' }}
            />
          </motion.div>

          {/* Details */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="admin-card"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ marginBottom: '1rem' }}
            >
              <span style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                borderRadius: '9999px',
                background: item.category === 'Products' ? '#dcfce7' : '#dbeafe',
                color: item.category === 'Products' ? '#166534' : '#1e40af'
              }}>
                {item.category}
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}
            >
              {item.title}
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="price" 
              style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}
            >
              ฿{(item.price * 35).toFixed(0)}
            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              style={{ color: '#6b7280', fontSize: '1.125rem', lineHeight: '1.6', marginBottom: '1.5rem' }}
            >
              {item.description}
            </motion.p>

            {/* Tags */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}
            >
              {item.tags?.map((tag, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#f3f4f6',
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    borderRadius: '9999px',
                    fontWeight: '500'
                  }}
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>

            {/* Timestamps */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}
            >
              <div className="timestamp" style={{ fontSize: '0.875rem' }}>
                Posted: {formatDate(item.created_at)}
              </div>
              {isEdited && (
                <div className="timestamp" style={{ fontSize: '0.875rem' }}>
                  Edited: {formatDate(item.updated_at)}
                </div>
              )}
              <div className="timestamp" style={{ fontSize: '0.875rem' }}>
                Views: {item.views}
              </div>
            </motion.div>

            {/* Seller Info */}
            {item.seller && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                style={{ 
                  padding: '1.5rem', 
                  background: '#f9fafb', 
                  borderRadius: '0.5rem',
                  marginBottom: '1.5rem'
                }}
              >
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
                  Seller Information
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    background: 'linear-gradient(135deg, #1a5f3f, #2d8659)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.25rem'
                  }}>
                    {item.seller.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                        {currentUser ? item.seller.name : 'Login to see seller name'}
                      </span>
                      {item.seller.is_verified && (
                        <span style={{ color: '#10b981', fontSize: '1.25rem' }}>✓</span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {item.seller.nationality}
                    </span>
                  </div>
                </div>
                
                {currentUser ? (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Contact:</p>
                    <p style={{ fontSize: '1rem', fontWeight: '500', color: '#1f2937' }}>
                      {item.seller.email}
                    </p>
                  </div>
                ) : (
                  <div style={{ 
                    padding: '1rem', 
                    background: '#fef3c7', 
                    border: '1px solid #f59e0b', 
                    borderRadius: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <p style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '0.5rem' }}>
                      🔒 Login required to see contact information
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="flex gap-4"
            >
              {currentUser ? (
                <>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary" 
                    style={{ flex: 1 }}
                  >
                    Contact Seller
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-secondary"
                  >
                    Add to Favorites
                  </motion.button>
                </>
              ) : (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleContactClick}
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                >
                  Login to Contact Seller
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Login/Register Modals */}
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
    </>
  );
};

export default ProductDetailPage;
