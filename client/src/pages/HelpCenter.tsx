import React from 'react';
import { motion } from 'framer-motion';

const HelpCenter: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="admin-card">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
          Help Center
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
          Find answers to common questions and learn how to use Uni-Market effectively.
        </p>
      </div>

      <div className="admin-card">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1a5f3f', marginBottom: '1rem' }}>
          Getting Started
        </h2>
        <div className="space-y-4">
          <div>
            <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>How do I create an account?</h3>
            <p style={{ color: '#6b7280' }}>
              Click the "Register" button in the header and fill out the registration form with your name, email (preferably @ait.asia for AIT certification), nationality, and password. You can also upload a profile picture during registration.
            </p>
          </div>
          <div>
            <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>How do I list an item for sale?</h3>
            <p style={{ color: '#6b7280' }}>
              After logging in, click "Sell" in the navigation menu. Fill out the item details including title, description, price (in Thai Baht), category, and upload an image. Your item will be visible to all users immediately.
            </p>
          </div>
          <div>
            <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>How do I contact a seller?</h3>
            <p style={{ color: '#6b7280' }}>
              You must be logged in to see seller contact information. Click on any item to view its details, and you'll see the seller's contact information at the bottom of the page.
            </p>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1a5f3f', marginBottom: '1rem' }}>
          Account Management
        </h2>
        <div className="space-y-4">
          <div>
            <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>How do I edit my profile?</h3>
            <p style={{ color: '#6b7280' }}>
              Go to your Profile page and click the "Edit Profile" button. You can update your name, nationality, and profile picture.
            </p>
          </div>
          <div>
            <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>How do I get verified?</h3>
            <p style={{ color: '#6b7280' }}>
              On your Profile page, click "Request Verification" and upload proof of identity (Student ID, Passport, etc.). An admin will review your request and approve or reject it.
            </p>
          </div>
          <div>
            <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>What is AIT Certification?</h3>
            <p style={{ color: '#6b7280' }}>
              Users who register with an @ait.asia email address automatically receive AIT Certification, indicating they are part of the Asian Institute of Technology community.
            </p>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1a5f3f', marginBottom: '1rem' }}>
          Buying & Selling
        </h2>
        <div className="space-y-4">
          <div>
            <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>What currency is used?</h3>
            <p style={{ color: '#6b7280' }}>
              All prices are displayed in Thai Baht (฿). The conversion rate is 1 USD = 35 THB.
            </p>
          </div>
          <div>
            <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>How do I delete my listing?</h3>
            <p style={{ color: '#6b7280' }}>
              Go to your Profile page, find the item in "My Listed Items" section, and click the "Delete" button.
            </p>
          </div>
          <div>
            <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>Is there a commission fee?</h3>
            <p style={{ color: '#6b7280' }}>
              Yes, Uni-Market charges a 5% commission on completed transactions to maintain and improve the platform.
            </p>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1a5f3f', marginBottom: '1rem' }}>
          Need More Help?
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          If you can't find the answer you're looking for, please contact us:
        </p>
        <ul style={{ color: '#6b7280', listStyle: 'disc', paddingLeft: '1.5rem' }}>
          <li>Email: support@uni-market.com</li>
          <li>Visit your Profile page and use the contact form</li>
          <li>Check our Safety Guidelines for security tips</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default HelpCenter;
