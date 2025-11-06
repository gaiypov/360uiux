/**
 * Database Load Test
 *
 * Tests database performance under load:
 * - Read operations (SELECT)
 * - Write operations (INSERT)
 * - Complex queries (JOINs, aggregations)
 * - Concurrent transactions
 *
 * Run: k6 run database.test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const dbReadLatency = new Trend('db_read_latency');
const dbWriteLatency = new Trend('db_write_latency');
const dbComplexQueryLatency = new Trend('db_complex_query_latency');
const dbErrors = new Rate('db_errors');
const dbQueries = new Counter('db_queries');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 20 },   // Warm up
    { duration: '3m', target: 50 },   // Normal load
    { duration: '2m', target: 100 },  // High load
    { duration: '1m', target: 150 },  // Stress test
    { duration: '2m', target: 0 },    // Cool down
  ],
  thresholds: {
    'db_read_latency': ['p(95)<200', 'p(99)<500'],
    'db_write_latency': ['p(95)<500', 'p(99)<1000'],
    'db_complex_query_latency': ['p(95)<1000', 'p(99)<2000'],
    'db_errors': ['rate<0.01'], // Less than 1% error rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';

export default function () {
  const params = {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  group('Database Read Operations', () => {
    // Simple SELECT query
    group('List Vacancies (Simple SELECT)', () => {
      const startTime = Date.now();
      const res = http.get(`${BASE_URL}/api/vacancies?page=1&limit=20`, params);
      const duration = Date.now() - startTime;

      dbReadLatency.add(duration);
      dbQueries.add(1);

      const success = check(res, {
        'read status 200': (r) => r.status === 200,
        'read latency < 200ms': () => duration < 200,
      });

      dbErrors.add(!success);
    });

    sleep(0.5);

    // SELECT with JOIN
    group('Get Application with Details (JOIN)', () => {
      const applicationId = Math.floor(Math.random() * 1000) + 1;
      const startTime = Date.now();
      const res = http.get(`${BASE_URL}/api/applications/${applicationId}`, params);
      const duration = Date.now() - startTime;

      dbReadLatency.add(duration);
      dbQueries.add(1);

      const success = check(res, {
        'join query status 200 or 404': (r) => r.status === 200 || r.status === 404,
        'join query latency < 500ms': () => duration < 500,
      });

      dbErrors.add(!success);
    });

    sleep(0.5);

    // Complex aggregation query
    group('Analytics Query (Aggregation)', () => {
      const startTime = Date.now();
      const res = http.get(`${BASE_URL}/api/analytics/platform`, params);
      const duration = Date.now() - startTime;

      dbComplexQueryLatency.add(duration);
      dbQueries.add(1);

      const success = check(res, {
        'aggregation status 200': (r) => r.status === 200,
        'aggregation latency < 1000ms': () => duration < 1000,
        'aggregation has data': (r) => r.json('data') !== undefined,
      });

      dbErrors.add(!success);
    });
  });

  sleep(1);

  group('Database Write Operations', () => {
    // INSERT operation (send message)
    group('Insert Message', () => {
      const payload = JSON.stringify({
        applicationId: Math.floor(Math.random() * 100) + 1,
        messageType: 'text',
        content: `Load test message ${Date.now()}`,
        senderType: 'jobseeker',
      });

      const startTime = Date.now();
      const res = http.post(`${BASE_URL}/api/chat/messages`, payload, params);
      const duration = Date.now() - startTime;

      dbWriteLatency.add(duration);
      dbQueries.add(1);

      const success = check(res, {
        'insert status 201': (r) => r.status === 201,
        'insert latency < 500ms': () => duration < 500,
        'insert returns id': (r) => r.json('data.id') !== undefined,
      });

      dbErrors.add(!success);
    });

    sleep(1);

    // UPDATE operation (mark as read)
    group('Update Messages (Mark as Read)', () => {
      const applicationId = Math.floor(Math.random() * 100) + 1;
      const startTime = Date.now();
      const res = http.post(
        `${BASE_URL}/api/chat/applications/${applicationId}/read`,
        '{}',
        params
      );
      const duration = Date.now() - startTime;

      dbWriteLatency.add(duration);
      dbQueries.add(1);

      const success = check(res, {
        'update status 200': (r) => r.status === 200,
        'update latency < 300ms': () => duration < 300,
      });

      dbErrors.add(!success);
    });
  });

  sleep(2);

  group('Concurrent Operations', () => {
    // Simulate concurrent reads
    const batch = http.batch([
      ['GET', `${BASE_URL}/api/vacancies?page=1&limit=10`, null, params],
      ['GET', `${BASE_URL}/api/vacancies?page=2&limit=10`, null, params],
      ['GET', `${BASE_URL}/api/analytics/platform`, null, params],
    ]);

    dbQueries.add(3);

    const success = check(batch, {
      'batch all successful': (responses) =>
        responses.every((r) => r.status === 200),
    });

    dbErrors.add(!success);
  });

  sleep(Math.random() * 3 + 1);
}

export function handleSummary(data) {
  console.log('\n======= DATABASE LOAD TEST SUMMARY =======\n');
  console.log('Total Queries:', data.metrics.db_queries.values.count);
  console.log('\nRead Operations:');
  console.log('  Avg Latency:', data.metrics.db_read_latency.values.avg.toFixed(2) + 'ms');
  console.log('  P95 Latency:', data.metrics.db_read_latency.values['p(95)'].toFixed(2) + 'ms');
  console.log('  P99 Latency:', data.metrics.db_read_latency.values['p(99)'].toFixed(2) + 'ms');
  console.log('\nWrite Operations:');
  console.log('  Avg Latency:', data.metrics.db_write_latency.values.avg.toFixed(2) + 'ms');
  console.log('  P95 Latency:', data.metrics.db_write_latency.values['p(95)'].toFixed(2) + 'ms');
  console.log('  P99 Latency:', data.metrics.db_write_latency.values['p(99)'].toFixed(2) + 'ms');
  console.log('\nComplex Queries:');
  console.log('  Avg Latency:', data.metrics.db_complex_query_latency.values.avg.toFixed(2) + 'ms');
  console.log('  P95 Latency:', data.metrics.db_complex_query_latency.values['p(95)'].toFixed(2) + 'ms');
  console.log('  P99 Latency:', data.metrics.db_complex_query_latency.values['p(99)'].toFixed(2) + 'ms');
  console.log('\nError Rate:', (data.metrics.db_errors.values.rate * 100).toFixed(2) + '%');
  console.log('\n==========================================\n');

  return {
    'tests/stress/results/database-summary.json': JSON.stringify(data),
  };
}
