import { useState, useEffect } from 'react';
import './NotificationToast.css';

const NotificationToast = ({ notifications, onClose, onMarkRead }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible || !notifications || notifications.length === 0) return null;

  const latestNotification = notifications[0];

  const getIcon = (type) => {
    switch(type) {
      case 'new_donation': return '🎁';
      case 'donation_update': return '📦';
      case 'update_request': return '🔄';
      case 'need_fulfilled': return '✅';
      default: return '🔔';
    }
  };

  return (
    <div className={`notification-toast ${visible ? 'show' : 'hide'}`}>
      <div className="toast-icon">{getIcon(latestNotification.type)}</div>
      <div className="toast-content">
        <h4>{latestNotification.title}</h4>
        <p>{latestNotification.message}</p>
        <span className="toast-time">
          {new Date(latestNotification.createdAt).toLocaleTimeString()}
        </span>
      </div>
      <button className="toast-close" onClick={() => {
        onMarkRead(latestNotification._id);
        setVisible(false);
        setTimeout(onClose, 300);
      }}>×</button>
    </div>
  );
};

export default NotificationToast;