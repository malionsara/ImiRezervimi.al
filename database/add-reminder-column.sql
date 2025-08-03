-- database/add-reminder-column.sql
-- Add reminder tracking column to appointments table
-- For ImiRezervimi.al - Albanian Beauty Salon Booking Platform

-- Add reminder_sent column to track when 24-hour reminders are sent
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS reminder_sent TIMESTAMP WITH TIME ZONE;

-- Add comment to document the column purpose
COMMENT ON COLUMN appointments.reminder_sent IS 'Timestamp when 24-hour reminder was sent to customer';

-- Add index for efficient reminder queries
-- This index helps the reminder system quickly find appointments that need reminders
CREATE INDEX IF NOT EXISTS idx_appointments_reminder 
ON appointments(appointment_date, status, reminder_sent) 
WHERE status = 'approved' AND reminder_sent IS NULL;

-- Add comment to document the index purpose  
COMMENT ON INDEX idx_appointments_reminder IS 'Efficient lookup for appointments needing 24-hour reminders';

-- Verify the changes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' 
  AND column_name = 'reminder_sent';

-- Show the new index
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename = 'appointments' 
  AND indexname = 'idx_appointments_reminder';