"use strict";
/**
 * 360° РАБОТА - Scheduler Service
 * Handles scheduled tasks like auto-deletion of expired videos
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initScheduler = initScheduler;
exports.stopScheduler = stopScheduler;
const node_cron_1 = __importDefault(require("node-cron"));
const PrivateVideoService_1 = require("./video/PrivateVideoService");
/**
 * Initialize all scheduled tasks
 */
function initScheduler() {
    console.log('📅 Initializing scheduler...');
    // Run auto-deletion every hour
    // Pattern: minute hour day month weekday
    // "0 * * * *" = every hour at minute 0
    const autoDeleteTask = node_cron_1.default.schedule('0 * * * *', async () => {
        console.log('⏰ Running scheduled auto-deletion task...');
        try {
            const result = await PrivateVideoService_1.privateVideoService.autoDeleteExpiredVideos();
            console.log(`✅ Auto-deletion task completed: ${result.deleted} videos deleted`);
        }
        catch (error) {
            console.error('❌ Error in auto-deletion task:', error);
        }
    });
    // Start the task
    autoDeleteTask.start();
    console.log('✅ Scheduler initialized: Auto-deletion runs every hour');
    // Return tasks for potential management
    return {
        autoDeleteTask,
    };
}
/**
 * Graceful shutdown
 */
function stopScheduler(tasks) {
    console.log('🛑 Stopping scheduler...');
    tasks.autoDeleteTask.stop();
    console.log('✅ Scheduler stopped');
}
//# sourceMappingURL=scheduler.js.map