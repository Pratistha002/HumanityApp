import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('[SOCKET] Connected to server:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('[SOCKET] Disconnected from server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[SOCKET] Connection error:', error);
    });

    // Listen for data updates from server
    this.socket.on('dataUpdated', (data) => {
      console.log('[SOCKET] Data update received:', data);
      
      // Notify all registered listeners
      this.listeners.forEach((callback, eventName) => {
        if (eventName === 'dataUpdated') {
          callback(data);
        }
      });
    });

    // Listen for Excel data changes (enhanced sync events)
    this.socket.on('excelDataChanged', (data) => {
      console.log('[SOCKET] Excel data changed:', data);
      
      this.listeners.forEach((callback, eventName) => {
        if (eventName === 'excelDataChanged') {
          callback(data);
        }
      });
    });

    // Listen for portal data saved events
    this.socket.on('portalDataSaved', (data) => {
      console.log('[SOCKET] Portal data saved:', data);
      
      this.listeners.forEach((callback, eventName) => {
        if (eventName === 'portalDataSaved') {
          callback(data);
        }
      });
    });

    // Listen for sync errors
    this.socket.on('syncError', (data) => {
      console.error('[SOCKET] Sync error:', data);
      
      this.listeners.forEach((callback, eventName) => {
        if (eventName === 'syncError') {
          callback(data);
        }
      });
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('[SOCKET] Manually disconnected');
    }
  }

  // Register a listener for data updates
  onDataUpdate(callback) {
    this.listeners.set('dataUpdated', callback);
    
    // Connect if not already connected
    if (!this.isConnected) {
      this.connect();
    }
  }

  // Register a listener for Excel data changes
  onExcelDataChanged(callback) {
    this.listeners.set('excelDataChanged', callback);
    
    if (!this.isConnected) {
      this.connect();
    }
  }

  // Register a listener for portal data saved events
  onPortalDataSaved(callback) {
    this.listeners.set('portalDataSaved', callback);
    
    if (!this.isConnected) {
      this.connect();
    }
  }

  // Register a listener for sync errors
  onSyncError(callback) {
    this.listeners.set('syncError', callback);
    
    if (!this.isConnected) {
      this.connect();
    }
  }

  // Remove a listener
  removeListener(eventName) {
    this.listeners.delete(eventName);
  }

  // Check if connected
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }

  // Get connection status
  getStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id || null,
      transport: this.socket?.io?.engine?.transport?.name || null
    };
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;