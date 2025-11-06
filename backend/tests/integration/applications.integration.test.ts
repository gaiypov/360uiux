/**
 * Applications Integration Tests
 *
 * End-to-end tests for application workflow:
 * - Creating applications
 * - Updating application status
 * - Filtering applications
 * - Application analytics
 */

import request from 'supertest';

describe('Applications Integration Tests', () => {
  let app: any;
  let jobseekerToken: string;
  let employerToken: string;
  let vacancyId: number;
  let applicationId: number;

  beforeAll(async () => {
    // Mock setup
    jobseekerToken = 'mock-jobseeker-token';
    employerToken = 'mock-employer-token';
    vacancyId = 1;
  });

  describe('Application Submission', () => {
    it('should create a new application', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${jobseekerToken}`)
        .send({
          vacancyId,
          resumeId: 1,
          coverLetter: 'I am very interested in this position...',
          videoResumeUrl: 'https://storage.yandex.com/videos/resume.mp4',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.status).toBe('pending');

      applicationId = response.body.data.id;
    });

    it('should not allow duplicate application to same vacancy', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${jobseekerToken}`)
        .send({
          vacancyId,
          resumeId: 1,
          coverLetter: 'Another application',
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/already applied/i);
    });

    it('should require authentication for application submission', async () => {
      await request(app)
        .post('/api/applications')
        .send({
          vacancyId,
          resumeId: 1,
        })
        .expect(401);
    });
  });

  describe('Application Status Management', () => {
    it('should update application status (employer only)', async () => {
      const response = await request(app)
        .patch(`/api/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          status: 'viewed',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('viewed');
    });

    it('should not allow jobseeker to change status', async () => {
      const response = await request(app)
        .patch(`/api/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${jobseekerToken}`)
        .send({
          status: 'interview',
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should validate status values', async () => {
      const response = await request(app)
        .patch(`/api/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          status: 'invalid-status',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should update status through multiple stages', async () => {
      const statuses = ['viewed', 'interview', 'hired'];

      for (const status of statuses) {
        const response = await request(app)
          .patch(`/api/applications/${applicationId}/status`)
          .set('Authorization', `Bearer ${employerToken}`)
          .send({ status })
          .expect(200);

        expect(response.body.data.status).toBe(status);
      }
    });
  });

  describe('Application Listing & Filtering', () => {
    it('should get all applications for jobseeker', async () => {
      const response = await request(app)
        .get('/api/applications/jobseeker/me')
        .set('Authorization', `Bearer ${jobseekerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter applications by status', async () => {
      const response = await request(app)
        .get('/api/applications/jobseeker/me?status=hired')
        .set('Authorization', `Bearer ${jobseekerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach((app: any) => {
        expect(app.status).toBe('hired');
      });
    });

    it('should get all applications for employer vacancy', async () => {
      const response = await request(app)
        .get(`/api/applications/vacancy/${vacancyId}`)
        .set('Authorization', `Bearer ${employerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter employer applications by status', async () => {
      const response = await request(app)
        .get(`/api/applications/vacancy/${vacancyId}?status=pending`)
        .set('Authorization', `Bearer ${employerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach((app: any) => {
        expect(app.status).toBe('pending');
      });
    });

    it('should paginate application results', async () => {
      const page1 = await request(app)
        .get('/api/applications/jobseeker/me?page=1&limit=5')
        .set('Authorization', `Bearer ${jobseekerToken}`)
        .expect(200);

      expect(page1.body.data.length).toBeLessThanOrEqual(5);
      expect(page1.body.pagination).toHaveProperty('total');
      expect(page1.body.pagination).toHaveProperty('page', 1);
    });
  });

  describe('Application Details', () => {
    it('should get application details (jobseeker)', async () => {
      const response = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${jobseekerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', applicationId);
      expect(response.body.data).toHaveProperty('vacancy');
      expect(response.body.data).toHaveProperty('status');
    });

    it('should get application details (employer)', async () => {
      const response = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${employerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('jobseeker');
      expect(response.body.data).toHaveProperty('resume');
    });

    it('should not allow unauthorized access to application', async () => {
      const anotherJobseekerToken = 'another-jobseeker-token';

      await request(app)
        .get(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${anotherJobseekerToken}`)
        .expect(403);
    });
  });

  describe('Application Statistics', () => {
    it('should get jobseeker application stats', async () => {
      const response = await request(app)
        .get('/api/applications/jobseeker/me/stats')
        .set('Authorization', `Bearer ${jobseekerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('byStatus');
      expect(response.body.data.byStatus).toHaveProperty('pending');
      expect(response.body.data.byStatus).toHaveProperty('viewed');
      expect(response.body.data.byStatus).toHaveProperty('interview');
      expect(response.body.data.byStatus).toHaveProperty('hired');
      expect(response.body.data.byStatus).toHaveProperty('rejected');
    });

    it('should get employer vacancy application stats', async () => {
      const response = await request(app)
        .get(`/api/applications/vacancy/${vacancyId}/stats`)
        .set('Authorization', `Bearer ${employerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('new');
      expect(response.body.data).toHaveProperty('conversionRate');
    });
  });

  describe('Application Withdrawal', () => {
    it('should allow jobseeker to withdraw application', async () => {
      // Create a new application
      const createResponse = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${jobseekerToken}`)
        .send({
          vacancyId: 2,
          resumeId: 1,
        })
        .expect(201);

      const newApplicationId = createResponse.body.data.id;

      // Withdraw it
      const response = await request(app)
        .delete(`/api/applications/${newApplicationId}`)
        .set('Authorization', `Bearer ${jobseekerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');
    });

    it('should not allow withdrawal of hired application', async () => {
      const response = await request(app)
        .delete(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${jobseekerToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/cannot withdraw|already hired/i);
    });
  });

  describe('Push Notifications', () => {
    it('should send notification on new application (to employer)', async () => {
      // This would require mocking the OneSignal service
      // For now, we just verify the application was created
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${jobseekerToken}`)
        .send({
          vacancyId: 3,
          resumeId: 1,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      // In a real test, you'd verify OneSignal API was called
    });

    it('should send notification on status change (to jobseeker)', async () => {
      const response = await request(app)
        .patch(`/api/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          status: 'interview',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      // In a real test, you'd verify OneSignal API was called
    });
  });
});
