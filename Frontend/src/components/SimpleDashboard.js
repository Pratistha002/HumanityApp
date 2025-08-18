import React, { useState, useEffect } from 'react';

const SimpleDashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 SimpleDashboard: Starting fetch...');
      
      // Use native fetch instead of axios
      const [statsRes, collaborationsRes, postsRes] = await Promise.all([
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/collaborations').then(r => r.json()),
        fetch('/api/posts').then(r => r.json())
      ]);
      
      console.log('✅ SimpleDashboard: All data fetched');
      console.log('Stats:', statsRes);
      console.log('Collaborations:', collaborationsRes);
      console.log('Posts:', postsRes);
      
      setData({
        stats: statsRes,
        collaborations: collaborationsRes,
        posts: postsRes
      });
      
    } catch (error) {
      console.error('❌ SimpleDashboard: Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>🔄 Loading Simple Dashboard...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>❌ Simple Dashboard Error</h2>
        <p>Error: {error}</p>
        <button onClick={fetchData}>🔄 Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>✅ Simple Dashboard Working!</h2>
      
      <div style={{ marginTop: '20px' }}>
        <h3>📊 Stats</h3>
        <p>Total Donations: ₹{data.stats.totalDonations}</p>
        <p>Total Posts: {data.stats.totalPosts}</p>
        <p>Total Collaborations: {data.stats.totalCollaborations}</p>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>🤝 Collaborations</h3>
        <p>Success: {data.collaborations.success ? 'Yes' : 'No'}</p>
        <p>Count: {data.collaborations.data?.length || 0}</p>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>📝 Posts</h3>
        <p>Count: {data.posts.length}</p>
        <p>First Post: {data.posts[0]?.title || 'None'}</p>
      </div>
      
      <button onClick={fetchData} style={{ marginTop: '20px', padding: '10px' }}>
        🔄 Refresh Data
      </button>
    </div>
  );
};

export default SimpleDashboard;