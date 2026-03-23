import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './SchoolMessages.css';

const SchoolMessages = () => {
  const { donorId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (donorId && conversations.length > 0) {
      const conv = conversations.find(c => c.donorId === donorId);
      if (conv) selectConversation(conv);
    }
  }, [donorId, conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/school/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversation) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/school/messages/${conversation.donorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
      
      // Mark as read
      if (conversation.unreadCount > 0) {
        await api.put(`/school/messages/${conversation.donorId}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(prev => prev.map(c => 
          c.donorId === conversation.donorId ? { ...c, unreadCount: 0 } : c
        ));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/school/messages/${selectedConversation.donorId}`, {
        message: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessages(prev => [...prev, response.data]);
      setConversations(prev => prev.map(c => 
        c.donorId === selectedConversation.donorId 
          ? { ...c, lastMessage: newMessage, lastMessageTime: new Date().toISOString() }
          : c
      ));
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('en-IN', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="school-loading">
        <div className="loading-spinner"></div>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="school-messages-page">
      <div className="messages-header">
        <button className="back-btn" onClick={() => navigate('/school/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Messages</h1>
      </div>

      <div className="messages-container">
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <h2>Conversations</h2>
          </div>
          <div className="conversations-list">
            {conversations.length === 0 ? (
              <div className="empty-state">No conversations yet</div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.donorId}
                  className={`conversation-item ${selectedConversation?.donorId === conv.donorId ? 'active' : ''}`}
                  onClick={() => selectConversation(conv)}
                >
                  <div className="conv-avatar">
                    <span>{conv.donorName?.charAt(0) || 'D'}</span>
                  </div>
                  <div className="conv-info">
                    <div className="conv-header">
                      <h4>{conv.donorName || 'Donor'}</h4>
                      <span className="conv-time">{formatTime(conv.lastMessageTime)}</span>
                    </div>
                    <p className="conv-last-message">{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="unread-count">{conv.unreadCount}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="messages-area">
          {selectedConversation ? (
            <>
              <div className="messages-header-area">
                <div className="donor-info">
                  <div className="donor-avatar">
                    <span>{selectedConversation.donorName?.charAt(0) || 'D'}</span>
                  </div>
                  <div>
                    <h3>{selectedConversation.donorName || 'Donor'}</h3>
                    <p className="donor-status">Donor</p>
                  </div>
                </div>
              </div>

              <div className="messages-list">
                {messages.map((message, index) => {
                  const showDate = index === 0 || 
                    new Date(message.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();
                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="message-date-divider">
                          <span>{formatDate(message.createdAt)}</span>
                        </div>
                      )}
                      <div className={`message ${message.sender === 'school' ? 'school' : 'donor'}`}>
                        <div className="message-bubble">
                          <p>{message.text}</p>
                          <span className="message-time">{formatTime(message.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="message-input-area">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  disabled={sending}
                />
                <button 
                  className={`send-btn ${newMessage.trim() ? 'active' : ''}`}
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                >
                  {sending ? '...' : 'Send'}
                </button>
              </div>
            </>
          ) : (
            <div className="no-conversation">
              <span className="no-msg-icon">💬</span>
              <h3>Select a conversation</h3>
              <p>Choose a donor from the sidebar to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolMessages;