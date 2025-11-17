import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import FeaturesSection from '../components/FeaturesSection';
import type { Item } from '../types';
import { API_BASE } from '../config';

const HomePage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${API_BASE}/items`);
        // Ensure we have an array
        if (Array.isArray(response.data)) {
          setItems(response.data);
        } else {
          console.error('API did not return an array:', response.data);
          setItems([]);
        }
      } catch (err) {
        console.error('Failed to fetch items:', err);
        setItems([]);
      }
    };

    fetchItems();
  }, []);

  // Sort by views (popularity) and take top 6 for featured
  // Create a copy before sorting to avoid mutation
  const featuredItems = Array.isArray(items) 
    ? [...items].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6)
    : [];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, featuredItems.length - 2));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(1, featuredItems.length - 2)) % Math.max(1, featuredItems.length - 2));
  };

  const handleManualNavigation = (direction: 'next' | 'prev') => {
    setIsAutoPlaying(false);
    if (direction === 'next') {
      nextSlide();
    } else {
      prevSlide();
    }
    // Resume auto-play after 5 seconds
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  // Auto-scroll to the left
  useEffect(() => {
    if (featuredItems.length > 3 && isAutoPlaying) {
      const interval = setInterval(nextSlide, 3000);
      return () => clearInterval(interval);
    }
  }, [featuredItems.length, isAutoPlaying]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="hero"
      >
        <div className="hero-content">
          {/* Logo with Yellow Background */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '2rem'
            }}
          >
            <div style={{
              background: '#fbbf24',
              padding: '1.5rem',
              borderRadius: '1rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              <img 
                src="/logo.png" 
                alt="Uni-Market Logo" 
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '0.75rem',
                  objectFit: 'cover'
                }}
              />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              delay: 0.3, 
              duration: 0.8,
              type: "spring",
              stiffness: 100
            }}
          >
            Uni-Market
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              delay: 0.5, 
              duration: 0.8,
              type: "spring",
              stiffness: 80
            }}
          >
            The exclusive peer-to-peer marketplace for the Asian Institute of Technology community. 
            Buy, sell, and connect with fellow students, faculty, and staff.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex justify-center space-x-4" 
            style={{ flexWrap: 'wrap', gap: '1rem' }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/sell" className="btn btn-secondary">
                Start Selling
              </Link>
            </motion.div>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn" 
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.3)' }}
            >
              Browse Items
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      <FeaturesSection />

      {/* Category Navigation Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-center"
      >
        <motion.h2 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: 0.4, 
            duration: 0.6,
            type: "spring",
            stiffness: 120
          }}
          style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem' }}
        >
          Browse by Category
        </motion.h2>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '1rem', 
          maxWidth: '800px', 
          margin: '0 auto',
          flexWrap: 'wrap'
        }}>
          <Link to="/browse?category=Products" style={{ textDecoration: 'none', flex: '1 1 200px', maxWidth: '220px' }}>
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-lg shadow-lg cursor-pointer"
              style={{ 
                border: '2px solid #e5e7eb', 
                transition: 'all 0.3s',
                padding: '1.5rem',
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📦</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1a5f3f', marginBottom: '0.25rem' }}>
                Products
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.75rem', textAlign: 'center' }}>
                Physical goods
              </p>
            </motion.div>
          </Link>

          <Link to="/browse?category=Services" style={{ textDecoration: 'none', flex: '1 1 200px', maxWidth: '220px' }}>
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-lg shadow-lg cursor-pointer"
              style={{ 
                border: '2px solid #e5e7eb', 
                transition: 'all 0.3s',
                padding: '1.5rem',
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛠️</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1a5f3f', marginBottom: '0.25rem' }}>
                Services
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.75rem', textAlign: 'center' }}>
                Skills & assistance
              </p>
            </motion.div>
          </Link>

          <Link to="/browse?category=Food" style={{ textDecoration: 'none', flex: '1 1 200px', maxWidth: '220px' }}>
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-lg shadow-lg cursor-pointer"
              style={{ 
                border: '2px solid #e5e7eb', 
                transition: 'all 0.3s',
                padding: '1.5rem',
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🍜</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1a5f3f', marginBottom: '0.25rem' }}>
                Food
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.75rem', textAlign: 'center' }}>
                Meals & ingredients
              </p>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Featured Items Carousel */}
      {featuredItems.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          id="featured"
          className="bg-gray-50 py-8" 
          style={{ borderRadius: '1.5rem', padding: '4rem 2rem' }}
        >
          <div className="text-center mb-8">
            <motion.h2 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: 0.5,
                type: "spring",
                stiffness: 100,
                damping: 10
              }}
              style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}
            >
              Featured Items
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: 0.6,
                type: "spring",
                stiffness: 100,
                damping: 10
              }}
              style={{ color: '#6b7280', fontSize: '1.125rem' }}
            >
              Most popular products and services from our community
            </motion.p>
          </div>
          
          {/* Carousel Container */}
          <div 
            style={{ position: 'relative', overflow: 'hidden', maxWidth: '1200px', margin: '0 auto' }}
            className="carousel-container"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {/* Left Arrow */}
            <motion.button
              whileHover={{ scale: 1.15, backgroundColor: '#2d8659' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleManualNavigation('prev')}
              className="carousel-arrow carousel-arrow-left"
            >
              ◄
            </motion.button>

            {/* Carousel Track */}
            <motion.div 
              animate={{ x: `${-currentSlide * 320}px` }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="carousel-track"
            >
              {featuredItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="carousel-item"
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ProductCard item={item} />
                </motion.div>
              ))}
            </motion.div>

            {/* Right Arrow */}
            <motion.button
              whileHover={{ scale: 1.15, backgroundColor: '#2d8659' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleManualNavigation('next')}
              className="carousel-arrow carousel-arrow-right"
            >
              ►
            </motion.button>
          </div>

          {/* Dots Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
            {Array.from({ length: Math.max(1, featuredItems.length - 2) }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentSlide(i);
                  setIsAutoPlaying(false);
                  setTimeout(() => setIsAutoPlaying(true), 5000);
                }}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: 'none',
                  background: currentSlide === i ? '#1a5f3f' : '#d1d5db',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8"
          >
            <Link to="/browse" className="btn btn-primary">
              View All Items
            </Link>
          </motion.div>
        </motion.div>
      )}

      {/* CTA Section - AIT Theme */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        style={{ 
          background: 'linear-gradient(135deg, #1a5f3f, #2d8659)', 
          color: 'white', 
          padding: '4rem 2rem', 
          borderRadius: '1.5rem', 
          textAlign: 'center' 
        }}
      >
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}
        >
          Ready to Join Our Community?
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ fontSize: '1.25rem', marginBottom: '2rem', color: '#d1fae5' }}
        >
          Start buying and selling with trusted AIT community members today
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex justify-center space-x-4" 
          style={{ flexWrap: 'wrap', gap: '1rem' }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/sell" className="btn" style={{ background: 'white', color: '#1a5f3f', fontWeight: '600' }}>
              List Your First Item
            </Link>
          </motion.div>
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="btn" 
            style={{ border: '2px solid white', background: 'transparent', color: 'white' }}
          >
            Learn More
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default HomePage;
