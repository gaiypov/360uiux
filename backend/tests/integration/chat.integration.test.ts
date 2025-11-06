/**
 * Chat Integration Tests
 *
 * End-to-end tests for the chat system:
 * - Sending messages
 * - Receiving messages
 * - Video messages with 2-view limit
 * - Push notifications
 * - Real-time WebSocket events
 */

import request from 'supertest';
import { Server } from 'http';
import { io as ioClient, Socket } from 'socket.io-client';

describe('Chat Integration Tests', () => {
  let server: Server;
  let app: any;
  let jobseekerToken: string;
  let employerToken: string;
  let applicationId: number;
  let jobseekerSocket: Socket;
  let employerSocket: Socket;

  beforeAll(async () => {
    // Import app (you'll need to export it from server.ts)
    // app = require('../../src/server').app;
    // server = require('../../src/server').server;

    // For this example, we'll mock the setup
    jobseekerToken = 'mock-jobseeker-token';
    employerToken = 'mock-employer-token';
    applicationId = 1;
  });

  afterAll(async () => {
    if (jobseekerSocket) {
      jobseekerSocket.close();
    }
    if (employerSocket) {
      employerSocket.close();
    }
    if (server) {
      server.close();
    }
  });

  describe('Text Messages', () => {
    it('should send a text message from jobseeker to employer', async () => {
      const response = await request(app)
        .post('/api/chat/messages')
        .set('Authorization', `Bearer ${jobseekerToken}`)
        .send({
          applicationId,
          messageType: 'text',
          content: 'Hello, I am interested in this position.',
          senderType: 'jobseeker',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.content).toBe(
        'Hello, I am interested in this position.'
      );
      expect(response.body.data.messageType).toBe('text');
      expect(response.body.data.senderType).toBe('jobseeker');
    });

    it('should send a text message from employer to jobseeker', async () => {
      const response = await request(app)
        .post('/api/chat/messages')
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          applicationId,
          messageType: 'text',
          content: 'Thank you for your interest. Let me review your application.',
          senderType: 'employer',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messageType).toBe('text');
      expect(response.body.data.senderType).toBe('employer');
    });

    it('should retrieve message history for an application', async () => {
      const response = await request(app)
        .get(`/api/chat/applications/${applicationId}/messages`)
        .set('Authorization', `Bearer ${jobseekerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Video Messages with 2-View Limit', () => {
    let videoMessageId: number;

    it('should send a video message from jobseeker', async () => {
      const response = await request(app)
        .post('/api/chat/messages')
        .set('Authorization', `Bearer ${jobseekerToken}`)
        .send({
          applicationId,
          messageType: 'video',
          content: 'https://storage.yandex.com/videos/mock-video.mp4',
          senderType: 'jobseeker',
          videoDuration: 45,
          videoThumbnail: 'https://storage.yandex.com/videos/mock-thumbnail.jpg',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messageType).toBe('video');
      expect(response.body.data.viewsRemaining).toBe(2);

      videoMessageId = response.body.data.id;
    });

    it('should track first view of video message', async () => {
      const response = await request(app)
        .post(`/api/chat/messages/${videoMessageId}/view`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ viewerType: 'employer' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.viewsRemaining).toBe(1);
    });

    it('should track second view of video message', async () => {
      const response = await request(app)
        .post(`/api/chat/messages/${videoMessageId}/view`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ viewerType: 'employer' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.viewsRemaining).toBe(0);
    });

    it('should auto-delete video after 2 views', async () => {
      const response = await request(app)
        .get(`/api/chat/messages/${videoMessageId}`)
        .set('Authorization', `Bearer ${jobseekerToken}`)
        .expect(200);

      expect(response.body.data.isDeleted).toBe(true);
      expect(response.body.data.content).toBe(null);
    });

    it('should not allow third view of video message', async () => {
      const response = await request(app)
        .post(`/api/chat/messages/${videoMessageId}/view`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ viewerType: 'employer' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/already deleted|no views remaining/i);
    });
  });

  describe('Mark Messages as Read', () => {
    it('should mark all messages in application as read', async () => {
      const response = await request(app)
        .post(`/api/chat/applications/${applicationId}/read`)
        .set('Authorization', `Bearer ${employerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return unread count as 0 after marking as read', async () => {
      const response = await request(app)
        .get(`/api/chat/applications/${applicationId}/unread-count`)
        .set('Authorization', `Bearer ${employerToken}`)
        .expect(200);

      expect(response.body.data.unreadCount).toBe(0);
    });
  });

  describe('WebSocket Real-time Events', () => {
    beforeAll((done) => {
      // Connect jobseeker socket
      jobseekerSocket = ioClient('http://localhost:5000', {
        auth: { token: jobseekerToken },
      });

      // Connect employer socket
      employerSocket = ioClient('http://localhost:5000', {
        auth: { token: employerToken },
      });

      let connectedCount = 0;
      const checkDone = () => {
        connectedCount++;
        if (connectedCount === 2) {
          done();
        }
      };

      jobseekerSocket.on('connect', checkDone);
      employerSocket.on('connect', checkDone);
    });

    it('should receive real-time message via WebSocket', (done) => {
      const testMessage = 'Real-time test message';

      // Employer listens for new message
      employerSocket.on('new-message', (data) => {
        expect(data.content).toBe(testMessage);
        expect(data.senderType).toBe('jobseeker');
        done();
      });

      // Jobseeker sends message via HTTP
      request(app)
        .post('/api/chat/messages')
        .set('Authorization', `Bearer ${jobseekerToken}`)
        .send({
          applicationId,
          messageType: 'text',
          content: testMessage,
          senderType: 'jobseeker',
        })
        .expect(201)
        .catch(done);
    });

    it('should receive video-viewed event via WebSocket', (done) => {
      // Jobseeker listens for video-viewed event
      jobseekerSocket.on('video-viewed', (data) => {
        expect(data.viewsRemaining).toBeLessThan(2);
        done();
      });

      // Create and view video message
      request(app)
        .post('/api/chat/messages')
        .set('Authorization', `Bearer ${jobseekerToken}`)
        .send({
          applicationId,
          messageType: 'video',
          content: 'https://storage.yandex.com/videos/test.mp4',
          senderType: 'jobseeker',
        })
        .then((res) => {
          const messageId = res.body.data.id;

          // Employer views the video
          request(app)
            .post(`/api/chat/messages/${messageId}/view`)
            .set('Authorization', `Bearer ${employerToken}`)
            .send({ viewerType: 'employer' })
            .expect(200)
            .catch(done);
        })
        .catch(done);
    });
  });

  describe('Error Handling', () => {
    it('should return 401 for unauthorized access', async () => {
      await request(app)
        .get(`/api/chat/applications/${applicationId}/messages`)
        .expect(401);
    });

    it('should return 400 for invalid message type', async () => {
      const response = await request(app)
        .post('/api/chat/messages')
        .set('Authorization', `Bearer ${jobseekerToken}`)
        .send({
          applicationId,
          messageType: 'invalid-type',
          content: 'Test',
          senderType: 'jobseeker',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent application', async () => {
      await request(app)
        .get('/api/chat/applications/99999/messages')
        .set('Authorization', `Bearer ${jobseekerToken}`)
        .expect(404);
    });
  });
});
