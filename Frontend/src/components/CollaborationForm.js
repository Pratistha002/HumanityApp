import React, { useState } from 'react';
import apiService from '../services/apiService';

const CollaborationForm = () => {
  const [formData, setFormData] = useState({
    organizationName: '',
    contactPerson: '',
    email: '',
    phone: '',
    organizationType: '',
    description: '',
    resources: [],
    collaborationType: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const organizationTypes = [
    'NGO/Non-Profit',
    'Corporate/Business',
    'Educational Institution',
    'Healthcare Organization',
    'Government Agency',
    'Religious Organization',
    'Community Group',
    'Individual Volunteer'
  ];

  const collaborationTypes = [
    'Financial Support',
    'Resource Donation',
    'Volunteer Services',
    'Skill-based Support',
    'Awareness Campaign',
    'Event Partnership',
    'Long-term Partnership'
  ];

  const availableResources = [
    'Food & Supplies',
    'Medical Equipment',
    'Educational Materials',
    'Transportation',
    'Technology/Equipment',
    'Professional Services',
    'Venue/Space',
    'Marketing Support'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleResourceChange = (resource) => {
    const updatedResources = formData.resources.includes(resource)
      ? formData.resources.filter(r => r !== resource)
      : [...formData.resources, resource];
    
    setFormData({
      ...formData,
      resources: updatedResources
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await apiService.submitCollaboration(formData);
      setMessage('Collaboration request submitted successfully! We will contact you soon.');
      setFormData({
        organizationName: '',
        contactPerson: '',
        email: '',
        phone: '',
        organizationType: '',
        description: '',
        resources: [],
        collaborationType: ''
      });
    } catch (error) {
      setMessage('Error submitting request. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Collaborate With Us</h2>
      <p>Join us in making a difference! Whether you're an organization, business, or individual, we welcome partnerships that help us serve those in need better.</p>
      
      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="organizationName">Organization/Individual Name *</label>
          <input
            type="text"
            id="organizationName"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleInputChange}
            required
            placeholder="Your organization or full name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="contactPerson">Contact Person *</label>
          <input
            type="text"
            id="contactPerson"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleInputChange}
            required
            placeholder="Primary contact person"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="contact@organization.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="form-group">
          <label htmlFor="organizationType">Organization Type *</label>
          <select
            id="organizationType"
            name="organizationType"
            value={formData.organizationType}
            onChange={handleInputChange}
            required
          >
            <option value="">Select organization type</option>
            {organizationTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="collaborationType">Type of Collaboration *</label>
          <select
            id="collaborationType"
            name="collaborationType"
            value={formData.collaborationType}
            onChange={handleInputChange}
            required
          >
            <option value="">Select collaboration type</option>
            {collaborationTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Available Resources (Select all that apply)</label>
          <div className="checkbox-grid">
            {availableResources.map(resource => (
              <label key={resource} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={formData.resources.includes(resource)}
                  onChange={() => handleResourceChange(resource)}
                />
                {resource}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            placeholder="Tell us about your organization and how you'd like to collaborate with us. Include any specific ideas, past experience, or goals you have in mind."
            rows="5"
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Collaboration Request'}
        </button>
      </form>

      <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
        <h3>Why Collaborate With Us?</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
          <div>
            <h4>🤝 Make Real Impact</h4>
            <p>Your contribution directly helps people in need and creates lasting change in communities.</p>
          </div>
          <div>
            <h4>🌟 Build Your Brand</h4>
            <p>Associate your organization with meaningful social causes and enhance your corporate social responsibility.</p>
          </div>
          <div>
            <h4>📈 Expand Your Network</h4>
            <p>Connect with like-minded organizations and individuals who share your values and vision.</p>
          </div>
          <div>
            <h4>💡 Share Expertise</h4>
            <p>Use your skills and resources to solve complex social problems and drive innovation in charity work.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationForm;