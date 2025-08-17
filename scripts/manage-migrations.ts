#!/usr/bin/env tsx
/**
 * Migration Management Script for ImiRezervimi.al
 * Helps apply and track database migrations
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { join } from 'path'

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const MIGRATIONS_DIR = join(__dirname, '..', 'database')

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface MigrationFile {
  number: string
  name: string
  filename: string
  path: string
}

interface MigrationRecord {
  id: string
  name: string
  applied_at: string
  checksum: string
}

/**
 * Get all migration files from the database directory
 */
function getMigrationFiles(): MigrationFile[] {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql') && /^\d{3}_/.test(file))
    .sort()

  return files.map(filename => {
    const match = filename.match(/^(\d{3})_(.+)\.sql$/)
    if (!match) throw new Error(`Invalid migration filename: ${filename}`)
    
    return {
      number: match[1],
      name: match[2],
      filename,
      path: join(MIGRATIONS_DIR, filename)
    }
  })
}

/**
 * Create migration tracking table if it doesn't exist
 */
async function ensureMigrationTable(): Promise<void> {
  console.log('🔧 Ensuring migration tracking table exists...')
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS _migrations (
        id VARCHAR(10) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW(),
        checksum VARCHAR(64) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      -- Enable RLS but allow service role access
      ALTER TABLE _migrations ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY IF NOT EXISTS "Service role can manage migrations" 
      ON _migrations FOR ALL USING (auth.role() = 'service_role');
    `
  })

  if (error) {
    console.error('❌ Failed to create migration table:', error)
    throw error
  }
  
  console.log('✅ Migration tracking table ready')
}

/**
 * Get applied migrations from database
 */
async function getAppliedMigrations(): Promise<MigrationRecord[]> {
  const { data, error } = await supabase
    .from('_migrations')
    .select('*')
    .order('id')

  if (error) {
    console.error('❌ Failed to fetch applied migrations:', error)
    throw error
  }

  return data || []
}

/**
 * Calculate checksum for a file
 */
function calculateChecksum(content: string): string {
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16)
}

/**
 * Apply a migration to the database
 */
async function applyMigration(migration: MigrationFile): Promise<void> {
  console.log(`📦 Applying migration ${migration.number}_${migration.name}...`)
  
  const content = readFileSync(migration.path, 'utf-8')
  const checksum = calculateChecksum(content)
  
  // Apply the migration SQL
  const { error: migrationError } = await supabase.rpc('exec_sql', {
    sql: content
  })
  
  if (migrationError) {
    console.error(`❌ Failed to apply migration ${migration.number}:`, migrationError)
    throw migrationError
  }
  
  // Record the migration as applied
  const { error: recordError } = await supabase
    .from('_migrations')
    .insert({
      id: migration.number,
      name: migration.name,
      checksum
    })
  
  if (recordError) {
    console.error(`❌ Failed to record migration ${migration.number}:`, recordError)
    throw recordError
  }
  
  console.log(`✅ Migration ${migration.number}_${migration.name} applied successfully`)
}

/**
 * Main migration command
 */
async function runMigrations(): Promise<void> {
  try {
    console.log('🚀 Starting migration process...')
    
    // Ensure migration tracking exists
    await ensureMigrationTable()
    
    // Get all migrations
    const migrationFiles = getMigrationFiles()
    const appliedMigrations = await getAppliedMigrations()
    const appliedIds = new Set(appliedMigrations.map(m => m.id))
    
    console.log(`📁 Found ${migrationFiles.length} migration files`)
    console.log(`✅ ${appliedMigrations.length} migrations already applied`)
    
    // Find pending migrations
    const pendingMigrations = migrationFiles.filter(m => !appliedIds.has(m.number))
    
    if (pendingMigrations.length === 0) {
      console.log('🎉 All migrations are up to date!')
      return
    }
    
    console.log(`📋 ${pendingMigrations.length} pending migrations:`)
    pendingMigrations.forEach(m => {
      console.log(`   ${m.number}_${m.name}`)
    })
    
    // Apply pending migrations
    for (const migration of pendingMigrations) {
      await applyMigration(migration)
    }
    
    console.log('🎉 All migrations applied successfully!')
    
  } catch (error) {
    console.error('💥 Migration process failed:', error)
    process.exit(1)
  }
}

/**
 * Show migration status
 */
async function showStatus(): Promise<void> {
  try {
    await ensureMigrationTable()
    
    const migrationFiles = getMigrationFiles()
    const appliedMigrations = await getAppliedMigrations()
    const appliedMap = new Map(appliedMigrations.map(m => [m.id, m]))
    
    console.log('\n📊 Migration Status\n')
    console.log('ID  | Name                           | Status    | Applied At')
    console.log('----|--------------------------------|-----------|------------------')
    
    migrationFiles.forEach(file => {
      const applied = appliedMap.get(file.number)
      const status = applied ? '✅ Applied' : '⏳ Pending'
      const appliedAt = applied ? applied.applied_at.substring(0, 16) : '-'
      
      console.log(`${file.number} | ${file.name.padEnd(30)} | ${status.padEnd(9)} | ${appliedAt}`)
    })
    
    console.log('')
    
  } catch (error) {
    console.error('💥 Failed to show status:', error)
    process.exit(1)
  }
}

/**
 * Create a new migration file
 */
function createMigration(name: string): void {
  const migrationFiles = getMigrationFiles()
  const lastNumber = migrationFiles.length > 0 
    ? parseInt(migrationFiles[migrationFiles.length - 1].number) 
    : 0
  
  const nextNumber = String(lastNumber + 1).padStart(3, '0')
  const filename = `${nextNumber}_${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.sql`
  const filepath = join(MIGRATIONS_DIR, filename)
  
  const template = `-- Migration ${nextNumber}: ${name}
-- Description: [Add description here]
-- Priority: [HIGH/MEDIUM/LOW]

-- ==============================================
-- MIGRATION CONTENT
-- ==============================================

-- Add your SQL here...

-- ==============================================
-- VERIFICATION
-- ==============================================

-- Add verification queries to ensure migration worked
-- Example:
-- SELECT COUNT(*) FROM new_table;

-- ==============================================
-- ROLLBACK (if applicable)
-- ==============================================

-- Add rollback instructions if the migration can be reversed
-- Example:
-- DROP TABLE IF EXISTS new_table;
`

  writeFileSync(filepath, template)
  console.log(`✅ Created migration file: ${filename}`)
}

// CLI Interface
const command = process.argv[2]
const arg = process.argv[3]

switch (command) {
  case 'migrate':
  case 'up':
    runMigrations()
    break
    
  case 'status':
    showStatus()
    break
    
  case 'create':
    if (!arg) {
      console.error('❌ Please provide a migration name')
      console.error('   Usage: npm run migrate create "add_new_feature"')
      process.exit(1)
    }
    createMigration(arg)
    break
    
  default:
    console.log('🗃️  Migration Management for ImiRezervimi.al\n')
    console.log('Usage:')
    console.log('  npm run migrate up      - Apply pending migrations')
    console.log('  npm run migrate status  - Show migration status')
    console.log('  npm run migrate create <name> - Create new migration')
    console.log('')
    console.log('Examples:')
    console.log('  npm run migrate status')
    console.log('  npm run migrate up')
    console.log('  npm run migrate create "add_salon_reviews"')
    break
}