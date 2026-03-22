/*
  # Restore All Operational Data

  ## Overview
  Restores all handlers, dogs, locations, and their assignments to match
  the last successful session state.

  ## Data Restored
  1. Locations - Physical base locations for dog assignments
  2. Handlers - 10 K9 handlers with employee IDs and roles
  3. Dogs - 10 K9 dogs with breeds, specializations, and weights
  4. dog_handler - Handler-to-dog assignments
  5. dog_officer - Officer-to-dog assignments

  ## Notes
  - Adds unique constraint on dogs.microchip_number if not present
  - Fitness status records are auto-created by trigger on dog insert
*/

-- Add unique constraint on microchip_number if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'dogs_microchip_number_key'
  ) THEN
    ALTER TABLE dogs ADD CONSTRAINT dogs_microchip_number_key UNIQUE (microchip_number);
  END IF;
END $$;

-- ============================================
-- SEED: Locations (bases)
-- ============================================

INSERT INTO locations (name, address, description) VALUES
  ('Dubai International Airport (DXB)', 'Dubai, UAE', 'Main international airport hub, K9 operations base'),
  ('Abu Dhabi International Airport (AUH)', 'Abu Dhabi, UAE', 'Capital city international airport, K9 operations base'),
  ('Sharjah International Airport (SHJ)', 'Sharjah, UAE', 'Northern Emirates airport, K9 operations base')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SEED: Handlers
-- ============================================

INSERT INTO handlers (employee_id, full_name, email, phone, team_leader, driver) VALUES
  ('150101', 'Saif Al Rashidi', 'saif.rashidi@k9.ae', '+971 50 111 0101', true, false),
  ('150102', 'Omar Al Marzouqi', 'omar.marzouqi@k9.ae', '+971 50 111 0102', false, true),
  ('150103', 'Khalid Al Falasi', 'khalid.falasi@k9.ae', '+971 50 111 0103', false, false),
  ('150104', 'Ahmed Al Blooshi', 'ahmed.blooshi@k9.ae', '+971 50 111 0104', false, false),
  ('150105', 'Hamad Al Kaabi', 'hamad.kaabi@k9.ae', '+971 50 111 0105', true, false),
  ('150106', 'Yousif Al Muhairi', 'yousif.muhairi@k9.ae', '+971 50 111 0106', false, true),
  ('150107', 'Rashid Al Shamsi', 'rashid.shamsi@k9.ae', '+971 50 111 0107', false, false),
  ('150108', 'Sultan Al Dhaheri', 'sultan.dhaheri@k9.ae', '+971 50 111 0108', false, false),
  ('150109', 'Majid Al Nuaimi', 'majid.nuaimi@k9.ae', '+971 50 111 0109', false, false),
  ('150110', 'Jaber Al Mazrouei', 'jaber.mazrouei@k9.ae', '+971 50 111 0110', false, false)
ON CONFLICT (employee_id) DO NOTHING;

-- ============================================
-- SEED: Dogs
-- ============================================

INSERT INTO dogs (name, breed, sex, microchip_number, dob, training_level, specialization, location, origin, weight_kg, note) VALUES
  ('Thunder', 'German Shepherd', 'Male', 'UAE-K9-1101', '2021-03-15', 'Operational', 'Explosive', 'Abu Dhabi International Airport', 'Germany', 32.5, 'Excellent detection skills, certified for international operations'),
  ('Luna', 'Belgian Malinois', 'Female', 'UAE-K9-1102', '2020-08-22', 'Operational', 'Narcotic', 'Dubai International Airport', 'Belgium', 28.0, 'High energy, exceptional tracking abilities'),
  ('Rex', 'Dutch Shepherd', 'Male', 'UAE-K9-1103', '2022-01-10', 'Phase 4', 'Explosive', 'Abu Dhabi International Airport', 'Netherlands', 30.5, 'Fast learner, completing advanced training'),
  ('Shadow', 'Labrador Retriever', 'Male', 'UAE-K9-1104', '2021-06-18', 'Operational', 'Currency', 'Dubai International Airport', 'United Kingdom', 35.0, 'Specialized in currency detection, calm temperament'),
  ('Bella', 'German Shepherd', 'Female', 'UAE-K9-1105', '2020-11-05', 'Operational', 'Narcotic', 'Sharjah International Airport', 'Germany', 29.5, 'Veteran officer with multiple successful detections'),
  ('Max', 'Belgian Malinois', 'Male', 'UAE-K9-1106', '2022-04-12', 'Phase 3', 'Explosive', 'Abu Dhabi International Airport', 'Belgium', 31.0, 'Showing great promise in explosive detection training'),
  ('Nala', 'Springer Spaniel', 'Female', 'UAE-K9-1107', '2021-09-30', 'Operational', 'Tobacco', 'Dubai International Airport', 'United Kingdom', 22.5, 'Excellent for tobacco detection, friendly disposition'),
  ('Duke', 'German Shepherd', 'Male', 'UAE-K9-1108', '2020-05-14', 'Operational', 'RAS Cargo', 'Abu Dhabi International Airport', 'Germany', 34.0, 'Specialized in cargo screening, highly focused'),
  ('Rocky', 'Dutch Shepherd', 'Male', 'UAE-K9-1109', '2021-12-20', 'Phase 4', 'Narcotic', 'Dubai International Airport', 'Netherlands', 29.0, 'Nearly completed training, strong detection instincts'),
  ('Zara', 'Labrador Retriever', 'Female', 'UAE-K9-1110', '2022-02-28', 'Phase 3', 'Kong', 'Sharjah International Airport', 'United Kingdom', 27.5, 'Training for Kong specialization, eager to learn')
ON CONFLICT (microchip_number) DO NOTHING;

-- ============================================
-- SEED: dog_handler assignments
-- ============================================

INSERT INTO dog_handler (dog_id, handler_id)
SELECT d.id, h.id FROM dogs d CROSS JOIN handlers h
WHERE d.microchip_number = 'UAE-K9-1101' AND h.employee_id = '150101'
ON CONFLICT (dog_id, handler_id) DO NOTHING;

INSERT INTO dog_handler (dog_id, handler_id)
SELECT d.id, h.id FROM dogs d CROSS JOIN handlers h
WHERE d.microchip_number = 'UAE-K9-1102' AND h.employee_id = '150102'
ON CONFLICT (dog_id, handler_id) DO NOTHING;

INSERT INTO dog_handler (dog_id, handler_id)
SELECT d.id, h.id FROM dogs d CROSS JOIN handlers h
WHERE d.microchip_number = 'UAE-K9-1103' AND h.employee_id = '150103'
ON CONFLICT (dog_id, handler_id) DO NOTHING;

INSERT INTO dog_handler (dog_id, handler_id)
SELECT d.id, h.id FROM dogs d CROSS JOIN handlers h
WHERE d.microchip_number = 'UAE-K9-1104' AND h.employee_id = '150104'
ON CONFLICT (dog_id, handler_id) DO NOTHING;

INSERT INTO dog_handler (dog_id, handler_id)
SELECT d.id, h.id FROM dogs d CROSS JOIN handlers h
WHERE d.microchip_number = 'UAE-K9-1105' AND h.employee_id = '150105'
ON CONFLICT (dog_id, handler_id) DO NOTHING;

INSERT INTO dog_handler (dog_id, handler_id)
SELECT d.id, h.id FROM dogs d CROSS JOIN handlers h
WHERE d.microchip_number = 'UAE-K9-1106' AND h.employee_id = '150106'
ON CONFLICT (dog_id, handler_id) DO NOTHING;

INSERT INTO dog_handler (dog_id, handler_id)
SELECT d.id, h.id FROM dogs d CROSS JOIN handlers h
WHERE d.microchip_number = 'UAE-K9-1107' AND h.employee_id = '150107'
ON CONFLICT (dog_id, handler_id) DO NOTHING;

INSERT INTO dog_handler (dog_id, handler_id)
SELECT d.id, h.id FROM dogs d CROSS JOIN handlers h
WHERE d.microchip_number = 'UAE-K9-1108' AND h.employee_id = '150108'
ON CONFLICT (dog_id, handler_id) DO NOTHING;

INSERT INTO dog_handler (dog_id, handler_id)
SELECT d.id, h.id FROM dogs d CROSS JOIN handlers h
WHERE d.microchip_number = 'UAE-K9-1109' AND h.employee_id = '150109'
ON CONFLICT (dog_id, handler_id) DO NOTHING;

INSERT INTO dog_handler (dog_id, handler_id)
SELECT d.id, h.id FROM dogs d CROSS JOIN handlers h
WHERE d.microchip_number = 'UAE-K9-1110' AND h.employee_id = '150110'
ON CONFLICT (dog_id, handler_id) DO NOTHING;

-- ============================================
-- SEED: dog_officer assignments
-- ============================================

INSERT INTO dog_officer (dog_id, officer_id)
SELECT d.id, o.id FROM dogs d CROSS JOIN mission_officers o
WHERE d.microchip_number = 'UAE-K9-1101' AND o.full_name IN ('Abdullah Al Suwaidi', 'Ahmed Al Mansoori')
ON CONFLICT (dog_id, officer_id) DO NOTHING;

INSERT INTO dog_officer (dog_id, officer_id)
SELECT d.id, o.id FROM dogs d CROSS JOIN mission_officers o
WHERE d.microchip_number = 'UAE-K9-1102' AND o.full_name = 'Ali Al Qubaisi'
ON CONFLICT (dog_id, officer_id) DO NOTHING;

INSERT INTO dog_officer (dog_id, officer_id)
SELECT d.id, o.id FROM dogs d CROSS JOIN mission_officers o
WHERE d.microchip_number = 'UAE-K9-1103' AND o.full_name IN ('Hassan Al Zaabi', 'Khalid Al Mazrouei')
ON CONFLICT (dog_id, officer_id) DO NOTHING;

INSERT INTO dog_officer (dog_id, officer_id)
SELECT d.id, o.id FROM dogs d CROSS JOIN mission_officers o
WHERE d.microchip_number = 'UAE-K9-1104' AND o.full_name = 'Mohammed Al Shamsi'
ON CONFLICT (dog_id, officer_id) DO NOTHING;

INSERT INTO dog_officer (dog_id, officer_id)
SELECT d.id, o.id FROM dogs d CROSS JOIN mission_officers o
WHERE d.microchip_number = 'UAE-K9-1105' AND o.full_name IN ('Omar Al Ketbi', 'Rashid Al Nuaimi')
ON CONFLICT (dog_id, officer_id) DO NOTHING;

INSERT INTO dog_officer (dog_id, officer_id)
SELECT d.id, o.id FROM dogs d CROSS JOIN mission_officers o
WHERE d.microchip_number = 'UAE-K9-1106' AND o.full_name = 'Saeed Al Dhaheri'
ON CONFLICT (dog_id, officer_id) DO NOTHING;

INSERT INTO dog_officer (dog_id, officer_id)
SELECT d.id, o.id FROM dogs d CROSS JOIN mission_officers o
WHERE d.microchip_number = 'UAE-K9-1107' AND o.full_name = 'Sultan Al Ameri'
ON CONFLICT (dog_id, officer_id) DO NOTHING;

INSERT INTO dog_officer (dog_id, officer_id)
SELECT d.id, o.id FROM dogs d CROSS JOIN mission_officers o
WHERE d.microchip_number = 'UAE-K9-1108' AND o.full_name IN ('Abdullah Al Suwaidi', 'Ali Al Qubaisi')
ON CONFLICT (dog_id, officer_id) DO NOTHING;

INSERT INTO dog_officer (dog_id, officer_id)
SELECT d.id, o.id FROM dogs d CROSS JOIN mission_officers o
WHERE d.microchip_number = 'UAE-K9-1109' AND o.full_name = 'Khalid Al Mazrouei'
ON CONFLICT (dog_id, officer_id) DO NOTHING;

INSERT INTO dog_officer (dog_id, officer_id)
SELECT d.id, o.id FROM dogs d CROSS JOIN mission_officers o
WHERE d.microchip_number = 'UAE-K9-1110' AND o.full_name IN ('Omar Al Ketbi', 'Sultan Al Ameri')
ON CONFLICT (dog_id, officer_id) DO NOTHING;
