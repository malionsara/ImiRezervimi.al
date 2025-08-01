-- Fix for salon registration RLS policy
-- This allows anonymous users to register new salons

-- Add policy to allow anonymous salon registration
CREATE POLICY "Allow anonymous salon registration" ON salons
    FOR INSERT 
    WITH CHECK (status = 'pending');

-- Ensure the existing policies are correct
-- This policy allows salon owners to manage their own salon data
DROP POLICY IF EXISTS "Salon owners can manage their salon" ON salons;
CREATE POLICY "Salon owners can manage their salon" ON salons
    FOR ALL USING (
        auth.uid()::text = id::text OR 
        status = 'pending' -- Allow access to pending salons for initial setup
    );

-- Add policy for service creation during salon registration
CREATE POLICY "Allow service creation for new salons" ON services
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM salons 
            WHERE salons.id = services.salon_id 
            AND salons.status = 'pending'
        )
    );

-- Comment explaining the security model
-- New salons are created with status 'pending' and can be registered anonymously
-- Once approved by admin, salon owners get proper authentication access
-- This allows the registration flow while maintaining security for active salons