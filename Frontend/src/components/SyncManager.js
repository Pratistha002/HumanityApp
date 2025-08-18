import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import './SyncManager.css';

const SyncManager = () => {
  const [syncStatus, setSyncStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSyncStatus();
    
    // Refresh status every 30 seconds
    const interval = setInterval(fetchSyncStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/sync/status`);
      const data = await response.json();
      
      if (data.success) {
        setSyncStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching sync status:', error);
    }
  };

  const handleForceSync = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/sync/force`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ Full synchronization completed successfully');
        fetchSyncStatus();
      } else {
        setMessage(`❌ Sync failed: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupBackups = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/sync/cleanup-backups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ Backup cleanup completed');
      } else {
        setMessage(`❌ Cleanup failed: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (!syncStatus) {
    return (
      <div className="sync-manager">
        <h3>📊 Sync Management</h3>
        <div className="loading">Loading sync status...</div>
      </div>
    );
  }

  return (
    <div className="sync-manager">
      <h3>📊 Sync Management</h3>
      
      {/* Sync Status */}
      <div className="sync-status-card">
        <h4>Current Status</h4>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Last Sync:</span>
            <span className="status-value">{formatDate(syncStatus.lastSyncTime)}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Sync in Progress:</span>
            <span className={`status-value ${syncStatus.syncInProgress ? 'active' : ''}`}>
              {syncStatus.syncInProgress ? '🔄 Yes' : '✅ No'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Pending Changes:</span>
            <span className="status-value">{syncStatus.pendingChanges}</span>
          </div>
        </div>
      </div>

      {/* Data State */}
      <div className="data-state-card">
        <h4>Data State</h4>
        <div className="data-grid">
          <div className="data-item">
            <span className="data-icon">📖</span>
            <span className="data-label">Stories</span>
            <span className="data-count">{syncStatus.dataState.stories}</span>
          </div>
          <div className="data-item">
            <span className="data-icon">💰</span>
            <span className="data-label">Donations</span>
            <span className="data-count">{syncStatus.dataState.donations}</span>
          </div>
          <div className="data-item">
            <span className="data-icon">🤝</span>
            <span className="data-label">Collaborations</span>
            <span className="data-count">{syncStatus.dataState.collaborations}</span>
          </div>
          <div className="data-item">
            <span className="data-icon">📝</span>
            <span className="data-label">Status Updates</span>
            <span className="data-count">{syncStatus.dataState.statusUpdates}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="sync-actions">
        <h4>Actions</h4>
        <div className="action-buttons">
          <button 
            className="action-btn primary"
            onClick={handleForceSync}
            disabled={loading || syncStatus.syncInProgress}
          >
            {loading ? '🔄 Syncing...' : '🔄 Force Full Sync'}
          </button>
          
          <button 
            className="action-btn secondary"
            onClick={fetchSyncStatus}
            disabled={loading}
          >
            🔍 Refresh Status
          </button>
          
          <button 
            className="action-btn warning"
            onClick={handleCleanupBackups}
            disabled={loading}
          >
            🧹 Cleanup Backups
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Help Section */}
      <div className="help-section">
        <h4>ℹ️ How Sync Works</h4>
        <ul>
          <li><strong>Excel to Portal:</strong> Changes in Excel files are automatically detected and synced to the portal in real-time</li>
          <li><strong>Portal to Excel:</strong> When you create stories, donations, or collaborations through the portal, they're immediately saved to Excel</li>
          <li><strong>Backups:</strong> Automatic backups are created before major changes to prevent data loss</li>
          <li><strong>Conflict Resolution:</strong> The system validates data and handles conflicts gracefully</li>
        </ul>
      </div>
    </div>
  );
};

export default SyncManager;