import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [collaborations, setCollaborations] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Dashboard: Starting to fetch data with native fetch...');

      // Use native fetch instead of axios to isolate the issue
      const [statsRes, collaborationsRes, postsRes] = await Promise.all([
        fetch('/api/stats').then(response => {
          if (!response.ok) {
            throw new Error(`Stats API failed: ${response.status} ${response.statusText}`);
          }
          return response.json();
        }),
        fetch('/api/collaborations').then(response => {
          if (!response.ok) {
            throw new Error(`Collaborations API failed: ${response.status} ${response.statusText}`);
          }
          return response.json();
        }),
        fetch('/api/posts').then(response => {
          if (!response.ok) {
            throw new Error(`Posts API failed: ${response.status} ${response.statusText}`);
          }
          return response.json();
        })
      ]);

      console.log('✅ Dashboard: All data fetched successfully');
      console.log('Stats:', statsRes);
      console.log('Collaborations:', collaborationsRes);
      console.log('Posts:', postsRes);

      // Set stats
      setStats(statsRes || {});
      
      // Handle collaborations response structure
      if (collaborationsRes && collaborationsRes.success && collaborationsRes.data) {
        setCollaborations(collaborationsRes.data);
      } else if (Array.isArray(collaborationsRes)) {
        setCollaborations(collaborationsRes);
      } else {
        setCollaborations([]);
      }
      
      // Handle posts response
      if (Array.isArray(postsRes)) {
        setPosts(postsRes);
      } else {
        setPosts([]);
      }

    } catch (error) {
      console.error('❌ Dashboard: Error fetching dashboard data:', error);
      setError(error.message);
      // Set default values on error
      setStats({});
      setCollaborations([]);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'No date';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status || 'pending'}`;
  };

  if (loading) {
    return (
      <div className="form-container">
        <h2>📊 Loading Dashboard...</h2>
        <p>Fetching your charity data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-container">
        <h2>❌ Dashboard Error</h2>
        <p>Error loading dashboard: {error}</p>
        <button 
          className="btn btn-primary" 
          onClick={fetchDashboardData}
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="form-container">
        <h2>📊 Charity Dashboard</h2>
        <p>Overview of our impact and collaboration efforts</p>
      </div>

      {/* Statistics Overview */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>💰 Financial Impact</h3>
          <div className="stat-large">
            <span className="stat-number">₹{(stats.totalDonations || 0).toLocaleString()}</span>
            <span className="stat-label">Total Donations Raised</span>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <p>Total donors: {stats.totalDonors || 0}</p>
            <p>Average donation: ₹{stats.averageDonation || 0}</p>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>📖 Stories & Reach</h3>
          <div className="stat-large">
            <span className="stat-number">{stats.totalPosts || posts.length || 0}</span>
            <span className="stat-label">Stories Shared</span>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <p>Recent donations: {stats.recentDonations ? stats.recentDonations.length : 0}</p>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>🤝 Collaborations</h3>
          <div className="stat-large">
            <span className="stat-number">{stats.totalCollaborations || collaborations.length || 0}</span>
            <span className="stat-label">Partnership Requests</span>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <p>Pending: {collaborations.filter(c => (c.status || 'pending') === 'pending').length}</p>
          </div>
        </div>
      </div>

      {/* Recent Donations */}
      <div className="dashboard-card" style={{ marginTop: '2rem' }}>
        <h3>💝 Recent Donations</h3>
        {stats.recentDonations && stats.recentDonations.length > 0 ? (
          <div>
            {stats.recentDonations.map((donation, index) => (
              <div key={donation.id || index} className="collaboration-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4>{donation.donorName || 'Anonymous'}</h4>
                    <p>₹{(donation.amount || 0).toLocaleString()} via {(donation.paymentMethod || 'UPI').toUpperCase()}</p>
                    <p style={{ fontSize: '0.8rem', color: '#888' }}>
                      {formatDate(donation.timestamp)}
                    </p>
                  </div>
                  <div className="status-badge status-approved">
                    Completed
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No donations yet. Share stories to start receiving donations!</p>
        )}
      </div>

      {/* Top Performing Stories */}
      <div className="dashboard-card" style={{ marginTop: '2rem' }}>
        <h3>🌟 Top Performing Stories</h3>
        {posts.length > 0 ? (
          <div>
            {posts
              .sort((a, b) => (b.donationAmount || 0) - (a.donationAmount || 0))
              .slice(0, 5)
              .map((post, index) => (
                <div key={post.id || index} className="collaboration-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4>{post.title || 'Untitled Story'}</h4>
                      <p>📍 {post.location || 'Unknown Location'}</p>
                      <p>💰 ₹{(post.donationAmount || 0).toLocaleString()} from {post.donations || 0} donors</p>
                      <p style={{ fontSize: '0.8rem', color: '#888' }}>
                        Posted: {formatDate(post.createdAt)}
                      </p>
                    </div>
                    <div className={`urgency-badge urgency-${post.urgencyLevel || 'medium'}`}>
                      {(post.urgencyLevel || 'medium').toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p>No stories shared yet. Start by sharing the first story!</p>
        )}
      </div>

      {/* Collaboration Requests */}
      <div className="dashboard-card" style={{ marginTop: '2rem' }}>
        <h3>🤝 Collaboration Requests</h3>
        {collaborations.length > 0 ? (
          <div>
            {collaborations
              .sort((a, b) => new Date(b.submittedAt || b.createdAt || Date.now()) - new Date(a.submittedAt || a.createdAt || Date.now()))
              .map((collab, index) => (
                <div key={collab.id || index} className="collaboration-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4>{collab.organizationName || 'Unknown Organization'}</h4>
                      <p><strong>Contact:</strong> {collab.contactPerson || 'Not provided'}</p>
                      <p><strong>Type:</strong> {collab.organizationType || 'Not specified'}</p>
                      <p><strong>Collaboration:</strong> {collab.collaborationType || 'Not specified'}</p>
                      <p><strong>Note:</strong> Contact details are private (Admin access required)</p>
                      {collab.resources && collab.resources.length > 0 && (
                        <p><strong>Resources:</strong> {collab.resources.join(', ')}</p>
                      )}
                      <p style={{ marginTop: '0.5rem' }}>{collab.description || 'No description provided'}</p>
                      <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>
                        Submitted: {formatDate(collab.submittedAt || collab.createdAt)}
                      </p>
                    </div>
                    <div className={getStatusClass(collab.status)}>
                      {(collab.status || 'pending').toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p>No collaboration requests yet. Promote your collaboration page to attract partners!</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-card" style={{ marginTop: '2rem' }}>
        <h3>⚡ Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/post'}
          >
            📝 Share New Story
          </button>
          <button 
            className="btn btn-success"
            onClick={() => window.location.href = '/collaborate'}
          >
            🤝 Find Collaborators
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/'}
          >
            🏠 View All Stories
          </button>
          <button 
            className="btn btn-success"
            onClick={fetchDashboardData}
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Impact Summary */}
      <div className="dashboard-card" style={{ marginTop: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <h3>🎯 Our Impact</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {posts.reduce((sum, post) => sum + (post.donations || 0), 0)}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Lives Touched</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {posts.filter(post => (post.urgencyLevel || 'medium') === 'high').length}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Urgent Cases</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {collaborations.filter(c => (c.status || 'pending') === 'approved').length}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Active Partners</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {posts.length > 0 ? new Set(posts.map(post => (post.location || 'Unknown').split(',')[0])).size : 0}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Cities Reached</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;