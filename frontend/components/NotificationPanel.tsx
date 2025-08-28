import React, { useState, useEffect } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task_reminder' | 'time_block_alert' | 'deadline_warning' | 'productivity_summary' | 'system_alert';
  priority: number;
  read: boolean;
  createdAt: string;
}

const NotificationPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // In a real implementation, this would fetch notifications from the API
  useEffect(() => {
    // Simulate fetching notifications
    const fetchNotifications = async () => {
      // This would be an API call in a real implementation
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Task Reminder',
          message: 'Remember to complete your project by tomorrow',
          type: 'task_reminder',
          priority: 3,
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Meeting Starting Soon',
          message: 'Your team meeting starts in 10 minutes',
          type: 'time_block_alert',
          priority: 2,
          read: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    };

    fetchNotifications();
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
    setUnreadCount(unreadCount - 1);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    setUnreadCount(0);
  };

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(unreadCount - 1);
    }
  };

  return (
    <div className="notification-panel">
      <button 
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="unread-count">{unreadCount}</span>
        )}
      </button>
      
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <button onClick={markAllAsRead}>Mark all as read</button>
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="no-notifications">No notifications</p>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                >
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <small>{new Date(notification.createdAt).toLocaleString()}</small>
                  </div>
                  <div className="notification-actions">
                    {!notification.read && (
                      <button onClick={() => markAsRead(notification.id)}>Mark as read</button>
                    )}
                    <button onClick={() => dismissNotification(notification.id)}>Dismiss</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .notification-panel {
          position: relative;
        }
        
        .notification-bell {
          position: relative;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
        
        .unread-count {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: #ff4757;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
        }
        
        .notification-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          width: 350px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }
        
        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .notification-header h3 {
          margin: 0;
        }
        
        .notification-list {
          max-height: 400px;
          overflow-y: auto;
        }
        
        .notification-item {
          padding: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .notification-item.unread {
          background-color: #f0f8ff;
        }
        
        .notification-content h4 {
          margin: 0 0 5px 0;
        }
        
        .notification-content p {
          margin: 5px 0;
          color: #666;
        }
        
        .notification-content small {
          color: #999;
        }
        
        .notification-actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        
        .notification-actions button {
          padding: 5px 10px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 3px;
          cursor: pointer;
          font-size: 0.8rem;
        }
        
        .no-notifications {
          text-align: center;
          padding: 20px;
          color: #999;
        }
      `}</style>
    </div>
  );
};

export default NotificationPanel;