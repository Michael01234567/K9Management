/*
  # Standardize Microchip Number Format

  ## Changes Made

  1. **Update Existing Microchip Numbers**
    - Convert UAE-K9-#### format to MC0000#### (extracting number and padding)
    - Standardize MC numbers to exactly 8 digits (pad with zeros or truncate)
    - Ensures all microchip numbers follow format: MC + 8 digits

  2. **Add Format Validation**
    - Add CHECK constraint requiring format: MC[0-9]{8}
    - Prevents future entries from using incorrect format

  ## Examples
    - UAE-K9-1101 → MC00001101
    - MC521365889 → MC21365889 (last 8 digits)
    - MC70055543 → MC70055543 (already correct)
*/

-- Update UAE-K9-#### format to MC########
UPDATE dogs
SET microchip_number = 'MC' || LPAD(
  REGEXP_REPLACE(microchip_number, '^UAE-K9-', ''),
  8,
  '0'
)
WHERE microchip_number LIKE 'UAE-K9-%';

-- Update MC numbers with more than 8 digits (take last 8 digits)
UPDATE dogs
SET microchip_number = 'MC' || RIGHT(
  REGEXP_REPLACE(microchip_number, '^MC', ''),
  8
)
WHERE microchip_number LIKE 'MC%'
  AND LENGTH(microchip_number) > 10;

-- Update MC numbers with less than 8 digits (pad with zeros)
UPDATE dogs
SET microchip_number = 'MC' || LPAD(
  REGEXP_REPLACE(microchip_number, '^MC', ''),
  8,
  '0'
)
WHERE microchip_number LIKE 'MC%'
  AND LENGTH(microchip_number) < 10;

-- Add CHECK constraint for microchip number format
ALTER TABLE dogs 
DROP CONSTRAINT IF EXISTS check_microchip_format;

ALTER TABLE dogs
ADD CONSTRAINT check_microchip_format 
CHECK (microchip_number ~ '^MC[0-9]{8}$');