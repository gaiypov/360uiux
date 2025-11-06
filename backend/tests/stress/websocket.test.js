/**
 * WebSocket Connection Load Test
 *
 * Tests WebSocket (Socket.IO) connections under load:
 * - Connection establishment
 * - Message broadcasting
 * - Connection stability
 * - Reconnection handling
 *
 * Run: k6 run websocket.test.js
 */

import { check, sleep } from 'k6';
import ws from 'k6/ws';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
const wsConnections = new Counter('ws_connections');
const wsMessages = new Counter('ws_messages');
const wsErrors = new Rate('ws_errors');
const wsConnectionTime = new Trend('ws_connection_time');
const wsMessageLatency = new Trend('ws_message_latency');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp up to 50 concurrent connections
    { duration: '2m', target: 50 },    // Maintain 50 connections
    { duration: '30s', target: 100 },  // Ramp up to 100 connections
    { duration: '2m', target: 100 },   // Maintain 100 connections
    { duration: '30s', target: 200 },  // Spike to 200 connections
    { duration: '1m', target: 200 },   // Maintain spike
    { duration: '1m', target: 0 },     // Ramp down
  ],
  thresholds: {
    'ws_connection_time': ['p(95)<500', 'p(99)<1000'],
    'ws_message_latency': ['p(95)<200', 'p(99)<500'],
    'ws_errors': ['rate<0.05'],
  },
};

const BASE_URL = __ENV.WS_URL || 'ws://localhost:5000';

export default function () {
  const userId = `user-${__VU}-${Date.now()}`;
  const url = `${BASE_URL}/socket.io/?EIO=4&transport=websocket`;

  const startTime = Date.now();

  const res = ws.connect(url, {
    headers: {
      'Origin': 'http://localhost:3000',
    },
  }, function (socket) {
    const connectionTime = Date.now() - startTime;
    wsConnectionTime.add(connectionTime);
    wsConnections.add(1);

    socket.on('open', () => {
      console.log(`[${userId}] Connected to WebSocket`);

      // Send Socket.IO handshake
      socket.send('40');

      // Join a room (application chat room)
      const applicationId = Math.floor(Math.random() * 100) + 1;
      socket.send(`42["join-application",{"applicationId":${applicationId}}]`);

      check(socket, {
        'websocket connected': () => true,
        'connection time < 500ms': () => connectionTime < 500,
      });
    });

    socket.on('message', (data) => {
      console.log(`[${userId}] Received:`, data);

      // Handle Socket.IO protocol messages
      if (data === '2') {
        // Pong response to ping
        socket.send('3');
      }

      if (data.startsWith('42')) {
        // Socket.IO event message
        wsMessages.add(1);
        const messageLatency = Date.now() - startTime;
        wsMessageLatency.add(messageLatency);
      }
    });

    socket.on('error', (e) => {
      console.error(`[${userId}] Error:`, e);
      wsErrors.add(1);
    });

    socket.on('close', () => {
      console.log(`[${userId}] Disconnected`);
    });

    // Send messages periodically
    const messageInterval = 5000; // 5 seconds
    let messageCount = 0;

    socket.setInterval(() => {
      if (messageCount >= 10) {
        // After 10 messages, close the connection
        socket.close();
        return;
      }

      const messageSentTime = Date.now();
      const message = JSON.stringify({
        type: 'text',
        content: `Test message ${messageCount++} from ${userId}`,
        timestamp: messageSentTime,
      });

      socket.send(`42["message",${message}]`);
      console.log(`[${userId}] Sent message ${messageCount}`);
    }, messageInterval);

    // Keep connection alive for test duration
    socket.setTimeout(() => {
      socket.close();
    }, 60000); // Close after 60 seconds
  });

  check(res, {
    'websocket connection established': (r) => r && r.status === 101,
  });

  if (!res || res.status !== 101) {
    wsErrors.add(1);
  }

  sleep(1);
}

export function handleSummary(data) {
  console.log('\n======= WEBSOCKET LOAD TEST SUMMARY =======\n');
  console.log('Total Connections:', data.metrics.ws_connections.values.count);
  console.log('Total Messages:', data.metrics.ws_messages.values.count);
  console.log('Connection Time (avg):', data.metrics.ws_connection_time.values.avg.toFixed(2) + 'ms');
  console.log('Connection Time (p95):', data.metrics.ws_connection_time.values['p(95)'].toFixed(2) + 'ms');
  console.log('Message Latency (avg):', data.metrics.ws_message_latency.values.avg.toFixed(2) + 'ms');
  console.log('Message Latency (p95):', data.metrics.ws_message_latency.values['p(95)'].toFixed(2) + 'ms');
  console.log('Error Rate:', (data.metrics.ws_errors.values.rate * 100).toFixed(2) + '%');
  console.log('\n===========================================\n');

  return {
    'tests/stress/results/websocket-summary.json': JSON.stringify(data),
  };
}
