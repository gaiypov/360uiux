/**
 * Chat & Messaging Load Test
 *
 * Tests the chat system under load:
 * - Sending text messages
 * - Retrieving message history
 * - Real-time message delivery
 * - Status updates
 *
 * Run: k6 run chat-load.test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const messageLatency = new Trend('message_send_latency');
const messageCounter = new Counter('messages_sent');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 50 },   // Stay at 50 users for 3 minutes
    { duration: '1m', target: 100 },  // Ramp up to 100 users
    { duration: '3m', target: 100 },  // Stay at 100 users for 3 minutes
    { duration: '1m', target: 200 },  // Spike to 200 users
    { duration: '2m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1s
    'http_req_failed': ['rate<0.05'], // Error rate < 5%
    'errors': ['rate<0.1'], // Application error rate < 10%
    'message_send_latency': ['p(95)<300', 'p(99)<600'],
  },
};

// Base URL - change this to your environment
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

// Mock authentication tokens (in production, these would be obtained via login)
const TOKENS = {
  jobseeker: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  employer: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
};

// Helper function to get random application ID
function getRandomApplicationId() {
  return Math.floor(Math.random() * 1000) + 1;
}

// Helper function to generate random message
function getRandomMessage() {
  const messages = [
    'Здравствуйте! Меня интересует эта вакансия.',
    'Какой график работы?',
    'Спасибо за ответ!',
    'Когда можно подойти на собеседование?',
    'Отлично, жду вашего звонка.',
    'Есть ли возможность удаленной работы?',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

export default function () {
  const userType = Math.random() > 0.5 ? 'jobseeker' : 'employer';
  const token = TOKENS[userType];
  const applicationId = getRandomApplicationId();

  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  group('Chat Operations', () => {
    // 1. Get message history
    group('Get Messages', () => {
      const res = http.get(
        `${BASE_URL}/api/chat/applications/${applicationId}/messages`,
        params
      );

      const success = check(res, {
        'get messages status 200': (r) => r.status === 200,
        'get messages has data': (r) => r.json('data') !== undefined,
      });

      errorRate.add(!success);
    });

    sleep(1);

    // 2. Send text message
    group('Send Message', () => {
      const startTime = Date.now();
      const payload = JSON.stringify({
        applicationId,
        messageType: 'text',
        content: getRandomMessage(),
        senderType: userType,
      });

      const res = http.post(
        `${BASE_URL}/api/chat/messages`,
        payload,
        params
      );

      const duration = Date.now() - startTime;
      messageLatency.add(duration);

      const success = check(res, {
        'send message status 201': (r) => r.status === 201,
        'send message has id': (r) => r.json('data.id') !== undefined,
        'send message latency < 500ms': () => duration < 500,
      });

      if (success) {
        messageCounter.add(1);
      }

      errorRate.add(!success);
    });

    sleep(2);

    // 3. Mark messages as read
    group('Mark as Read', () => {
      const res = http.post(
        `${BASE_URL}/api/chat/applications/${applicationId}/read`,
        '{}',
        params
      );

      const success = check(res, {
        'mark read status 200': (r) => r.status === 200,
      });

      errorRate.add(!success);
    });
  });

  sleep(Math.random() * 3 + 2); // Random sleep 2-5 seconds
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'tests/stress/results/chat-load-summary.json': JSON.stringify(data),
  };
}

function textSummary(data, options = {}) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;

  let summary = '\n' + indent + '======= CHAT LOAD TEST SUMMARY =======\n\n';

  // HTTP metrics
  summary += indent + 'HTTP Metrics:\n';
  summary += indent + `  Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += indent + `  Failed: ${data.metrics.http_req_failed.values.rate * 100}%\n`;
  summary += indent + `  Duration (avg): ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += indent + `  Duration (p95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += indent + `  Duration (p99): ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n\n`;

  // Custom metrics
  summary += indent + 'Message Metrics:\n';
  summary += indent + `  Messages Sent: ${data.metrics.messages_sent.values.count}\n`;
  summary += indent + `  Send Latency (avg): ${data.metrics.message_send_latency.values.avg.toFixed(2)}ms\n`;
  summary += indent + `  Send Latency (p95): ${data.metrics.message_send_latency.values['p(95)'].toFixed(2)}ms\n`;
  summary += indent + `  Error Rate: ${data.metrics.errors.values.rate * 100}%\n\n`;

  summary += indent + '======================================\n';

  return summary;
}
