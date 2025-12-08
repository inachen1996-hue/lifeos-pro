/**
 * Data Migration from lifeos_pro_history_v2 to lifeos_pro_events_v3
 * Handles migration of text-based history to structured Event objects
 */
import { STORAGE_KEYS } from './types.js';
import { Storage, EventStorage } from './storage.js';
/**
 * Parse a single history line into an Event object
 */
function parseHistoryLine(line, lineIndex) {
    if (!line.trim()) {
        return null;
    }
    // Parse existing format: [CATEGORY] Description | ISO8601 | ISO8601
    const categoryMatch = line.match(/^\[(WORK|STUDY|REST|SLEEP|LIFE|ENTERTAINMENT|HEALTH|HOBBY)\]/i);
    const timeMatch = line.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2})/g);
    if (!timeMatch || timeMatch.length < 2) {
        console.warn(`Line ${lineIndex}: Could not parse timestamps`);
        return null;
    }
    const category = categoryMatch ? categoryMatch[1].toLowerCase() : 'life';
    const name = line
        .replace(/^\[.*?\]/, '') // Remove category tag
        .split('|')[0] // Get text before first pipe
        .trim();
    if (!name) {
        console.warn(`Line ${lineIndex}: Empty event name`);
        return null;
    }
    const now = new Date().toISOString();
    return {
        id: `migrated_${Date.now()}_${lineIndex}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        startTime: timeMatch[0],
        endTime: timeMatch[1],
        categoryId: category,
        source: 'manual',
        priority: 3, // Manual priority for migrated events
        createdAt: now,
        updatedAt: now,
    };
}
/**
 * Migrate history text to Event objects
 */
export function migrateHistoryToEvents(historyText) {
    const events = [];
    const lines = historyText.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const event = parseHistoryLine(lines[i], i + 1);
        if (event) {
            events.push(event);
        }
    }
    return events;
}
/**
 * Perform the migration from v2 to v3
 * Returns the number of events migrated, or null if migration was not needed
 */
export function performMigration() {
    // Check if already migrated
    if (Storage.exists(STORAGE_KEYS.EVENTS)) {
        console.log('Migration already completed');
        return null;
    }
    // Check if old format exists
    const historyText = Storage.load(STORAGE_KEYS.HISTORY_V2, '');
    if (!historyText) {
        console.log('No history to migrate');
        return 0;
    }
    try {
        // Parse old format
        const events = migrateHistoryToEvents(historyText);
        // Store in new format
        EventStorage.saveEvents(events);
        // Store migration timestamp
        Storage.save('lifeos_pro_migration_date', new Date().toISOString());
        // Keep old format for rollback (mark as backup)
        Storage.save('lifeos_pro_history_v2_backup', historyText);
        console.log(`✅ Successfully migrated ${events.length} events to new format`);
        return events.length;
    }
    catch (error) {
        console.error('Migration failed:', error);
        throw new Error(`Migration failed: ${error}`);
    }
}
/**
 * Undo migration and restore old format
 */
export function undoMigration() {
    const backup = Storage.load('lifeos_pro_history_v2_backup', '');
    if (!backup) {
        console.error('No backup found');
        return false;
    }
    try {
        // Restore old format
        Storage.save(STORAGE_KEYS.HISTORY_V2, backup);
        // Remove new format
        Storage.remove(STORAGE_KEYS.EVENTS);
        Storage.remove('lifeos_pro_migration_date');
        console.log('Migration undone successfully');
        return true;
    }
    catch (error) {
        console.error('Failed to undo migration:', error);
        return false;
    }
}
/**
 * Check if migration is available (within 24 hours)
 */
export function canUndoMigration() {
    const migrationDate = Storage.load('lifeos_pro_migration_date', '');
    if (!migrationDate) {
        return false;
    }
    const migrationTime = new Date(migrationDate).getTime();
    const now = new Date().getTime();
    const hoursSinceMigration = (now - migrationTime) / (1000 * 60 * 60);
    return hoursSinceMigration < 24;
}
//# sourceMappingURL=migration.js.map