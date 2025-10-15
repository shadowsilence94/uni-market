import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      // Use a dark, professional background for the footer
      className="footer bg-gray-900 text-white"
    >
      <div className="container mx-auto px-4 py-10">
        {/*
          Using grid-cols-3 to force the three columns to display side-by-side 
          on ALL screen sizes.
        */}
        <div className="grid grid-cols-3 gap-10">
          {/* 1. Quick Links Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-xl font-bold mb-4 text-yellow-400">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/browse"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Browse All Items
                </Link>
              </li>
              <li>
                <Link
                  to="/browse?category=Products"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/browse?category=Services"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  to="/sell"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Sell Items
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  My Profile
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* 3. Support & Info Column (Kept in the second position for consistency in the file) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="text-xl font-bold mb-4 text-yellow-400">
              Support & Info
            </h4>
            <ul className="space-y-3 text-sm mb-4">
              <li>
                <Link
                  to="/help"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/safety"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Safety Guidelines
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/browse"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* 2. Uni-Market (Brand Section) Column - WITH ICON FIXES */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* The main title with gradient for visual emphasis */}
            <h4 className="text-xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Uni-Market
            </h4>
            <p className="text-gray-300 mb-4 text-sm leading-relaxed">
              The premier marketplace for the AIT community. Connect, trade, and
              grow together.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-4">
              <motion.a
                whileHover={{ scale: 1.2 }}
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-400 transition-colors duration-300"
                aria-label="Twitter"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  {/* FIX: Corrected and complete path for Twitter (X logo) */}
                  <path d="M18.901 1.144h3.138l-7.904 9.157 9.456 12.385h-7.009l-5.94-7.798L3.75 22.686H.612l8.026-9.356L.25 1.144h7.001l5.343 7.02L18.901 1.144zm-1.84 19.34L7.54 3.75H4.15l10.841 16.634h3.07z" />
                </svg>
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2 }}
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-400 transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  {/* FIX: Corrected and complete path for LinkedIn */}
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.747h3.555V20.45h-3.555V7.747zM7.115 5.176c-1.168 0-1.992-.781-1.992-1.78s.824-1.78 1.992-1.78c1.169 0 1.992.781 1.992 1.78s-.823 1.78-1.992 1.78z" />
                </svg>
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section (Copyright) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-6 border-t border-gray-700 text-center"
        >
          <div className="text-gray-400 text-sm">
            <p>&copy; 2025 Uni-Market. All rights reserved.</p>
            <p className="mt-1">
              Developed by{" "}
              <span className="text-yellow-400 font-bold">EBIZ GROUP</span> for
              the AIT Community
            </p>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;