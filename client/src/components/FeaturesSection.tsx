
import React from 'react';
import { motion } from 'framer-motion';

const Feature: React.FC<{
  title: string;
  description: string;
  icon: string;
  index: number;
}> = ({ title, description, icon, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{
      delay: index * 0.15,
      duration: 0.6,
      type: "spring",
      stiffness: 100,
      damping: 10
    }}
    whileHover={{
      y: -10,
      scale: 1.05,
      boxShadow: '0 20px 40px rgba(26, 95, 63, 0.15)',
      transition: { duration: 0.3 }
    }}
    style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
      padding: '2rem',
      borderRadius: '1.5rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: '2px solid transparent',
      backgroundClip: 'padding-box',
      position: 'relative',
      overflow: 'hidden'
    }}
    className="flex flex-col items-center text-center transition-all duration-300"
  >
    {/* Decorative gradient border effect */}
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #1a5f3f, #fbbf24, #1a5f3f)',
        borderRadius: '1.5rem 1.5rem 0 0'
      }}
    />
    
    {/* Icon with gradient background */}
    <motion.div 
      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
      transition={{ duration: 0.5 }}
      style={{
        fontSize: '3rem',
        marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, #1a5f3f, #2d8659)',
        borderRadius: '1rem',
        padding: '1rem',
        boxShadow: '0 8px 16px rgba(26, 95, 63, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '80px',
        height: '80px'
      }}
    >
      {icon}
    </motion.div>
    
    <h3 
      style={{ 
        fontSize: '1.25rem',
        fontWeight: '700',
        marginBottom: '0.75rem',
        background: 'linear-gradient(135deg, #1a5f3f, #2d8659)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}
    >
      {title}
    </h3>
    <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.6' }}>
      {description}
    </p>
  </motion.div>
);

const FeaturesSection: React.FC = () => {
  const features = [
    {
      title: "AIT-Certified Community",
      description: "Buy and sell with confidence within a verified community of AIT students, staff, and alumni.",
      icon: "✅"
    },
    {
      title: "Peer-to-Peer Simplicity",
      description: "Directly connect with buyers and sellers for both products and services with easy-to-use tools.",
      icon: "🤝"
    },
    {
      title: "Global & Local Reach",
      description: "Start with the AIT community and expand your reach as we grow, with options for different nationalities.",
      icon: "🌐"
    }
  ];

  return (
    <div 
      style={{
        background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 50%, #f8fafc 100%)',
        padding: '4rem 0',
        margin: '3rem 0',
        borderRadius: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative background elements */}
      <div 
        style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-100px',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(26, 95, 63, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}
      />
      
      <div className="container mx-auto px-4" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h2 
            style={{ 
              fontSize: '2.5rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #1a5f3f 0%, #2d8659 50%, #1a5f3f 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '1rem'
            }}
          >
            Why Uni Market?
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
            Your trusted marketplace for the AIT community.
          </p>
        </motion.div>
        
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem', 
            maxWidth: '1200px', 
            margin: '0 auto'
          }}
          className="features-grid"
        >
          {features.map((feature, index) => (
            <Feature
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              index={index}
            />
          ))}
        </div>
        
        <style>{`
          @media (max-width: 1024px) {
            .features-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          @media (max-width: 640px) {
            .features-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default FeaturesSection;
