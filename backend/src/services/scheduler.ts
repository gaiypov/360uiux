/**
 * 360° РАБОТА - Scheduler Service
 * Handles scheduled tasks like auto-deletion of expired videos
 */

import cron from 'node-cron';
import { privateVideoService } from './video/PrivateVideoService';

/**
 * Initialize all scheduled tasks
 */
export function initScheduler() {
  console.log('📅 Initializing scheduler...');

  // Run auto-deletion every hour
  // Pattern: minute hour day month weekday
  // "0 * * * *" = every hour at minute 0
  const autoDeleteTask = cron.schedule('0 * * * *', async () => {
    console.log('⏰ Running scheduled auto-deletion task...');
    try {
      const result = await privateVideoService.autoDeleteExpiredVideos();
      console.log(`✅ Auto-deletion task completed: ${result.deleted} videos deleted`);
    } catch (error) {
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
export function stopScheduler(tasks: { autoDeleteTask: cron.ScheduledTask }) {
  console.log('🛑 Stopping scheduler...');
  tasks.autoDeleteTask.stop();
  console.log('✅ Scheduler stopped');
}
