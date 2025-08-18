import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import SyncManager from './SyncManager';

const AdminDashboard = () => {
  const [collaborations, setCollaborations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedCollaboration, setSelectedCollaboration] = useState(null);
  const [showContactInfo, setShowContactInfo] = useState(false);

  const authenticate = () => {
    if (adminKey === 'Pratistha@123') {
      setIsAuthenticated(true);
      fetchCollaborationsWithContact();
      fetchStats();
    } else {
      alert('Invalid admin key. Please enter the correct admin key.');
    }
  };

  const fetchCollaborationsWithContact = async () => {
    try {
      const response = await apiService.getAdminCollaborations(adminKey);
      setCollaborations(response.data || []);
    } catch (error) {
      console.error('Error fetching collaborations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getAdminStats(adminKey);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateCollaborationStatus = async (id, status, notes = '') => {
    try {
      console.log('Updating collaboration:', { id, status, notes });
      const response = await apiService.updateCollaborationStatus(id, 
        { status, notes }, 
        adminKey
      );
      console.log('Update response:', response);
      
      // Refresh the collaborations list
      await fetchCollaborationsWithContact();
      setSelectedCollaboration(null);
      
      // Show success message
      alert(`Collaboration status updated to: ${status.toUpperCase()}`);
    } catch (error) {
      console.error('Error updating collaboration:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      alert(`Error updating collaboration status: ${errorMessage}`);
    }
  };

  const viewCollaborationDetails = async (id) => {
    try {
      const response = await apiService.getCollaborationDetails(id, adminKey);
      setSelectedCollaboration(response.data);
      setShowContactInfo(true);
    } catch (error) {
      console.error('Error fetching collaboration details:', error);
    }
  };

  const exportData = async () => {
    try {
      const response = await apiService.exportCollaborations(adminKey);
      
      // Create and download CSV
      const csvContent = convertToCSV(response.data);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `collaborations_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  if (!isAuthenticated) {
    return (
      <div className="form-container">
        <h2>🔐 Admin Dashboard</h2>
        <p>Enter admin key to access collaboration management and view contact details</p>
        
        <div className="form-group">
          <label htmlFor="adminKey">Admin Key</label>
          <input
            type="password"
            id="adminKey"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Enter your admin key"
            onKeyPress={(e) => e.key === 'Enter' && authenticate()}
          />
        </div>
        
        <button className="btn btn-primary" onClick={authenticate}>
          🔓 Access Dashboard
        </button>
        
        <div className="admin-info">
          <h3>ℹ️ Admin Features</h3>
          <ul>
            <li>✅ View all collaboration requests with full contact information</li>
            <li>✅ Access email addresses and phone numbers of partners</li>
            <li>✅ Update collaboration status and add notes</li>
            <li>✅ Export collaboration data for analysis</li>
            <li>✅ View detailed statistics and analytics</li>
            <li>🔒 Contact information is hidden from public dashboard</li>
          </ul>
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '8px' }}>
            <p><strong>🔐 Admin Access:</strong> Secure Key Required</p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Only authorized personnel can view partner contact details
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="form-container">
        <h2>📊 Admin Dashboard</h2>
        <p>Loading collaboration data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="form-container">
        <div className="admin-header">
          <h2>📊 Admin Dashboard</h2>
          <div className="admin-actions">
            <button className="btn btn-secondary" onClick={exportData}>
              📥 Export Data
            </button>
            <button className="btn btn-primary" onClick={() => setIsAuthenticated(false)}>
              🚪 Logout
            </button>
          </div>
        </div>

        {stats && (
          <div className="admin-stats">
            <div className="stat-card">
              <h3>📊 Total Requests</h3>
              <span className="stat-number">{stats.total}</span>
            </div>
            <div className="stat-card">
              <h3>⏳ Pending</h3>
              <span className="stat-number">{stats.pending}</span>
            </div>
            <div className="stat-card">
              <h3>✅ Approved</h3>
              <span className="stat-number">{stats.approved}</span>
            </div>
            <div className="stat-card">
              <h3>📞 Contacted</h3>
              <span className="stat-number">{stats.contacted}</span>
            </div>
          </div>
        )}
      </div>

      {/* Sync Management Section */}
      <SyncManager />

      <div className="form-container">
        <h3>🤝 Collaboration Requests with Contact Information</h3>
        <p className="admin-warning">
          ⚠️ This information is confidential and should be handled securely.
        </p>

        {collaborations.length === 0 ? (
          <p>No collaboration requests found.</p>
        ) : (
          <div className="admin-collaborations">
            {collaborations.map(collab => (
              <div key={collab.id || collab._id} className="admin-collab-card">
                <div className="collab-header">
                  <h4>{collab.organizationName}</h4>
                  <span className={`status-badge status-${collab.status}`}>
                    {collab.status}
                  </span>
                </div>
                
                <div className="collab-info">
                  <p><strong>Contact Person:</strong> {collab.contactPerson}</p>
                  <p><strong>📧 Email:</strong> {collab.email}</p>
                  <p><strong>📞 Phone:</strong> {collab.phone}</p>
                  <p><strong>Organization Type:</strong> {collab.organizationType}</p>
                  <p><strong>Collaboration Type:</strong> {collab.collaborationType}</p>
                  <p><strong>Description:</strong> {collab.description}</p>
                  {collab.resources && collab.resources.length > 0 && (
                    <p><strong>Resources:</strong> {collab.resources.join(', ')}</p>
                  )}
                  <p><strong>Submitted:</strong> {new Date(collab.submittedAt).toLocaleDateString()}</p>
                  {collab.lastContactedAt && (
                    <p><strong>Last Contacted:</strong> {new Date(collab.lastContactedAt).toLocaleDateString()}</p>
                  )}
                </div>

                <div className="collab-actions">
                  <button 
                    className="btn btn-success btn-small"
                    onClick={() => updateCollaborationStatus(collab.id || collab._id, 'approved')}
                    disabled={collab.status === 'approved'}
                  >
                    ✅ Approve
                  </button>
                  <button 
                    className="btn btn-warning btn-small"
                    onClick={() => updateCollaborationStatus(collab.id || collab._id, 'contacted')}
                    disabled={collab.status === 'contacted'}
                  >
                    📞 Mark Contacted
                  </button>
                  <button 
                    className="btn btn-danger btn-small"
                    onClick={() => updateCollaborationStatus(collab.id || collab._id, 'rejected')}
                    disabled={collab.status === 'rejected'}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;