
import React from 'react';

const Feature: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-xl font-bold mb-2" style={{ color: '#1a5f3f' }}>{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const FeaturesSection: React.FC = () => {
  return (
    <div className="py-12 rounded-lg" style={{ background: '#e8f5e9' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">Why Uni Market?</h2>
          <p className="text-gray-600 mt-2">Your trusted marketplace for the AIT community.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Feature 
            title="AIT-Certified Community"
            description="Buy and sell with confidence within a verified community of AIT students, staff, and alumni."
          />
          <Feature 
            title="Peer-to-Peer Simplicity"
            description="Directly connect with buyers and sellers for both products and services with easy-to-use tools."
          />
          <Feature 
            title="Global & Local Reach"
            description="Start with the AIT community and expand your reach as we grow, with options for different nationalities."
          />
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
