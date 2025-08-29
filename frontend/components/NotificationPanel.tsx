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
    <div style={{ position: 'relative' }}>
      <button 
        style={{ 
          position: 'relative',
          background: 'none',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: '#ff4757',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem'
          }}>
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          width: '350px',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          zIndex: 1000
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px',
            borderBottom: '1px solid #eee'
          }}>
            <h3 style={{ margin: 0 }}>Notifications</h3>
            <button 
              onClick={markAllAsRead}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer'
              }}
            >
              Mark all as read
            </button>
          </div>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <p style={{ padding: '15px', textAlign: 'center', color: '#666' }}>No notifications</p>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  style={{
                    padding: '15px',
                    borderBottom: '1px solid #eee',
                    backgroundColor: notification.read ? 'white' : '#f0f8ff'
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 5px 0' }}>{notification.title}</h4>
                    <p style={{ margin: '5px 0', color: '#666' }}>{notification.message}</p>
                    <small style={{ color: '#999' }}>{new Date(notification.createdAt).toLocaleString()}</small>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    {!notification.read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#007bff',
                          cursor: 'pointer'
                        }}
                      >
                        Mark as read
                      </button>
                    )}
                    <button 
                      onClick={() => dismissNotification(notification.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#007bff',
                        cursor: 'pointer'
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;