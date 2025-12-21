/*
  # Remove Microchip Number Format Constraint

  ## Changes Made

  1. **Remove Format Validation**
    - Drop CHECK constraint on `microchip_number` column in `dogs` table
    - Allows any format for microchip numbers without database-level validation
    - Existing microchip numbers remain unchanged

  ## Notes
    - Microchip numbers can now be entered in any format
    - No validation will be enforced at the database level
*/

-- Remove CHECK constraint for microchip number format
ALTER TABLE dogs 
DROP CONSTRAINT IF EXISTS check_microchip_format;