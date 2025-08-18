import axios from 'axios';
import API_CONFIG, { getApiUrl } from '../config/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data);
    
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      // Redirect to login if needed
    }
    
    return Promise.reject(error);
  }
);

// API Service functions
const apiService = {
  // Posts/Stories
  async getPosts() {
    const response = await apiClient.get(getApiUrl(API_CONFIG.ENDPOINTS.POSTS));
    return response.data;
  },

  async createPost(formData) {
    const response = await apiClient.post(getApiUrl(API_CONFIG.ENDPOINTS.POSTS), formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async deletePost(postId) {
    const response = await apiClient.delete(getApiUrl(API_CONFIG.ENDPOINTS.DELETE_POST(postId)));
    return response.data;
  },

  // Donations
  async makeDonation(postId, donationData) {
    const response = await apiClient.post(getApiUrl(API_CONFIG.ENDPOINTS.DONATE(postId)), donationData);
    return response.data;
  },

  async getStats() {
    const response = await apiClient.get(getApiUrl(API_CONFIG.ENDPOINTS.STATS));
    return response.data;
  },

  async getPaymentConfig() {
    const response = await apiClient.get(getApiUrl(API_CONFIG.ENDPOINTS.PAYMENT_CONFIG));
    return response.data;
  },

  // Collaborations
  async getCollaborations() {
    const response = await apiClient.get(getApiUrl(API_CONFIG.ENDPOINTS.COLLABORATIONS));
    return response.data;
  },

  async submitCollaboration(collaborationData) {
    const response = await apiClient.post(getApiUrl(API_CONFIG.ENDPOINTS.COLLABORATE), collaborationData);
    return response.data;
  },

  // Success Stories
  async getSuccessStories() {
    const response = await apiClient.get(getApiUrl(API_CONFIG.ENDPOINTS.SUCCESS_STORIES));
    return response.data;
  },

  async submitSuccessStory(formData) {
    const response = await apiClient.post(getApiUrl(API_CONFIG.ENDPOINTS.SUCCESS_STORIES), formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Admin functions
  async getAdminStats(adminKey) {
    const response = await apiClient.get(getApiUrl('/api/admin/collaborations/stats'), {
      headers: { 'x-admin-key': adminKey }
    });
    return response.data;
  },

  async getAdminCollaborations(adminKey) {
    const response = await apiClient.get(getApiUrl('/api/admin/collaborations'), {
      headers: { 'x-admin-key': adminKey }
    });
    return response.data;
  },

  async updateCollaborationStatus(id, updateData, adminKey) {
    const response = await apiClient.put(getApiUrl(`/api/admin/collaborations/${id}`), updateData, {
      headers: { 'x-admin-key': adminKey }
    });
    return response.data;
  },

  async getCollaborationDetails(id, adminKey) {
    const response = await apiClient.get(getApiUrl(`/api/admin/collaborations/${id}`), {
      headers: { 'x-admin-key': adminKey }
    });
    return response.data;
  },

  async exportCollaborations(adminKey) {
    const response = await apiClient.get(getApiUrl('/api/admin/collaborations/export'), {
      headers: { 'x-admin-key': adminKey }
    });
    return response.data;
  },

  async getAdminDonations() {
    const response = await apiClient.get(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_DONATIONS));
    return response.data;
  },

  async getAdminStories() {
    const response = await apiClient.get(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_STORIES));
    return response.data;
  }
};

export default apiService;