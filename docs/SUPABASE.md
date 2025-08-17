# Supabase Database Documentation
## ImiRezervimi.al - Albanian Beauty Salon Booking Platform

### Overview
This document provides comprehensive information about our Supabase database setup, schema, migrations, and best practices for the ImiRezervimi.al platform.

**Project Details:**
- **Supabase Project ID:** `xglpqjymtxfuhothbdet`
- **Project Name:** ImiRezervimi
- **Region:** EU Central 2 (eu-central-2)
- **Database Version:** PostgreSQL 17.4.1.064
- **Environment:** Production

---

## 🗄️ Database Schema

### Core Tables

#### 1. `customers` - Customer Management
Stores customer information, authentication, and reputation data.

**Key Features:**
- Instagram & Google OAuth integration
- Albanian phone number validation (`+355[0-9]{8,9}`)
- Priority scoring system for booking preferences
- Account types: `guest`, `social`, `verified`

**Important Columns:**
- `phone` - Required, unique, Albanian format validation
- `phone_verified` - WhatsApp verification status
- `account_type` - User permission level
- `rating`, `total_visits`, `no_shows` - Reputation metrics

#### 2. `salons` - Salon Management
Salon profiles, settings, and business configuration.

**Key Features:**
- Unique slug-based URLs (`/[salon-slug]`)
- Working hours in JSON format
- WhatsApp integration settings
- Subscription management with trial periods

**Important Columns:**
- `slug` - URL-friendly unique identifier
- `status` - `active`, `inactive`, `pending`, `suspended`
- `working_hours` - JSONB with weekly schedule
- `auto_approve_vips` - VIP customer auto-approval

#### 3. `appointments` - Booking System
Core appointment booking and management.

**Key Features:**
- **FIXED CONSTRAINT:** Now allows updates to past appointments
- Service integration with pricing
- Status workflow: `pending` → `approved`/`declined` → `completed`/`no_show`
- Priority scoring for intelligent booking

**Critical Constraints:**
- ✅ `reasonable_appointment_date` - Allows 7 days past, 365 days future
- ❌ ~~`future_appointment`~~ - **REMOVED** (was blocking status updates)

#### 4. `services` - Service Catalog
Service offerings per salon with pricing and duration.

#### 5. `notifications` - Communication Log
WhatsApp message tracking and delivery status.

#### 6. `verification_codes` - Phone Verification
SMS/WhatsApp verification code management with rate limiting.

---

## 🔐 Row Level Security (RLS)

### RLS Policy Status: ✅ FULLY IMPLEMENTED

All tables have comprehensive RLS policies implemented as of Migration 002.

#### Customer Policies
```sql
-- Customers can view/update their own data
CREATE POLICY "Customers can view own data" ON customers 
FOR SELECT USING (auth.uid()::text = id::text);

-- Service role has full access (for API operations)
CREATE POLICY "Service role can manage customers" ON customers 
FOR ALL USING (auth.role() = 'service_role');
```

#### Appointment Policies
```sql
-- Customers can view their appointments
CREATE POLICY "Customers can view their appointments" ON appointments 
FOR SELECT USING (
    customer_id IN (
        SELECT id FROM customers 
        WHERE auth.uid()::text = id::text
    )
);

-- Salon owners can view their salon's appointments
CREATE POLICY "Salon owners can view salon appointments" ON appointments 
FOR SELECT USING (
    salon_id IN (
        SELECT id FROM salons 
        WHERE auth.uid()::text = id::text
    )
);
```

### Performance Optimization
- **Security Definer Functions:** Implemented for expensive auth.uid() lookups
- **Optimized Queries:** Reduced RLS overhead with caching patterns
- **Service Role Policies:** Separate policies for API vs user access

---

## 🚀 Migration Management

### Migration System: ✅ ACTIVE

We use the Supabase MCP server for all database migrations to ensure consistency and proper tracking.

#### Current Migration Status

| Migration | Status | Priority | Description |
|-----------|--------|----------|-------------|
| `001_initial_schema` | ✅ Applied | - | Initial database schema |
| `002_add_critical_rls_policies` | ✅ Applied | HIGH | Security policies for all tables |
| `003_optimize_service_role_policies` | ✅ Applied | HIGH | Performance optimization |
| `004_standardize_environment_variables` | ✅ Applied | LOW | Environment variable cleanup |
| `005_fix_appointment_constraint` | ✅ Applied | CRITICAL | **FIXED: Past appointment updates** |

### Migration Best Practices

#### ✅ Correct Approach (Using Supabase MCP)
```typescript
// Use Supabase MCP server for migrations
await mcp__supabase__apply_migration({
  project_id: "xglpqjymtxfuhothbdet",
  name: "migration_name",
  query: "SQL_QUERY_HERE"
});
```

#### ❌ Avoid These Approaches
- Manual SQL execution in Supabase dashboard (no tracking)
- Local migration scripts without MCP integration
- Direct database connections bypassing Supabase

### Migration Workflow
1. **Plan:** Define migration scope and impact
2. **Write:** Create SQL with proper error handling
3. **Test:** Validate on development/staging
4. **Apply:** Use `mcp__supabase__apply_migration`
5. **Verify:** Check constraints and data integrity
6. **Document:** Update this file with changes

---

## 🔧 Environment Configuration

### Required Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xglpqjymtxfuhothbdet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Key Security Notes

#### Anon Key vs Service Role Key
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
  - ✅ Safe for client-side use
  - ✅ Respects RLS policies
  - ✅ Use in React components

- **`SUPABASE_SERVICE_ROLE_KEY`**
  - ❌ Server-side ONLY
  - ❌ Bypasses RLS policies
  - ✅ Use in API routes and background jobs

#### Environment Variable Standardization
All files now use standardized naming:
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (current standard)
- ❌ `SUPABASE_SERVICE_KEY` (deprecated)

---

## 📊 Database Performance

### Table Statistics (Live)
- **Appointments:** ~2 active rows, RLS enabled
- **Customers:** ~2 active rows, Albanian phone validation
- **Salons:** ~3 active rows, full business profiles
- **Services:** ~13 active services across salons

### Optimization Features
- **Indexes:** Optimized for common queries
- **RLS Caching:** Security definer functions reduce auth overhead
- **Constraint Validation:** Efficient Albanian phone/email patterns

---

## 🛠️ Development Workflow

### Using Supabase MCP Commands

#### 1. List Tables and Schema
```typescript
await mcp__supabase__list_tables({
  project_id: "xglpqjymtxfuhothbdet",
  schemas: ["public"]
});
```

#### 2. Execute SQL Queries
```typescript
await mcp__supabase__execute_sql({
  project_id: "xglpqjymtxfuhothbdet",
  query: "SELECT * FROM appointments WHERE status = 'pending'"
});
```

#### 3. Apply Migrations
```typescript
await mcp__supabase__apply_migration({
  project_id: "xglpqjymtxfuhothbdet",
  name: "descriptive_migration_name",
  query: "ALTER TABLE table_name ADD COLUMN new_column TYPE;"
});
```

#### 4. Generate TypeScript Types
```typescript
await mcp__supabase__generate_typescript_types({
  project_id: "xglpqjymtxfuhothbdet"
});
```

---

## 🚨 Critical Issues Resolved

### Issue #1: Appointment Constraint Blocking Status Updates ✅ FIXED

**Problem:** The `future_appointment` constraint prevented any updates to appointments with past dates, blocking business operations.

**Solution Applied (Migration 005):**
- ❌ Removed: `CHECK (appointment_date >= CURRENT_DATE)`
- ✅ Added: `CHECK (appointment_date >= CURRENT_DATE - INTERVAL '7 days' AND appointment_date <= CURRENT_DATE + INTERVAL '365 days')`

**Business Impact:**
- ✅ Status updates on past appointments now work
- ✅ Prevents unreasonable future bookings (>1 year)
- ✅ Allows 7-day grace period for timezone/late booking issues

### Issue #2: Missing RLS Policies ✅ FIXED

**Problem:** Tables were accessible across tenants without proper security.

**Solution Applied (Migration 002):**
- Added comprehensive RLS policies for all tables
- Implemented customer data isolation
- Salon-specific access controls

---

## 📋 Maintenance Tasks

### Regular Monitoring

#### 1. Check Security Advisors
```typescript
await mcp__supabase__get_advisors({
  project_id: "xglpqjymtxfuhothbdet",
  type: "security"
});
```

#### 2. Performance Advisors
```typescript
await mcp__supabase__get_advisors({
  project_id: "xglpqjymtxfuhothbdet",
  type: "performance"
});
```

#### 3. Review Logs
```typescript
await mcp__supabase__get_logs({
  project_id: "xglpqjymtxfuhothbdet",
  service: "postgres"
});
```

### Cleanup Operations

#### 1. Expired Verification Codes
```sql
DELETE FROM verification_codes 
WHERE expires_at < NOW() - INTERVAL '1 day';
```

#### 2. Old Notification Logs
```sql
DELETE FROM notifications 
WHERE sent_at < NOW() - INTERVAL '30 days'
AND delivered_at IS NOT NULL;
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. RLS Policy Errors
**Error:** `insufficient_privilege` when accessing data
**Solution:** Check if proper RLS policies exist for the operation

#### 2. Constraint Violations
**Error:** `check constraint "constraint_name" violated`
**Solution:** Review constraint logic and ensure data meets requirements

#### 3. Environment Variable Issues
**Error:** `SUPABASE_SERVICE_KEY is not defined`
**Solution:** Use standardized `SUPABASE_SERVICE_ROLE_KEY` instead

### Debug Commands

#### Check Active Connections
```sql
SELECT count(*) FROM pg_stat_activity;
```

#### Review Table Constraints
```sql
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(c.oid) AS definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'table_name';
```

---

## 📚 Resources

### Official Documentation
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL 17 Documentation](https://www.postgresql.org/docs/17/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

### Project-Specific
- **CLAUDE.md** - Development conventions and current status
- **Database Schema Files** - `/database/` directory
- **Migration Scripts** - Applied via Supabase MCP

---

*Last Updated: 2025-08-17*
*Database Version: PostgreSQL 17.4.1.064*
*Project: ImiRezervimi.al (xglpqjymtxfuhothbdet)*