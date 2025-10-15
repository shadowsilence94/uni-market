import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from '../config';

interface Item {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  views: number;
  created_at: string;
  updated_at: string;
  image_url?: string;
  seller?: {
    id: number;
    name: string;
    is_verified: boolean;
    nationality: string;
  };
}

const ProfilePage: React.FC = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState<'items' | 'favorites'>('items');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: currentUser?.name || '',
    nationality: currentUser?.nationality || '',
    profile_picture: currentUser?.profile_picture || ''
  });
  const [verifyForm, setVerifyForm] = useState({
    proof_document: '',
    message: ''
  });

  const nationalities = [
    'Afghan', 'Albanian', 'Algerian', 'American', 'Andorran', 'Angolan', 'Argentine', 'Armenian', 'Australian', 'Austrian',
    'Azerbaijani', 'Bahamian', 'Bahraini', 'Bangladeshi', 'Barbadian', 'Belarusian', 'Belgian', 'Belizean', 'Beninese',
    'Bhutanese', 'Bolivian', 'Bosnian', 'Brazilian', 'British', 'Bruneian', 'Bulgarian', 'Burkinabe', 'Burmese', 'Burundian',
    'Cambodian', 'Cameroonian', 'Canadian', 'Cape Verdean', 'Central African', 'Chadian', 'Chilean', 'Chinese', 'Colombian',
    'Comoran', 'Congolese', 'Costa Rican', 'Croatian', 'Cuban', 'Cypriot', 'Czech', 'Danish', 'Djiboutian', 'Dominican',
    'Dutch', 'East Timorese', 'Ecuadorean', 'Egyptian', 'Emirian', 'Equatorial Guinean', 'Eritrean', 'Estonian', 'Ethiopian',
    'Fijian', 'Filipino', 'Finnish', 'French', 'Gabonese', 'Gambian', 'Georgian', 'German', 'Ghanaian', 'Greek', 'Grenadian',
    'Guatemalan', 'Guinea-Bissauan', 'Guinean', 'Guyanese', 'Haitian', 'Herzegovinian', 'Honduran', 'Hungarian', 'Icelander',
    'Indian', 'Indonesian', 'Iranian', 'Iraqi', 'Irish', 'Israeli', 'Italian', 'Ivorian', 'Jamaican', 'Japanese', 'Jordanian',
    'Kazakhstani', 'Kenyan', 'Kittian and Nevisian', 'Kuwaiti', 'Kyrgyz', 'Laotian', 'Latvian', 'Lebanese', 'Liberian',
    'Libyan', 'Liechtensteiner', 'Lithuanian', 'Luxembourgish', 'Macedonian', 'Malagasy', 'Malawian', 'Malaysian', 'Maldivan',
    'Malian', 'Maltese', 'Marshallese', 'Mauritanian', 'Mauritian', 'Mexican', 'Micronesian', 'Moldovan', 'Monacan',
    'Mongolian', 'Moroccan', 'Mosotho', 'Motswana', 'Mozambican', 'Myanmar', 'Namibian', 'Nauruan', 'Nepalese', 'New Zealander',
    'Nicaraguan', 'Nigerian', 'Nigerien', 'North Korean', 'Norwegian', 'Omani', 'Pakistani', 'Palauan', 'Panamanian',
    'Papua New Guinean', 'Paraguayan', 'Peruvian', 'Polish', 'Portuguese', 'Qatari', 'Romanian', 'Russian', 'Rwandan',
    'Saint Lucian', 'Salvadoran', 'Samoan', 'San Marinese', 'Sao Tomean', 'Saudi', 'Scottish', 'Senegalese', 'Serbian',
    'Seychellois', 'Sierra Leonean', 'Singaporean', 'Slovakian', 'Slovenian', 'Solomon Islander', 'Somali', 'South African',
    'South Korean', 'Spanish', 'Sri Lankan', 'Sudanese', 'Surinamer', 'Swazi', 'Swedish', 'Swiss', 'Syrian', 'Taiwanese',
    'Tajik', 'Tanzanian', 'Thai', 'Togolese', 'Tongan', 'Trinidadian or Tobagonian', 'Tunisian', 'Turkish', 'Tuvaluan',
    'Ugandan', 'Ukrainian', 'Uruguayan', 'Uzbekistani', 'Venezuelan', 'Vietnamese', 'Welsh', 'Yemenite', 'Zambian', 'Zimbabwean'
  ];

  useEffect(() => {
    fetchUserItems();
    fetchFavoriteItems();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setEditForm({
        name: currentUser.name,
        nationality: currentUser.nationality,
        profile_picture: currentUser.profile_picture || ''
      });
    }
  }, [currentUser]);

  const fetchUserItems = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/items`);
      const myItems = Array.isArray(response.data) 
        ? response.data.filter((item: any) => 
            item.sellerId === currentUser.id || item.seller_id === currentUser.id
          )
        : [];
      setUserItems(myItems);
    } catch (err) {
      console.error('Failed to fetch items:', err);
      setError('Failed to fetch your items');
      setUserItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoriteItems = async () => {
    if (!currentUser) return;
    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (favorites.length === 0) {
        setFavoriteItems([]);
        return;
      }
      
      const response = await axios.get(`${API_BASE}/items`);
      const allItems = Array.isArray(response.data) ? response.data : [];
      const favItems = allItems.filter((item: any) => favorites.includes(item.id));
      setFavoriteItems(favItems);
    } catch (err) {
      console.error('Failed to fetch favorite items:', err);
      setFavoriteItems([]);
    }
  };

  const handleRemoveFavorite = (itemId: number) => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const newFavorites = favorites.filter((id: number) => id !== itemId);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    fetchFavoriteItems();
    setSuccess('Removed from favorites');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleDeleteItem = async (itemId: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${API_BASE}/items/${itemId}`);
        fetchUserItems();
      } catch (err) {
        console.error('Failed to delete item:', err);
        setError('Failed to delete item');
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, profile_picture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVerifyForm({ ...verifyForm, proof_document: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.put(`${API_BASE}/users/${currentUser?.id}`, editForm);
      setCurrentUser(response.data);
      setSuccess('Profile updated successfully!');
      setShowEditModal(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleVerificationRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!verifyForm.proof_document) {
      setError('Please upload proof of identity');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      await axios.post(`${API_BASE}/verification-requests`, {
        userId: currentUser?.id,
        proof_document: verifyForm.proof_document,
        message: verifyForm.message
      });
      setSuccess('Verification request submitted! Admin will review it soon.');
      setShowVerifyModal(false);
      setVerifyForm({ proof_document: '', message: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Verification request error:', err);
      setError(err.response?.data?.message || 'Failed to submit verification request');
      setTimeout(() => setError(null), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!currentUser) {
    return (
      <div className="text-center py-8">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="success"
        >
          {success}
        </motion.div>
      )}

      {/* Profile Header */}
      <div className="admin-card">
        <div className="flex items-center gap-4 mb-6">
          {currentUser.profile_picture ? (
            <img 
              src={currentUser.profile_picture} 
              alt={currentUser.name}
              style={{
                width: '5rem',
                height: '5rem',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #1a5f3f'
              }}
            />
          ) : (
            <img 
              src="/logo.png" 
              alt={currentUser.name}
              style={{
                width: '5rem',
                height: '5rem',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #1a5f3f'
              }}
            />
          )}
          <div className="flex-1">
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
              {currentUser.name}
              {currentUser.is_verified && <span style={{ color: '#10b981', marginLeft: '0.5rem' }}>✓</span>}
            </h1>
            <p style={{ color: '#6b7280' }}>{currentUser.email}</p>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              {currentUser.nationality} • {currentUser.is_ait_certified ? 'AIT Certified' : 'Not AIT Certified'}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowEditModal(true)} className="btn btn-secondary">
              Edit Profile
            </button>
            {!currentUser.is_verified && (
              <button onClick={() => setShowVerifyModal(true)} className="btn" style={{ background: '#fbbf24', color: '#1f2937' }}>
                Request Verification
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="stat-number">{userItems.length}</div>
            <div className="stat-label">Items Listed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{userItems.reduce((sum, item) => sum + item.views, 0)}</div>
            <div className="stat-label">Total Views</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">฿{(userItems.reduce((sum, item) => sum + item.price, 0) * 35).toFixed(0)}</div>
            <div className="stat-label">Total Value</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link to="/sell" className="btn btn-primary">
          List New Item
        </Link>
      </div>

      {/* Tabs */}
      <div className="admin-card">
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #e5e7eb', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('items')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: activeTab === 'items' ? '#1a5f3f' : '#6b7280',
              borderBottom: activeTab === 'items' ? '3px solid #1a5f3f' : 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            My Items ({userItems.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: activeTab === 'favorites' ? '#1a5f3f' : '#6b7280',
              borderBottom: activeTab === 'favorites' ? '3px solid #1a5f3f' : 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            ★ Favorites ({favoriteItems.length})
          </button>
        </div>

      {/* My Items */}
      {activeTab === 'items' && (
        <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem' }}>
          My Listed Items
        </h2>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="spinner"></div>
          </div>
        ) : userItems.length === 0 ? (
          <div className="text-center py-8">
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
              You haven't listed any items yet.{' '}
              <Link to="/sell" style={{ color: '#1a5f3f', fontWeight: '500' }}>
                List your first item!
              </Link>
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Views</th>
                  <th>Posted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url || 'https://via.placeholder.com/60x60?text=No+Image'}
                          alt={item.title}
                          style={{ width: '3rem', height: '3rem', objectFit: 'cover', borderRadius: '0.5rem' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {item.description.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        borderRadius: '9999px',
                        background: item.category === 'Products' ? '#dcfce7' : '#dbeafe',
                        color: item.category === 'Products' ? '#166534' : '#1e40af'
                      }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1a5f3f' }}>
                      ฿{(item.price * 35).toFixed(0)}
                    </td>
                    <td style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {item.views}
                    </td>
                    <td>
                      <div className="timestamp">{formatDate(item.created_at)}</div>
                      {item.updated_at !== item.created_at && (
                        <div className="timestamp">Edited: {formatDate(item.updated_at)}</div>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Link
                          to={`/item/${item.id}`}
                          style={{
                            fontSize: '0.75rem',
                            color: '#1a5f3f',
                            textDecoration: 'none',
                            fontWeight: '500'
                          }}
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          style={{
                            fontSize: '0.75rem',
                            color: '#dc2626',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      )}

      {/* Favorites */}
      {activeTab === 'favorites' && (
        <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem' }}>
          ★ My Favorite Items
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="spinner"></div>
          </div>
        ) : favoriteItems.length === 0 ? (
          <div className="text-center py-8">
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
              You haven't added any favorites yet.{' '}
              <Link to="/browse" style={{ color: '#1a5f3f', fontWeight: '500' }}>
                Browse items to add favorites!
              </Link>
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Seller</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {favoriteItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url || 'https://via.placeholder.com/60x60?text=No+Image'}
                          alt={item.title}
                          style={{ width: '3rem', height: '3rem', objectFit: 'cover', borderRadius: '0.5rem' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {item.description.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                        {item.seller?.name || 'Unknown'}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        borderRadius: '9999px',
                        background: item.category === 'Products' ? '#dcfce7' : '#dbeafe',
                        color: item.category === 'Products' ? '#166534' : '#1e40af'
                      }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                      ฿{((item.price || 0) * 35).toFixed(0)}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Link to={`/item/${item.id}`} className="btn" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', background: '#1a5f3f', color: 'white' }}>
                          View
                        </Link>
                        <button 
                          onClick={() => handleRemoveFavorite(item.id)}
                          className="btn" 
                          style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', background: '#ef4444', color: 'white' }}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      )}
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="modal"
            >
              <div className="modal-content">
                <div className="flex justify-between items-center mb-4">
                  <h2>Edit Profile</h2>
                  <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>
                {error && (
                  <div className="error" style={{ marginBottom: '1rem' }}>
                    {error}
                  </div>
                )}
                <form onSubmit={handleUpdateProfile}>
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nationality</label>
                    <select
                      value={editForm.nationality}
                      onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })}
                      className="form-input"
                      required
                    >
                      <option value="">Select your nationality</option>
                      {nationalities.map((nat) => (
                        <option key={nat} value={nat}>{nat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Profile Picture</label>
                    {editForm.profile_picture && (
                      <div style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
                        <img src={editForm.profile_picture} alt="Preview" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto' }} />
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="form-input" />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                    <button type="button" onClick={() => setShowEditModal(false)} className="btn">Cancel</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Verification Request Modal */}
      <AnimatePresence>
        {showVerifyModal && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="modal"
            >
              <div className="modal-content">
                <div className="flex justify-between items-center mb-4">
                  <h2>Request Verification Badge</h2>
                  <button onClick={() => setShowVerifyModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                  Upload proof of identity (Student ID, Passport, etc.) for admin verification.
                </p>
                {error && (
                  <div className="error" style={{ marginBottom: '1rem' }}>
                    {error}
                  </div>
                )}
                <form onSubmit={handleVerificationRequest}>
                  <div className="form-group">
                    <label className="form-label">Proof of Identity *</label>
                    {verifyForm.proof_document && (
                      <div style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
                        <img src={verifyForm.proof_document} alt="Proof" style={{ maxWidth: '300px', maxHeight: '200px', margin: '0 auto', border: '2px solid #e5e7eb', borderRadius: '0.5rem' }} />
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleProofChange} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Additional Message (Optional)</label>
                    <textarea
                      value={verifyForm.message}
                      onChange={(e) => setVerifyForm({ ...verifyForm, message: e.target.value })}
                      className="form-input"
                      rows={3}
                      placeholder="Any additional information..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary">Submit Request</button>
                    <button type="button" onClick={() => setShowVerifyModal(false)} className="btn">Cancel</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
