# 360° РАБОТА - Stress & Load Testing

Comprehensive stress testing suite using k6 for the 360° РАБОТА platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Test Scenarios](#test-scenarios)
- [Running Tests](#running-tests)
- [Understanding Results](#understanding-results)
- [Performance Benchmarks](#performance-benchmarks)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This stress testing suite validates the platform's performance under various load conditions:

- **API Endpoints**: Tests REST API performance under load
- **Chat System**: Tests real-time messaging and chat functionality
- **WebSocket**: Tests WebSocket connections and real-time events
- **Database**: Tests database performance with concurrent operations

## 🔧 Prerequisites

### Install k6

**macOS:**
```bash
brew install k6
```

**Linux:**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows:**
```powershell
choco install k6
```

**Docker:**
```bash
docker pull grafana/k6:latest
```

### Verify Installation

```bash
k6 version
# Expected output: k6 v0.x.x
```

## 📦 Installation

No additional installation required. All test files are included in this directory.

## 🧪 Test Scenarios

### 1. API Endpoints Test (`api-endpoints.test.js`)

Tests critical API endpoints with multiple load scenarios:

**Scenarios:**
- **Constant Load**: 50 VUs for 5 minutes
- **Ramping Load**: 0 → 100 → 200 VUs over 16 minutes
- **Spike Test**: 0 → 500 VUs (fast spike)

**Endpoints Tested:**
- `GET /health` - Health check
- `GET /api/vacancies` - List vacancies
- `GET /api/vacancies/:id` - Vacancy details
- `GET /api/analytics/platform` - Platform analytics
- `GET /api/analytics/top-vacancies` - Top vacancies

**Thresholds:**
- 95% of requests < 1000ms
- 99% of requests < 2000ms
- Error rate < 5%

### 2. Chat Load Test (`chat-load.test.js`)

Tests chat messaging system under load:

**Load Profile:**
- Ramp up: 50 → 100 → 200 concurrent users
- Duration: 13 minutes
- Operations: Send messages, get history, mark as read

**Operations Tested:**
- Get message history
- Send text messages
- Mark messages as read
- Real-time message delivery

**Thresholds:**
- 95% of message sends < 300ms
- 99% of message sends < 600ms
- HTTP requests 95% < 500ms
- Error rate < 10%

### 3. Database Load Test (`database.test.js`)

Tests database performance:

**Load Profile:**
- Warm up: 20 VUs
- Normal: 50 VUs
- High: 100 VUs
- Stress: 150 VUs
- Duration: 9 minutes

**Operations Tested:**
- Simple SELECT queries
- JOIN queries
- Complex aggregations
- INSERT operations
- UPDATE operations
- Concurrent batch operations

**Thresholds:**
- Read latency 95% < 200ms
- Write latency 95% < 500ms
- Complex queries 95% < 1000ms
- Error rate < 1%

### 4. WebSocket Test (`websocket.test.js`)

Tests WebSocket connections and real-time messaging:

**Load Profile:**
- 50 → 100 → 200 concurrent WebSocket connections
- Duration: 8 minutes
- Messages per connection: 10

**Operations Tested:**
- Connection establishment
- Message broadcasting
- Reconnection handling
- Connection stability

**Thresholds:**
- Connection time 95% < 500ms
- Message latency 95% < 200ms
- Error rate < 5%

## 🚀 Running Tests

### Run Individual Tests

```bash
# API endpoints test
k6 run -e BASE_URL=http://localhost:5000 api-endpoints.test.js

# Chat load test
k6 run -e BASE_URL=http://localhost:5000 chat-load.test.js

# Database test
k6 run -e BASE_URL=http://localhost:5000 database.test.js

# WebSocket test
k6 run -e WS_URL=ws://localhost:5000 websocket.test.js
```

### Run All Tests

```bash
# Local environment
./run-all-tests.sh local

# Staging environment
./run-all-tests.sh staging

# Production environment (use with caution!)
./run-all-tests.sh production
```

### Custom Configuration

```bash
# Run with custom VUs and duration
k6 run --vus 100 --duration 5m api-endpoints.test.js

# Run with specific stages
k6 run --stage 1m:10,3m:50,1m:100 api-endpoints.test.js

# Run with custom environment variables
k6 run -e BASE_URL=https://custom-url.com api-endpoints.test.js
```

### Docker

```bash
docker run --rm -v $(pwd):/tests grafana/k6 run /tests/api-endpoints.test.js
```

## 📊 Understanding Results

### Output Metrics

k6 provides several key metrics:

**HTTP Metrics:**
- `http_reqs` - Total HTTP requests
- `http_req_duration` - Request duration (avg, min, max, p95, p99)
- `http_req_failed` - Failed request rate
- `http_req_waiting` - Time waiting for response

**Custom Metrics:**
- `errors` - Application error rate
- `message_send_latency` - Chat message send latency
- `db_read_latency` - Database read latency
- `db_write_latency` - Database write latency
- `ws_connection_time` - WebSocket connection time
- `ws_message_latency` - WebSocket message latency

### Interpreting Results

**Good Performance:**
```
✓ http_req_duration..............: avg=250ms  p(95)=450ms  p(99)=800ms
✓ http_req_failed................: 0.12%
✓ message_send_latency...........: avg=180ms  p(95)=280ms
```

**Performance Issues:**
```
✗ http_req_duration..............: avg=1200ms  p(95)=2500ms  p(99)=4000ms
✗ http_req_failed................: 8.5%
✗ message_send_latency...........: avg=950ms  p(95)=1800ms
```

### Reports Location

After running tests, reports are saved to:
```
tests/stress/results/report_YYYYMMDD_HHMMSS/
├── api-endpoints-summary.json
├── chat-load-summary.json
├── database-summary.json
├── websocket-summary.json
└── summary.txt
```

## 📈 Performance Benchmarks

### Expected Performance (Production)

**API Endpoints:**
- Throughput: 500-1000 req/s
- P95 latency: < 500ms
- P99 latency: < 1000ms
- Error rate: < 1%

**Chat System:**
- Message throughput: 200-400 msg/s
- P95 latency: < 300ms
- Concurrent users: 500+

**WebSocket:**
- Concurrent connections: 1000+
- Connection time P95: < 300ms
- Message latency P95: < 200ms

**Database:**
- Read latency P95: < 100ms
- Write latency P95: < 300ms
- Concurrent queries: 200+

### Optimization Targets

If results don't meet benchmarks:

1. **High Latency (> 1s)**
   - Check database query optimization
   - Review API response caching
   - Check network latency

2. **High Error Rate (> 5%)**
   - Check server resources (CPU, RAM)
   - Review error logs
   - Check connection pool settings

3. **Low Throughput**
   - Increase server instances
   - Enable HTTP/2
   - Optimize database indexes
   - Implement caching (Redis)

## 🔍 Troubleshooting

### Common Issues

**1. Connection Refused**
```
Error: failed to connect to http://localhost:5000
```

**Solution:** Ensure backend server is running:
```bash
cd backend
npm run dev
```

**2. High Error Rates During Test**
```
✗ http_req_failed: 25%
```

**Solution:**
- Reduce VUs (virtual users)
- Increase ramp-up time
- Check server logs for errors
- Verify database connection pool

**3. WebSocket Test Failures**
```
Error: websocket connection failed
```

**Solution:**
- Verify WebSocket URL (ws:// or wss://)
- Check Socket.IO version compatibility
- Review server WebSocket configuration

**4. Timeout Errors**
```
ERRO[0060] request timeout
```

**Solution:**
- Increase k6 timeout: `--http-debug=full`
- Check server processing time
- Review database query performance

### Debug Mode

Run tests in debug mode:

```bash
# Enable HTTP debug
k6 run --http-debug api-endpoints.test.js

# Enable full debug
k6 run --http-debug=full --verbose api-endpoints.test.js
```

### Monitoring During Tests

Monitor server resources during tests:

```bash
# CPU and Memory
htop

# Docker containers
docker stats

# Database connections
docker exec postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Redis
docker exec redis redis-cli INFO stats
```

## 📚 Additional Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Cloud](https://k6.io/cloud/) - Cloud-based load testing
- [Grafana Integration](https://k6.io/docs/results-visualization/grafana-dashboards/)
- [Performance Optimization Guide](../../DEPLOYMENT.md#performance-optimization)

## 🤝 Contributing

When adding new stress tests:

1. Follow existing test structure
2. Add custom metrics for key operations
3. Set appropriate thresholds
4. Update this README
5. Add test to `run-all-tests.sh`

## 📝 Notes

- **Production Testing**: Always coordinate with team before running stress tests on production
- **Database Impact**: High-load tests may impact database performance
- **Test Data**: Tests use mock data and random IDs
- **Authentication**: Update tokens in test files for authenticated endpoints
