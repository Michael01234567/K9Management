/*
  # Restore Missing Schema and Data

  ## Overview
  Restores data that was missing from the last successful session:

  1. Schema Fixes
     - Add default_handler_id to dogs table
     - Populate default_handler_id from dog_handler assignments

  2. Vet Records
     - Sample vet records for all 10 dogs

  3. Fitness Logs
     - Recent fitness logs for all dogs

  4. Missions
     - 8 sample missions across UAE airports and border crossings
*/

-- ============================================
-- 1. ADD default_handler_id COLUMN TO DOGS
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dogs' AND column_name = 'default_handler_id'
  ) THEN
    ALTER TABLE dogs ADD COLUMN default_handler_id uuid REFERENCES handlers(id) ON DELETE SET NULL;
  END IF;
END $$;

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

-- ============================================
-- 2. VET RECORDS
-- ============================================

INSERT INTO vet_records (dog_id, visit_date, visit_type, notes, next_visit_date)
SELECT d.id, '2025-10-01', 'Checkup', 'Annual health checkup. Dog in excellent condition. Weight within optimal range.', '2026-04-01'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1101';

INSERT INTO vet_records (dog_id, visit_date, visit_type, notes, next_visit_date)
SELECT d.id, '2025-10-01', 'Vaccination', 'Rabies and DHPP booster administered. No adverse reactions.', '2026-10-01'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1101';

INSERT INTO vet_records (dog_id, visit_date, visit_type, notes, next_visit_date)
SELECT d.id, '2025-09-15', 'Checkup', 'Routine checkup. Luna is healthy and active. Coat and teeth in good condition.', '2026-03-15'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1102';

INSERT INTO vet_records (dog_id, visit_date, visit_type, notes, next_visit_date)
SELECT d.id, '2025-09-15', 'Vaccination', 'Annual vaccinations updated. Bordetella and leptospirosis included.', '2026-09-15'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1102';

INSERT INTO vet_records (dog_id, visit_date, visit_type, notes, next_visit_date)
SELECT d.id, '2025-11-10', 'Checkup', 'Pre-training evaluation. Good physical condition. Ready for Phase 4 completion.', '2026-05-10'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1103';

INSERT INTO vet_records (dog_id, visit_date, visit_type, notes, next_visit_date)
SELECT d.id, '2025-10-20', 'Dental', 'Annual dental cleaning performed. Minor tartar removed. Teeth in good health.', '2026-10-20'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1104';

INSERT INTO vet_records (dog_id, visit_date, visit_type, notes, next_visit_date)
SELECT d.id, '2025-08-05', 'Checkup', 'Post-mission health screening. Bella is fit for continued operational duty.', '2026-02-05'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1105';

INSERT INTO vet_records (dog_id, visit_date, visit_type, notes, next_visit_date)
SELECT d.id, '2025-11-01', 'Checkup', 'Phase 3 evaluation checkup. Max shows excellent physical development.', '2026-05-01'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1106';

INSERT INTO vet_records (dog_id, visit_date, visit_type, notes, next_visit_date)
SELECT d.id, '2025-09-22', 'Vaccination', 'Core vaccines administered. Nala tolerated vaccines well, no side effects.', '2026-09-22'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1107';

INSERT INTO vet_records (dog_id, visit_date, visit_type, notes, next_visit_date)
SELECT d.id, '2025-10-12', 'Checkup', 'Annual checkup. Duke is in prime condition for cargo screening work.', '2026-04-12'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1108';

INSERT INTO vet_records (dog_id, visit_date, visit_type, notes, next_visit_date)
SELECT d.id, '2025-11-05', 'Checkup', 'Phase 4 readiness evaluation. Rocky is progressing well.', '2026-05-05'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1109';

INSERT INTO vet_records (dog_id, visit_date, visit_type, notes, next_visit_date)
SELECT d.id, '2025-11-18', 'Checkup', 'Initial training phase evaluation. Zara is healthy and eager.', '2026-05-18'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1110';

-- ============================================
-- 3. FITNESS LOGS
-- ============================================

INSERT INTO fitness_logs (dog_id, log_date, activity_type, duration_minutes, distance_km, weight_kg, notes)
SELECT d.id, '2026-03-10', 'Training Session', 90, 5.2, 32.5, 'Explosive detection drill. Thunder performed exceptionally. Hit rate 100%.'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1101';

INSERT INTO fitness_logs (dog_id, log_date, activity_type, duration_minutes, distance_km, weight_kg, notes)
SELECT d.id, '2026-03-15', 'Run', 45, 8.0, 32.3, 'Morning endurance run along perimeter. Excellent stamina maintained.'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1101';

INSERT INTO fitness_logs (dog_id, log_date, activity_type, duration_minutes, distance_km, weight_kg, notes)
SELECT d.id, '2026-03-10', 'Training Session', 75, 3.5, 28.0, 'Narcotic detection training. Luna located all 6 planted samples.'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1102';

INSERT INTO fitness_logs (dog_id, log_date, activity_type, duration_minutes, distance_km, weight_kg, notes)
SELECT d.id, '2026-03-16', 'Agility', 60, 2.0, 28.0, 'Agility course completed in record time. Excellent obstacle navigation.'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1102';

INSERT INTO fitness_logs (dog_id, log_date, activity_type, duration_minutes, distance_km, weight_kg, notes)
SELECT d.id, '2026-03-12', 'Training Session', 80, 4.0, 30.5, 'Phase 4 explosive detection. Rex improving rapidly, 5/6 hits.'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1103';

INSERT INTO fitness_logs (dog_id, log_date, activity_type, duration_minutes, distance_km, weight_kg, notes)
SELECT d.id, '2026-03-14', 'Walk', 30, 3.0, 35.0, 'Recovery walk. Shadow maintaining weight within target range.'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1104';

INSERT INTO fitness_logs (dog_id, log_date, activity_type, duration_minutes, distance_km, weight_kg, notes)
SELECT d.id, '2026-03-11', 'Training Session', 90, 5.5, 29.5, 'Narcotic sweep training at simulated airport terminal. Bella 6/6.'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1105';

INSERT INTO fitness_logs (dog_id, log_date, activity_type, duration_minutes, distance_km, weight_kg, notes)
SELECT d.id, '2026-03-13', 'Training Session', 70, 3.8, 31.0, 'Explosive detection Phase 3 assessment. Max passed all criteria.'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1106';

INSERT INTO fitness_logs (dog_id, log_date, activity_type, duration_minutes, distance_km, weight_kg, notes)
SELECT d.id, '2026-03-15', 'Training Session', 60, 2.5, 22.5, 'Tobacco detection training. Nala located all concealed samples.'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1107';

INSERT INTO fitness_logs (dog_id, log_date, activity_type, duration_minutes, distance_km, weight_kg, notes)
SELECT d.id, '2026-03-12', 'Training Session', 85, 6.0, 34.0, 'Cargo container screening exercise. Duke cleared 12 containers.'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1108';

INSERT INTO fitness_logs (dog_id, log_date, activity_type, duration_minutes, distance_km, weight_kg, notes)
SELECT d.id, '2026-03-14', 'Training Session', 75, 4.2, 29.0, 'Phase 4 narcotic detection. Rocky 5/6, one false negative on trace sample.'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1109';

INSERT INTO fitness_logs (dog_id, log_date, activity_type, duration_minutes, distance_km, weight_kg, notes)
SELECT d.id, '2026-03-16', 'Training Session', 50, 2.0, 27.5, 'Kong toy motivation training. Zara responding well to reward system.'
FROM dogs d WHERE d.microchip_number = 'UAE-K9-1110';

-- ============================================
-- 4. MISSIONS
-- ============================================

-- Mission 1: Completed - DXB narcotic find
INSERT INTO missions (
  date, mission_location_id, departure_time, return_time,
  explosive_dog_ids, narcotic_dog_ids, handler_ids,
  explosive_teams, narcotic_teams,
  mission_officer_id, team_leader_id, driver_id,
  training, search, num_items_searched, items_searched_ids, items_with_quantities,
  indication, confirmed_indication, comments, status
)
SELECT
  '2026-03-10',
  ml.id,
  '06:00', '14:00',
  ARRAY[thunder.id, bella.id],
  ARRAY[luna.id],
  ARRAY[h1.id, h2.id, h5.id],
  jsonb_build_array(
    jsonb_build_object('dog_id', thunder.id, 'handler_id', h1.id),
    jsonb_build_object('dog_id', bella.id, 'handler_id', h5.id)
  ),
  jsonb_build_array(
    jsonb_build_object('dog_id', luna.id, 'handler_id', h2.id)
  ),
  mo1.id, h1.id, h2.id,
  false, true, 450,
  ARRAY[bags.id, suitcases.id, backpacks.id],
  jsonb_build_array(
    jsonb_build_object('item_id', bags.id, 'quantity', 200),
    jsonb_build_object('item_id', suitcases.id, 'quantity', 150),
    jsonb_build_object('item_id', backpacks.id, 'quantity', 100)
  ),
  true, true,
  'Positive indication confirmed. Narcotic substance found in checked luggage. Handed over to authorities.',
  'Completed'
FROM
  mission_locations ml,
  dogs thunder, dogs luna, dogs bella,
  handlers h1, handlers h2, handlers h5,
  mission_officers mo1,
  items bags, items suitcases, items backpacks
WHERE
  ml.name = 'Dubai International Airport (DXB)'
  AND thunder.microchip_number = 'UAE-K9-1101'
  AND luna.microchip_number = 'UAE-K9-1102'
  AND bella.microchip_number = 'UAE-K9-1105'
  AND h1.employee_id = '150101'
  AND h2.employee_id = '150102'
  AND h5.employee_id = '150105'
  AND mo1.employee_id = 'ICP-FCA 001'
  AND bags.name = 'Bags'
  AND suitcases.name = 'Suitcases'
  AND backpacks.name = 'Backpacks';

-- Mission 2: Completed - AUH cargo screening
INSERT INTO missions (
  date, mission_location_id, departure_time, return_time,
  explosive_dog_ids, narcotic_dog_ids, handler_ids,
  explosive_teams, narcotic_teams,
  mission_officer_id, team_leader_id, driver_id,
  training, search, num_items_searched, items_searched_ids, items_with_quantities,
  indication, confirmed_indication, comments, status
)
SELECT
  '2026-03-12',
  ml.id,
  '08:00', '16:00',
  ARRAY[thunder.id],
  ARRAY[]::uuid[],
  ARRAY[h1.id, h3.id],
  jsonb_build_array(
    jsonb_build_object('dog_id', thunder.id, 'handler_id', h1.id)
  ),
  '[]'::jsonb,
  mo2.id, h1.id, h3.id,
  false, true, 80,
  ARRAY[cargo.id],
  jsonb_build_array(
    jsonb_build_object('item_id', cargo.id, 'quantity', 80)
  ),
  false, false,
  'Routine cargo screening. No contraband detected. All 80 containers cleared.',
  'Completed'
FROM
  mission_locations ml,
  dogs thunder,
  handlers h1, handlers h3,
  mission_officers mo2,
  items cargo
WHERE
  ml.name = 'Abu Dhabi International Airport (AUH)'
  AND thunder.microchip_number = 'UAE-K9-1101'
  AND h1.employee_id = '150101'
  AND h3.employee_id = '150103'
  AND mo2.employee_id = 'ICP-FCA 002'
  AND cargo.name = 'Cargo Containers';

-- Mission 3: Completed - Al Ghuwaifat border vehicle screening
INSERT INTO missions (
  date, mission_location_id, departure_time, return_time,
  explosive_dog_ids, narcotic_dog_ids, handler_ids,
  explosive_teams, narcotic_teams,
  mission_officer_id, team_leader_id, driver_id,
  training, search, num_items_searched, items_searched_ids, items_with_quantities,
  indication, confirmed_indication, comments, status
)
SELECT
  '2026-03-14',
  ml.id,
  '07:00', '17:00',
  ARRAY[duke.id],
  ARRAY[bella.id],
  ARRAY[h5.id, h6.id, h8.id],
  jsonb_build_array(
    jsonb_build_object('dog_id', duke.id, 'handler_id', h8.id)
  ),
  jsonb_build_array(
    jsonb_build_object('dog_id', bella.id, 'handler_id', h5.id)
  ),
  mo3.id, h5.id, h6.id,
  false, true, 120,
  ARRAY[vehicles.id],
  jsonb_build_array(
    jsonb_build_object('item_id', vehicles.id, 'quantity', 120)
  ),
  false, false,
  'Land border vehicle screening. All commercial trucks and passenger vehicles cleared.',
  'Completed'
FROM
  mission_locations ml,
  dogs duke, dogs bella,
  handlers h5, handlers h6, handlers h8,
  mission_officers mo3,
  items vehicles
WHERE
  ml.name = 'Al Ghuwaifat Border Crossing'
  AND duke.microchip_number = 'UAE-K9-1108'
  AND bella.microchip_number = 'UAE-K9-1105'
  AND h5.employee_id = '150105'
  AND h6.employee_id = '150106'
  AND h8.employee_id = '150108'
  AND mo3.employee_id = 'ICP-FCA 003'
  AND vehicles.name = 'Vehicles';

-- Mission 4: Completed - SHJ parcel and mail screening
INSERT INTO missions (
  date, mission_location_id, departure_time, return_time,
  explosive_dog_ids, narcotic_dog_ids, handler_ids,
  explosive_teams, narcotic_teams,
  mission_officer_id, team_leader_id, driver_id,
  training, search, num_items_searched, items_searched_ids, items_with_quantities,
  indication, confirmed_indication, comments, status
)
SELECT
  '2026-03-16',
  ml.id,
  '09:00', '15:00',
  ARRAY[]::uuid[],
  ARRAY[luna.id, nala.id],
  ARRAY[h2.id, h7.id, h1.id],
  '[]'::jsonb,
  jsonb_build_array(
    jsonb_build_object('dog_id', luna.id, 'handler_id', h2.id),
    jsonb_build_object('dog_id', nala.id, 'handler_id', h7.id)
  ),
  mo4.id, h1.id, h2.id,
  false, true, 340,
  ARRAY[parcels.id, mail.id],
  jsonb_build_array(
    jsonb_build_object('item_id', parcels.id, 'quantity', 220),
    jsonb_build_object('item_id', mail.id, 'quantity', 120)
  ),
  true, false,
  'Initial indication noted but not confirmed after secondary inspection. Parcels cleared.',
  'Completed'
FROM
  mission_locations ml,
  dogs luna, dogs nala,
  handlers h1, handlers h2, handlers h7,
  mission_officers mo4,
  items parcels, items mail
WHERE
  ml.name = 'Sharjah International Airport (SHJ)'
  AND luna.microchip_number = 'UAE-K9-1102'
  AND nala.microchip_number = 'UAE-K9-1107'
  AND h1.employee_id = '150101'
  AND h2.employee_id = '150102'
  AND h7.employee_id = '150107'
  AND mo4.employee_id = 'ICP-FCA 004'
  AND parcels.name = 'Parcels'
  AND mail.name = 'Mail';

-- Mission 5: Active - DXB ongoing
INSERT INTO missions (
  date, mission_location_id, departure_time, return_time,
  explosive_dog_ids, narcotic_dog_ids, handler_ids,
  explosive_teams, narcotic_teams,
  mission_officer_id, team_leader_id, driver_id,
  training, search, num_items_searched, items_searched_ids, items_with_quantities,
  indication, confirmed_indication, comments, status
)
SELECT
  '2026-03-22',
  ml.id,
  '06:00', NULL,
  ARRAY[thunder.id],
  ARRAY[luna.id, bella.id],
  ARRAY[h1.id, h2.id, h5.id],
  jsonb_build_array(
    jsonb_build_object('dog_id', thunder.id, 'handler_id', h1.id)
  ),
  jsonb_build_array(
    jsonb_build_object('dog_id', luna.id, 'handler_id', h2.id),
    jsonb_build_object('dog_id', bella.id, 'handler_id', h5.id)
  ),
  mo1.id, h1.id, h2.id,
  false, true, 0,
  ARRAY[bags.id, suitcases.id],
  '[]'::jsonb,
  false, false,
  'Morning arrival screening operation ongoing.',
  'Active'
FROM
  mission_locations ml,
  dogs thunder, dogs luna, dogs bella,
  handlers h1, handlers h2, handlers h5,
  mission_officers mo1,
  items bags, items suitcases
WHERE
  ml.name = 'Dubai International Airport (DXB)'
  AND thunder.microchip_number = 'UAE-K9-1101'
  AND luna.microchip_number = 'UAE-K9-1102'
  AND bella.microchip_number = 'UAE-K9-1105'
  AND h1.employee_id = '150101'
  AND h2.employee_id = '150102'
  AND h5.employee_id = '150105'
  AND mo1.employee_id = 'ICP-FCA 001'
  AND bags.name = 'Bags'
  AND suitcases.name = 'Suitcases';

-- Mission 6: On Standby - AUH ready team
INSERT INTO missions (
  date, mission_location_id, departure_time, return_time,
  explosive_dog_ids, narcotic_dog_ids, handler_ids,
  explosive_teams, narcotic_teams,
  mission_officer_id, team_leader_id, driver_id,
  training, search, num_items_searched, items_searched_ids, items_with_quantities,
  indication, confirmed_indication, comments, status
)
SELECT
  '2026-03-22',
  ml.id,
  '08:00', NULL,
  ARRAY[duke.id],
  ARRAY[shadow.id],
  ARRAY[h8.id, h4.id, h6.id],
  jsonb_build_array(
    jsonb_build_object('dog_id', duke.id, 'handler_id', h8.id)
  ),
  jsonb_build_array(
    jsonb_build_object('dog_id', shadow.id, 'handler_id', h4.id)
  ),
  mo5.id, h8.id, h6.id,
  false, false, 0,
  ARRAY[]::uuid[],
  '[]'::jsonb,
  false, false,
  'Team on standby for incoming international flights.',
  'On Standby'
FROM
  mission_locations ml,
  dogs duke, dogs shadow,
  handlers h4, handlers h6, handlers h8,
  mission_officers mo5
WHERE
  ml.name = 'Abu Dhabi International Airport (AUH)'
  AND duke.microchip_number = 'UAE-K9-1108'
  AND shadow.microchip_number = 'UAE-K9-1104'
  AND h4.employee_id = '150104'
  AND h6.employee_id = '150106'
  AND h8.employee_id = '150108'
  AND mo5.employee_id = 'ICP-FCA 005';

-- Mission 7: Completed - Training exercise SHJ
INSERT INTO missions (
  date, mission_location_id, departure_time, return_time,
  explosive_dog_ids, narcotic_dog_ids, handler_ids,
  explosive_teams, narcotic_teams,
  mission_officer_id, team_leader_id, driver_id,
  training, search, num_items_searched, items_searched_ids, items_with_quantities,
  indication, confirmed_indication, comments, status
)
SELECT
  '2026-03-08',
  ml.id,
  '07:30', '12:30',
  ARRAY[rex.id, max_dog.id],
  ARRAY[rocky.id],
  ARRAY[h3.id, h6.id, h9.id],
  jsonb_build_array(
    jsonb_build_object('dog_id', rex.id, 'handler_id', h3.id),
    jsonb_build_object('dog_id', max_dog.id, 'handler_id', h6.id)
  ),
  jsonb_build_array(
    jsonb_build_object('dog_id', rocky.id, 'handler_id', h9.id)
  ),
  mo6.id, h3.id, h6.id,
  true, true, 60,
  ARRAY[bags.id, vehicles.id],
  jsonb_build_array(
    jsonb_build_object('item_id', bags.id, 'quantity', 40),
    jsonb_build_object('item_id', vehicles.id, 'quantity', 20)
  ),
  false, false,
  'Joint training exercise with Phase 3 and 4 dogs. All trainees performed well.',
  'Completed'
FROM
  mission_locations ml,
  dogs rex, dogs max_dog, dogs rocky,
  handlers h3, handlers h6, handlers h9,
  mission_officers mo6,
  items bags, items vehicles
WHERE
  ml.name = 'Sharjah International Airport (SHJ)'
  AND rex.microchip_number = 'UAE-K9-1103'
  AND max_dog.microchip_number = 'UAE-K9-1106'
  AND rocky.microchip_number = 'UAE-K9-1109'
  AND h3.employee_id = '150103'
  AND h6.employee_id = '150106'
  AND h9.employee_id = '150109'
  AND mo6.employee_id = 'ICP-POL 001'
  AND bags.name = 'Bags'
  AND vehicles.name = 'Vehicles';

-- Mission 8: Completed - Hatta border crossing
INSERT INTO missions (
  date, mission_location_id, departure_time, return_time,
  explosive_dog_ids, narcotic_dog_ids, handler_ids,
  explosive_teams, narcotic_teams,
  mission_officer_id, team_leader_id, driver_id,
  training, search, num_items_searched, items_searched_ids, items_with_quantities,
  indication, confirmed_indication, comments, status
)
SELECT
  '2026-03-05',
  ml.id,
  '06:00', '18:00',
  ARRAY[thunder.id],
  ARRAY[nala.id],
  ARRAY[h1.id, h7.id, h10.id],
  jsonb_build_array(
    jsonb_build_object('dog_id', thunder.id, 'handler_id', h1.id)
  ),
  jsonb_build_array(
    jsonb_build_object('dog_id', nala.id, 'handler_id', h7.id)
  ),
  mo7.id, h1.id, h10.id,
  false, true, 95,
  ARRAY[vehicles.id, backpacks.id],
  jsonb_build_array(
    jsonb_build_object('item_id', vehicles.id, 'quantity', 75),
    jsonb_build_object('item_id', backpacks.id, 'quantity', 20)
  ),
  false, false,
  'Full-day border crossing screening operation. 95 vehicles screened, all cleared.',
  'Completed'
FROM
  mission_locations ml,
  dogs thunder, dogs nala,
  handlers h1, handlers h7, handlers h10,
  mission_officers mo7,
  items vehicles, items backpacks
WHERE
  ml.name = 'Hatta Border Crossing'
  AND thunder.microchip_number = 'UAE-K9-1101'
  AND nala.microchip_number = 'UAE-K9-1107'
  AND h1.employee_id = '150101'
  AND h7.employee_id = '150107'
  AND h10.employee_id = '150110'
  AND mo7.employee_id = 'ICP-POL 002'
  AND vehicles.name = 'Vehicles'
  AND backpacks.name = 'Backpacks';
