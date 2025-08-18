import React, { useState, useEffect } from 'react';

const DashboardTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runTests();
  }, []);

  const addResult = (test, success, data) => {
    setTestResults(prev => [...prev, { test, success, data, timestamp: new Date().toISOString() }]);
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);

    // Test 1: Direct fetch to stats
    try {
      addResult('Direct fetch /api/stats', false, 'Starting...');
      const response = await fetch('/api/stats');
      const data = await response.json();
      addResult('Direct fetch /api/stats', true, `Status: ${response.status}, Data: ${JSON.stringify(data)}`);
    } catch (error) {
      addResult('Direct fetch /api/stats', false, `Error: ${error.message}`);
    }

    // Test 2: Direct fetch to posts
    try {
      addResult('Direct fetch /api/posts', false, 'Starting...');
      const response = await fetch('/api/posts');
      const data = await response.json();
      addResult('Direct fetch /api/posts', true, `Status: ${response.status}, Posts: ${data.length}`);
    } catch (error) {
      addResult('Direct fetch /api/posts', false, `Error: ${error.message}`);
    }

    // Test 3: Direct fetch to collaborations
    try {
      addResult('Direct fetch /api/collaborations', false, 'Starting...');
      const response = await fetch('/api/collaborations');
      const data = await response.json();
      addResult('Direct fetch /api/collaborations', true, `Status: ${response.status}, Success: ${data.success}`);
    } catch (error) {
      addResult('Direct fetch /api/collaborations', false, `Error: ${error.message}`);
    }

    // Test 4: Test axios import
    try {
      const axios = await import('axios');
      addResult('Axios import', true, 'Axios imported successfully');
      
      // Test 5: Axios request
      try {
        const response = await axios.default.get('/api/stats');
        addResult('Axios /api/stats', true, `Status: ${response.status}, Data: ${JSON.stringify(response.data)}`);
      } catch (axiosError) {
        addResult('Axios /api/stats', false, `Axios Error: ${axiosError.message}`);
      }
    } catch (importError) {
      addResult('Axios import', false, `Import Error: ${importError.message}`);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🧪 Dashboard API Test</h1>
      
      {loading && <p>Running tests...</p>}
      
      <div style={{ marginTop: '20px' }}>
        {testResults.map((result, index) => (
          <div 
            key={index} 
            style={{ 
              margin: '10px 0', 
              padding: '10px', 
              backgroundColor: result.success ? '#d4edda' : '#f8d7da',
              border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
              borderRadius: '4px'
            }}
          >
            <strong>{result.success ? '✅' : '❌'} {result.test}</strong>
            <br />
            <small>{result.data}</small>
            <br />
            <small style={{ color: '#666' }}>{result.timestamp}</small>
          </div>
        ))}
      </div>
      
      <button 
        onClick={runTests} 
        style={{ 
          marginTop: '20px', 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        🔄 Run Tests Again
      </button>
    </div>
  );
};

export default DashboardTest;