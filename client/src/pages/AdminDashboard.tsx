import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

interface AdminStats {
  totalUsers: number;
  totalItems: number;
  totalOrders: number;
  totalRevenue: number;
  usersByNationality: Record<string, number>;
  itemsByCategory: Record<string, number>;
  recentOrders: Array<{
    id: number;
    price: number;
    status: string;
    date: string;
    item: { title: string } | null;
    buyer: { name: string } | null;
    seller: { name: string } | null;
  }>;
}

interface User {
  id: number;
  name: string;
  email: string;
  nationality: string;
  is_verified: boolean;
  role: string;
  is_ait_certified: boolean;
}

interface Item {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  sellerId: number;
  views: number;
  created_at: string;
  updated_at: string;
  seller?: {
    name: string;
  };
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [tags, setTags] = useState<{ tag: string; count: number; category?: string }[]>([]);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editTagValue, setEditTagValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    nationality: '',
    role: 'user'
  });
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    userId: 'all'
  });
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchData();
    if (activeTab === 'tags') {
      fetchTags();
    }
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsResponse, usersResponse, itemsResponse, verifyResponse] = await Promise.all([
        axios.get(`${API_BASE}/analytics`),
        axios.get(`${API_BASE}/users`),
        axios.get(`${API_BASE}/items`),
        axios.get(`${API_BASE}/verification-requests`).catch(() => ({ data: [] }))
      ]);
      
      setStats(statsResponse.data);
      setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
      setItems(Array.isArray(itemsResponse.data) ? itemsResponse.data : []);
      setVerificationRequests(Array.isArray(verifyResponse.data) ? verifyResponse.data : []);
    } catch (err: any) {
      console.error('Failed to fetch admin data:', err);
      setError(err.response?.data?.message || 'Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${API_BASE}/users/${userId}`);
      setSuccess('User deleted successfully');
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/users`, newUserForm);
      setSuccess('User added successfully');
      setShowAddUserModal(false);
      setNewUserForm({ name: '', email: '', password: '', nationality: '', role: 'user' });
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to add user:', err);
      setError(err.response?.data?.message || 'Failed to add user.');
    }
  };

  const handleApproveVerification = async (requestId: number) => {
    try {
      await axios.put(`${API_BASE}/verification-requests/${requestId}/approve`);
      setSuccess('User verified successfully');
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to approve verification:', err);
      setError(err.response?.data?.message || 'Failed to approve verification.');
    }
  };

  const handleRejectVerification = async (requestId: number) => {
    try {
      await axios.put(`${API_BASE}/verification-requests/${requestId}/reject`);
      setSuccess('Verification request rejected');
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to reject verification:', err);
      setError(err.response?.data?.message || 'Failed to reject verification.');
    }
  };

  const handleVerifyUser = async (userId: number) => {
    try {
      await axios.put(`${API_BASE}/users/${userId}/verify`);
      fetchData();
    } catch (err: any) {
      console.error('Failed to verify user:', err);
      setError(err.response?.data?.message || 'Failed to verify user.');
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await axios.put(`${API_BASE}/users/${userId}/role`, { role: newRole });
      fetchData();
    } catch (err: any) {
      console.error('Failed to update user role:', err);
      setError(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${API_BASE}/items/${itemId}`);
        fetchData();
      } catch (err: any) {
        console.error('Failed to delete item:', err);
        setError(err.response?.data?.message || 'Failed to delete item.');
      }
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/notifications`, notificationForm, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      setNotificationForm({ title: '', message: '', userId: 'all' });
      alert('Notification sent successfully!');
    } catch (err: any) {
      console.error('Failed to send notification:', err);
      setError(err.response?.data?.message || 'Failed to send notification.');
    }
  };

  const fetchTags = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/tags/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTags(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch tags:', err);
      setError(err.response?.data?.message || 'Failed to fetch tags.');
    }
  };

  const handleDeleteTag = async (tag: string) => {
    if (!confirm(`Delete tag "${tag}"? This will remove it from all items.`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/tags/${encodeURIComponent(tag)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`Tag "${tag}" deleted successfully!`);
      fetchTags();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to delete tag:', err);
      setError(err.response?.data?.message || 'Failed to delete tag.');
    }
  };

  const handleRenameTag = async (oldTag: string, newTag: string) => {
    if (!newTag.trim()) {
      alert('Please enter a new tag name.');
      return;
    }
    
    if (oldTag === newTag) {
      setEditingTag(null);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/tags/merge`, {
        sourceTag: oldTag,
        targetTag: newTag
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`Tag renamed from "${oldTag}" to "${newTag}" successfully!`);
      setEditingTag(null);
      setEditTagValue('');
      fetchTags();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to rename tag:', err);
      setError(err.response?.data?.message || 'Failed to rename tag.');
    }
  };

  const handleMergeTags = async (sourceTag: string, targetTag: string) => {
    if (!targetTag.trim()) {
      alert('Please enter a target tag name.');
      return;
    }
    
    if (!confirm(`Merge "${sourceTag}" into "${targetTag}"? This will replace all occurrences.`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/tags/merge`, {
        sourceTag,
        targetTag
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`Tag "${sourceTag}" merged into "${targetTag}" successfully!`);
      fetchTags();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to merge tags:', err);
      setError(err.response?.data?.message || 'Failed to merge tags.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937' }}>Admin Dashboard</h1>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Welcome back, <span style={{ fontWeight: '600', color: '#1a5f3f' }}>{currentUser?.name}</span>
        </div>
      </div>

      {success && (
        <div className="success">
          {success}
        </div>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ borderBottom: '1px solid #e5e7eb' }}>
        <nav style={{ display: 'flex', gap: '2rem', marginBottom: '-1px', flexWrap: 'wrap' }}>
          {[
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'users', name: 'User Management', icon: '👥' },
            { id: 'verification', name: 'Verification Requests', icon: '✓', badge: verificationRequests.filter(r => r.status === 'pending').length },
            { id: 'items', name: 'Item Management', icon: '📦' },
            { id: 'tags', name: 'Tag Management', icon: '🏷️' },
            { id: 'notifications', name: 'Notifications', icon: '📢' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.5rem 0',
                borderBottom: activeTab === tab.id ? '2px solid #1a5f3f' : '2px solid transparent',
                fontWeight: '500',
                fontSize: '0.875rem',
                color: activeTab === tab.id ? '#1a5f3f' : '#6b7280',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <span style={{ marginRight: '0.5rem' }}>{tab.icon}</span>
              {tab.name}
              {tab.badge && tab.badge > 0 && (
                <span style={{
                  marginLeft: '0.5rem',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '9999px',
                  padding: '0.125rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="stat-card">
              <div className="stat-number">{stats.totalUsers}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalItems}</div>
              <div className="stat-label">Total Items</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalOrders}</div>
              <div className="stat-label">Total Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">${stats.totalRevenue.toFixed(2)}</div>
              <div className="stat-label">Revenue (5%)</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="admin-card">
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>Users by Nationality</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(stats.usersByNationality).map(([nationality, count]) => (
                  <div key={nationality} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280' }}>{nationality}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '5rem', height: '0.5rem', background: '#e5e7eb', borderRadius: '9999px' }}>
                        <div
                          style={{
                            width: `${(count / stats.totalUsers) * 100}%`,
                            height: '100%',
                            background: '#1a5f3f',
                            borderRadius: '9999px'
                          }}
                        ></div>
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-card">
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>Items by Category</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(stats.itemsByCategory).map(([category, count]) => (
                  <div key={category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280' }}>{category}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '5rem', height: '0.5rem', background: '#e5e7eb', borderRadius: '9999px' }}>
                        <div
                          style={{
                            width: `${(count / stats.totalItems) * 100}%`,
                            height: '100%',
                            background: '#2d8659',
                            borderRadius: '9999px'
                          }}
                        ></div>
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-card">
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>User Management</h3>
            <button onClick={() => setShowAddUserModal(true)} className="btn btn-primary">
              + Add User
            </button>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Nationality</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          background: user.profile_picture 
                            ? `url(${user.profile_picture})` 
                            : 'linear-gradient(135deg, #1a5f3f, #2d8659)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          border: '2px solid #e5e7eb'
                        }}>
                          {!user.profile_picture && user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.875rem', color: '#6b7280' }}>{user.email}</td>
                    <td style={{ fontSize: '0.875rem', color: '#6b7280' }}>{user.nationality}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {user.is_verified && (
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            borderRadius: '9999px',
                            background: '#dcfce7',
                            color: '#166534'
                          }}>
                            Verified
                          </span>
                        )}
                        {user.is_ait_certified && (
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            borderRadius: '9999px',
                            background: '#dbeafe',
                            color: '#1e40af'
                          }}>
                            AIT
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        style={{ fontSize: '0.875rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', padding: '0.25rem 0.5rem' }}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {!user.is_verified && (
                          <button
                            onClick={() => handleVerifyUser(user.id)}
                            style={{
                              fontSize: '0.875rem',
                              color: '#1a5f3f',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: '500'
                            }}
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          style={{
                            fontSize: '0.875rem',
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
        </div>
      )}

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div className="admin-card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}>Item Management</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Seller</th>
                  <th>Views</th>
                  <th>Posted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>{item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.description.substring(0, 50)}...</div>
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
                      ${item.price.toFixed(2)}
                    </td>
                    <td style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {item.seller?.name || 'Unknown'}
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
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        style={{
                          fontSize: '0.875rem',
                          color: '#dc2626',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {/* Tag Management Tab */}
      {activeTab === 'tags' && (
        <div className="admin-card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}>
            Tag Management
          </h3>
          
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Manage tags used across all items. Merge duplicate tags or delete unused ones.
          </p>

          {tags.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No tags found</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {tags.map((tagData, index) => (
                <div 
                  key={index} 
                  style={{ 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '0.5rem', 
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {editingTag === tagData.tag ? (
                        <input
                          type="text"
                          value={editTagValue}
                          onChange={(e) => setEditTagValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleRenameTag(tagData.tag, editTagValue);
                            } else if (e.key === 'Escape') {
                              setEditingTag(null);
                              setEditTagValue('');
                            }
                          }}
                          autoFocus
                          style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            padding: '0.25rem 0.75rem',
                            border: '2px solid #3b82f6',
                            borderRadius: '9999px',
                            outline: 'none'
                          }}
                        />
                      ) : (
                        <span style={{ 
                          fontSize: '1rem', 
                          fontWeight: '600', 
                          color: '#1f2937',
                          padding: '0.25rem 0.75rem',
                          background: '#f3f4f6',
                          borderRadius: '9999px'
                        }}>
                          {tagData.tag}
                        </span>
                      )}
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: '#6b7280',
                        background: '#dbeafe',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '9999px'
                      }}>
                        {tagData.count} {tagData.count === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    {tagData.category && (
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        Category: {tagData.category}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {editingTag === tagData.tag ? (
                      <>
                        <button
                          onClick={() => handleRenameTag(tagData.tag, editTagValue)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingTag(null);
                            setEditTagValue('');
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingTag(tagData.tag);
                            setEditTagValue(tagData.tag);
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#8b5cf6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => {
                            const targetTag = prompt(`Merge "${tagData.tag}" into which tag?`, '');
                            if (targetTag) {
                              handleMergeTags(tagData.tag, targetTag);
                            }
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Merge
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tagData.tag)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
              💡 Tag Management Tips
            </h4>
            <ul style={{ fontSize: '0.875rem', color: '#6b7280', paddingLeft: '1.5rem', margin: 0 }}>
              <li>Merge similar tags to reduce duplicates (e.g., "electronic" → "electronics")</li>
              <li>Delete unused tags to keep the system clean</li>
              <li>Tags are automatically suggested when users create items</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="admin-card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}>Send Notification</h3>
          <form onSubmit={handleSendNotification}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                rows={4}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Send To</label>
              <select
                value={notificationForm.userId}
                onChange={(e) => setNotificationForm({ ...notificationForm, userId: e.target.value })}
                className="form-input"
              >
                <option value="all">All Users</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id.toString()}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">
              Send Notification
            </button>
          </form>
        </div>
      )}

      {/* Verification Requests Tab */}
      {activeTab === 'verification' && (
        <div className="admin-card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}>Verification Requests</h3>
          {verificationRequests.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No verification requests</p>
          ) : (
            <div className="space-y-4">
              {verificationRequests.map((request) => {
                const user = users.find(u => u.id === request.userId);
                return (
                  <div key={request.id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                          {user?.name} ({user?.email})
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                          Status: <span style={{ 
                            fontWeight: '600',
                            color: request.status === 'pending' ? '#f59e0b' : request.status === 'approved' ? '#10b981' : '#ef4444'
                          }}>{request.status}</span>
                        </p>
                        {request.message && (
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                            Message: {request.message}
                          </p>
                        )}
                        <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                          Submitted: {new Date(request.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div style={{ marginLeft: '1rem' }}>
                        {request.proof_document && (
                          <img 
                            src={request.proof_document} 
                            alt="Proof" 
                            style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: '0.5rem', border: '2px solid #e5e7eb' }}
                          />
                        )}
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex gap-2" style={{ marginTop: '1rem' }}>
                        <button onClick={() => handleApproveVerification(request.id)} className="btn btn-primary">
                          Approve
                        </button>
                        <button onClick={() => handleRejectVerification(request.id)} className="btn" style={{ background: '#ef4444', color: 'white' }}>
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <div className="flex justify-between items-center mb-4">
                <h2>Add New User</h2>
                <button onClick={() => setShowAddUserModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
              </div>
              <form onSubmit={handleAddUser}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nationality</label>
                  <input
                    type="text"
                    value={newUserForm.nationality}
                    onChange={(e) => setNewUserForm({ ...newUserForm, nationality: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="form-input"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary">Add User</button>
                  <button type="button" onClick={() => setShowAddUserModal(false)} className="btn">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
