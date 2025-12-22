/*
  # Populate Default Handlers for Dogs

  1. Purpose
    - Automatically set default_handler_id for all dogs that have handlers assigned in dog_handler table
    - This enables auto-assignment of handlers when dogs are selected for missions
  
  2. Logic
    - For each dog with handler(s) in dog_handler table, set the most recently assigned handler as default
    - If a dog has multiple handlers, pick the one with the most recent assigned_at timestamp
    - Dogs without handlers will remain with NULL default_handler_id
  
  3. Impact
    - Updates default_handler_id for dogs: Rex, Max, Luna, Charlie, Daisy, Rocky, Molly, Duke, Sadie, Sharkan, Vicki, and Bella
    - Thunder and other dogs without handlers in dog_handler table remain unchanged
*/

-- Update default_handler_id for all dogs that have handlers
UPDATE dogs d
SET default_handler_id = (
  SELECT dh.handler_id
  FROM dog_handler dh
  WHERE dh.dog_id = d.id
  ORDER BY dh.assigned_at DESC
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 FROM dog_handler dh WHERE dh.dog_id = d.id
);