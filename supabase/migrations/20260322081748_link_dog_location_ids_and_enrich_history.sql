/*
  # Link Dog Location IDs and Enrich Historical Data

  ## Overview
  Fixes remaining data gaps:

  1. Links dogs.location_id FK to locations table (was NULL)
  2. Links handler_id on fitness_status records
  3. Adds 8 weeks of historical fitness logs per dog
  4. Adds prior-year vet records for complete history
*/

-- ============================================
-- 1. LINK DOGS TO LOCATION IDs
-- ============================================

UPDATE dogs SET location_id = (SELECT id FROM locations WHERE name = 'Dubai International Airport (DXB)')
WHERE location IN ('Dubai International Airport', 'Dubai International Airport (DXB)');

UPDATE dogs SET location_id = (SELECT id FROM locations WHERE name = 'Abu Dhabi International Airport (AUH)')
WHERE location IN ('Abu Dhabi International Airport', 'Abu Dhabi International Airport (AUH)');

UPDATE dogs SET location_id = (SELECT id FROM locations WHERE name = 'Sharjah International Airport (SHJ)')
WHERE location IN ('Sharjah International Airport', 'Sharjah International Airport (SHJ)');

-- ============================================
-- 2. LINK HANDLER IDs ON FITNESS STATUS
-- ============================================

UPDATE fitness_status fs
SET handler_id = dh.handler_id,
    duration_start = '2025-01-01',
    notes = 'Dog is fit and performing at operational standard.'
FROM dog_handler dh
WHERE dh.dog_id = fs.dog_id
  AND fs.handler_id IS NULL;

-- ============================================
-- 3. ADDITIONAL FITNESS LOGS (historical data)
-- ============================================

DO $$
DECLARE
  dog_id uuid;
BEGIN

  -- Thunder (UAE-K9-1101)
  SELECT id INTO dog_id FROM dogs WHERE microchip_number = 'UAE-K9-1101';
  INSERT INTO fitness_logs (dog_id, log_date, activity_type, duration_minutes, distance_km, weight_kg, notes) VALUES
    (dog_id, '2025-12-05', 'Training Session', 85, 4.8, 32.8, 'Explosive detection exercise. All simulated targets found.'),
    (dog_id, '2025-12-12', 'Run', 40, 7.5, 32.6, 'Endurance run, good pace throughout.'),
    (dog_id, '2025-12-19', 'Training Session', 90, 5.0, 32.5, 'Advanced detection drill. Perfect score.'),
    (dog_id, '2026-01-06', 'Training Session', 80, 4.5, 32.4, 'Post-holiday session. Re-engaged quickly.'),
    (dog_id, '2026-01-13', 'Run', 45, 8.0, 32.4, 'Good stamina. No issues observed.'),
    (dog_id, '2026-01-20', 'Agility', 60, 2.5, 32.3, 'Agility course, improved obstacle time by 8%.'),
    (dog_id, '2026-02-03', 'Training Session', 90, 5.2, 32.5, 'Pre-mission calibration. Ready for DXB operation.'),
    (dog_id, '2026-02-17', 'Training Session', 85, 5.0, 32.5, 'Explosive detection refresher.');

  -- Luna (UAE-K9-1102)
  SELECT id INTO dog_id FROM dogs WHERE microchip_number = 'UAE-K9-1102';
  INSERT INTO fitness_logs (dog_id, log_date, activity_type, duration_minutes, distance_km, weight_kg, notes) VALUES
    (dog_id, '2025-12-03', 'Training Session', 70, 3.2, 28.2, 'Narcotic detection drill. Excellent sensitivity.'),
    (dog_id, '2025-12-10', 'Agility', 55, 1.8, 28.1, 'Agility training, fluid movement.'),
    (dog_id, '2025-12-17', 'Run', 35, 6.0, 28.0, 'Morning run. Good energy levels.'),
    (dog_id, '2026-01-07', 'Training Session', 75, 3.5, 28.0, 'Multi-scent discrimination training. 100% accuracy.'),
    (dog_id, '2026-01-14', 'Walk', 25, 2.0, 28.1, 'Light exercise after extended mission.'),
    (dog_id, '2026-01-21', 'Training Session', 80, 3.8, 28.0, 'Advanced concealment detection. 5/5 hits.'),
    (dog_id, '2026-02-04', 'Run', 40, 7.0, 27.9, 'Long run, strong cardiovascular performance.'),
    (dog_id, '2026-02-18', 'Training Session', 75, 3.5, 28.0, 'Pre-SHJ mission exercise.');

  -- Rex (UAE-K9-1103)
  SELECT id INTO dog_id FROM dogs WHERE microchip_number = 'UAE-K9-1103';
  INSERT INTO fitness_logs (dog_id, log_date, activity_type, duration_minutes, distance_km, weight_kg, notes) VALUES
    (dog_id, '2025-12-04', 'Training Session', 75, 3.8, 30.8, 'Phase 4 evaluation drill. 4/6 hits, improving.'),
    (dog_id, '2025-12-11', 'Run', 40, 7.2, 30.7, 'Endurance run. Excellent pace.'),
    (dog_id, '2025-12-18', 'Training Session', 80, 4.0, 30.6, 'Explosive scenario training. 5/6 hits.'),
    (dog_id, '2026-01-08', 'Training Session', 80, 4.0, 30.5, 'Phase 4 continuation. Consistent improvement.'),
    (dog_id, '2026-01-15', 'Agility', 50, 2.0, 30.5, 'Obstacle course. Best time to date.'),
    (dog_id, '2026-01-22', 'Training Session', 85, 4.2, 30.5, 'Complex explosive detection. 6/6 hits.'),
    (dog_id, '2026-02-05', 'Training Session', 80, 4.0, 30.5, 'Training exercise with Phase 3 dogs.'),
    (dog_id, '2026-02-19', 'Training Session', 82, 4.1, 30.5, 'Nearing operational readiness.');

  -- Shadow (UAE-K9-1104)
  SELECT id INTO dog_id FROM dogs WHERE microchip_number = 'UAE-K9-1104';
  INSERT INTO fitness_logs (dog_id, log_date, activity_type, duration_minutes, distance_km, weight_kg, notes) VALUES
    (dog_id, '2025-12-02', 'Walk', 30, 3.0, 35.2, 'Controlled walk. Monitoring weight per vet guidance.'),
    (dog_id, '2025-12-09', 'Training Session', 60, 2.5, 35.1, 'Currency detection drill. Maintained accuracy.'),
    (dog_id, '2025-12-16', 'Run', 35, 5.5, 35.0, 'Moderate run, building endurance.'),
    (dog_id, '2026-01-06', 'Walk', 25, 2.5, 35.0, 'Easy day. Vet recommended lighter activity.'),
    (dog_id, '2026-01-13', 'Training Session', 65, 2.8, 35.0, 'Currency detection. 100% accuracy.'),
    (dog_id, '2026-01-20', 'Walk', 30, 3.0, 34.9, 'Maintaining fitness. Weight stable.'),
    (dog_id, '2026-02-03', 'Training Session', 65, 2.8, 35.0, 'Pre-mission screening exercise.'),
    (dog_id, '2026-02-17', 'Walk', 30, 3.0, 35.0, 'Recovery day walk.');

  -- Bella (UAE-K9-1105)
  SELECT id INTO dog_id FROM dogs WHERE microchip_number = 'UAE-K9-1105';
  INSERT INTO fitness_logs (dog_id, log_date, activity_type, duration_minutes, distance_km, weight_kg, notes) VALUES
    (dog_id, '2025-12-02', 'Training Session', 85, 5.0, 29.6, 'Narcotic sweep, 6/6 hits.'),
    (dog_id, '2025-12-09', 'Run', 42, 7.5, 29.5, 'Strong run, well within fitness standards.'),
    (dog_id, '2025-12-16', 'Training Session', 88, 5.2, 29.5, 'Concealment training. Excellent performance.'),
    (dog_id, '2026-01-06', 'Training Session', 90, 5.5, 29.5, 'Post-holiday calibration session.'),
    (dog_id, '2026-01-13', 'Agility', 58, 2.2, 29.4, 'Agility refresher. Strong and agile.'),
    (dog_id, '2026-01-20', 'Training Session', 88, 5.0, 29.4, 'Narcotic scenario run-through.'),
    (dog_id, '2026-02-04', 'Training Session', 90, 5.5, 29.5, 'Full detection sweep at mock airport terminal.'),
    (dog_id, '2026-02-18', 'Run', 45, 8.0, 29.5, 'Endurance maintenance run.');

  -- Max (UAE-K9-1106)
  SELECT id INTO dog_id FROM dogs WHERE microchip_number = 'UAE-K9-1106';
  INSERT INTO fitness_logs (dog_id, log_date, activity_type, duration_minutes, distance_km, weight_kg, notes) VALUES
    (dog_id, '2025-12-03', 'Training Session', 65, 3.2, 31.2, 'Phase 3 explosive detection. 3/5 hits, early stage.'),
    (dog_id, '2025-12-10', 'Run', 35, 6.0, 31.1, 'Great stamina for his age.'),
    (dog_id, '2025-12-17', 'Training Session', 70, 3.5, 31.0, 'Phase 3 continuation. 4/5 hits.'),
    (dog_id, '2026-01-07', 'Training Session', 72, 3.6, 31.0, 'Improving detection rate. 4/5 hits.'),
    (dog_id, '2026-01-14', 'Agility', 45, 1.8, 31.0, 'Agility training, energetic performance.'),
    (dog_id, '2026-01-21', 'Training Session', 75, 3.8, 31.0, 'Phase 3 assessment. 5/5 hits.'),
    (dog_id, '2026-02-04', 'Training Session', 75, 3.8, 31.0, 'Transitioning to Phase 3 advanced.'),
    (dog_id, '2026-02-18', 'Training Session', 78, 3.9, 31.0, 'Complex scenario training.');

  -- Nala (UAE-K9-1107)
  SELECT id INTO dog_id FROM dogs WHERE microchip_number = 'UAE-K9-1107';
  INSERT INTO fitness_logs (dog_id, log_date, activity_type, duration_minutes, distance_km, weight_kg, notes) VALUES
    (dog_id, '2025-12-04', 'Training Session', 55, 2.2, 22.6, 'Tobacco scent discrimination. 100% accuracy.'),
    (dog_id, '2025-12-11', 'Walk', 20, 2.0, 22.5, 'Easy day. Nala sprightly as always.'),
    (dog_id, '2025-12-18', 'Training Session', 60, 2.5, 22.5, 'Tobacco in varied containers. All detected.'),
    (dog_id, '2026-01-08', 'Training Session', 58, 2.3, 22.5, 'Post-holiday training. Quick to focus.'),
    (dog_id, '2026-01-15', 'Agility', 40, 1.5, 22.5, 'Light agility, nimble movement.'),
    (dog_id, '2026-01-22', 'Training Session', 60, 2.5, 22.5, 'Advanced concealment scenarios.'),
    (dog_id, '2026-02-05', 'Training Session', 60, 2.5, 22.5, 'Mail and parcel sweep training.'),
    (dog_id, '2026-02-19', 'Walk', 20, 1.8, 22.5, 'Recovery walk after long screening mission.');

  -- Duke (UAE-K9-1108)
  SELECT id INTO dog_id FROM dogs WHERE microchip_number = 'UAE-K9-1108';
  INSERT INTO fitness_logs (dog_id, log_date, activity_type, duration_minutes, distance_km, weight_kg, notes) VALUES
    (dog_id, '2025-12-02', 'Training Session', 80, 5.5, 34.2, 'Cargo screening exercise. 15 containers.'),
    (dog_id, '2025-12-09', 'Run', 45, 8.5, 34.1, 'Strong endurance run. Highly fit.'),
    (dog_id, '2025-12-16', 'Training Session', 85, 5.8, 34.0, 'Heavy cargo and vehicle screening drill.'),
    (dog_id, '2026-01-06', 'Training Session', 85, 5.5, 34.0, 'New cargo scenario configurations.'),
    (dog_id, '2026-01-13', 'Run', 45, 8.0, 34.0, 'Endurance run.'),
    (dog_id, '2026-01-20', 'Training Session', 85, 5.5, 34.0, 'Cargo sweep at mock freight terminal.'),
    (dog_id, '2026-02-03', 'Training Session', 85, 5.8, 34.0, 'Pre-AUH cargo op preparation.'),
    (dog_id, '2026-02-17', 'Agility', 55, 2.2, 34.0, 'Agility refresher, maintaining full fitness.');

  -- Rocky (UAE-K9-1109)
  SELECT id INTO dog_id FROM dogs WHERE microchip_number = 'UAE-K9-1109';
  INSERT INTO fitness_logs (dog_id, log_date, activity_type, duration_minutes, distance_km, weight_kg, notes) VALUES
    (dog_id, '2025-12-03', 'Training Session', 68, 3.5, 29.2, 'Phase 4 narcotic detection. 4/6 hits.'),
    (dog_id, '2025-12-10', 'Run', 40, 7.0, 29.1, 'Building endurance for operational duty.'),
    (dog_id, '2025-12-17', 'Training Session', 72, 3.8, 29.0, 'Phase 4 advanced scenarios. 5/6 hits.'),
    (dog_id, '2026-01-07', 'Training Session', 74, 3.9, 29.0, 'Consistency improving. 5/6 hits.'),
    (dog_id, '2026-01-14', 'Agility', 48, 1.9, 29.0, 'Agility training. Fast and responsive.'),
    (dog_id, '2026-01-21', 'Training Session', 76, 4.0, 29.0, 'Near-operational performance. 6/6 hits.'),
    (dog_id, '2026-02-04', 'Training Session', 75, 4.2, 29.0, 'Final Phase 4 evaluation prep.'),
    (dog_id, '2026-02-18', 'Training Session', 75, 4.2, 29.0, 'Consistent high performance.');

  -- Zara (UAE-K9-1110)
  SELECT id INTO dog_id FROM dogs WHERE microchip_number = 'UAE-K9-1110';
  INSERT INTO fitness_logs (dog_id, log_date, activity_type, duration_minutes, distance_km, weight_kg, notes) VALUES
    (dog_id, '2025-12-04', 'Training Session', 45, 1.8, 27.8, 'Kong motivation foundation training.'),
    (dog_id, '2025-12-11', 'Walk', 20, 1.5, 27.7, 'Socialization walk with handler.'),
    (dog_id, '2025-12-18', 'Training Session', 50, 2.0, 27.6, 'Early scent introduction exercises.'),
    (dog_id, '2026-01-07', 'Training Session', 52, 2.1, 27.5, 'Phase 3 introduction. Eager and responsive.'),
    (dog_id, '2026-01-14', 'Agility', 38, 1.4, 27.5, 'Basic agility, building confidence.'),
    (dog_id, '2026-01-21', 'Training Session', 55, 2.2, 27.5, 'Scent discrimination progress.'),
    (dog_id, '2026-02-04', 'Training Session', 55, 2.2, 27.5, 'Phase 3 milestone assessment.'),
    (dog_id, '2026-02-18', 'Training Session', 58, 2.3, 27.5, 'Consistent motivation, good bond with handler.');

END $$;

-- ============================================
-- 4. ADDITIONAL VET RECORDS (prior year)
-- ============================================

DO $$
DECLARE
  dog_id uuid;
BEGIN

  SELECT id INTO dog_id FROM dogs WHERE microchip_number = 'UAE-K9-1101';
  INSERT INTO vet_records (dog_id, visit_date, visit_type, notes, next_visit_date) VALUES
    (dog_id, '2025-04-01', 'Checkup', 'Mid-year health assessment. Excellent overall condition. Weight stable.', '2025-10-01'),
    (dog_id, '2025-04-01', 'Vaccination', 'Annual core vaccine boosters completed. No adverse reactions.', '2026-04-01');

  SELECT id INTO dog_id FROM dogs WHERE microchip_number = 'UAE-K9-1102';
  INSERT INTO vet_records (dog_id, visit_date, visit_type, notes, next_visit_date) VALUES
    (dog_id, '2025-03-15', 'Checkup', 'Spring health check. Luna in excellent condition, coat healthy.', '2025-09-15'),
    (dog_id, '2025-03-15', 'Vaccination', 'DHPP and rabies administered. Cleared for active duty.', '2026-03-15');

  SELECT id INTO dog_id FROM dogs WHERE microchip_number = 'UAE-K9-1103';
  INSERT INTO vet_records (dog_id, visit_date, visit_type, notes, next_visit_date) VALUES
    (dog_id, '2025-04-10', 'Checkup', 'Physical evaluation. Rex fit for Phase 4 training.', '2025-11-10'),
    (dog_id, '2025-04-10', 'Vaccination', 'Vaccinations updated. Cleared for training program.', '2026-04-10');

  SELECT id INTO dog_id FROM dogs WHERE microchip_number = 'UAE-K9-1104';
  INSERT INTO vet_records (dog_id, visit_date, visit_type, notes, next_visit_date) VALUES
    (dog_id, '2025-04-20', 'Checkup', 'Semi-annual checkup. Shadow slightly overweight, advised reduced portions.', '2025-10-20'),
    (dog_id, '2025-04-20', 'Vaccination', 'Annual vaccines administered. Shadow in good health.', '2026-04-20');

  SELECT id INTO dog_id FROM dogs WHERE microchip_number = 'UAE-K9-1105';
  INSERT INTO vet_records (dog_id, visit_date, visit_type, notes, next_visit_date) VALUES
    (dog_id, '2025-03-05', 'Checkup', 'Pre-deployment health check. Bella fully fit for operations.', '2025-08-05'),
    (dog_id, '2025-04-10', 'Vaccination', 'Vaccinations updated. Bella cleared for mission work.', '2026-04-10');

  SELECT id INTO dog_id FROM dogs WHERE microchip_number = 'UAE-K9-1106';
  INSERT INTO vet_records (dog_id, visit_date, visit_type, notes, next_visit_date) VALUES
    (dog_id, '2025-04-12', 'Checkup', 'Initial K9 unit assessment. Max shows outstanding potential.', '2025-11-01'),
    (dog_id, '2025-04-12', 'Vaccination', 'Full vaccination course for training program entry.', '2026-04-12');

  SELECT id INTO dog_id FROM dogs WHERE microchip_number = 'UAE-K9-1107';
  INSERT INTO vet_records (dog_id, visit_date, visit_type, notes, next_visit_date) VALUES
    (dog_id, '2025-03-22', 'Dental', 'Routine dental exam. Clean teeth, minor plaque removed.', '2026-03-22'),
    (dog_id, '2025-03-22', 'Vaccination', 'Spring vaccinations. Nala in perfect health.', '2026-03-22');

  SELECT id INTO dog_id FROM dogs WHERE microchip_number = 'UAE-K9-1108';
  INSERT INTO vet_records (dog_id, visit_date, visit_type, notes, next_visit_date) VALUES
    (dog_id, '2025-04-12', 'Checkup', 'Duke cleared for intensive cargo operations. Physically excellent.', '2025-10-12'),
    (dog_id, '2025-04-12', 'Vaccination', 'Vaccines current. Duke fully operational.', '2026-04-12');

  SELECT id INTO dog_id FROM dogs WHERE microchip_number = 'UAE-K9-1109';
  INSERT INTO vet_records (dog_id, visit_date, visit_type, notes, next_visit_date) VALUES
    (dog_id, '2025-05-05', 'Checkup', 'Entry checkup. Rocky healthy and ready for Phase 4 training.', '2025-11-05'),
    (dog_id, '2025-05-05', 'Vaccination', 'Full vaccine course completed for active duty eligibility.', '2026-05-05');

  SELECT id INTO dog_id FROM dogs WHERE microchip_number = 'UAE-K9-1110';
  INSERT INTO vet_records (dog_id, visit_date, visit_type, notes, next_visit_date) VALUES
    (dog_id, '2025-05-18', 'Checkup', 'Intake examination. Zara young and healthy, fit for training.', '2025-11-18'),
    (dog_id, '2025-05-18', 'Vaccination', 'Initial vaccination course administered. No adverse reactions.', '2026-05-18');

END $$;
