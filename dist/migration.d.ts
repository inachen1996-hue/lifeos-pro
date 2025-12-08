/**
 * Data Migration from lifeos_pro_history_v2 to lifeos_pro_events_v3
 * Handles migration of text-based history to structured Event objects
 */
import { Event } from './types.js';
/**
 * Migrate history text to Event objects
 */
export declare function migrateHistoryToEvents(historyText: string): Event[];
/**
 * Perform the migration from v2 to v3
 * Returns the number of events migrated, or null if migration was not needed
 */
export declare function performMigration(): number | null;
/**
 * Undo migration and restore old format
 */
export declare function undoMigration(): boolean;
/**
 * Check if migration is available (within 24 hours)
 */
export declare function canUndoMigration(): boolean;
//# sourceMappingURL=migration.d.ts.map