// API Configuration for Frontend-Backend Integration
const API_CONFIG = {
  // Base URL for API calls
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_API_URL || 'http://localhost:5000'
    : 'http://localhost:5000',
  
  // API Endpoints
  ENDPOINTS: {
    // Posts/Stories
    POSTS: '/api/posts',
    POST_BY_ID: (id) => `/api/posts/${id}`,
    DELETE_POST: (id) => `/api/posts/${id}`,
    
    // Donations
    DONATE: (postId) => `/api/donate/${postId}`,
    STATS: '/api/stats',
    PAYMENT_CONFIG: '/api/payment-config',
    
    // Collaborations
    COLLABORATIONS: '/api/collaborations',
    COLLABORATE: '/api/collaborate',
    
    // Success Stories
    SUCCESS_STORIES: '/api/success-stories',
    
    // Admin
    ADMIN: '/api/admin',
    ADMIN_COLLABORATIONS: '/api/admin/collaborations',
    ADMIN_DONATIONS: '/api/admin/donations',
    ADMIN_STORIES: '/api/admin/stories',
    ADMIN_STATS: '/api/admin/stats',
    
    // File uploads
    UPLOADS: '/uploads'
  },
  
  // Request timeout
  TIMEOUT: 30000,
  
  // Default headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Helper function to get full URL
export const getApiUrl = (endpoint) => {
  // If using proxy in development, don't include base URL
  if (process.env.NODE_ENV === 'development') {
    return endpoint;
  }
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get upload URL
export const getUploadUrl = (filename) => {
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:5000/uploads/${filename}`;
  }
  return `${API_CONFIG.BASE_URL}/uploads/${filename}`;
};

export default API_CONFIG;