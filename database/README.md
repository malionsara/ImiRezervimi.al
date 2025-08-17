# Database Migrations for ImiRezervimi.al

This directory contains all database migrations for the Albanian beauty salon booking platform.

## Migration System

We use a numbered migration system to track database changes:

- `000_` - Initial schema (baseline)
- `001_` - Salon authentication tokens
- `002_` - Critical RLS policies
- `003_` - Service role optimizations
- `999_` - Future migrations

## Migration Files

### Applied Migrations ✅

| File | Description | Status | Applied Date |
|------|-------------|--------|--------------|
| `000_initial_schema.sql` | Baseline database schema | ✅ Applied | Manual setup |
| `001_salon_auth_tokens.sql` | Salon authentication system | ✅ Applied | Via Supabase |
| `002_add_critical_rls_policies.sql` | Critical security policies | ✅ Applied | 2025-08-17 |
| `003_optimize_service_role_policies.sql` | Performance optimizations | ✅ Applied | 2025-08-17 |

### Pending Migrations 📋

Currently no pending migrations.

## How to Apply Migrations

### Using Supabase MCP Server (Recommended)
```typescript
// Apply via Supabase MCP server
await supabase.applyMigration(projectId, migrationName, sqlContent)
```

### Manual Application
1. Copy the SQL content from the migration file
2. Go to Supabase Dashboard → SQL Editor
3. Paste and execute the SQL
4. Update this README with applied status

## Migration Guidelines

### File Naming Convention
```
{number}_{descriptive_name}.sql
```

Examples:
- `004_add_salon_reviews.sql`
- `005_implement_payment_system.sql`

### Migration Content Structure
```sql
-- Migration Description
-- Brief description of what this migration does
-- Priority: HIGH/MEDIUM/LOW

-- ==============================================
-- MIGRATION CONTENT
-- ==============================================

-- Your SQL here...

-- ==============================================
-- VERIFICATION
-- ==============================================

-- Add verification queries to ensure migration worked

-- ==============================================
-- ROLLBACK (if applicable)
-- ==============================================

-- Add rollback instructions if the migration can be reversed
```

### Best Practices

1. **Always backup before applying**
2. **Test migrations on staging first**
3. **Include verification queries**
4. **Document any manual steps required**
5. **Use IF NOT EXISTS for safety**
6. **Include rollback instructions when possible**

## Database Schema Overview

### Core Tables
- `customers` - Customer profiles and authentication
- `salons` - Salon information and settings  
- `services` - Services offered by salons
- `appointments` - Booking requests and appointments
- `notifications` - WhatsApp/SMS message log

### Authentication Tables
- `salon_auth_tokens` - Magic link tokens for salon login
- `salon_sessions` - Persistent salon login sessions
- `auth_sessions` - Customer social login sessions
- `verification_codes` - Phone verification codes

### Supporting Tables
- `time_slots` - Salon availability management
- `salon_staff` - Staff members and permissions

## Row Level Security (RLS)

All tables have RLS enabled with comprehensive policies:

### Security Patterns
- **Service Role Access**: All API operations use service role
- **Customer Isolation**: Customers can only see their own data
- **Salon Isolation**: Salons can only manage their own data
- **Public Data**: Active salons/services visible to all

### Performance Optimizations
- Auth.uid() calls wrapped in SELECT for caching
- Security definer functions for complex checks
- Proper indexes on RLS filtering columns
- Optimized policy structures

## Environment Setup

### Required Extensions
- `uuid-ossp` - UUID generation
- `pgcrypto` - Cryptographic functions

### Required Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Troubleshooting

### Common Issues

1. **RLS Policy Conflicts**
   - Check policy names for duplicates
   - Verify role targeting (authenticated vs anon)
   - Test with `SELECT auth.role()` and `SELECT auth.uid()`

2. **Migration Failures**
   - Check for syntax errors
   - Verify table/column names exist
   - Ensure proper permissions

3. **Performance Issues**
   - Check if indexes exist for RLS policies
   - Verify auth.uid() is wrapped in SELECT
   - Consider using security definer functions

### Debug Queries

```sql
-- Check applied policies
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Test auth functions
SELECT auth.role(), auth.uid();
```

## Contact

For questions about migrations or database schema:
- Check the main project documentation
- Review existing migration files for patterns
- Test changes on staging environment first

---

*Last Updated: 2025-08-17*
*Migration System Version: 1.0*