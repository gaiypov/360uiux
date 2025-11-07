# Database Migrations

## Running Migrations

### Using psql

```bash
# Connect to your database
psql -h localhost -U postgres -d 360_rabota

# Run the migration
\i migrations/001_create_admin_tables.sql
```

### Using node-postgres

```bash
# Run all migrations
npm run migrate
```

## Migration Files

- `001_create_admin_tables.sql` - Creates admin, admin_actions, complaints, and video_views tables

## Default Admin Account

After running the migration, you can log in with:

- **Email:** admin@360rabota.ru
- **Password:** admin123

**⚠️ IMPORTANT:** Change the default password in production!

## Database Schema

### Tables Created

1. **admins** - Admin and moderator accounts
   - id (UUID)
   - email (unique)
   - password_hash (bcrypt)
   - name
   - role (admin | moderator)
   - status (active | inactive | blocked)
   - created_at, updated_at, last_login_at

2. **admin_actions** - Audit log
   - id (UUID)
   - admin_id (foreign key)
   - action_type
   - target_id, target_type
   - details (JSONB)
   - ip_address, user_agent
   - created_at

3. **complaints** - User complaints
   - id (UUID)
   - reporter_id (foreign key to users)
   - reported_id, reported_type
   - type, priority, description
   - status, resolution, notes
   - resolved_by (foreign key to admins)
   - created_at, updated_at

4. **video_views** - Video view tracking
   - id (UUID)
   - video_id (foreign key to videos)
   - user_id (foreign key to users)
   - application_id (foreign key to applications)
   - viewed_at
   - ip_address, user_agent

### Triggers

1. **enforce_video_view_limit** - Prevents more than 2 views per video per user
2. **trigger_auto_delete_video** - Auto-deletes video after 2nd view
3. **update_admins_updated_at** - Auto-updates updated_at timestamp
4. **update_complaints_updated_at** - Auto-updates updated_at timestamp

## Rollback

If you need to rollback the migration:

```sql
-- Drop tables (in reverse order due to foreign keys)
DROP TABLE IF EXISTS video_views CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS admin_actions CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS check_video_view_limit CASCADE;
DROP FUNCTION IF EXISTS auto_delete_video_after_2_views CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
```
