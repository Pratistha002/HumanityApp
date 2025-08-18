import React from 'react';
import { getUploadUrl } from '../config/api';

const PostList = ({ posts, onDonate }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUrgencyClass = (level) => {
    return `urgency-badge urgency-${level}`;
  };

  const renderMedia = (media) => {
    if (!media || media.length === 0) return null;

    const firstMedia = media[0];
    
    if (firstMedia.mimetype.startsWith('image/')) {
      return (
        <img 
          src={getUploadUrl(firstMedia.filename)} 
          alt="Story media"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      );
    } else if (firstMedia.mimetype.startsWith('video/')) {
      return (
        <video 
          src={getUploadUrl(firstMedia.filename)} 
          controls
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      );
    }
    
    return null;
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="form-container">
        <h2>No Stories Yet</h2>
        <p>Be the first to share a story and help someone in need!</p>
      </div>
    );
  }

  return (
    <div className="stories-section">
      <div className="stories-header">
        <h2>💝 Stories of Hope</h2>
        <p>These are real stories of people who need our help. Every donation makes a difference in someone's life.</p>
        <div className="stories-quote">
          <p>"The purpose of human life is to serve, and to show compassion and the will to help others." - Albert Schweitzer</p>
        </div>
      </div>
      
      <div className="posts-grid">
        {posts.map(post => (
          <div key={post.id} className="post-card">
            {post.media && post.media.length > 0 && (
              <div className="post-media">
                {renderMedia(post.media)}
                <div className={getUrgencyClass(post.urgencyLevel)}>
                  {post.urgencyLevel.toUpperCase()}
                </div>
              </div>
            )}
            
            <div className="post-content">
              <h3 className="post-title">{post.title}</h3>
              <p className="post-description">{post.description}</p>
              
              <div className="post-meta">
                <span>📍 {post.location}</span>
                <span>📅 {formatDate(post.createdAt)}</span>
              </div>
              
              {post.contactInfo && (
                <div className="post-meta">
                  <span>📞 {post.contactInfo}</span>
                </div>
              )}
              
              <div className="post-meta">
                <span>💰 ₹{post.donationAmount?.toLocaleString() || 0} raised</span>
                <span>👥 {post.donations || 0} donors</span>
              </div>
              
              {/* Debug info - remove in production */}
              <div style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
                Debug: donationAmount={post.donationAmount}, donations={post.donations}
              </div>
              
              <div className="post-actions">
                <button 
                  className="btn btn-success donate-btn"
                  onClick={() => onDonate(post)}
                >
                  <span className="btn-icon">💝</span>
                  <span className="btn-text">Donate Now</span>
                  <span className="btn-ripple"></span>
                </button>
                
                {post.media && post.media.length > 1 && (
                  <span className="media-count">
                    +{post.media.length - 1} more media
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostList;