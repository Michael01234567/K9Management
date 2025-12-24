/*
  # Enforce Global Assignment Rules
  
  1. Data Cleanup
    - Handler "Sarah Johnson" has 2 dogs with officers assigned (Bella and Zara 2)
    - Keep only the most recent officer assignment (Zara 2 with Mohammed Al Shamsi)
    - Remove the older assignment (Bella with Rashid Al Nuaimi)
  
  2. Database Constraints
    - Add UNIQUE constraint on dog_id in dog_handler table
      * Enforces: One dog can have only ONE handler globally
    - Add UNIQUE constraint on dog_id in dog_officer table
      * Enforces: One dog can have only ONE mission officer globally
    - Drop old composite constraints that allowed multiple assignments
  
  3. Trigger Function for Handler Multi-Dog Rule
    - Create trigger function: check_handler_officer_limit()
    - Enforces: A handler can have multiple dogs, BUT only ONE of those dogs can have a mission officer assigned globally
    - Validates on INSERT and UPDATE of dog_officer table
    - Blocks operation with clear error message if violation detected
  
  4. Security
    - No changes to RLS policies
  
  5. Assignment Rules Summary
    ✓ Rule 1: One dog = max ONE handler globally
    ✓ Rule 2: One dog = max ONE mission officer globally  
    ✓ Rule 3: A dog CAN have one handler AND one officer simultaneously
    ✓ Rule 4: A handler CAN manage multiple dogs
    ✓ Rule 5: Only ONE of a handler's dogs can have an officer assigned globally
*/

-- ============================================================================
-- STEP 1: Clean up existing violation
-- ============================================================================

-- Remove the older officer assignment for Sarah Johnson's dog "Bella"
-- Keep the newer assignment for "Zara 2"
DELETE FROM dog_officer
WHERE id IN (
  SELECT dog_off.id
  FROM dog_officer dog_off
  JOIN dogs d ON d.id = dog_off.dog_id
  JOIN dog_handler dh ON dh.dog_id = d.id
  WHERE dh.handler_id = '22222222-2222-2222-2222-222222222222'
    AND dog_off.assigned_at < '2025-12-22 17:47:20.829715+00'
);

-- ============================================================================
-- STEP 2: Add constraints for one handler per dog
-- ============================================================================

-- Drop the old composite UNIQUE constraint on dog_handler
ALTER TABLE dog_handler DROP CONSTRAINT IF EXISTS dog_handler_dog_id_handler_id_key;

-- Add UNIQUE constraint on dog_id to enforce one handler per dog
ALTER TABLE dog_handler ADD CONSTRAINT dog_handler_dog_id_unique UNIQUE (dog_id);

-- ============================================================================
-- STEP 3: Add constraint for one officer per dog
-- ============================================================================

-- Add UNIQUE constraint on dog_id to enforce one officer per dog
-- (officer_id already has a unique constraint from previous migration)
ALTER TABLE dog_officer ADD CONSTRAINT dog_officer_dog_id_unique UNIQUE (dog_id);

-- ============================================================================
-- STEP 4: Create trigger function for handler multi-dog officer rule
-- ============================================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS check_handler_officer_limit() CASCADE;

-- Create function to enforce: handler can only have one dog with an officer
CREATE OR REPLACE FUNCTION check_handler_officer_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_handler_id uuid;
  v_existing_count integer;
BEGIN
  -- Get the handler_id for the dog being assigned to an officer
  SELECT dh.handler_id INTO v_handler_id
  FROM dog_handler dh
  WHERE dh.dog_id = NEW.dog_id;
  
  -- If the dog has no handler, allow the assignment
  IF v_handler_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Count how many OTHER dogs this handler has that already have officers
  SELECT COUNT(*) INTO v_existing_count
  FROM dog_handler dh
  JOIN dog_officer dog_off ON dog_off.dog_id = dh.dog_id
  WHERE dh.handler_id = v_handler_id
    AND dog_off.dog_id != NEW.dog_id;  -- Exclude the current dog being assigned
  
  -- If handler already has a dog with an officer, block this assignment
  IF v_existing_count > 0 THEN
    RAISE EXCEPTION 'Assignment Rule Violated: A dog cannot have multiple handlers or multiple mission officers, and a handler can only have one mission-officer-assigned dog globally at the same time.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on dog_officer table
CREATE TRIGGER enforce_handler_officer_limit
  BEFORE INSERT OR UPDATE ON dog_officer
  FOR EACH ROW
  EXECUTE FUNCTION check_handler_officer_limit();

-- ============================================================================
-- STEP 5: Create indexes for performance
-- ============================================================================

-- Index already exists for dog_handler.dog_id via UNIQUE constraint
-- Index already exists for dog_officer.dog_id via UNIQUE constraint
-- Ensure we have indexes for the JOIN queries in the trigger
CREATE INDEX IF NOT EXISTS idx_dog_handler_handler_id ON dog_handler(handler_id);
