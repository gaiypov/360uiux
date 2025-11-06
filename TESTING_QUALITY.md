# 360° РАБОТА - Testing & Code Quality Guide

Complete guide for testing, code quality, and performance validation.

## 📋 Table of Contents

- [Overview](#overview)
- [Code Quality Tools](#code-quality-tools)
- [Testing Strategy](#testing-strategy)
- [Running Tests](#running-tests)
- [Code Quality Scans](#code-quality-scans)
- [Performance Testing](#performance-testing)
- [Continuous Integration](#continuous-integration)
- [Best Practices](#best-practices)

## 🎯 Overview

The 360° РАБОТА platform uses a comprehensive testing and quality assurance strategy:

- **ESLint** - Code linting for TypeScript/JavaScript
- **Prettier** - Code formatting
- **Jest** - Unit and integration testing
- **k6** - Load and stress testing
- **GitHub Actions** - Automated CI/CD

## 🔧 Code Quality Tools

### ESLint Configuration

**Frontend (.eslintrc.js):**
```javascript
module.exports = {
  root: true,
  extends: '@react-native',
};
```

**Backend (.eslintrc.js):**
```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'prefer-const': 'error',
  },
};
```

### Prettier Configuration

**Both Frontend and Backend (.prettierrc.js):**
```javascript
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  arrowParens: 'always',
};
```

## 🧪 Testing Strategy

### Testing Pyramid

```
        /\
       /  \
      /E2E \          ← Integration Tests (10%)
     /------\
    /        \
   /  Unit    \       ← Unit Tests (70%)
  /------------\
 / Performance  \     ← Stress Tests (20%)
/________________\
```

### Test Types

1. **Unit Tests** (70%)
   - Test individual functions/methods
   - Mock external dependencies
   - Fast execution (< 1s per test)
   - Location: `backend/tests/services/`

2. **Integration Tests** (10%)
   - Test API endpoints end-to-end
   - Use test database
   - Verify business logic
   - Location: `backend/tests/integration/`

3. **Stress/Load Tests** (20%)
   - Test system under load
   - Verify performance thresholds
   - Identify bottlenecks
   - Location: `backend/tests/stress/`

## 🚀 Running Tests

### Unit Tests

```bash
# Backend unit tests
cd backend
npm test

# Run specific test file
npm test CacheService.test.ts

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

**Expected Output:**
```
PASS  tests/services/CacheService.test.ts
  ✓ should get and set values (15ms)
  ✓ should handle TTL expiration (1002ms)
  ✓ should use getOrSet pattern (25ms)

Test Suites: 3 passed, 3 total
Tests:       27 passed, 27 total
Time:        3.5s
```

### Integration Tests

```bash
# Run integration tests
cd backend
npm test -- tests/integration

# Run specific integration test
npm test chat.integration.test.ts

# Run with coverage
npm test -- --coverage tests/integration
```

**Requirements:**
- PostgreSQL running
- Redis running
- Test database seeded

**Setup Test Environment:**
```bash
# Start services
docker-compose up -d postgres redis

# Run migrations
npm run migrate

# Seed test data
npm run seed:test
```

### Stress Tests

See [backend/tests/stress/README.md](backend/tests/stress/README.md) for detailed instructions.

```bash
cd backend/tests/stress

# Run all stress tests
./run-all-tests.sh local

# Run individual test
k6 run -e BASE_URL=http://localhost:5000 api-endpoints.test.js
```

## 📊 Code Quality Scans

### Linting

**Frontend:**
```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint -- --fix

# Check specific files
npm run lint src/components/chat/*.tsx
```

**Backend:**
```bash
cd backend

# Run ESLint
npm run lint

# Auto-fix issues
npm run lint:fix

# Lint specific files
npm run lint src/services/*.ts
```

**Expected Output:**
```
✔ 0 problems (0 errors, 0 warnings)

Or with issues:

/src/services/ChatService.ts
  15:10  warning  Unexpected console statement  no-console
  23:5   error    'userId' is never used       @typescript-eslint/no-unused-vars

✖ 2 problems (1 error, 1 warning)
```

### Code Formatting

**Check formatting:**
```bash
# Backend
cd backend
npm run format:check

# Frontend
npm run format:check
```

**Auto-format code:**
```bash
# Backend
cd backend
npm run format

# Frontend
npm run format
```

### Full Code Quality Report

Run a comprehensive code quality scan:

```bash
#!/bin/bash
# Save as: scripts/code-quality-report.sh

echo "🔍 Running Code Quality Report..."
echo ""

# Frontend
echo "📱 Frontend Analysis"
echo "===================="
cd /path/to/360uiux
npm run lint > reports/frontend-lint.txt 2>&1
npm run format:check > reports/frontend-format.txt 2>&1
echo "✓ Frontend scan complete"
echo ""

# Backend
echo "⚙️  Backend Analysis"
echo "==================="
cd backend
npm run lint > ../reports/backend-lint.txt 2>&1
npm run format:check > ../reports/backend-format.txt 2>&1
npm test -- --coverage > ../reports/backend-tests.txt 2>&1
echo "✓ Backend scan complete"
echo ""

# Summary
echo "📊 Summary"
echo "=========="
echo "Frontend linting: $(grep -c 'error' reports/frontend-lint.txt || echo 0) errors"
echo "Backend linting: $(grep -c 'error' reports/backend-lint.txt || echo 0) errors"
echo "Test coverage: $(grep 'All files' reports/backend-tests.txt | awk '{print $10}')"
echo ""
echo "✅ Report generated in ./reports/"
```

## ⚡ Performance Testing

### Load Testing with k6

**Quick Load Test:**
```bash
cd backend/tests/stress
k6 run --vus 50 --duration 2m api-endpoints.test.js
```

**Comprehensive Stress Test:**
```bash
./run-all-tests.sh local
```

### Performance Benchmarks

**Expected Performance Metrics:**

| Metric | Target | Acceptable | Critical |
|--------|--------|------------|----------|
| API Response Time (P95) | < 300ms | < 500ms | < 1000ms |
| API Response Time (P99) | < 600ms | < 1000ms | < 2000ms |
| Database Query (P95) | < 100ms | < 200ms | < 500ms |
| WebSocket Connection | < 200ms | < 300ms | < 500ms |
| Message Send Latency | < 200ms | < 300ms | < 600ms |
| Error Rate | < 1% | < 5% | < 10% |

**Performance Testing Scenarios:**

1. **Normal Load**
   - 50-100 concurrent users
   - Average request rate: 100 req/s
   - Duration: 5 minutes

2. **Peak Load**
   - 200-300 concurrent users
   - Average request rate: 300 req/s
   - Duration: 10 minutes

3. **Stress Test**
   - 500+ concurrent users
   - Average request rate: 500+ req/s
   - Duration: 5 minutes
   - Goal: Find breaking point

4. **Spike Test**
   - 0 → 500 users in 10 seconds
   - Duration: 2 minutes
   - Goal: Test auto-scaling

## 🔄 Continuous Integration

### GitHub Actions Workflow

The CI/CD pipeline automatically runs on every push:

**Pipeline Stages:**

1. **Lint & Format Check**
   ```yaml
   - name: Run linter
     run: npm run lint
   ```

2. **Unit Tests**
   ```yaml
   - name: Run tests
     run: npm test -- --coverage
   ```

3. **Build**
   ```yaml
   - name: Build application
     run: npm run build
   ```

4. **Security Scan**
   ```yaml
   - name: Run Trivy security scan
     uses: aquasecurity/trivy-action@master
   ```

5. **Deploy** (main branch only)
   ```yaml
   - name: Deploy to production
     if: github.ref == 'refs/heads/main'
   ```

**View CI/CD Results:**
- GitHub → Actions tab
- Check marks (✓) indicate passing tests
- Red X (✗) indicates failures

## 📝 Best Practices

### Writing Tests

**Unit Tests:**
```typescript
describe('CacheService', () => {
  it('should cache values with TTL', async () => {
    // Arrange
    const key = 'test-key';
    const value = { data: 'test' };
    const ttl = 60;

    // Act
    await cacheService.set(key, value, ttl);
    const result = await cacheService.get(key);

    // Assert
    expect(result).toEqual(value);
  });
});
```

**Integration Tests:**
```typescript
it('should create application and send notification', async () => {
  const response = await request(app)
    .post('/api/applications')
    .set('Authorization', `Bearer ${token}`)
    .send({ vacancyId: 1 })
    .expect(201);

  expect(response.body.success).toBe(true);
  // Verify notification was sent
});
```

### Code Quality Rules

1. **No `any` Types**
   ```typescript
   // ❌ Bad
   function process(data: any) { }

   // ✅ Good
   function process(data: UserData) { }
   ```

2. **Use `const` over `let`**
   ```typescript
   // ❌ Bad
   let userId = 123;

   // ✅ Good
   const userId = 123;
   ```

3. **No Console Logs in Production**
   ```typescript
   // ❌ Bad
   console.log('User logged in');

   // ✅ Good
   logger.info('User logged in');
   ```

4. **Handle Errors Properly**
   ```typescript
   // ❌ Bad
   try {
     await doSomething();
   } catch (e) {
     console.log(e);
   }

   // ✅ Good
   try {
     await doSomething();
   } catch (error) {
     logger.error('Operation failed', { error });
     throw new ApplicationError('Failed to process request');
   }
   ```

### Pre-Commit Checklist

Before committing code:

- [ ] Run `npm run lint` (no errors)
- [ ] Run `npm run format` (code formatted)
- [ ] Run `npm test` (all tests pass)
- [ ] Review changes for sensitive data (API keys, passwords)
- [ ] Update tests for new features
- [ ] Update documentation if needed

### Code Review Checklist

When reviewing PRs:

- [ ] All tests pass
- [ ] Code follows style guide
- [ ] No console.log statements
- [ ] Error handling is proper
- [ ] Types are defined (no `any`)
- [ ] Performance is acceptable
- [ ] Security vulnerabilities addressed
- [ ] Documentation updated

## 🐛 Debugging Tests

### Debug Unit Tests

```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Open chrome://inspect in Chrome
# Click "inspect" on the remote target
```

### Debug Integration Tests

```bash
# Enable verbose logging
DEBUG=* npm test

# Run single test
npm test -- -t "should send message"
```

### Common Test Issues

**1. Database Connection Failed**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Start PostgreSQL
```bash
docker-compose up -d postgres
```

**2. Redis Connection Failed**
```
Error: Redis connection failed
```
**Solution:** Start Redis
```bash
docker-compose up -d redis
```

**3. Timeouts**
```
Timeout - Async callback was not invoked within the 5000 ms timeout
```
**Solution:** Increase timeout
```typescript
it('should process video', async () => {
  // ...
}, 10000); // 10 second timeout
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [k6 Documentation](https://k6.io/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [GitHub Actions](https://docs.github.com/en/actions)

## 🎯 Quality Metrics

Track these metrics over time:

- **Test Coverage**: Target 80%+
- **Linting Errors**: Target 0
- **Type Safety**: No `any` types
- **Build Time**: < 2 minutes
- **Test Execution**: < 30 seconds (unit tests)
- **P95 Response Time**: < 500ms
- **Error Rate**: < 1%

## 📊 Reporting

Generate weekly quality reports:

```bash
#!/bin/bash
# Weekly Quality Report

echo "360° РАБОТА - Weekly Quality Report"
echo "===================================="
echo ""
echo "Test Coverage: $(npm test -- --coverage | grep 'All files' | awk '{print $10}')"
echo "Linting Errors: $(npm run lint 2>&1 | grep -c 'error')"
echo "Type Errors: $(npm run build 2>&1 | grep -c 'error')"
echo "Passing Tests: $(npm test 2>&1 | grep 'Tests:' | awk '{print $2}')"
echo ""
```

---

**Last Updated:** 2025-11-06
**Maintained by:** Development Team
