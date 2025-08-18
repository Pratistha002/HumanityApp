import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const TestDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    stats: {},
    posts: [],
    collaborations: []
  });

  useEffect(() => {
    testAPIs();
  }, []);

  const testAPIs = async () => {
    try {
      console.log('Testing APIs...');
      
      // Test stats API
      const statsRes = await apiService.getStats();
      console.log('Stats API working:', statsRes);
      
      // Test posts API
      const postsRes = await apiService.getPosts();
      console.log('Posts API working:', postsRes);
      
      // Test collaborations API
      const collaborationsRes = await apiService.getCollaborations();
      console.log('Collaborations API working:', collaborationsRes);
      
      setData({
        stats: statsRes,
        posts: postsRes,
        collaborations: collaborationsRes
      });
      
    } catch (error) {
      console.error('API Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="form-container">
        <h2>🔄 Testing Dashboard APIs...</h2>
        <p>Loading data from server...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-container">
        <h2>❌ Dashboard Error</h2>
        <p>Error: {error}</p>
        <button onClick={testAPIs} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="form-container">
        <h2>✅ Dashboard Test Results</h2>
        <p>All APIs are working correctly!</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>📊 Stats API</h3>
          <pre>{JSON.stringify(data.stats, null, 2)}</pre>
        </div>

        <div className="dashboard-card">
          <h3>📖 Posts API</h3>
          <p>Posts count: {data.posts.length}</p>
          {data.posts.slice(0, 2).map(post => (
            <div key={post.id} style={{ marginBottom: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
              <h4>{post.title}</h4>
              <p>Location: {post.location}</p>
              <p>Donations: ₹{post.donationAmount || 0}</p>
            </div>
          ))}
        </div>

        <div className="dashboard-card">
          <h3>🤝 Collaborations API</h3>
          <pre>{JSON.stringify(data.collaborations, null, 2)}</pre>
        </div>
      </div>

      <div className="dashboard-card" style={{ marginTop: '2rem' }}>
        <h3>🔧 Debug Information</h3>
        <p><strong>Stats Response Type:</strong> {typeof data.stats}</p>
        <p><strong>Posts Response Type:</strong> {typeof data.posts} (Array: {Array.isArray(data.posts) ? 'Yes' : 'No'})</p>
        <p><strong>Collaborations Response Type:</strong> {typeof data.collaborations}</p>
        
        <button onClick={() => window.location.href = '/dashboard'} className="btn btn-primary">
          Try Real Dashboard
        </button>
      </div>
    </div>
  );
};

export default TestDashboard;