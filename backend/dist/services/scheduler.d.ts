/**
 * 360° РАБОТА - Scheduler Service
 * Handles scheduled tasks like auto-deletion of expired videos
 */
import cron from 'node-cron';
/**
 * Initialize all scheduled tasks
 */
export declare function initScheduler(): {
    autoDeleteTask: cron.ScheduledTask;
};
/**
 * Graceful shutdown
 */
export declare function stopScheduler(tasks: {
    autoDeleteTask: cron.ScheduledTask;
}): void;
//# sourceMappingURL=scheduler.d.ts.map