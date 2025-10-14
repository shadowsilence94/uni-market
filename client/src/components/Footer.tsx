import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  return (
    <motion.footer 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="footer"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-3 text-yellow-400">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/browse" className="text-gray-300 hover:text-white transition-colors duration-300">
                  Browse All Items
                </Link>
              </li>
              <li>
                <Link to="/browse?category=Products" className="text-gray-300 hover:text-white transition-colors duration-300">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/browse?category=Services" className="text-gray-300 hover:text-white transition-colors duration-300">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/sell" className="text-gray-300 hover:text-white transition-colors duration-300">
                  Sell Items
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-300 hover:text-white transition-colors duration-300">
                  My Profile
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Brand Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Uni-Market
            </h3>
            <p className="text-gray-300 mb-3 text-sm leading-relaxed">
              The premier marketplace for the AIT community. Connect, trade, and grow together.
            </p>
            <div className="flex space-x-3">
              <motion.a 
                whileHover={{ scale: 1.2 }}
                href="https://twitter.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-400 transition-colors duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.2 }}
                href="https://linkedin.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-400 transition-colors duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286z"/>
                </svg>
              </motion.a>
            </div>
          </motion.div>

          {/* Support & AIT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="text-lg font-semibold mb-3 text-yellow-400">Support & Info</h4>
            <ul className="space-y-2 text-sm mb-4">
              <li>
                <Link to="/help" className="text-gray-300 hover:text-white transition-colors duration-300">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/safety" className="text-gray-300 hover:text-white transition-colors duration-300">
                  Safety Guidelines
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-300 hover:text-white transition-colors duration-300">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/browse" className="text-gray-300 hover:text-white transition-colors duration-300">
                  Privacy Policy
                </Link>
              </li>
            </ul>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <img 
                src="https://www.ait.ac.th/wp-content/uploads/2019/11/AIT-Logo-1.png" 
                alt="AIT Logo" 
                className="h-6 opacity-70"
              />
              <span className="text-gray-400 text-xs">Asian Institute of Technology</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-4 border-t border-gray-700 text-center"
        >
          <div className="text-gray-400 text-sm">
            <p>&copy; 2025 Uni-Market. All rights reserved.</p>
            <p className="mt-1">
              Developed by{' '}
              <span className="text-yellow-400 font-semibold">HTUT KO KO</span>
              {' '}for the AIT Community
            </p>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
