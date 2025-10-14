import React from 'react';
import { motion } from 'framer-motion';

const SafetyGuidelines: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="admin-card">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
          Safety Guidelines
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
          Stay safe while buying and selling on Uni-Market. Follow these guidelines to protect yourself and others.
        </p>
      </div>

      <div className="admin-card" style={{ borderLeft: '4px solid #ef4444' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#ef4444', marginBottom: '1rem' }}>
          🚨 Important Safety Rules
        </h2>
        <ul style={{ color: '#6b7280', listStyle: 'disc', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
          <li>Never share your password or personal financial information</li>
          <li>Meet in public, well-lit places for in-person transactions</li>
          <li>Bring a friend when meeting someone for the first time</li>
          <li>Trust your instincts - if something feels wrong, walk away</li>
          <li>Report suspicious activity to administrators immediately</li>
        </ul>
      </div>

      <div className="admin-card">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1a5f3f', marginBottom: '1rem' }}>
          For Buyers
        </h2>
        <div className="space-y-4">
          <div>
            <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>✓ Verify Seller Identity</h3>
            <p style={{ color: '#6b7280' }}>
              Look for verified badges and AIT certification. Check the seller's profile and previous listings.
            </p>
          </div>
          <div>
            <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>✓ Inspect Before Paying</h3>
            <p style={{ color: '#6b7280' }}>
              Always inspect items thoroughly before making payment. Check for damage, authenticity, and functionality.
            </p>
          </div>
          <div>
            <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>✓ Use Secure Payment Methods</h3>
            <p style={{ color: '#6b7280' }}>
              Prefer traceable payment methods. Avoid cash when possible. Keep receipts and transaction records.
            </p>
          </div>
          <div>
            <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>✓ Ask Questions</h3>
            <p style={{ color: '#6b7280' }}>
              Don't hesitate to ask sellers for more photos, details, or clarifications before committing to purchase.
            </p>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1a5f3f', marginBottom: '1rem' }}>
          For Sellers
        </h2>
        <div className="space-y-4">
          <div>
            <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>✓ Provide Accurate Descriptions</h3>
            <p style={{ color: '#6b7280' }}>
              Be honest about item condition, defects, and specifications. Use clear, well-lit photos.
            </p>
          </div>
          <div>
            <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>✓ Set Fair Prices</h3>
            <p style={{ color: '#6b7280' }}>
              Research market prices and set reasonable rates. Overpricing or underpricing can raise red flags.
            </p>
          </div>
          <div>
            <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>✓ Communicate Clearly</h3>
            <p style={{ color: '#6b7280' }}>
              Respond promptly to inquiries. Be professional and courteous in all communications.
            </p>
          </div>
          <div>
            <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>✓ Protect Your Privacy</h3>
            <p style={{ color: '#6b7280' }}>
              Don't share unnecessary personal information. Use the platform's messaging system when available.
            </p>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1a5f3f', marginBottom: '1rem' }}>
          Prohibited Items & Activities
        </h2>
        <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
          <p style={{ color: '#991b1b', fontWeight: '600', marginBottom: '0.5rem' }}>
            The following are strictly prohibited on Uni-Market:
          </p>
          <ul style={{ color: '#991b1b', listStyle: 'disc', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            <li>Illegal items, drugs, weapons, or stolen goods</li>
            <li>Counterfeit or pirated products</li>
            <li>Adult content or services</li>
            <li>Scams, fraud, or misleading listings</li>
            <li>Harassment, hate speech, or discrimination</li>
            <li>Academic dishonesty (selling assignments, exams, etc.)</li>
          </ul>
        </div>
      </div>

      <div className="admin-card">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1a5f3f', marginBottom: '1rem' }}>
          Reporting Issues
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          If you encounter suspicious activity, scams, or violations of these guidelines:
        </p>
        <ol style={{ color: '#6b7280', listStyle: 'decimal', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
          <li>Document the issue (screenshots, messages, etc.)</li>
          <li>Contact an administrator through your profile page</li>
          <li>Provide detailed information about the incident</li>
          <li>Do not engage further with the suspicious party</li>
        </ol>
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #bbf7d0' }}>
          <p style={{ color: '#166534', fontWeight: '600' }}>
            🛡️ Your safety is our priority. Administrators review all reports within 24 hours.
          </p>
        </div>
      </div>

      <div className="admin-card">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1a5f3f', marginBottom: '1rem' }}>
          Emergency Contacts
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
          For urgent safety concerns or emergencies:
        </p>
        <ul style={{ color: '#6b7280', listStyle: 'none', paddingLeft: '0', lineHeight: '1.8' }}>
          <li>📧 Emergency Email: safety@uni-market.com</li>
          <li>🚨 AIT Campus Security: [Contact Number]</li>
          <li>👮 Local Police: 191 (Thailand Emergency Number)</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default SafetyGuidelines;
