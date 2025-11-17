import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_BASE } from '../config';

interface TagAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  category?: string;
}

const TagAutocomplete: React.FC<TagAutocompleteProps> = ({ value, onChange, category }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchExistingTags();
  }, [category]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchExistingTags = async () => {
    try {
      const response = await axios.get(`${API_BASE}/tags`, {
        params: category ? { category } : {}
      });
      setSuggestions(response.data || []);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    
    // Get the current tag being typed (after last comma)
    const tags = inputValue.split(',');
    const current = tags[tags.length - 1].trim();
    setCurrentInput(current);
    
    if (current.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const getFilteredSuggestions = () => {
    if (!currentInput) return [];
    
    // Get already added tags
    const existingTags = value.split(',').map(t => t.trim().toLowerCase()).filter(t => t);
    
    // Filter suggestions
    return suggestions
      .filter(tag => 
        tag.toLowerCase().includes(currentInput.toLowerCase()) &&
        !existingTags.includes(tag.toLowerCase())
      )
      .slice(0, 5);
  };

  const handleSuggestionClick = (tag: string) => {
    const tags = value.split(',').map(t => t.trim()).filter(t => t);
    tags[tags.length - 1] = tag;
    onChange(tags.join(', ') + ', ');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const filteredSuggestions = getFilteredSuggestions();

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => currentInput && setShowSuggestions(true)}
        className="form-input"
        placeholder="e.g. handmade, gift, electronics (comma separated)"
      />
      
      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 0.25rem)',
              left: 0,
              right: 0,
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              zIndex: 10,
              maxHeight: '200px',
              overflowY: 'auto'
            }}
          >
            {filteredSuggestions.map((tag, index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSuggestionClick(tag)}
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  borderBottom: index < filteredSuggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <span style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                  {tag}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
        Separate tags with commas. Suggestions will appear as you type.
      </p>
    </div>
  );
};

export default TagAutocomplete;
