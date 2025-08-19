// Demo service for GitHub Pages deployment
import { demoStories, demoStats, demoCollaborations } from '../data/demoData';

class DemoService {
  constructor() {
    this.stories = [...demoStories];
    this.stats = { ...demoStats };
    this.collaborations = [...demoCollaborations];
    this.donations = [];
  }

  // Simulate API delay
  delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Posts/Stories endpoints
  async getPosts() {
    await this.delay();
    return {
      success: true,
      data: this.stories
    };
  }

  async getPostById(id) {
    await this.delay();
    const post = this.stories.find(p => p.id === parseInt(id));
    return {
      success: !!post,
      data: post || null
    };
  }

  async createPost(postData) {
    await this.delay();
    const newPost = {
      id: Date.now(),
      ...postData,
      donationAmount: 0,
      donations: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.stories.push(newPost);
    return {
      success: true,
      data: newPost
    };
  }

  // Stats endpoint
  async getStats() {
    await this.delay();
    return {
      success: true,
      data: this.stats
    };
  }

  // Donation endpoint
  async donate(postId, donationData) {
    await this.delay();
    
    // Find the post and update donation amount
    const postIndex = this.stories.findIndex(p => p.id === parseInt(postId));
    if (postIndex !== -1) {
      this.stories[postIndex].donationAmount += donationData.amount;
      this.stories[postIndex].donations += 1;
      this.stories[postIndex].updatedAt = new Date().toISOString();
    }

    // Add to donations list
    const donation = {
      id: Date.now(),
      postId: parseInt(postId),
      ...donationData,
      status: 'completed',
      timestamp: new Date().toISOString()
    };
    this.donations.push(donation);

    // Update stats
    this.stats.totalDonations += donationData.amount;
    this.stats.totalDonors += 1;
    this.stats.recentDonations.unshift({
      id: donation.id,
      donorName: donationData.donorName || 'Anonymous',
      amount: donationData.amount,
      storyTitle: this.stories[postIndex]?.title || 'Unknown Story',
      timestamp: donation.timestamp
    });
    
    // Keep only last 5 recent donations
    this.stats.recentDonations = this.stats.recentDonations.slice(0, 5);

    return {
      success: true,
      data: donation,
      message: 'Thank you for your donation! (Demo Mode)'
    };
  }

  // Collaboration endpoints
  async getCollaborations() {
    await this.delay();
    return {
      success: true,
      data: this.collaborations
    };
  }

  async submitCollaboration(collaborationData) {
    await this.delay();
    const newCollaboration = {
      id: Date.now(),
      ...collaborationData,
      status: 'pending',
      priority: 'medium',
      submittedAt: new Date().toISOString()
    };
    this.collaborations.push(newCollaboration);
    this.stats.totalCollaborations += 1;
    
    return {
      success: true,
      data: newCollaboration,
      message: 'Collaboration request submitted successfully! (Demo Mode)'
    };
  }

  // Payment config
  async getPaymentConfig() {
    await this.delay();
    return {
      success: true,
      data: {
        upiId: 'demo@upi',
        qrCode: '/qr-code.jpg',
        supportedMethods: ['UPI', 'Bank Transfer']
      }
    };
  }

  // Success stories
  async getSuccessStories() {
    await this.delay();
    return {
      success: true,
      data: this.stories.filter(story => story.status === 'completed').slice(0, 3)
    };
  }

  // Admin endpoints (simplified)
  async getAdminStats() {
    await this.delay();
    return {
      success: true,
      data: {
        ...this.stats,
        totalStories: this.stories.length,
        activeStories: this.stories.filter(s => s.status === 'active').length,
        completedStories: this.stories.filter(s => s.status === 'completed').length,
        pendingCollaborations: this.collaborations.filter(c => c.status === 'pending').length
      }
    };
  }
}

// Create singleton instance
const demoService = new DemoService();

export default demoService;