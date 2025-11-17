import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE } from '../config';
import { useAuth } from '../context/AuthContext';

interface TeamMember {
  name: string;
  role: string;
  github: string;
  linkedin: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Htut Ko Ko',
    role: 'Lead Developer',
    github: 'https://github.com/htutkoko',
    linkedin: 'https://linkedin.com/in/htutkoko'
  },
  {
    name: 'Prabidhi Pyakurel',
    role: 'Backend Developer',
    github: 'https://github.com/prabidhipyakurel',
    linkedin: 'https://linkedin.com/in/prabidhipyakurel'
  },
  {
    name: 'Anubhav Kharel',
    role: 'Frontend Developer',
    github: 'https://github.com/anubhavkharel',
    linkedin: 'https://linkedin.com/in/anubhavkharel'
  },
  {
    name: 'Theingi Win',
    role: 'UI/UX Designer',
    github: 'https://github.com/theingiwin',
    linkedin: 'https://linkedin.com/in/theingiwin'
  }
];

const AboutUs: React.FC = () => {
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const { currentUser } = useAuth();

  const handleContactSubmit = async () => {
    if (!currentUser) {
      alert('Please login to contact us!');
      return;
    }

    if (!contactMessage.trim()) {
      alert('Please enter a message!');
      return;
    }

    try {
      setContactStatus('sending');
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setContactStatus('error');
        setTimeout(() => setContactStatus('idle'), 3000);
        return;
      }

      // Use the new contact endpoint
      await axios.post(`${API_BASE}/contact`, {
        message: contactMessage
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setContactStatus('success');
      setContactMessage('');
      setTimeout(() => setContactStatus('idle'), 3000);
    } catch (error: any) {
      console.error('Failed to send contact message:', error);
      console.error('Error details:', error.response?.data);
      setContactStatus('error');
      setTimeout(() => setContactStatus('idle'), 3000);
    }
  };

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
        <motion.h1 
          initial={{ opacity: 0, rotateY: 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          transition={{ 
            delay: 0.3,
            duration: 0.8,
            type: "spring",
            stiffness: 100
          }}
          style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}
        >
          About Uni-Market
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: 0.5,
            duration: 0.6
          }}
          style={{ color: '#6b7280', fontSize: '1.125rem', maxWidth: '800px', margin: '0 auto' }}
        >
          A peer-to-peer marketplace built by students, for the Asian Institute of Technology community
        </motion.p>
      </motion.div>

      {/* Mission Section */}
      <motion.div 
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ 
          delay: 0.3,
          type: "spring",
          stiffness: 80
        }}
        style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '1.5rem',
          boxShadow: '0 10px 15px rgba(0,0,0,0.1)'
        }}
      >
        <motion.h2 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            delay: 0.4,
            type: "spring"
          }}
          style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1a5f3f', marginBottom: '1rem' }}
        >
          Our Mission
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ color: '#6b7280', fontSize: '1rem', lineHeight: '1.75' }}
        >
          Uni-Market aims to create a safe, trusted platform where AIT community members can buy, sell, 
          and trade products and services. We believe in empowering students, faculty, and staff to 
          connect with each other while building a sustainable campus economy.
        </motion.p>
      </motion.div>

      {/* Team Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '2rem', textAlign: 'center' }}>
          Meet Our Team
        </h2>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '1.5rem', 
          flexWrap: 'wrap',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -8, scale: 1.05 }}
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                border: '2px solid #e5e7eb',
                textAlign: 'center',
                minWidth: '220px',
                maxWidth: '220px',
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Name Only - Large and Bold */}
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold', 
                color: '#1f2937', 
                marginBottom: '0.5rem',
                lineHeight: '1.4'
              }}>
                {member.name}
              </h3>
              
              {/* Role - Smaller */}
              <p style={{ 
                color: '#1a5f3f', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                marginBottom: '1.5rem' 
              }}>
                {member.role}
              </p>

              {/* Social Links */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <motion.a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#333',
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '1.25rem'
                  }}
                  title="GitHub"
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </motion.a>

                <motion.a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#0077b5',
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '1.25rem'
                  }}
                  title="LinkedIn"
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </motion.a>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '1.5rem',
          boxShadow: '0 10px 15px rgba(0,0,0,0.1)'
        }}
      >
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1a5f3f', marginBottom: '1.5rem', textAlign: 'center' }}>
          What We Offer
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔒</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
              Secure Transactions
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Verified users and secure payment options
            </p>
          </div>
          <div className="text-center">
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎓</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
              AIT Community
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Exclusive platform for AIT members
            </p>
          </div>
          <div className="text-center">
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💬</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
              Live Chat
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Direct communication between buyers and sellers
            </p>
          </div>
        </div>
      </motion.div>

      {/* AIT Location Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '1.5rem',
          boxShadow: '0 10px 15px rgba(0,0,0,0.1)'
        }}
      >
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1a5f3f', marginBottom: '1.5rem', textAlign: 'center' }}>
          Find Us at AIT
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Address */}
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
              📍 Address
            </h3>
            <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: '1.75' }}>
              <strong>Asian Institute of Technology</strong><br />
              58 Moo 9, Km. 42, Paholyothin Highway<br />
              Klong Luang, Pathumthani 12120<br />
              Thailand
            </p>
            <div style={{ marginTop: '1rem' }}>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                📞 Phone: +66 660780566<br />
                📧 Email: st126010@ait.asia
              </p>
            </div>
          </div>

          {/* Map */}
          <div style={{ borderRadius: '0.75rem', overflow: 'hidden', height: '300px' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3871.0346108746794!2d100.61437931483265!3d14.078565790100816!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d78964ba5e46f%3A0x2e0a82ab175cf355!2sAsian%20Institute%20of%20Technology!5e0!3m2!1sen!2sth!4v1637000000000!5m2!1sen!2sth"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </motion.div>

      {/* Contact Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="text-center"
        style={{
          background: 'linear-gradient(135deg, #1a5f3f, #2d8659)',
          color: 'white',
          padding: '3rem 2rem',
          borderRadius: '1rem'
        }}
      >
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Have Questions?
        </h2>
        <p style={{ fontSize: '1.125rem', marginBottom: '1.5rem', color: '#d1fae5' }}>
          We'd love to hear from you! Send a message to our administrators.
        </p>
        
        {currentUser ? (
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={4}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: '2px solid white',
                fontSize: '1rem',
                marginBottom: '1rem',
                resize: 'vertical'
              }}
            />
            <button
              onClick={handleContactSubmit}
              disabled={contactStatus === 'sending'}
              style={{
                display: 'inline-block',
                background: contactStatus === 'success' ? '#10b981' : contactStatus === 'error' ? '#ef4444' : 'white',
                color: contactStatus === 'success' || contactStatus === 'error' ? 'white' : '#1a5f3f',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: '600',
                cursor: contactStatus === 'sending' ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                opacity: contactStatus === 'sending' ? 0.7 : 1
              }}
            >
              {contactStatus === 'sending' ? 'Sending...' : 
               contactStatus === 'success' ? '✓ Message Sent!' : 
               contactStatus === 'error' ? '✗ Failed to Send' : 
               'Send Message'}
            </button>
          </div>
        ) : (
          <p style={{ color: '#fbbf24', fontSize: '1rem' }}>
            Please login to contact us!
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AboutUs;
