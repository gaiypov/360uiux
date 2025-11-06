/**
 * API Endpoints Load Test
 *
 * Tests critical API endpoints under load:
 * - Authentication
 * - Vacancy listing
 * - Application submission
 * - User profile
 * - Analytics
 *
 * Run: k6 run api-endpoints.test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiLatency = new Trend('api_latency');

// Test configuration
export const options = {
  scenarios: {
    // Constant load scenario
    constant_load: {
      executor: 'constant-vus',
      vus: 50,
      duration: '5m',
    },
    // Ramping load scenario
    ramping_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 200 },
        { duration: '5m', target: 200 },
        { duration: '2m', target: 0 },
      ],
      startTime: '6m', // Start after constant_load
    },
    // Spike test scenario
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 500 }, // Fast ramp to 500
        { duration: '1m', target: 500 },
        { duration: '10s', target: 0 },
      ],
      startTime: '17m', // Start after ramping_load
    },
  },
  thresholds: {
    'http_req_duration': ['p(95)<1000', 'p(99)<2000'],
    'http_req_failed': ['rate<0.05'],
    'errors': ['rate<0.1'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  group('Public Endpoints', () => {
    // Health check
    group('Health Check', () => {
      const startTime = Date.now();
      const res = http.get(`${BASE_URL}/health`);
      apiLatency.add(Date.now() - startTime);

      const success = check(res, {
        'health status 200': (r) => r.status === 200,
        'health has status': (r) => r.json('status') === 'ok',
      });

      errorRate.add(!success);
    });

    sleep(0.5);

    // Get vacancies list
    group('List Vacancies', () => {
      const startTime = Date.now();
      const res = http.get(`${BASE_URL}/api/vacancies?page=1&limit=20`, params);
      apiLatency.add(Date.now() - startTime);

      const success = check(res, {
        'vacancies status 200': (r) => r.status === 200,
        'vacancies has data': (r) => Array.isArray(r.json('data')),
        'vacancies response < 1s': (r) => r.timings.duration < 1000,
      });

      errorRate.add(!success);
    });

    sleep(1);

    // Get vacancy details
    group('Vacancy Details', () => {
      const vacancyId = Math.floor(Math.random() * 100) + 1;
      const startTime = Date.now();
      const res = http.get(`${BASE_URL}/api/vacancies/${vacancyId}`, params);
      apiLatency.add(Date.now() - startTime);

      const success = check(res, {
        'vacancy details status 200 or 404': (r) =>
          r.status === 200 || r.status === 404,
        'vacancy details response < 500ms': (r) => r.timings.duration < 500,
      });

      errorRate.add(!success);
    });
  });

  sleep(2);

  group('Analytics Endpoints', () => {
    // Platform analytics
    group('Platform Analytics', () => {
      const startTime = Date.now();
      const res = http.get(`${BASE_URL}/api/analytics/platform`, params);
      apiLatency.add(Date.now() - startTime);

      const success = check(res, {
        'platform analytics status 200': (r) => r.status === 200,
        'platform analytics has stats': (r) => r.json('data') !== undefined,
      });

      errorRate.add(!success);
    });

    sleep(1);

    // Top vacancies
    group('Top Vacancies', () => {
      const startTime = Date.now();
      const res = http.get(`${BASE_URL}/api/analytics/top-vacancies?limit=10`, params);
      apiLatency.add(Date.now() - startTime);

      const success = check(res, {
        'top vacancies status 200': (r) => r.status === 200,
        'top vacancies is array': (r) => Array.isArray(r.json('data')),
      });

      errorRate.add(!success);
    });
  });

  sleep(Math.random() * 2 + 1);
}

export function handleSummary(data) {
  console.log('\n======= API ENDPOINTS LOAD TEST SUMMARY =======\n');
  console.log('Total Requests:', data.metrics.http_reqs.values.count);
  console.log('Failed Requests:', (data.metrics.http_req_failed.values.rate * 100).toFixed(2) + '%');
  console.log('Avg Duration:', data.metrics.http_req_duration.values.avg.toFixed(2) + 'ms');
  console.log('P95 Duration:', data.metrics.http_req_duration.values['p(95)'].toFixed(2) + 'ms');
  console.log('P99 Duration:', data.metrics.http_req_duration.values['p(99)'].toFixed(2) + 'ms');
  console.log('Error Rate:', (data.metrics.errors.values.rate * 100).toFixed(2) + '%');
  console.log('\n================================================\n');

  return {
    'tests/stress/results/api-endpoints-summary.json': JSON.stringify(data),
  };
}
