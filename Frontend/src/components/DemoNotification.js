import React, { useState } from 'react';
import { isDemo } from '../data/demoData';
import './DemoNotification.css';

const DemoNotification = () => {
  const [isVisible, setIsVisible] = useState(isDemo);

  if (!isVisible) return null;

  return (
    <div className="demo-notification">
      <div className="demo-content">
        <div className="demo-icon">🚀</div>
        <div className="demo-text">
          <strong>Demo Mode</strong>
          <p>You're viewing a live demo with sample data. All features are functional!</p>
        </div>
        <button 
          className="demo-close"
          onClick={() => setIsVisible(false)}
          aria-label="Close demo notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default DemoNotification;