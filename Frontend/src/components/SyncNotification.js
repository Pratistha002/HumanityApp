import React, { useState, useEffect } from 'react';
import socketService from '../services/socketService';
import './SyncNotification.css';

const SyncNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [syncStatus, setSyncStatus] = useState({
    isOnline: false,
    lastSync: null,
    syncInProgress: false
  });

  useEffect(() => {
    // Listen for Excel data changes
    socketService.onExcelDataChanged((data) => {
      addNotification({
        id: Date.now(),
        type: 'excel-update',
        title: '🔄 Data Synchronized',
        message: 'Excel changes have been synced to portal',
        timestamp: new Date(data.timestamp),
        autoHide: true
      });
      
      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date(data.timestamp),
        syncInProgress: false
      }));
    });

    // Listen for portal data saved events
    socketService.onPortalDataSaved((data) => {
      addNotification({
        id: Date.now(),
        type: 'portal-save',
        title: '✅ Data Saved',
        message: 'Your data has been saved successfully',
        timestamp: new Date(data.timestamp),
        autoHide: true
      });
    });

    // Listen for sync errors
    socketService.onSyncError((data) => {
      addNotification({
        id: Date.now(),
        type: 'error',
        title: '❌ Sync Error',
        message: `Failed to sync: ${data.error}`,
        timestamp: new Date(data.timestamp),
        autoHide: false
      });
    });

    // Check connection status
    const checkConnectionStatus = () => {
      const status = socketService.getStatus();
      setSyncStatus(prev => ({
        ...prev,
        isOnline: status.connected
      }));
    };

    const statusInterval = setInterval(checkConnectionStatus, 5000);
    checkConnectionStatus();

    return () => {
      clearInterval(statusInterval);
    };
  }, []);

  const addNotification = (notification) => {
    // For save notifications, remove any existing save notifications first
    if (notification.type === 'portal-save' || notification.type === 'excel-update') {
      setNotifications(prev => prev.filter(n => n.type !== 'portal-save' && n.type !== 'excel-update'));
    }
    
    // Add the new notification
    setNotifications(prev => [notification, ...prev.slice(0, 2)]); // Keep only 3 notifications max

    if (notification.autoHide) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };



  const formatTime = (date) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  return (
    <div className="sync-notification-container">
      {/* Notifications */}
      <div className="notifications-list">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`notification ${notification.type}`}
            onClick={() => removeNotification(notification.id)}
          >
            <div className="notification-header">
              <span className="notification-title">{notification.title}</span>
              <span className="notification-time">
                {formatTime(notification.timestamp)}
              </span>
              <button 
                className="notification-close"
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(notification.id);
                }}
              >
                ×
              </button>
            </div>
            <div className="notification-message">{notification.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SyncNotification;