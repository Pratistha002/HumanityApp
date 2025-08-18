// Real-time notification system
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.init();
    }

    init() {
        this.createContainer();
        this.setupEventListeners();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);
    }

    show(type, title, message, duration = 5000) {
        const notification = this.createNotification(type, title, message);
        this.container.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);

        // Auto remove
        setTimeout(() => {
            this.remove(notification);
        }, duration);

        return notification;
    }

    createNotification(type, title, message) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle',
            donation: 'fas fa-heart'
        };

        const colors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6',
            donation: '#EC4899'
        };

        notification.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            border-left: 4px solid ${colors[type]};
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s ease;
            pointer-events: auto;
            position: relative;
            overflow: hidden;
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="color: ${colors[type]}; font-size: 20px; margin-top: 2px;">
                    <i class="${icons[type]}"></i>
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #1F2937; margin-bottom: 4px;">
                        ${title}
                    </div>
                    <div style="color: #6B7280; font-size: 14px; line-height: 1.4;">
                        ${message}
                    </div>
                </div>
                <button onclick="notificationSystem.remove(this.parentElement.parentElement)" 
                        style="background: none; border: none; color: #9CA3AF; cursor: pointer; padding: 4px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-progress" style="
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: ${colors[type]};
                width: 100%;
                transform-origin: left;
                animation: progress 5s linear;
            "></div>
        `;

        return notification;
    }

    remove(notification) {
        if (notification && notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.parentElement.removeChild(notification);
                }
            }, 300);
        }
    }

    success(title, message) {
        return this.show('success', title, message);
    }

    error(title, message) {
        return this.show('error', title, message);
    }

    warning(title, message) {
        return this.show('warning', title, message);
    }

    info(title, message) {
        return this.show('info', title, message);
    }

    donation(amount, storyTitle) {
        return this.show('donation', 'New Donation!', 
            `₹${amount} donated to "${storyTitle}". Thank you for making a difference!`, 7000);
    }

    setupEventListeners() {
        // Listen for donation events
        document.addEventListener('donationComplete', (e) => {
            this.donation(e.detail.amount, e.detail.storyTitle);
        });

        // Listen for story submission events
        document.addEventListener('storySubmitted', (e) => {
            this.success('Story Submitted!', 'Your story has been submitted and will be reviewed soon.');
        });

        // Listen for collaboration events
        document.addEventListener('collaborationSubmitted', (e) => {
            this.success('Collaboration Request Sent!', 'Thank you for your interest. We will contact you soon.');
        });
    }
}

// Add progress animation CSS
const progressStyles = `
    @keyframes progress {
        from {
            transform: scaleX(1);
        }
        to {
            transform: scaleX(0);
        }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = progressStyles;
document.head.appendChild(styleSheet);

// Initialize notification system
const notificationSystem = new NotificationSystem();

// Make it globally available
window.notificationSystem = notificationSystem;