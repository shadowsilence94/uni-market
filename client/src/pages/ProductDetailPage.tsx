import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';
import { API_BASE } from '../config';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/CheckoutForm';

const stripePromise = loadStripe('your_stripe_publishable_key'); // Replace with your key

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
  sellerId?: number;
  seller?: {
    id: number;
    name: string;
    email: string;
    is_verified: boolean;
    nationality: string;
    profile_picture?: string;
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
  const [isFavorite, setIsFavorite] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    fetchItem();
    checkIfFavorite();
    incrementViewCount();
  }, [id, currentUser]);

  const handleBuyNowClick = async () => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    if (!item) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE}/create-payment-intent`,
        {
          amount: item.price * 100, // Amount in cents
          currency: 'thb',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setClientSecret(response.data.clientSecret);
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      alert('Error initiating payment. Please try again.');
    }
  };

  const incrementViewCount = async () => {
    if (!id) return;
    
    // Check if this user has already viewed this item in this session
    const viewedItems = JSON.parse(sessionStorage.getItem('viewedItems') || '[]');
    const itemIdNum = parseInt(id);
    
    if (viewedItems.includes(itemIdNum)) {
      // Already viewed in this session, don't increment
      return;
    }
    
    try {
      await axios.post(`${API_BASE}/items/${id}/view`);
      
      // Mark as viewed in this session
      viewedItems.push(itemIdNum);
      sessionStorage.setItem('viewedItems', JSON.stringify(viewedItems));
      
      // Update the item views in state
      setItem(prevItem => prevItem ? { ...prevItem, views: (prevItem.views || 0) + 1 } : null);
    } catch (err) {
      console.error('Failed to increment view count:', err);
    }
  };

  const fetchItem = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/items/${id}`);
      setItem(response.data);
    } catch (err) {
      console.error('Failed to fetch item:', err);
      setError('Item not found');
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = () => {
    if (currentUser && id) {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favorites.includes(parseInt(id)));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleContactClick = () => {
    if (!currentUser) {
      setShowLoginModal(true);
    } else if (!currentUser.is_verified) {
      alert('⚠️ Please verify your email before contacting sellers. Check your inbox for the verification link.');
    } else {
      // Create/open conversation with seller
      handleContactSeller();
    }
  };

  const handleContactSeller = async () => {
    if (!item || !currentUser) return;
    
    // Get seller ID from either sellerId or seller.id
    const sellerId = item.sellerId || item.seller?.id;
    
    if (!sellerId) {
      alert('Unable to contact seller. Seller information is missing.');
      console.error('Item structure:', item);
      return;
    }
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Creating conversation:', {
        item_id: item.id,
        seller_id: sellerId,
        item_title: item.title
      });
      
      // Create conversation
      const response = await axios.post(`${API_BASE}/conversations`, {
        item_id: item.id,
        seller_id: sellerId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Conversation created:', response.data);
      setActionSuccess('✅ Conversation started! Check the chat widget at the bottom-right to send a message.');
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      console.error('Failed to start conversation:', err);
      console.error('Error response:', err.response?.data);
      alert(err.response?.data?.message || 'Failed to start conversation. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFavorite = () => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const itemId = parseInt(id!);
    
    if (isFavorite) {
      const newFavorites = favorites.filter((fav: number) => fav !== itemId);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      setIsFavorite(false);
      setActionSuccess('Removed from favorites');
    } else {
      favorites.push(itemId);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
      setActionSuccess('Added to favorites');
    }
    
    setTimeout(() => setActionSuccess(null), 3000);
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
              ฿{((item.price || 0) * 35).toFixed(0)}
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
                  <img
                    src={item.seller.profile_picture || '/logo.png'}
                    alt={item.seller.name}
                    style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
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
              className="flex gap-4 action-buttons"
            >
              {currentUser ? (
                <>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleContactClick}
                    className="btn btn-primary action-button" 
                    style={{ flex: 1 }}
                    disabled={item?.seller?.id === currentUser.id}
                  >
                    {item?.seller?.id === currentUser.id ? 'Your Item' : 'Contact Seller'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBuyNowClick}
                    className="btn btn-secondary action-button"
                    style={{ flex: 1 }}
                    disabled={item?.seller?.id === currentUser.id}
                  >
                    Buy Now
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggleFavorite}
                    className="btn btn-secondary action-button"
                    style={{
                      background: isFavorite ? '#fbbf24' : undefined,
                      color: isFavorite ? 'white' : undefined
                    }}
                  >
                    {isFavorite ? '★ Favorited' : '☆ Add to Favorites'}
                  </motion.button>
                </>
              ) : (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleContactClick}
                  className="btn btn-primary action-button" 
                  style={{ flex: 1 }}
                >
                  Login to Contact Seller
                </motion.button>
              )}
            </motion.div>

            {/* Success Message */}
            {actionSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: '#d1fae5',
                  border: '1px solid #10b981',
                  borderRadius: '0.5rem',
                  color: '#065f46',
                  textAlign: 'center'
                }}
              >
                ✓ {actionSuccess}
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Contact Seller Modal */}
      {showContactModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setShowContactModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
              Contact Seller
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Send a message to <strong>{item?.seller?.name}</strong> about this item.
            </p>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Hi, I'm interested in this item. Is it still available?"
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                marginBottom: '1rem',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleContactSeller}
                disabled={!contactMessage.trim() || actionLoading}
                className="btn btn-primary"
                style={{ flex: 1, opacity: (!contactMessage.trim() || actionLoading) ? 0.5 : 1 }}
              >
                {actionLoading ? 'Sending...' : 'Send Message'}
              </button>
              <button
                onClick={() => {
                  setShowContactModal(false);
                  setContactMessage('');
                }}
                className="btn"
                style={{ background: '#e5e7eb', color: '#374151' }}
              >
                Cancel
              </button>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem' }}>
              💡 The seller will be notified via email and can contact you directly.
            </p>
          </motion.div>
        </div>
      )}

      {showPaymentModal && clientSecret && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setShowPaymentModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
              Complete Your Purchase
            </h3>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm
                clientSecret={clientSecret}
                onPaymentSuccess={(paymentIntent: any) => {
                  setActionSuccess(`Payment successful! Payment ID: ${paymentIntent.id}`);
                  setShowPaymentModal(false);
                }}
                onPaymentError={(error: string) => {
                  alert(`Payment failed: ${error}`);
                }}
              />
            </Elements>
          </motion.div>
        </div>
      )}

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
