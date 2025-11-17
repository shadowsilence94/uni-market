import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  message: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  id: number;
  item_id: number;
  item_title: string;
  buyer_id: number;
  seller_id: number;
  other_user_name: string;
  last_message: string;
  unread_count: number;
  updated_at: string;
}

const ChatWidget: React.FC = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch conversations
  useEffect(() => {
    if (currentUser && isOpen) {
      fetchConversations();
    }
  }, [currentUser, isOpen]);

  // Poll for new messages every 5 seconds when a conversation is open
  useEffect(() => {
    if (selectedConversation) {
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE}/conversations/${selectedConversation.id}/messages`,
        { message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage('');
      fetchMessages(selectedConversation.id);
      fetchConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const handleBack = () => {
    setSelectedConversation(null);
    fetchConversations();
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  if (!currentUser) return null;

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1a5f3f, #2d8659)',
          color: 'white',
          border: '3px solid #fbbf24',
          fontSize: '1.75rem',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isOpen ? '✕' : '💬'}
        {totalUnread > 0 && !isOpen && (
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: '#dc2626',
            color: 'white',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}>
            {totalUnread}
          </div>
        )}
      </motion.button>

      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: '6rem',
              right: '2rem',
              width: '380px',
              height: '500px',
              background: 'white',
              borderRadius: '1rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            className="chat-widget"
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #1a5f3f, #2d8659)',
              color: 'white',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              {selectedConversation ? (
                <>
                  <button onClick={handleBack} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.25rem', cursor: 'pointer' }}>
                    ←
                  </button>
                  <h3 style={{ flex: 1, margin: '0 1rem', fontSize: '1rem' }}>
                    {selectedConversation.other_user_name}
                  </h3>
                </>
              ) : (
                <h3 style={{ flex: 1, margin: 0, fontSize: '1rem' }}>Messages</h3>
              )}
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            {/* Content */}
            {selectedConversation ? (
              /* Messages View */
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                {/* Messages List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                  {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        style={{
                          marginBottom: '1rem',
                          display: 'flex',
                          justifyContent: msg.sender_id === currentUser.id ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '70%',
                            padding: '0.75rem',
                            borderRadius: '1rem',
                            background: msg.sender_id === currentUser.id ? '#1a5f3f' : '#f3f4f6',
                            color: msg.sender_id === currentUser.id ? 'white' : '#1f2937'
                          }}
                        >
                          <div style={{ fontSize: '0.875rem' }}>{msg.message}</div>
                          <div style={{ fontSize: '0.625rem', opacity: 0.7, marginTop: '0.25rem' }}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={loading || !newMessage.trim()}
                      style={{
                        padding: '0.75rem 1rem',
                        background: '#1a5f3f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '1.25rem'
                      }}
                    >
                      ➤
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Conversations List */
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {conversations.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                    No conversations yet. Contact a seller to start chatting!
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => handleConversationClick(conv)}
                      style={{
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb',
                        cursor: 'pointer',
                        background: conv.unread_count > 0 ? '#f0fdf4' : 'white'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.25rem' }}>
                        <strong style={{ fontSize: '0.875rem', color: '#1f2937' }}>{conv.other_user_name}</strong>
                        {conv.unread_count > 0 && (
                          <span style={{
                            background: '#dc2626',
                            color: 'white',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}>
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        Re: {conv.item_title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {conv.last_message || 'No messages yet'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      {isOpen && (
        <style>{`
          @media (max-width: 768px) {
            .chat-widget {
              width: 100vw !important;
              height: 100vh !important;
              bottom: 0 !important;
              right: 0 !important;
              border-radius: 0 !important;
            }
          }
        `}</style>
      )}
    </>
  );
};

export default ChatWidget;
