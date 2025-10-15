import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

const SellPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Products',
    tags: '',
    image_url: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'upload'>('url');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentUser) {
      setError('You must be logged in to list an item');
      return;
    }

    setLoading(true);

    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      const priceInUSD = parseFloat(formData.price) / 35; // Convert THB to USD for storage

      let imageUrl = formData.image_url;
      
      // For file upload, you would typically upload to a service like Cloudinary, AWS S3, etc.
      // For now, we'll use the preview URL or a placeholder
      if (uploadMethod === 'upload' && imageFile) {
        // In a real app, upload the file to a cloud service here
        imageUrl = imagePreview; // Using data URL for demo
      }

      await axios.post(`${API_BASE}/items`, {
        title: formData.title,
        description: formData.description,
        price: priceInUSD,
        category: formData.category,
        tags: tagsArray,
        image_url: imageUrl || undefined
      });

      setSuccess('Item listed successfully!');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to list item:', err);
      setError(err.response?.data?.message || 'Failed to list item');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="admin-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
            Login Required
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            You need to be logged in to list items for sale.
          </p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Go to Login
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
          List a New Item or Service
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
          Share your products or services with the AIT community
        </p>
      </motion.div>

      {/* Form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="admin-card" 
        style={{ maxWidth: '800px', margin: '0 auto' }}
      >
        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="error"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="success"
          >
            {success}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="form-group"
            >
              <label htmlFor="title" className="form-label">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter item title"
                required
              />
            </motion.div>

            {/* Category */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="form-group"
            >
              <label htmlFor="category" className="form-label">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="Products">Products</option>
                <option value="Services">Services</option>
              </select>
            </motion.div>
          </div>

          {/* Description */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="form-group"
          >
            <label htmlFor="description" className="form-label">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="form-input"
              placeholder="Describe your item or service in detail"
              required
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="form-group"
            >
              <label htmlFor="price" className="form-label">
                Price (Thai Baht) *
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  ฿
                </span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="0"
                  min="1"
                  required
                />
              </div>
            </motion.div>

            {/* Tags */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="form-group"
            >
              <label htmlFor="tags" className="form-label">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. handmade, gift, electronics (comma separated)"
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Separate tags with commas to help buyers find your item
              </p>
            </motion.div>
          </div>

          {/* Image Upload Method Selection */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="form-group"
          >
            <label className="form-label">Image Method</label>
            <div className="flex gap-4">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="radio"
                  value="url"
                  checked={uploadMethod === 'url'}
                  onChange={(e) => setUploadMethod(e.target.value as 'url' | 'upload')}
                />
                Image URL
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="radio"
                  value="upload"
                  checked={uploadMethod === 'upload'}
                  onChange={(e) => setUploadMethod(e.target.value as 'url' | 'upload')}
                />
                Upload File
              </label>
            </div>
          </motion.div>

          {/* Image Input */}
          {uploadMethod === 'url' ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="form-group"
            >
              <label htmlFor="image_url" className="form-label">
                Image URL (Optional)
              </label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="form-input"
                placeholder="https://example.com/image.jpg"
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Add a link to an image of your item (use image hosting services like Imgur, etc.)
              </p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="form-group"
            >
              <label htmlFor="image_file" className="form-label">
                Upload Image (Optional)
              </label>
              <input
                type="file"
                id="image_file"
                accept="image/*"
                onChange={handleFileChange}
                className="form-input"
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Upload an image file (JPG, PNG, etc.)
              </p>
            </motion.div>
          )}

          {/* Preview */}
          {(formData.image_url || imagePreview) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 }}
              className="form-group"
            >
              <label className="form-label">Image Preview</label>
              <img
                src={uploadMethod === 'url' ? formData.image_url : imagePreview}
                alt="Preview"
                style={{
                  width: '200px',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: '0.5rem',
                  border: '1px solid #d1d5db'
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => navigate('/')}
              className="btn"
              style={{ background: '#6b7280', color: 'white', flex: 1 }}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 2 }}
            >
              {loading ? 'Listing Item...' : 'List Item'}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>

      {/* Tips */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="admin-card" 
        style={{ maxWidth: '800px', margin: '0 auto' }}
      >
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
          💡 Tips for Better Listings
        </h3>
        <ul style={{ color: '#6b7280', lineHeight: '1.6' }}>
          <li style={{ marginBottom: '0.5rem' }}>• Use clear, descriptive titles that buyers will search for</li>
          <li style={{ marginBottom: '0.5rem' }}>• Include detailed descriptions with condition, size, or specifications</li>
          <li style={{ marginBottom: '0.5rem' }}>• Add relevant tags to help buyers discover your items</li>
          <li style={{ marginBottom: '0.5rem' }}>• Use high-quality images to showcase your item</li>
          <li style={{ marginBottom: '0.5rem' }}>• Price competitively based on condition and market value</li>
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default SellPage;
