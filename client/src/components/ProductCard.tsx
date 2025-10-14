import React from 'react';
import { Link } from 'react-router-dom';
import type { Item } from '../types';

interface ProductCardProps {
  item: Item & {
    seller?: {
      id: number;
      name: string;
      is_verified: boolean;
      nationality: string;
    };
    created_at?: string;
    updated_at?: string;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isEdited = item.updated_at && item.created_at && item.updated_at !== item.created_at;
  const imageUrl = item.image_url || item.image || 'https://via.placeholder.com/300x200?text=No+Image';
  const views = item.views || 0;
  const tags = item.tags || [];

  return (
    <div className="card">
      {/* Image */}
      <div style={{ position: 'relative' }}>
        <img
          src={imageUrl}
          alt={item.title}
        />
        <div style={{ 
          position: 'absolute', 
          top: '0.75rem', 
          left: '0.75rem',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '600',
          background: item.category === 'Products' ? '#dcfce7' : '#dbeafe',
          color: item.category === 'Products' ? '#166534' : '#1e40af'
        }}>
          {item.category}
        </div>
        <div style={{ 
          position: 'absolute', 
          top: '0.75rem', 
          right: '0.75rem',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '0.25rem 0.5rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          color: '#6b7280'
        }}>
          👁 {views}
        </div>
      </div>

      {/* Content */}
      <div className="card-content">
        <h3>{item.title}</h3>
        
        <p>{item.description}</p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '1rem' }}>
          {tags.slice(0, 3).map((tag: string, index: number) => (
            <span
              key={index}
              style={{
                padding: '0.25rem 0.5rem',
                background: '#f3f4f6',
                color: '#6b7280',
                fontSize: '0.75rem',
                borderRadius: '9999px'
              }}
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span style={{
              padding: '0.25rem 0.5rem',
              background: '#f3f4f6',
              color: '#6b7280',
              fontSize: '0.75rem',
              borderRadius: '9999px'
            }}>
              +{tags.length - 3}
            </span>
          )}
        </div>

        {/* Timestamps */}
        <div style={{ marginBottom: '1rem' }}>
          <div className="timestamp">
            Posted: {formatDate(item.created_at)}
          </div>
          {isEdited && (
            <div className="timestamp">
              Edited: {formatDate(item.updated_at)}
            </div>
          )}
        </div>

        {/* Seller Info */}
        {item.seller && (
          <div className="seller-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '2rem',
                height: '2rem',
                background: 'linear-gradient(135deg, #1a5f3f, #2d8659)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}>
                {item.seller.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                    {item.seller.name}
                  </span>
                  {item.seller.is_verified && (
                    <span style={{ color: '#10b981' }}>✓</span>
                  )}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.seller.nationality}</span>
              </div>
            </div>
          </div>
        )}

        {/* Price and Button */}
        <div className="card-footer">
          <div className="price">
            ฿{(item.price * 35).toFixed(0)}
          </div>
          <Link 
            to={`/item/${item.id}`} 
            className="btn btn-primary" 
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', textDecoration: 'none' }}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
