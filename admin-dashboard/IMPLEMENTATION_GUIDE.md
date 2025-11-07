# 360° РАБОТА - Admin Dashboard Implementation Guide

## Overview
This guide covers the complete implementation of all remaining admin dashboard APIs and frontend integrations completed in this session.

## What Was Implemented

### 1. Backend APIs (Complete Database Integration)

#### Complaints Management (3 endpoints)
- **GET `/api/admin/complaints`** - List all complaints
  - Query parameters: `status`, `type`, `priority`
  - Complex multi-table JOIN queries
  - Dynamic filtering with parameterized queries
  - Returns formatted complaint data with reporter/reported information

- **POST `/api/admin/complaints/resolve`** - Resolve a complaint
  - Body: `{ complaintId, resolution, notes }`
  - Updates complaint status to 'resolved'
  - Records admin decision and notes
  - Audit logging to admin_actions table

- **POST `/api/admin/complaints/reject`** - Reject a complaint
  - Body: `{ complaintId }`
  - Updates complaint status to 'rejected'
  - Automatic rejection message
  - Audit logging

#### Moderation (3 endpoints + migration)
- **Migration 003**: Added moderation columns to vacancies table
  - Columns: moderation_status, approved_at, approved_by, rejected_at, rejected_by, rejection_reason, rejection_comment, deleted_at
  - Indexes for performance optimization

- **GET `/api/admin/moderation`** - List vacancies for moderation
  - Query parameter: `status` (pending/approved/rejected)
  - JOIN with users and admins tables
  - Formatted salary display: range, "от X", or "Договорная"
  - Returns up to 50 vacancies per request

- **POST `/api/admin/moderation/approve`** - Approve a vacancy
  - Body: `{ vacancyId }`
  - Updates moderation_status to 'approved'
  - Records approval timestamp and admin
  - Sends notification to employer (via NotificationService)
  - Audit logging

- **POST `/api/admin/moderation/reject`** - Reject a vacancy
  - Body: `{ vacancyId, reason, comment }`
  - Predefined rejection reasons:
    * Несоответствие описанию
    * Низкое качество видео
    * Низкое качество звука
    * Недопустимый контент
    * Спам/мошенничество
    * Другое
  - Updates moderation_status to 'rejected'
  - Records rejection details
  - Sends notification to employer
  - Audit logging

#### Analytics (1 comprehensive endpoint)
- **GET `/api/admin/analytics`** - Platform analytics with charts data
  - Query parameter: `range` (7d, 30d, 90d, 1y)
  - Returns multiple data series:
    * **User Growth**: Cumulative jobseekers/employers by date
    * **Vacancy Stats**: Posted/approved/rejected by date
    * **Video Views**: Total and unique users by date
    * **Application Stats**: Applications by date
    * **User Activity**: 24-hour distribution
    * **Role Distribution**: Pie chart data
    * **Vacancy Categories**: Top 10 professions (bar chart)
    * **Platform Stats**: Totals and growth rate
  - Uses PostgreSQL `generate_series` for complete date ranges
  - All time-series data formatted for recharts library
  - Audit logging of analytics access

#### Video View Tracking - 2-View Limit (2 endpoints) **CRITICAL**
- **GET `/api/video/track-view`** - Check view count
  - Query parameters: `videoId`, `applicationId`
  - Returns: `{ videoId, applicationId, viewCount, viewsRemaining, isLocked }`
  - Used before displaying video player

- **POST `/api/video/track-view`** - Record a video view
  - Body: `{ videoId, applicationId }`
  - Enforces 2-view limit per video per employer
  - Database triggers automatically:
    * BEFORE INSERT: Prevents 3rd view (raises exception)
    * AFTER INSERT: Auto-deletes video after 2nd view
  - Retrieves jobseeker and employer info
  - Sends push notifications:
    * 1st view: "Ваше видео просмотрено! Осталось 1 просмотр"
    * 2nd view: "Лимит просмотров достигнут. Видео удалено"
  - Returns: `{ success, viewCount, viewsRemaining, isLocked, message }`
  - IP address tracking

### 2. Notification Service

Created comprehensive `NotificationService` in `/lib/notification.ts`:

**Features:**
- Multi-channel support: FCM (Firebase Cloud Messaging), Web Push, Email, SMS
- User preference management
- Device management (iOS, Android, Web)
- Notification logging to database
- Status tracking (pending, sent, failed)

**Pre-built Notification Methods:**
- `notifyVideoViewed()` - 1st video view notification
- `notifyVideoLimitReached()` - 2nd video view notification
- `notifyVacancyApproved()` - Vacancy approval notification
- `notifyVacancyRejected()` - Vacancy rejection notification
- `notifyUserBlocked()` - User account blocked
- `notifyUserUnblocked()` - User account unblocked

**Integration Points:**
- ✅ Integrated into `/api/video/track-view` (POST)
- ✅ Integrated into `/api/admin/moderation/approve` (POST)
- ✅ Integrated into `/api/admin/moderation/reject` (POST)

**TODO for Production:**
- Add Firebase Cloud Messaging credentials
- Add web-push VAPID keys
- Create database tables:
  * `user_devices` - Device tokens and subscriptions
  * `user_notification_preferences` - User preferences
  * `notification_logs` - Notification history

### 3. Frontend Components

#### Complaints Page (`/admin/complaints/page.tsx`)
- ✅ Updated TypeScript interfaces to match API response
- ✅ Added data mapping from snake_case to camelCase
- ✅ Integrated with all 3 complaints API endpoints
- ✅ Real-time filtering by status, type, priority
- ✅ Resolve modal with resolution text and notes
- ✅ Reject confirmation dialog
- ✅ Statistics cards (total, pending, resolved, rejected)

#### Moderation Page (`/admin/moderation/page.tsx`)
- ✅ Updated TypeScript interfaces to match API response
- ✅ Added data mapping for vacancy data
- ✅ Integrated with moderation API endpoints
- ✅ Video player for vacancy review
- ✅ Approve/Reject buttons with confirmation
- ✅ Reject modal with predefined reasons and comments
- ✅ Filter tabs (pending, approved, rejected)

#### Analytics Page (`/admin/analytics/page.tsx`)
- ✅ Already properly configured with correct interfaces
- ✅ Real-time data fetching from analytics API
- ✅ Date range selector (7d, 30d, 90d, 1y)
- ✅ Recharts integration for all chart types:
  * Line charts (user growth, vacancy stats)
  * Area charts (video views, applications)
  * Pie chart (role distribution)
  * Bar chart (vacancy categories)
- ✅ Export to CSV functionality
- ✅ Overview statistics cards

### 4. Database Migration Tools

Created migration infrastructure:

**Files:**
- `migrations/003_add_moderation_columns.sql` - Moderation columns migration
- `scripts/run-migration.js` - Migration runner script
- `docker-compose.yml` - PostgreSQL container for local development
- `.env` - Environment configuration (copied from .env.example)

## How to Run

### 1. Start PostgreSQL Database

**Option A: Using Docker (Recommended)**
```bash
cd admin-dashboard
docker compose up -d
```

**Option B: Using existing PostgreSQL**
Update `.env` file with your PostgreSQL credentials:
```env
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=360_rabota
PG_USER=postgres
PG_PASSWORD=postgres
```

### 2. Run Migration 003

```bash
cd admin-dashboard
node scripts/run-migration.js 003
```

This will add all necessary moderation columns to the vacancies table.

### 3. Start the Admin Dashboard

```bash
cd admin-dashboard
npm install  # if not already done
npm run dev
```

The admin dashboard will be available at http://localhost:3001

### 4. Login to Admin Dashboard

Default credentials (created by migration 001):
```
Email: admin@360rabota.ru
Password: admin123
```

**⚠️ IMPORTANT:** Change this password in production!

## API Endpoints Summary

### Complaints
```
GET  /api/admin/complaints?status=all&type=all&priority=all
POST /api/admin/complaints/resolve { complaintId, resolution, notes }
POST /api/admin/complaints/reject { complaintId }
```

### Moderation
```
GET  /api/admin/moderation?status=pending
POST /api/admin/moderation/approve { vacancyId }
POST /api/admin/moderation/reject { vacancyId, reason, comment }
```

### Analytics
```
GET  /api/admin/analytics?range=30d
```

### Video Tracking
```
GET  /api/video/track-view?videoId=xxx&applicationId=yyy
POST /api/video/track-view { videoId, applicationId }
```

## Testing

### Manual Testing Checklist

**Complaints:**
- [ ] List complaints with different filters
- [ ] Resolve a complaint with resolution text
- [ ] Reject a complaint
- [ ] Verify audit logging in admin_actions table

**Moderation:**
- [ ] List pending vacancies
- [ ] Approve a vacancy
- [ ] Reject a vacancy with reason and comment
- [ ] Verify notification sent to employer
- [ ] Check approved/rejected vacancy lists

**Analytics:**
- [ ] View analytics with different date ranges
- [ ] Verify all charts display correctly
- [ ] Export data to CSV
- [ ] Check data accuracy

**Video Tracking:**
- [ ] Check view count for a video
- [ ] Record 1st view, verify notification sent
- [ ] Record 2nd view, verify notification sent and video deleted
- [ ] Try to record 3rd view, should fail with 403 error

### Automated Testing

Create test file `tests/api.test.js`:

```javascript
// Example API test
const BASE_URL = 'http://localhost:3001';

async function testComplaintsAPI() {
  const response = await fetch(`${BASE_URL}/api/admin/complaints?status=all`);
  const data = await response.json();
  console.log('Complaints:', data.complaints.length);
}

testComplaintsAPI();
```

## Security Considerations

1. **Authentication:**
   - All admin endpoints use JWT middleware
   - Admin info injected via headers (x-admin-id, x-admin-email, x-admin-role)
   - User endpoints use user authentication (x-user-id)

2. **SQL Injection Protection:**
   - All queries use parameterized statements ($1, $2, etc.)
   - No string concatenation in SQL queries

3. **Input Validation:**
   - Required fields validation
   - Type checking for all inputs
   - Existence checks before updates

4. **Audit Logging:**
   - All admin actions logged to admin_actions table
   - Includes: admin_id, action_type, target_id, target_type, details (JSON)
   - Timestamp and IP tracking

5. **Error Handling:**
   - Try-catch blocks in all endpoints
   - Safe error messages (no sensitive data leakage)
   - Proper HTTP status codes

## Performance Optimizations

1. **Database Indexes:**
   - All foreign keys indexed
   - Status columns indexed for filtering
   - Created_at columns indexed for sorting
   - Composite index on video_views(video_id, user_id)

2. **Query Optimizations:**
   - LIMIT clauses on all list queries
   - Efficient JOINs with proper conditions
   - CASE statements for conditional logic
   - generate_series for time-series data

3. **API Response Size:**
   - Complaints limited to 100 records
   - Moderation limited to 50 vacancies
   - Analytics optimized date ranges
   - Selective column fetching (not SELECT *)

## Deployment Checklist

- [ ] Run all 3 migrations (001, 002, 003)
- [ ] Change default admin password
- [ ] Set up Firebase Cloud Messaging for notifications
- [ ] Configure web-push VAPID keys
- [ ] Set up email/SMS providers
- [ ] Create notification database tables
- [ ] Update JWT_SECRET in production
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Monitor admin_actions table for suspicious activity

## Troubleshooting

### Migration fails with "relation already exists"
The migrations are designed to be idempotent using `IF NOT EXISTS`. This error means the migration already ran successfully.

### "Unauthorized" errors
- Check that JWT middleware is properly configured
- Verify JWT_SECRET matches between admin dashboard and backend
- Check that admin is logged in

### Video view tracking not working
- Verify video_views table exists (created in migration 001)
- Check that database triggers are installed
- Verify user authentication middleware

### Notifications not sending
- NotificationService will log to console in development
- For production, configure FCM/web-push credentials
- Create necessary database tables (user_devices, etc.)

## Next Steps

1. **Production Deployment:**
   - Deploy database migrations
   - Configure production environment variables
   - Set up notification providers

2. **Feature Enhancements:**
   - Add video duration and quality detection
   - Implement AI moderation checks
   - Add email notifications backup
   - Create admin activity reports
   - Add bulk actions for moderation

3. **Testing:**
   - Write integration tests for all endpoints
   - Add E2E tests for frontend flows
   - Load testing for analytics endpoint
   - Security penetration testing

## Support

For questions or issues:
1. Check this implementation guide
2. Review the code comments in each file
3. Check the admin_actions table for audit logs
4. Review database migration files for schema details

---

**Implementation completed:** 2025-11-07
**Developer:** Claude (Anthropic)
**Project:** 360° РАБОТА Admin Dashboard
