import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import type { Item } from '../types';

const BrowsePage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedNationality, setSelectedNationality] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  const categories = ['All', 'Products', 'Services'];
  const nationalities = ['All', 'Vietnamese', 'Indian', 'Myanmar', 'Thai', 'Chinese', 'Japanese'];
  const itemsPerPage = 12; // 4 columns x 3 rows

  useEffect(() => {
    const searchQuery = searchParams.get('search');
    const categoryParam = searchParams.get('category');
    
    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
    
    fetchItems(searchQuery);
  }, [selectedCategory, selectedNationality, searchParams]);

  const fetchItems = async (searchQuery?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedNationality !== 'All') params.append('nationality', selectedNationality);
      if (searchQuery) params.append('search', searchQuery);

      const response = await axios.get(`/api/items?${params.toString()}`);
      setItems(response.data);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to fetch items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = items.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}
        >
          Browse Marketplace
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ color: '#6b7280', fontSize: '1.125rem' }}
        >
          Discover products and services from the AIT community
        </motion.p>
      </div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-lg shadow-lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Seller Nationality
            </label>
            <select
              value={selectedNationality}
              onChange={(e) => setSelectedNationality(e.target.value)}
              className="form-input"
            >
              {nationalities.map((nationality) => (
                <option key={nationality} value={nationality}>
                  {nationality}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <div style={{ 
              padding: '0.75rem 1rem', 
              background: '#f9fafb', 
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              {items.length} items found
            </div>
          </div>
        </div>
      </motion.div>

      {/* Items Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="error">{error}</div>
        </div>
      ) : items.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <div style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            No items found. Try adjusting your filters.
          </div>
        </motion.div>
      ) : (
        <>
          {/* Products Grid - Fixed 4 columns */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.5rem'
            }}
            className="responsive-grid"
          >
            {currentItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5 }}
              >
                <ProductCard item={item} />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center items-center gap-2"
            >
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn"
                style={{ 
                  background: currentPage === 1 ? '#e5e7eb' : '#1a5f3f',
                  color: currentPage === 1 ? '#9ca3af' : 'white',
                  padding: '0.5rem 1rem'
                }}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className="btn"
                  style={{
                    background: currentPage === page ? '#1a5f3f' : 'white',
                    color: currentPage === page ? 'white' : '#1a5f3f',
                    border: '1px solid #1a5f3f',
                    padding: '0.5rem 0.75rem',
                    minWidth: '2.5rem'
                  }}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn"
                style={{ 
                  background: currentPage === totalPages ? '#e5e7eb' : '#1a5f3f',
                  color: currentPage === totalPages ? '#9ca3af' : 'white',
                  padding: '0.5rem 1rem'
                }}
              >
                Next
              </button>
            </motion.div>
          )}
        </>
      )}

      <style jsx>{`
        @media (max-width: 1024px) {
          .responsive-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .responsive-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .responsive-grid {
            grid-template-columns: repeat(1, 1fr) !important;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default BrowsePage;
