/**
 * NotificationService Unit Tests
 * 360° РАБОТА - Backend Testing
 */

import axios from 'axios';
import { notificationService } from '../../src/services/NotificationService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendToUser', () => {
    it('should send notification to single user', async () => {
      const mockResponse = {
        data: {
          id: 'notification-123',
          recipients: 1,
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await notificationService.sendToUser('user-123', {
        title: 'Test Notification',
        body: 'Test message',
        data: { type: 'test' },
      });

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://onesignal.com/api/v1/notifications',
        expect.objectContaining({
          include_external_user_ids: ['user-123'],
          headings: { en: 'Test Notification' },
          contents: { en: 'Test message' },
          data: { type: 'test' },
        }),
        expect.any(Object)
      );

      expect(result).toEqual({
        id: 'notification-123',
        recipients: 1,
      });
    });

    it('should handle notification send error', async () => {
      mockedAxios.post.mockRejectedValueOnce(
        new Error('OneSignal API error')
      );

      await expect(
        notificationService.sendToUser('user-123', {
          title: 'Test',
          body: 'Test',
        })
      ).rejects.toThrow('Notification send failed');
    });
  });

  describe('sendToUsers', () => {
    it('should send notification to multiple users', async () => {
      const mockResponse = {
        data: {
          id: 'notification-456',
          recipients: 3,
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await notificationService.sendToUsers(
        ['user-1', 'user-2', 'user-3'],
        {
          title: 'Broadcast',
          body: 'Message to all',
        }
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          include_external_user_ids: ['user-1', 'user-2', 'user-3'],
        }),
        expect.any(Object)
      );

      expect(result.recipients).toBe(3);
    });
  });

  describe('sendToSegment', () => {
    it('should send notification to segment', async () => {
      const mockResponse = {
        data: {
          id: 'notification-789',
          recipients: 100,
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await notificationService.sendToSegment('All', {
        title: 'Platform Update',
        body: 'New features available',
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          included_segments: ['All'],
        }),
        expect.any(Object)
      );

      expect(result.recipients).toBe(100);
    });
  });

  describe('Business logic notifications', () => {
    it('should send new message notification', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { id: 'notif-1', recipients: 1 },
      });

      await notificationService.notifyNewMessage({
        recipientId: 'employer-1',
        senderName: 'John Doe',
        messagePreview: 'Hello, I am interested in this position',
        applicationId: 'app-123',
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          include_external_user_ids: ['employer-1'],
          headings: { en: 'John Doe' },
          contents: {
            en: 'Hello, I am interested in this position',
          },
          data: {
            type: 'new_message',
            applicationId: 'app-123',
            senderName: 'John Doe',
          },
        }),
        expect.any(Object)
      );
    });

    it('should send status change notification', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { id: 'notif-2', recipients: 1 },
      });

      await notificationService.notifyStatusChange({
        recipientId: 'jobseeker-1',
        vacancyTitle: 'Senior Developer',
        newStatus: 'interview',
        applicationId: 'app-456',
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          include_external_user_ids: ['jobseeker-1'],
          headings: { en: 'Senior Developer' },
          contents: { en: 'Вас приглашают на собеседование!' },
          data: {
            type: 'status_change',
            applicationId: 'app-456',
            newStatus: 'interview',
          },
        }),
        expect.any(Object)
      );
    });

    it('should send video viewed notification', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { id: 'notif-3', recipients: 1 },
      });

      await notificationService.notifyVideoViewed({
        recipientId: 'jobseeker-1',
        viewerName: 'HR Manager',
        viewsRemaining: 1,
        applicationId: 'app-789',
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          include_external_user_ids: ['jobseeker-1'],
          headings: { en: 'HR Manager посмотрел ваше видео' },
          contents: { en: 'Осталось просмотров: 1' },
          data: {
            type: 'video_viewed',
            applicationId: 'app-789',
            viewsRemaining: 1,
          },
        }),
        expect.any(Object)
      );
    });

    it('should send new application notification', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { id: 'notif-4', recipients: 1 },
      });

      await notificationService.notifyNewApplication({
        employerId: 'employer-1',
        jobseekerName: 'Jane Smith',
        vacancyTitle: 'Product Manager',
        applicationId: 'app-999',
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          include_external_user_ids: ['employer-1'],
          headings: { en: 'Новый отклик!' },
          contents: {
            en: 'Jane Smith откликнулся на вакансию "Product Manager"',
          },
          data: {
            type: 'new_application',
            applicationId: 'app-999',
            jobseekerName: 'Jane Smith',
          },
        }),
        expect.any(Object)
      );
    });

    it('should send interview invite notification', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { id: 'notif-5', recipients: 1 },
      });

      await notificationService.notifyInterviewInvite({
        jobseekerId: 'jobseeker-1',
        companyName: 'Tech Corp',
        vacancyTitle: 'Backend Developer',
        interviewDate: '2025-11-10 14:00',
        applicationId: 'app-111',
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          include_external_user_ids: ['jobseeker-1'],
          headings: { en: 'Tech Corp - Backend Developer' },
          contents: { en: 'Собеседование назначено на 2025-11-10 14:00' },
          data: {
            type: 'interview_invite',
            applicationId: 'app-111',
            companyName: 'Tech Corp',
            interviewDate: '2025-11-10 14:00',
          },
        }),
        expect.any(Object)
      );
    });
  });

  describe('getNotificationStats', () => {
    it('should get notification statistics', async () => {
      const mockStats = {
        data: {
          id: 'notification-123',
          successful: 95,
          failed: 5,
          converted: 12,
          remaining: 0,
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockStats);

      const result = await notificationService.getNotificationStats(
        'notification-123'
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('notification-123'),
        expect.any(Object)
      );

      expect(result).toEqual({
        id: 'notification-123',
        successful: 95,
        failed: 5,
        converted: 12,
        remaining: 0,
      });
    });

    it('should handle stats fetch error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API error'));

      await expect(
        notificationService.getNotificationStats('notification-123')
      ).rejects.toThrow('Get notification stats failed');
    });
  });
});
