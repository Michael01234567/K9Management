/*
  # Disable All Row Level Security Policies
  
  ## Overview
  This migration permanently disables all Row Level Security (RLS) policies and RLS enforcement
  across the entire application. All data will be accessible without authentication restrictions.
  
  ## 1. Dropped Policies
  
  ### handlers table
  - "Authenticated users can view handlers" (SELECT)
  - "Authenticated users can insert handlers" (INSERT)
  - "Authenticated users can update handlers" (UPDATE)
  - "Authenticated users can delete handlers" (DELETE)
  
  ### dogs table
  - "Authenticated users can view dogs" (SELECT)
  - "Authenticated users can insert dogs" (INSERT)
  - "Authenticated users can update dogs" (UPDATE)
  - "Authenticated users can delete dogs" (DELETE)
  
  ### dog_handler table
  - "Authenticated users can view dog-handler relationships" (SELECT)
  - "Authenticated users can assign handlers" (INSERT)
  - "Authenticated users can update assignments" (UPDATE)
  - "Authenticated users can remove assignments" (DELETE)
  
  ### vet_records table
  - "Authenticated users can view vet records" (SELECT)
  - "Authenticated users can create vet records" (INSERT)
  - "Authenticated users can update vet records" (UPDATE)
  - "Authenticated users can delete vet records" (DELETE)
  
  ### fitness_logs table
  - "Authenticated users can view fitness logs" (SELECT)
  - "Authenticated users can create fitness logs" (INSERT)
  - "Authenticated users can update fitness logs" (UPDATE)
  - "Authenticated users can delete fitness logs" (DELETE)
  
  ### fitness_status table
  - "Authenticated users can view fitness status" (SELECT)
  - "Authenticated users can create fitness status" (INSERT)
  - "Authenticated users can update fitness status" (UPDATE)
  - "Authenticated users can delete fitness status" (DELETE)
  
  ### users table
  - "Users can view own profile" (SELECT)
  - "Users can insert own profile" (INSERT)
  - "Users can update own profile" (UPDATE)
  
  ### storage.objects (handler-pictures bucket)
  - "Authenticated users can upload handler pictures" (INSERT)
  - "Authenticated users can update handler pictures" (UPDATE)
  - "Authenticated users can delete handler pictures" (DELETE)
  - "Anyone can view handler pictures" (SELECT)
  
  ## 2. RLS Disabled On
  - handlers
  - dogs
  - dog_handler
  - vet_records
  - fitness_logs
  - fitness_status
  - users
  
  ## 3. Important Notes
  - ALL authentication and authorization checks are removed
  - Data is now publicly accessible without any restrictions
  - This is a permanent change for development/internal use
  - The get_user_role() helper function is also removed as it's no longer needed
  - All tables, data, indexes, and triggers remain intact
*/

-- ============================================
-- DROP ALL POLICIES FROM HANDLERS TABLE
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view handlers" ON handlers;
DROP POLICY IF EXISTS "Authenticated users can insert handlers" ON handlers;
DROP POLICY IF EXISTS "Authenticated users can update handlers" ON handlers;
DROP POLICY IF EXISTS "Authenticated users can delete handlers" ON handlers;
DROP POLICY IF EXISTS "Handlers are viewable by authenticated users" ON handlers;
DROP POLICY IF EXISTS "Only admins can insert handlers" ON handlers;
DROP POLICY IF EXISTS "Only admins can update handlers" ON handlers;
DROP POLICY IF EXISTS "Only admins can delete handlers" ON handlers;

-- ============================================
-- DROP ALL POLICIES FROM DOGS TABLE
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view dogs" ON dogs;
DROP POLICY IF EXISTS "Authenticated users can insert dogs" ON dogs;
DROP POLICY IF EXISTS "Authenticated users can update dogs" ON dogs;
DROP POLICY IF EXISTS "Authenticated users can delete dogs" ON dogs;
DROP POLICY IF EXISTS "Dogs are viewable by authenticated users" ON dogs;
DROP POLICY IF EXISTS "Only admins can insert dogs" ON dogs;
DROP POLICY IF EXISTS "Only admins can update dogs" ON dogs;
DROP POLICY IF EXISTS "Only admins can delete dogs" ON dogs;

-- ============================================
-- DROP ALL POLICIES FROM DOG_HANDLER TABLE
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view dog-handler relationships" ON dog_handler;
DROP POLICY IF EXISTS "Authenticated users can assign handlers" ON dog_handler;
DROP POLICY IF EXISTS "Authenticated users can update assignments" ON dog_handler;
DROP POLICY IF EXISTS "Authenticated users can remove assignments" ON dog_handler;
DROP POLICY IF EXISTS "Dog-handler relationships are viewable by authenticated users" ON dog_handler;
DROP POLICY IF EXISTS "Only admins can assign handlers to dogs" ON dog_handler;
DROP POLICY IF EXISTS "Only admins can remove handler assignments" ON dog_handler;

-- ============================================
-- DROP ALL POLICIES FROM VET_RECORDS TABLE
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view vet records" ON vet_records;
DROP POLICY IF EXISTS "Authenticated users can create vet records" ON vet_records;
DROP POLICY IF EXISTS "Authenticated users can update vet records" ON vet_records;
DROP POLICY IF EXISTS "Authenticated users can delete vet records" ON vet_records;
DROP POLICY IF EXISTS "Vet records are viewable by authenticated users" ON vet_records;
DROP POLICY IF EXISTS "Admins, handlers, and vets can create vet records" ON vet_records;
DROP POLICY IF EXISTS "Admins, handlers, and vets can update vet records" ON vet_records;
DROP POLICY IF EXISTS "Admins and vets can delete vet records" ON vet_records;

-- ============================================
-- DROP ALL POLICIES FROM FITNESS_LOGS TABLE
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view fitness logs" ON fitness_logs;
DROP POLICY IF EXISTS "Authenticated users can create fitness logs" ON fitness_logs;
DROP POLICY IF EXISTS "Authenticated users can update fitness logs" ON fitness_logs;
DROP POLICY IF EXISTS "Authenticated users can delete fitness logs" ON fitness_logs;
DROP POLICY IF EXISTS "Fitness logs are viewable by authenticated users" ON fitness_logs;
DROP POLICY IF EXISTS "Admins, handlers, and vets can create fitness logs" ON fitness_logs;
DROP POLICY IF EXISTS "Admins, handlers, and vets can update fitness logs" ON fitness_logs;
DROP POLICY IF EXISTS "Only admins can delete fitness logs" ON fitness_logs;

-- ============================================
-- DROP ALL POLICIES FROM FITNESS_STATUS TABLE
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view fitness status" ON fitness_status;
DROP POLICY IF EXISTS "Authenticated users can create fitness status" ON fitness_status;
DROP POLICY IF EXISTS "Authenticated users can update fitness status" ON fitness_status;
DROP POLICY IF EXISTS "Authenticated users can delete fitness status" ON fitness_status;
DROP POLICY IF EXISTS "Fitness status viewable by authenticated users" ON fitness_status;
DROP POLICY IF EXISTS "Admins, handlers, and vets can create fitness status" ON fitness_status;
DROP POLICY IF EXISTS "Admins, handlers, and vets can update fitness status" ON fitness_status;
DROP POLICY IF EXISTS "Only admins can delete fitness status" ON fitness_status;

-- ============================================
-- DROP ALL POLICIES FROM USERS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- ============================================
-- DROP ALL STORAGE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can upload handler pictures" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update handler pictures" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete handler pictures" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view handler pictures" ON storage.objects;
DROP POLICY IF EXISTS "Public can view handler pictures" ON storage.objects;

-- ============================================
-- DISABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE handlers DISABLE ROW LEVEL SECURITY;
ALTER TABLE dogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE dog_handler DISABLE ROW LEVEL SECURITY;
ALTER TABLE vet_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_status DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- ============================================
-- DROP HELPER FUNCTION
-- ============================================

DROP FUNCTION IF EXISTS get_user_role() CASCADE;