import React, { useState } from 'react';
import apiService from '../services/apiService';

const PostForm = ({ onPostCreated, posts, setPosts }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    contactInfo: '',
    urgencyLevel: 'medium'
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showMyStories, setShowMyStories] = useState(false);

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

      await apiService.createPost(submitData);

      setMessage('Story shared successfully!');
      setFormData({
        title: '',
        description: '',
        location: '',
        contactInfo: '',
        urgencyLevel: 'medium'
      });
      setFiles([]);
      
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      setMessage('Error sharing story. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this story?')) {
      return;
    }

    try {
      await apiService.deletePost(postId);
      setPosts(posts.filter(post => post.id !== postId));
      setMessage('Story deleted successfully!');
    } catch (error) {
      setMessage('Error deleting story. Please try again.');
      console.error('Error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderMedia = (media) => {
    if (!media || media.length === 0) return null;

    const firstMedia = media[0];
    
    if (firstMedia.mimetype.startsWith('image/')) {
      return (
        <img 
          src={`http://localhost:5000${firstMedia.path}`} 
          alt="Story media"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      );
    } else if (firstMedia.mimetype.startsWith('video/')) {
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

  return (
    <div>
      <div className="form-container">
        <h2>📝 Share a Story</h2>
        <p>Help us spread awareness about people in need by sharing their stories with photos or videos.</p>
        
        <div className="story-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowMyStories(!showMyStories)}
          >
            {showMyStories ? '➕ Add New Story' : '📋 Manage My Stories'}
          </button>
        </div>
        
        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
            {message}
          </div>
        )}
      </div>

      {showMyStories ? (
        <div className="form-container">
          <h3>📋 My Stories</h3>
          <p>Manage your shared stories. You can delete stories that are no longer relevant.</p>
          
          {posts && posts.length > 0 ? (
            <div className="my-stories-grid">
              {posts.map(post => (
                <div key={post.id} className="my-story-card">
                  {post.media && post.media.length > 0 && (
                    <div className="story-media-small">
                      {renderMedia(post.media)}
                    </div>
                  )}
                  
                  <div className="story-content">
                    <h4 className="story-title">{post.title}</h4>
                    <p className="story-description">{post.description.substring(0, 100)}...</p>
                    
                    <div className="story-meta">
                      <span>📍 {post.location}</span>
                      <span>📅 {formatDate(post.createdAt)}</span>
                    </div>
                    
                    <div className="story-stats">
                      <span>💰 ₹{post.donationAmount?.toLocaleString() || 0} raised</span>
                      <span>👥 {post.donations || 0} donors</span>
                    </div>
                    
                    <div className="story-actions">
                      <button 
                        className="btn btn-danger btn-small"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>You haven't shared any stories yet.</p>
          )}
        </div>
      ) : (
        <div className="form-container">
          <h3>✨ Share Your Story</h3>
          <p>Fill out the form below to share a story that needs attention and support.</p>

          <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Story Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="Brief title describing the situation"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            placeholder="Detailed description of the situation and how people can help"
            rows="5"
          />
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
            placeholder="City, State or specific address"
          />
        </div>

        <div className="form-group">
          <label htmlFor="contactInfo">Contact Information</label>
          <input
            type="text"
            id="contactInfo"
            name="contactInfo"
            value={formData.contactInfo}
            onChange={handleInputChange}
            placeholder="Phone number or email for direct contact (optional)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="urgencyLevel">Urgency Level</label>
          <select
            id="urgencyLevel"
            name="urgencyLevel"
            value={formData.urgencyLevel}
            onChange={handleInputChange}
          >
            <option value="low">Low - General support needed</option>
            <option value="medium">Medium - Moderate urgency</option>
            <option value="high">High - Immediate help required</option>
          </select>
        </div>

        <div className="form-group">
          <label>Photos/Videos</label>
          <div className="file-input" onClick={() => document.getElementById('media').click()}>
            <input
              type="file"
              id="media"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
            <p>Click to select photos or videos</p>
            <p>Maximum 5 files, 10MB each</p>
            {files.length > 0 && (
              <p>{files.length} file(s) selected</p>
            )}
          </div>
        </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Sharing...' : '🚀 Share Story'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostForm;