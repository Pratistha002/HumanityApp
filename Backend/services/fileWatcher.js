const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

class FileWatcher {
  constructor(dataService, updateCallback) {
    this.dataService = dataService;
    this.updateCallback = updateCallback;
    this.dataDir = path.join(__dirname, '..', 'data');
    this.watchers = [];
    this.debounceTimers = new Map();
    
    this.initializeWatchers();
  }

  initializeWatchers() {
    console.log('[WATCHER] Initializing Excel file watchers...');
    
    // Watch all Excel files in the data directory
    const excelFiles = [
      'stories.xlsx',
      'donations.xlsx', 
      'collaborations.xlsx',
      'status_updates.xlsx'
    ];

    excelFiles.forEach(filename => {
      const filePath = path.join(this.dataDir, filename);
      
      if (fs.existsSync(filePath)) {
        this.watchFile(filePath, filename);
      }
    });

    console.log(`[WATCHER] Watching ${this.watchers.length} Excel files for changes`);
  }

  watchFile(filePath, filename) {
    const watcher = chokidar.watch(filePath, {
      persistent: true,
      ignoreInitial: true,
      usePolling: true, // Better for Excel files that are locked during editing
      interval: 1000,   // Check every second
      binaryInterval: 1000
    });

    watcher.on('change', () => {
      this.handleFileChange(filename, filePath);
    });

    watcher.on('error', (error) => {
      console.error(`[WATCHER] Error watching ${filename}:`, error);
    });

    this.watchers.push({ watcher, filename, filePath });
    console.log(`[WATCHER] Now watching: ${filename}`);
  }

  handleFileChange(filename, filePath) {
    // Debounce rapid changes (Excel saves multiple times)
    const debounceKey = filename;
    
    if (this.debounceTimers.has(debounceKey)) {
      clearTimeout(this.debounceTimers.get(debounceKey));
    }

    this.debounceTimers.set(debounceKey, setTimeout(() => {
      this.processFileChange(filename, filePath);
      this.debounceTimers.delete(debounceKey);
    }, 2000)); // Wait 2 seconds after last change
  }

  processFileChange(filename, filePath) {
    console.log(`[WATCHER] Excel file changed: ${filename}`);
    
    try {
      // Wait a bit more to ensure file is fully written
      setTimeout(() => {
        this.reloadDataFromExcel(filename);
      }, 1000);
      
    } catch (error) {
      console.error(`[WATCHER] Error processing ${filename}:`, error);
    }
  }

  // Enhanced method to detect specific changes in Excel files
  detectChanges(filename, oldData, newData) {
    const changes = {
      added: [],
      modified: [],
      deleted: [],
      filename: filename
    };

    if (!oldData || !newData) return changes;

    // Convert data to maps for easier comparison
    const oldMap = new Map();
    const newMap = new Map();

    oldData.forEach(item => oldMap.set(item.ID, item));
    newData.forEach(item => newMap.set(item.ID, item));

    // Find added items
    newMap.forEach((item, id) => {
      if (!oldMap.has(id)) {
        changes.added.push(item);
      }
    });

    // Find deleted items
    oldMap.forEach((item, id) => {
      if (!newMap.has(id)) {
        changes.deleted.push(item);
      }
    });

    // Find modified items
    newMap.forEach((newItem, id) => {
      const oldItem = oldMap.get(id);
      if (oldItem && JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
        changes.modified.push({
          old: oldItem,
          new: newItem
        });
      }
    });

    return changes;
  }

  reloadDataFromExcel(filename) {
    console.log(`[WATCHER] Reloading data from ${filename}...`);
    
    try {
      // Load fresh data from all Excel files
      const allData = this.dataService.loadAllData();
      
      // Call the update callback to refresh in-memory data
      if (this.updateCallback) {
        this.updateCallback(allData, filename);
      }
      
      console.log(`[WATCHER] Successfully reloaded data from ${filename}`);
      
    } catch (error) {
      console.error(`[WATCHER] Error reloading data from ${filename}:`, error);
    }
  }

  // Method to manually trigger a reload of all data
  reloadAllData() {
    console.log('[WATCHER] Manual reload of all Excel data...');
    
    try {
      const allData = this.dataService.loadAllData();
      
      if (this.updateCallback) {
        this.updateCallback(allData, 'manual_reload');
      }
      
      console.log('[WATCHER] Manual reload completed');
      return allData;
      
    } catch (error) {
      console.error('[WATCHER] Error during manual reload:', error);
      throw error;
    }
  }

  // Clean up watchers
  destroy() {
    console.log('[WATCHER] Cleaning up file watchers...');
    
    this.watchers.forEach(({ watcher, filename }) => {
      watcher.close();
      console.log(`[WATCHER] Stopped watching: ${filename}`);
    });
    
    this.watchers = [];
    
    // Clear any pending debounce timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }
}

module.exports = FileWatcher;