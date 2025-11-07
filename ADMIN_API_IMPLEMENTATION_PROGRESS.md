# Admin Dashboard - API Implementation Progress

## ✅ COMPLETED (Commits: 84644a4, f9b91f6, ede6a87)

### 1. Database Infrastructure ✅
- **PostgreSQL Connection Pool** (`lib/db.ts`)
  - Type-safe query helpers
  - Transaction support
  - Connection pooling (max 20)

### 2. Authentication System ✅
- **JWT Authentication** (`lib/auth.ts`)
  - Token generation/verification
  - Password hashing (bcrypt)
  - Role-based access control

- **Next.js Middleware** (`middleware.ts`)
  - Route protection
  - Token verification
  - Admin info injection

- **Auth APIs**:
  - ✅ `POST /api/admin/auth/login` - Database authentication
  - ✅ `POST /api/admin/auth/logout` - Audit logging

### 3. Database Migrations ✅
- **001_create_admin_tables.sql**:
  - admins table
  - admin_actions table
  - complaints table
  - video_views table
  - Triggers for 2-view limit
  - Default admin account

- **002_add_user_management_columns.sql**:
  - blocked_at, blocked_by, blocked_reason
  - deleted_at, last_active_at
  - Performance indexes

### 4. Stats API ✅
- ✅ `GET /api/admin/stats`
  - Real-time database queries
  - User/vacancy/complaint counts
  - Recent admin activity feed
  - Growth trends

### 5. Users Management APIs ✅
- ✅ `GET /api/admin/users`
  - Role and status filtering
  - Application/vacancy counts
  - Pagination (100 limit)
  - Audit logging

- ✅ `POST /api/admin/users/block`
  - Database update
  - Optional reason
  - Audit logging

- ✅ `POST /api/admin/users/unblock`
  - Database update
  - Audit logging

## 🚧 PENDING (Remaining Work)

### 6. Complaints Management APIs (Priority: HIGH)

**APIs to Update:**

1. **`GET /api/admin/complaints`** - List complaints
   ```typescript
   // Query needed:
   SELECT
     c.id, c.type, c.priority, c.description, c.status,
     c.created_at, c.resolved_at, c.resolution, c.notes,
     reporter.name as reporter_name, reporter.phone as reporter_phone,
     reported.name as reported_name, reported.role as reported_role,
     admin.name as resolved_by_name
   FROM complaints c
   JOIN users reporter ON reporter.id = c.reporter_id
   LEFT JOIN users reported ON reported.id = c.reported_id
   LEFT JOIN admins admin ON admin.id = c.resolved_by
   WHERE [filters]
   ORDER BY c.created_at DESC
   ```

2. **`POST /api/admin/complaints/resolve`** - Resolve complaint
   ```typescript
   // Updates needed:
   - UPDATE complaints SET status='resolved', resolution=$1, notes=$2, resolved_by=$3, resolved_at=NOW()
   - INSERT INTO admin_actions (audit log)
   - Optional: Send notification to reporter
   ```

3. **`POST /api/admin/complaints/reject`** - Reject complaint
   ```typescript
   // Updates needed:
   - UPDATE complaints SET status='rejected', resolved_by=$1, resolved_at=NOW()
   - INSERT INTO admin_actions (audit log)
   ```

### 7. Moderation Management APIs (Priority: HIGH)

**APIs to Update:**

1. **`GET /api/admin/moderation`** - List vacancies for moderation
   ```typescript
   // Query needed:
   SELECT
     v.id, v.title, v.description, v.salary, v.location, v.category,
     v.status, v.video_url, v.created_at, v.approved_at, v.rejected_at,
     v.rejection_reason, v.rejection_comment,
     u.company_name as employer_name, u.id as employer_id,
     ai.video_quality, ai.audio_quality, ai.content_match, ai.flags, ai.confidence
   FROM vacancies v
   JOIN users u ON u.id = v.employer_id
   LEFT JOIN ai_checks ai ON ai.vacancy_id = v.id
   WHERE v.status = $1 AND v.deleted_at IS NULL
   ORDER BY v.created_at ASC
   LIMIT 50
   ```

2. **`POST /api/admin/moderation/approve`** - Approve vacancy
   ```typescript
   // Updates needed:
   - UPDATE vacancies SET status='approved', approved_at=NOW(), approved_by=$1
   - INSERT INTO admin_actions (audit log)
   - Send notification to employer (approved)
   ```

3. **`POST /api/admin/moderation/reject`** - Reject vacancy
   ```typescript
   // Updates needed:
   - UPDATE vacancies SET status='rejected', rejected_at=NOW(), rejected_by=$1, rejection_reason=$2, rejection_comment=$3
   - INSERT INTO admin_actions (audit log)
   - Send notification to employer (rejected with reason)
   ```

### 8. Analytics API (Priority: MEDIUM)

**`GET /api/admin/analytics`** - Comprehensive analytics
```typescript
// Queries needed:
- User growth by date (GROUP BY DATE)
- Vacancy statistics (posted/approved/rejected)
- Video view statistics
- Application statistics
- User activity by hour
- Role distribution (pie chart)
- Vacancy categories (bar chart)
- All filtered by date range parameter
```

### 9. Video View Tracking API (Priority: CRITICAL - 2-View Limit)

**`GET /api/video/track-view`** - Check view count
```typescript
SELECT COUNT(*) as count
FROM video_views
WHERE video_id = $1 AND user_id = $2
```

**`POST /api/video/track-view`** - Track view
```typescript
// Transaction needed:
1. Check if count < 2 (trigger will also enforce this)
2. INSERT INTO video_views (video_id, user_id, application_id, ip_address)
3. Get new count
4. If count = 2:
   - Video auto-deleted by trigger
   - Send notification to employer
5. Return { viewCount, viewsRemaining, isLocked }
```

## 📋 Implementation Pattern

All remaining APIs should follow this pattern:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET/POST(request: NextRequest) {
  try {
    // 1. Get admin info from middleware
    const adminId = request.headers.get('x-admin-id');

    // 2. Validate input
    const { param1, param2 } = await request.json(); // for POST
    if (!param1) {
      return NextResponse.json({ error: 'param1 required' }, { status: 400 });
    }

    // 3. Execute database query
    const result = await db.many<ResultType>(
      `SELECT ... FROM ... WHERE ... ORDER BY ...`,
      [param1, param2]
    );

    // 4. Log admin action
    await db.none(
      `INSERT INTO admin_actions (admin_id, action_type, target_id, details)
       VALUES ($1, $2, $3, $4)`,
      [adminId, 'action_name', targetId, JSON.stringify({ ...details })]
    );

    // 5. Return response
    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## 🗄️ Database Schema Reference

### Vacancies Table (from backend)
```sql
CREATE TABLE vacancies (
  id UUID PRIMARY KEY,
  employer_id UUID REFERENCES users(id),
  title VARCHAR(255),
  description TEXT,
  salary TEXT,
  location VARCHAR(100),
  category VARCHAR(50),
  video_url TEXT,
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES admins(id),
  rejected_at TIMESTAMP,
  rejected_by UUID REFERENCES admins(id),
  rejection_reason TEXT,
  rejection_comment TEXT,
  created_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

### Applications Table (from backend)
```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  vacancy_id UUID REFERENCES vacancies(id),
  status VARCHAR(20),
  created_at TIMESTAMP
);
```

### Videos Table (from backend)
```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  video_url TEXT,
  thumbnail_url TEXT,
  duration INTEGER,
  deleted_at TIMESTAMP,
  deletion_reason TEXT,
  created_at TIMESTAMP
);
```

## 🔧 Required Migrations

Before implementing remaining APIs, you may need to add columns to existing tables:

```sql
-- For vacancies table (if not exists)
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES admins(id);
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES admins(id);
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS rejection_comment TEXT;
CREATE INDEX IF NOT EXISTS idx_vacancies_status ON vacancies(status);
CREATE INDEX IF NOT EXISTS idx_vacancies_approved_at ON vacancies(approved_at);
```

## 📊 Next Steps

### Step 1: Complete Complaints APIs (1-2 hours)
- Update complaints list endpoint
- Update resolve endpoint
- Update reject endpoint
- Test all three

### Step 2: Complete Moderation APIs (1-2 hours)
- Check vacancies table schema
- Add missing columns if needed
- Update moderation list endpoint
- Update approve endpoint
- Update reject endpoint with reason
- Test workflow

### Step 3: Complete Analytics API (2-3 hours)
- Design comprehensive queries
- Handle date range parameter
- Optimize with proper indexes
- Test performance with large datasets

### Step 4: Complete 2-View Limit API (1 hour)
- Already have triggers in place
- Just need to implement track-view logic
- Test extensively (critical feature)

### Step 5: Testing & Documentation (1 hour)
- Test all endpoints
- Update API documentation
- Create deployment guide
- Final commit

## 📈 Progress Tracker

**Total APIs:** 19
**Completed:** 6 (32%)
**Remaining:** 13 (68%)

**Estimated Time Remaining:** 5-8 hours

**Completed:**
- ✅ Login
- ✅ Logout
- ✅ Stats
- ✅ Users List
- ✅ Block User
- ✅ Unblock User

**In Progress:**
- 🔄 Complaints (0/3)
- 🔄 Moderation (0/3)
- 🔄 Analytics (0/1)
- 🔄 Video Tracking (0/2)

## 🎯 Success Criteria

All APIs should:
- ✅ Use real database queries
- ✅ Have proper error handling
- ✅ Log admin actions
- ✅ Validate input
- ✅ Return consistent response format
- ✅ Pass TypeScript strict checks
- ✅ Handle edge cases

---

**Last Updated:** After commit ede6a87
**Branch:** claude/revolut-ultra-job-app-011CUoibKxNjRkXdDTh4rhTp
**Status:** Users APIs Complete, Continuing with Complaints & Moderation
