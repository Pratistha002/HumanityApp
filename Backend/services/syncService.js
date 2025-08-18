const EventEmitter = require('events');

class SyncService extends EventEmitter {
  constructor(dataService, io) {
    super();
    this.dataService = dataService;
    this.io = io;
    this.lastSyncTime = new Date();
    this.syncInProgress = false;
    this.pendingChanges = new Map();
    this.lastNotificationTime = 0;
    this.notificationCooldown = 3000; // 3 seconds cooldown between notifications
    
    // Store previous data state for change detection
    this.previousData = {
      stories: [],
      donations: [],
      collaborations: [],
      statusUpdates: []
    };
    
    console.log('✅ SyncService initialized');
  }

  // Method to handle Excel-to-Portal synchronization
  async syncFromExcel(changedFile, allData) {
    if (this.syncInProgress) {
      console.log('[SYNC] Sync already in progress, queuing change...');
      this.pendingChanges.set(changedFile, allData);
      return;
    }

    this.syncInProgress = true;
    console.log(`[SYNC] Starting Excel-to-Portal sync for ${changedFile}`);

    try {
      const changes = this.detectDetailedChanges(allData);
      
      if (this.hasSignificantChanges(changes)) {
        // Check if enough time has passed since last notification
        const now = Date.now();
        if (now - this.lastNotificationTime > this.notificationCooldown) {
          // Emit consolidated change information
          this.io.emit('excelDataChanged', {
            changes: changes,
            timestamp: new Date().toISOString(),
            changedFile: changedFile,
            syncDirection: 'excel-to-portal'
          });
          
          this.lastNotificationTime = now;
        }

        // Update previous data state
        this.updatePreviousDataState(allData);

        console.log(`[SYNC] Excel-to-Portal sync completed for ${changedFile}`);
        console.log(`[SYNC] Changes detected:`, {
          stories: { added: changes.stories.added.length, modified: changes.stories.modified.length, deleted: changes.stories.deleted.length },
          donations: { added: changes.donations.added.length, modified: changes.donations.modified.length, deleted: changes.donations.deleted.length },
          collaborations: { added: changes.collaborations.added.length, modified: changes.collaborations.modified.length, deleted: changes.collaborations.deleted.length }
        });

        // Emit success event
        this.emit('syncCompleted', {
          direction: 'excel-to-portal',
          file: changedFile,
          changes: changes
        });
      } else {
        console.log(`[SYNC] No significant changes detected in ${changedFile}`);
      }

    } catch (error) {
      console.error(`[SYNC] Error during Excel-to-Portal sync:`, error);
      this.io.emit('syncError', {
        error: error.message,
        file: changedFile,
        direction: 'excel-to-portal',
        timestamp: new Date().toISOString()
      });
      
      this.emit('syncError', { error, direction: 'excel-to-portal', file: changedFile });
    } finally {
      this.syncInProgress = false;
      this.lastSyncTime = new Date();
      
      // Process any pending changes
      if (this.pendingChanges.size > 0) {
        const [nextFile, nextData] = this.pendingChanges.entries().next().value;
        this.pendingChanges.delete(nextFile);
        setTimeout(() => this.syncFromExcel(nextFile, nextData), 1000);
      }
    }
  }

  // Method to handle Portal-to-Excel synchronization
  async syncToExcel(dataType, data, operation = 'update') {
    console.log(`[SYNC] Starting Portal-to-Excel sync for ${dataType} (${operation})`);

    try {
      let result = { success: false, errors: [] };

      switch (dataType) {
        case 'story':
          result = this.dataService.saveStoryWithValidation(data);
          break;
        case 'donation':
          result = this.dataService.saveDonationWithValidation(data);
          break;
        case 'collaboration':
          result = this.dataService.saveCollaborationWithValidation(data);
          break;
        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }

      if (result.success) {
        // Check if enough time has passed since last notification
        const now = Date.now();
        if (now - this.lastNotificationTime > this.notificationCooldown) {
          // Emit success notification to all clients
          this.io.emit('portalDataSaved', {
            dataType: dataType,
            operation: operation,
            data: data,
            timestamp: new Date().toISOString(),
            syncDirection: 'portal-to-excel'
          });
          
          this.lastNotificationTime = now;
        }

        console.log(`[SYNC] Portal-to-Excel sync completed for ${dataType}`);
        
        this.emit('syncCompleted', {
          direction: 'portal-to-excel',
          dataType: dataType,
          operation: operation,
          data: data
        });

        return { success: true, message: 'Data synchronized to Excel successfully' };
      } else {
        throw new Error(`Validation failed: ${result.errors.join(', ')}`);
      }

    } catch (error) {
      console.error(`[SYNC] Error during Portal-to-Excel sync:`, error);
      
      this.io.emit('syncError', {
        error: error.message,
        dataType: dataType,
        operation: operation,
        direction: 'portal-to-excel',
        timestamp: new Date().toISOString()
      });

      this.emit('syncError', { error, direction: 'portal-to-excel', dataType, operation });
      
      return { success: false, error: error.message };
    }
  }

  // Detect detailed changes between old and new data
  detectDetailedChanges(newData) {
    const changes = {
      stories: this.compareDataArrays(this.previousData.stories, newData.stories || []),
      donations: this.compareDataArrays(this.previousData.donations, newData.donations || []),
      collaborations: this.compareDataArrays(this.previousData.collaborations, newData.collaborations || []),
      statusUpdates: this.compareDataArrays(this.previousData.statusUpdates, newData.statusUpdates || [])
    };

    return changes;
  }

  // Compare two data arrays and return detailed changes
  compareDataArrays(oldArray, newArray) {
    const changes = {
      added: [],
      modified: [],
      deleted: []
    };

    // Convert arrays to maps for easier comparison
    const oldMap = new Map();
    const newMap = new Map();

    oldArray.forEach(item => oldMap.set(item.ID || item.id, item));
    newArray.forEach(item => newMap.set(item.ID || item.id, item));

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
      if (oldItem && !this.deepEqual(oldItem, newItem)) {
        changes.modified.push({
          id: id,
          old: oldItem,
          new: newItem,
          changedFields: this.getChangedFields(oldItem, newItem)
        });
      }
    });

    return changes;
  }

  // Deep equality check for objects
  deepEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  // Get list of changed fields between two objects
  getChangedFields(oldObj, newObj) {
    const changedFields = [];
    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    allKeys.forEach(key => {
      if (oldObj[key] !== newObj[key]) {
        changedFields.push({
          field: key,
          oldValue: oldObj[key],
          newValue: newObj[key]
        });
      }
    });

    return changedFields;
  }

  // Check if changes are significant enough to trigger sync
  hasSignificantChanges(changes) {
    return Object.values(changes).some(categoryChanges => 
      categoryChanges.added.length > 0 || 
      categoryChanges.modified.length > 0 || 
      categoryChanges.deleted.length > 0
    );
  }

  // Update the previous data state
  updatePreviousDataState(newData) {
    this.previousData = {
      stories: [...(newData.stories || [])],
      donations: [...(newData.donations || [])],
      collaborations: [...(newData.collaborations || [])],
      statusUpdates: [...(newData.statusUpdates || [])]
    };
  }

  // Initialize previous data state
  initializePreviousDataState() {
    const currentData = this.dataService.loadAllData();
    this.updatePreviousDataState(currentData);
    console.log('[SYNC] Previous data state initialized');
  }

  // Get sync status and statistics
  getSyncStatus() {
    return {
      lastSyncTime: this.lastSyncTime,
      syncInProgress: this.syncInProgress,
      pendingChanges: this.pendingChanges.size,
      dataState: {
        stories: this.previousData.stories.length,
        donations: this.previousData.donations.length,
        collaborations: this.previousData.collaborations.length,
        statusUpdates: this.previousData.statusUpdates.length
      }
    };
  }

  // Force a full synchronization
  async forceSyncFromExcel() {
    console.log('[SYNC] Forcing full synchronization from Excel...');
    
    try {
      const allData = this.dataService.loadAllData();
      await this.syncFromExcel('manual_full_sync', allData);
      return { success: true, message: 'Full synchronization completed' };
    } catch (error) {
      console.error('[SYNC] Error during forced sync:', error);
      return { success: false, error: error.message };
    }
  }

  // Clean up old backup files (keep only last 10)
  cleanupBackups() {
    try {
      const dataDir = this.dataService.getFilePaths().dataDirectory;
      const files = require('fs').readdirSync(dataDir);
      
      const backupFiles = files
        .filter(file => file.includes('_backup_'))
        .map(file => ({
          name: file,
          path: require('path').join(dataDir, file),
          time: require('fs').statSync(require('path').join(dataDir, file)).mtime
        }))
        .sort((a, b) => b.time - a.time);

      // Keep only the 10 most recent backups
      if (backupFiles.length > 10) {
        const filesToDelete = backupFiles.slice(10);
        filesToDelete.forEach(file => {
          require('fs').unlinkSync(file.path);
          console.log(`[SYNC] Deleted old backup: ${file.name}`);
        });
      }
    } catch (error) {
      console.error('[SYNC] Error cleaning up backups:', error);
    }
  }
}

module.exports = SyncService;