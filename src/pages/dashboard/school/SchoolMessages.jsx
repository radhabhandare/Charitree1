import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../../../services/api';
import './SchoolMessages.css';

// ─── Socket singleton ────────────────────────────────────────────────────────
let socketInstance = null;

const getSocket = () => {
  if (!socketInstance) {
    const token = localStorage.getItem('token');
    socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
};

// ─── Component ───────────────────────────────────────────────────────────────
const SchoolMessages = () => {
  const { donorId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimerRef = useRef(null);

  const [loading, setLoading]                     = useState(true);
  const [conversations, setConversations]         = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages]                   = useState([]);
  const [newMessage, setNewMessage]               = useState('');
  const [sending, setSending]                     = useState(false);
  const [connected, setConnected]                 = useState(false);
  const [donorTyping, setDonorTyping]             = useState(false);   // donor is typing
  const [onlineDonors, setOnlineDonors]           = useState(new Set());

  // ── Socket setup ────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    // Connection status
    socket.on('connect', () => {
      setConnected(true);
      socket.emit('school:join');           // join school-specific room
    });
    socket.on('disconnect', () => setConnected(false));

    // New message arriving in real time
    socket.on('message:new', (message) => {
      // Update chat window if this conversation is open
      setMessages(prev => {
        const exists = prev.some(m => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });

      // Update sidebar preview + unread badge
      setConversations(prev =>
        prev.map(c => {
          if (c.donorId !== message.donorId) return c;
          return {
            ...c,
            lastMessage: message.text,
            lastMessageTime: message.createdAt,
            // Only increment unread if this conversation is NOT currently open
            unreadCount: message.sender === 'donor'
              ? c.donorId === selectedConversationRef.current?.donorId
                ? 0
                : (c.unreadCount || 0) + 1
              : c.unreadCount,
          };
        })
      );
    });

    // Typing indicator
    socket.on('typing:donor', ({ donorId: tid, isTyping }) => {
      if (tid === selectedConversationRef.current?.donorId) {
        setDonorTyping(isTyping);
      }
    });

    // Online presence
    socket.on('presence:update', ({ donorId: did, online }) => {
      setOnlineDonors(prev => {
        const next = new Set(prev);
        online ? next.add(did) : next.delete(did);
        return next;
      });
    });

    // Initial online donors list
    socket.on('presence:list', (donorIds) => {
      setOnlineDonors(new Set(donorIds));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('message:new');
      socket.off('typing:donor');
      socket.off('presence:update');
      socket.off('presence:list');
    };
  }, []);

  // Keep a ref to selectedConversation so socket callbacks can read current value
  const selectedConversationRef = useRef(selectedConversation);
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // ── Data fetching ────────────────────────────────────────────────────────
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
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data);

      if (conversation.unreadCount > 0) {
        await api.put(`/school/messages/${conversation.donorId}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(prev =>
          prev.map(c => c.donorId === conversation.donorId ? { ...c, unreadCount: 0 } : c)
        );
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const selectConversation = async (conversation) => {
    // Leave previous room, join new one
    if (socketRef.current) {
      if (selectedConversationRef.current) {
        socketRef.current.emit('room:leave', { donorId: selectedConversationRef.current.donorId });
      }
      socketRef.current.emit('room:join', { donorId: conversation.donorId });
    }
    setDonorTyping(false);
    setSelectedConversation(conversation);
    await fetchMessages(conversation);
  };

  // ── Sending ──────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = newMessage.trim();
    if (!text) return;

    // Optimistic UI
    const optimistic = {
      id: `temp-${Date.now()}`,
      text,
      sender: 'school',
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages(prev => [...prev, optimistic]);
    setNewMessage('');
    setSending(true);

    // Stop typing indicator
    if (socketRef.current) {
      socketRef.current.emit('typing:school', {
        donorId: selectedConversation.donorId,
        isTyping: false,
      });
    }

    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        `/school/messages/${selectedConversation.donorId}`,
        { message: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Replace optimistic message with real one
      setMessages(prev =>
        prev.map(m => m.id === optimistic.id ? { ...response.data, pending: false } : m)
      );

      setConversations(prev =>
        prev.map(c =>
          c.donorId === selectedConversation.donorId
            ? { ...c, lastMessage: text, lastMessageTime: new Date().toISOString() }
            : c
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setNewMessage(text);   // restore input
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // ── Typing indicator ─────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (!socketRef.current || !selectedConversation) return;

    socketRef.current.emit('typing:school', {
      donorId: selectedConversation.donorId,
      isTyping: true,
    });

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit('typing:school', {
        donorId: selectedConversation.donorId,
        isTyping: false,
      });
    }, 1500);
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now  = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);

    if (diffHours < 24)  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffHours < 168) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────
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
        <button className="back-btn" onClick={() => navigate('/schools/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Messages</h1>

        {/* Real-time connection badge */}
        <span className={`connection-badge ${connected ? 'online' : 'offline'}`}>
          <span className="badge-dot" />
          {connected ? 'Live' : 'Reconnecting…'}
        </span>
      </div>

      <div className="messages-container">
        {/* ── Sidebar ── */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <h2>Conversations with Donors</h2>
          </div>
          <div className="conversations-list">
            {conversations.length === 0 ? (
              <div className="empty-state">
                No conversations yet. Donors will appear here once they message you.
              </div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.donorId}
                  className={`conversation-item ${selectedConversation?.donorId === conv.donorId ? 'active' : ''}`}
                  onClick={() => selectConversation(conv)}
                >
                  <div className="conv-avatar">
                    <span>{conv.donorName?.charAt(0) || 'D'}</span>
                    {onlineDonors.has(conv.donorId) && <span className="online-dot" />}
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

        {/* ── Chat area ── */}
        <div className="messages-area">
          {selectedConversation ? (
            <>
              <div className="messages-header-area">
                <div className="donor-info">
                  <div className="donor-avatar">
                    <span>{selectedConversation.donorName?.charAt(0) || 'D'}</span>
                    {onlineDonors.has(selectedConversation.donorId) && (
                      <span className="online-dot" />
                    )}
                  </div>
                  <div>
                    <h3>{selectedConversation.donorName || 'Donor'}</h3>
                    <p className="donor-status">
                      {donorTyping
                        ? <span className="typing-status">typing…</span>
                        : onlineDonors.has(selectedConversation.donorId)
                          ? 'Online'
                          : 'Donor'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="messages-list">
                {messages.map((message, index) => {
                  const showDate =
                    index === 0 ||
                    new Date(message.createdAt).toDateString() !==
                      new Date(messages[index - 1].createdAt).toDateString();
                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="message-date-divider">
                          <span>{formatDate(message.createdAt)}</span>
                        </div>
                      )}
                      <div
                        className={`message ${message.sender === 'school' ? 'school' : 'donor'} ${message.pending ? 'pending' : ''}`}
                      >
                        <div className="message-bubble">
                          <p>{message.text}</p>
                          <span className="message-time">
                            {formatTime(message.createdAt)}
                            {message.sender === 'school' && (
                              <span className="msg-status">
                                {message.pending ? ' ⏳' : ' ✓'}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator bubble */}
                {donorTyping && (
                  <div className="message donor typing-indicator-wrapper">
                    <div className="message-bubble typing-bubble">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="message-input-area">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === 'Enter' && !sending && sendMessage()}
                  placeholder="Type a message…"
                  disabled={sending}
                />
                <button
                  className={`send-btn ${newMessage.trim() ? 'active' : ''}`}
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                >
                  {sending ? '…' : 'Send'}
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