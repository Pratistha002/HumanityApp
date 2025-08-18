import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import apiService from './services/apiService';
import socketService from './services/socketService';
import './App.css';

// Components
import PostForm from './components/PostForm';
import PostList from './components/PostList';
import CollaborationForm from './components/CollaborationForm';
import Dashboard from './components/Dashboard';
import QRPaymentModal from './components/QRPaymentModal';
import SuccessStories from './components/SuccessStories';
import QuotesSection from './components/QuotesSection';
import AdminDashboard from './components/AdminDashboard';
import TestDashboard from './components/TestDashboard';
import DashboardTest from './components/DashboardTest';
import SimpleDashboard from './components/SimpleDashboard';
import SyncNotification from './components/SyncNotification';

function App() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetchPosts();
    fetchStats();
    
    // Set up real-time data updates
    socketService.onDataUpdate((data) => {
      console.log('[APP] Real-time data update received:', data);
      
      // Update posts if provided
      if (data.posts) {
        console.log('[APP] Updating posts from real-time data');
        setPosts(data.posts);
      }
      
      // Update stats if provided
      if (data.stats) {
        console.log('[APP] Updating stats from real-time data');
        setStats(data.stats);
      }
      
      // Show notification to user
      if (data.changedFile) {
        console.log(`[APP] Excel file updated: ${data.changedFile}`);
        // You can add a toast notification here if needed
      }
    });
    
    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  const fetchPosts = async () => {
    try {
      console.log('🔄 Fetching posts from API...');
      const posts = await apiService.getPosts();
      console.log('📋 Received posts:', posts);
      
      // Log each post's donation data
      posts.forEach(post => {
        console.log(`  - ${post.title}: ₹${post.donationAmount} from ${post.donations} donors`);
      });
      
      setPosts(posts);
      console.log('✅ Posts state updated');
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('📊 Fetching stats from API...');
      const stats = await apiService.getStats();
      console.log('📈 Received stats:', stats);
      console.log(`  - Total Donations: ₹${stats.totalDonations}`);
      console.log(`  - Stories Shared: ${stats.totalPosts}`);
      console.log(`  - Collaborations: ${stats.totalCollaborations}`);
      
      setStats(stats);
      console.log('✅ Stats state updated');
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
    }
  };

  const handleDonate = (post) => {
    setSelectedPost(post);
    setShowPaymentModal(true);
  };

  const handleDonationComplete = () => {
    setShowPaymentModal(false);
    setSelectedPost(null);
    fetchPosts();
    fetchStats();
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              🤝 Humanity
            </Link>
            <div className="nav-menu">
              <Link to="/" className="nav-link">🏠 Home</Link>
              <Link to="/post" className="nav-link">📝 Share Story</Link>
              <Link to="/success-stories" className="nav-link">🌟 Success Stories</Link>
              <Link to="/collaborate" className="nav-link">🤝 Collaborate</Link>
              <Link to="/dashboard" className="nav-link">📊 Dashboard</Link>
              <Link to="/admin" className="nav-link">🔐 Admin</Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <div>
                <section className="hero">
                  <div className="hero-content">
                    <h1>✨ Help Those in Need ✨</h1>
                    <p>Share stories, make donations, and collaborate to make a difference in people's lives.</p>
                    <div className="hero-quote">
                      <p>"The best way to find yourself is to lose yourself in the service of others." - Mahatma Gandhi</p>
                    </div>
                    <div className="stats-bar">
                      <div className="stat">
                        <span className="stat-number">₹{stats.totalDonations?.toLocaleString() || 0}</span>
                        <span className="stat-label">Total Donations</span>
                      </div>
                      <div className="stat">
                        <span className="stat-number">{stats.totalPosts || 0}</span>
                        <span className="stat-label">Stories Shared</span>
                      </div>
                      <div className="stat">
                        <span className="stat-number">{stats.totalCollaborations || 0}</span>
                        <span className="stat-label">Collaborations</span>
                      </div>
                    </div>
                  </div>
                </section>
                <QuotesSection />
                <PostList posts={posts} onDonate={handleDonate} />
              </div>
            } />
            <Route path="/post" element={<PostForm onPostCreated={fetchPosts} posts={posts} setPosts={setPosts} />} />
            <Route path="/success-stories" element={<SuccessStories />} />
            <Route path="/collaborate" element={<CollaborationForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/test-dashboard" element={<TestDashboard />} />
            <Route path="/dashboard-test" element={<DashboardTest />} />
            <Route path="/simple-dashboard" element={<SimpleDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>

        {showPaymentModal && (
          <QRPaymentModal
            post={selectedPost}
            onClose={() => setShowPaymentModal(false)}
            onDonationComplete={handleDonationComplete}
          />
        )}

        {/* Sync Notification Component */}
        <SyncNotification />

        <footer className="footer">
          <div className="footer-content">
            <div className="footer-main">
              <div className="footer-section">
                <h3>🤝 Humanity</h3>
                <p>Connecting hearts, sharing stories, creating positive change.</p>
                <div className="footer-quote">
                  <p>"No one has ever become poor by giving." - Anne Frank</p>
                </div>
              </div>
              
              <div className="footer-section">
                <h4>Quick Links</h4>
                <div className="footer-links">
                  <Link to="/">🏠 Home</Link>
                  <Link to="/post">📝 Share Story</Link>
                  <Link to="/success-stories">🌟 Success Stories</Link>
                  <Link to="/collaborate">🤝 Collaborate</Link>
                </div>
              </div>
              
              <div className="footer-section">
                <h4>Contact Us</h4>
                <div className="footer-contact">
                  <p>📧 help@humanity.org</p>
                  <p>📞 +91 98765 43210</p>
                  <p>🌐 www.humanity.org</p>
                </div>
              </div>
              
              <div className="footer-section">
                <h4>Follow Us</h4>
                <div className="social-links">
                  <a href="#facebook">📘 Facebook</a>
                  <a href="#twitter">🐦 Twitter</a>
                  <a href="#instagram">📷 Instagram</a>
                  <a href="#linkedin">💼 LinkedIn</a>
                </div>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p>&copy; 2024 Humanity. Making a difference together.</p>
              <div className="footer-bottom-links">
                <a href="#privacy">Privacy Policy</a>
                <a href="#terms">Terms of Service</a>
                <a href="#cookies">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;