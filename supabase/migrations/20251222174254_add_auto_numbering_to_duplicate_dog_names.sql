/*
  # Add Auto-Numbering to Duplicate Dog Names

  1. Updates
    - Finds all dogs with duplicate names
    - Appends sequential numbers to duplicate names (e.g., "Bella", "Bella 2", "Bella 3")
    - Preserves the first occurrence without modification
    
  2. Implementation
    - Uses ROW_NUMBER() to identify duplicates within each name group
    - Updates only dogs where name appears more than once
    - Maintains chronological order based on created_at timestamp
*/

DO $$
DECLARE
  dog_record RECORD;
  row_num INTEGER;
BEGIN
  FOR dog_record IN 
    SELECT 
      id, 
      name, 
      created_at,
      ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at) as rn,
      COUNT(*) OVER (PARTITION BY name) as name_count
    FROM dogs
    ORDER BY name, created_at
  LOOP
    IF dog_record.name_count > 1 AND dog_record.rn > 1 THEN
      UPDATE dogs
      SET name = dog_record.name || ' ' || dog_record.rn
      WHERE id = dog_record.id;
    END IF;
  END LOOP;
END $$;