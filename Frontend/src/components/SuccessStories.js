import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const SuccessStories = () => {
  const [successStories, setSuccessStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    beforeDescription: '',
    afterDescription: '',
    donationAmount: '',
    helpedBy: '',
    location: ''
  });
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSuccessStories();
  }, []);

  const fetchSuccessStories = async () => {
    try {
      const stories = await apiService.getSuccessStories();
      setSuccessStories(stories);
    } catch (error) {
      console.error('Error fetching success stories:', error);
      // Set some demo data if API fails
      setSuccessStories([
        {
          id: 1,
          title: "Medical Treatment Success",
          description: "Thanks to your donations, Ravi received the heart surgery he desperately needed.",
          beforeDescription: "Ravi was suffering from a critical heart condition and couldn't afford the surgery.",
          afterDescription: "After successful surgery, Ravi is now healthy and back to work, supporting his family.",
          donationAmount: 250000,
          helpedBy: "Community Donors",
          location: "Mumbai, Maharashtra",
          createdAt: new Date().toISOString(),
          media: []
        },
        {
          id: 2,
          title: "Education Dream Fulfilled",
          description: "Priya completed her engineering degree with your support and now works at a tech company.",
          beforeDescription: "Priya's family couldn't afford her college fees despite her excellent grades.",
          afterDescription: "Priya graduated with honors and secured a job, now helping other students in need.",
          donationAmount: 180000,
          helpedBy: "Education Foundation",
          location: "Bangalore, Karnataka",
          createdAt: new Date().toISOString(),
          media: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      files.forEach(file => {
        submitData.append('media', file);
      });

      await apiService.submitSuccessStory(submitData);

      setMessage('Success story shared successfully!');
      setFormData({
        title: '',
        description: '',
        beforeDescription: '',
        afterDescription: '',
        donationAmount: '',
        helpedBy: '',
        location: ''
      });
      setFiles([]);
      setShowForm(false);
      fetchSuccessStories();
    } catch (error) {
      setMessage('Error sharing success story. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderMedia = (media) => {
    if (!media || media.length === 0) return null;

    const firstMedia = media[0];
    
    if (firstMedia.mimetype && firstMedia.mimetype.startsWith('image/')) {
      return (
        <img 
          src={`http://localhost:5000${firstMedia.path}`} 
          alt="Success story"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      );
    } else if (firstMedia.mimetype && firstMedia.mimetype.startsWith('video/')) {
      return (
        <video 
          src={`http://localhost:5000${firstMedia.path}`} 
          controls
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      );
    }
    
    return null;
  };

  if (loading && successStories.length === 0) {
    return (
      <div className="form-container">
        <h2>🌟 Success Stories</h2>
        <p>Loading inspiring stories...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="success-stories-header">
        <div className="form-container">
          <h2>🌟 Success Stories</h2>
          <p>Celebrating the positive impact we've made together. These stories show how your donations have transformed lives.</p>
          
          <div className="success-stats">
            <div className="success-stat">
              <span className="stat-number">{successStories.length}</span>
              <span className="stat-label">Lives Changed</span>
            </div>
            <div className="success-stat">
              <span className="stat-number">
                ₹{successStories.reduce((total, story) => total + (story.donationAmount || 0), 0).toLocaleString()}
              </span>
              <span className="stat-label">Total Impact</span>
            </div>
          </div>

          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '❌ Cancel' : '➕ Share Success Story'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>Share a Success Story</h3>
          <p>Help inspire others by sharing how donations made a difference.</p>
          
          {message && (
            <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Success Story Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Brief title describing the success"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Overall Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Brief overview of the success story"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="beforeDescription">Before (The Challenge) *</label>
                <textarea
                  id="beforeDescription"
                  name="beforeDescription"
                  value={formData.beforeDescription}
                  onChange={handleInputChange}
                  required
                  placeholder="Describe the situation before help was received"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="afterDescription">After (The Success) *</label>
                <textarea
                  id="afterDescription"
                  name="afterDescription"
                  value={formData.afterDescription}
                  onChange={handleInputChange}
                  required
                  placeholder="Describe the positive outcome and current situation"
                  rows="4"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="donationAmount">Total Donation Amount (₹)</label>
                <input
                  type="number"
                  id="donationAmount"
                  name="donationAmount"
                  value={formData.donationAmount}
                  onChange={handleInputChange}
                  placeholder="Total amount that helped"
                />
              </div>

              <div className="form-group">
                <label htmlFor="helpedBy">Helped By</label>
                <input
                  type="text"
                  id="helpedBy"
                  name="helpedBy"
                  value={formData.helpedBy}
                  onChange={handleInputChange}
                  placeholder="Who provided the help (e.g., Community, Organization)"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                placeholder="City, State"
              />
            </div>

            <div className="form-group">
              <label>Photos/Videos of Success</label>
              <div className="file-input" onClick={() => document.getElementById('success-media').click()}>
                <input
                  type="file"
                  id="success-media"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />
                <p>📸 Click to select photos or videos showing the positive outcome</p>
                <p>Maximum 5 files, 10MB each</p>
                {files.length > 0 && (
                  <p>✅ {files.length} file(s) selected</p>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? 'Sharing...' : '🌟 Share Success Story'}
            </button>
          </form>
        </div>
      )}

      {successStories.length === 0 ? (
        <div className="form-container">
          <h3>No Success Stories Yet</h3>
          <p>Be the first to share an inspiring success story!</p>
        </div>
      ) : (
        <div className="success-stories-grid">
          {successStories.map(story => (
            <div key={story.id} className="success-story-card">
              {story.media && story.media.length > 0 && (
                <div className="story-media">
                  {renderMedia(story.media)}
                </div>
              )}
              
              <div className="story-content">
                <h3 className="story-title">🌟 {story.title}</h3>
                <p className="story-description">{story.description}</p>
                
                <div className="before-after">
                  <div className="before-section">
                    <h4>📉 Before</h4>
                    <p>{story.beforeDescription}</p>
                  </div>
                  
                  <div className="after-section">
                    <h4>📈 After</h4>
                    <p>{story.afterDescription}</p>
                  </div>
                </div>
                
                <div className="story-meta">
                  <div className="meta-item">
                    <span className="meta-label">💰 Impact:</span>
                    <span className="meta-value">₹{story.donationAmount?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">🤝 Helped by:</span>
                    <span className="meta-value">{story.helpedBy || 'Community'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">📍 Location:</span>
                    <span className="meta-value">{story.location}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">📅 Date:</span>
                    <span className="meta-value">{formatDate(story.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuccessStories;