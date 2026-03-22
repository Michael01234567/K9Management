/*
  # Add 10 New Dogs with Handler and Officer Assignments

  ## Summary
  Adds 10 new operational K9 dogs across all specializations (Narcotic, Explosive,
  Currency, Tobacco, Patrol) with realistic breeds, weights, training levels, and
  UAE-format microchip numbers continuing from the existing sequence (UAE-K9-1111
  through UAE-K9-1120).

  ## New Data

  ### dogs (10 new rows)
  - Atlas, Bruno, Cairo, Diesel, Echo, Falcon, Ghost, Hunter, Indigo, Jasper
  - Breeds: German Shepherd, Belgian Malinois, Labrador Retriever, Dutch Shepherd, Springer Spaniel
  - Specializations: Narcotic, Explosive, Currency, Tobacco, Patrol
  - Training levels: Operational, Phase 3, Phase 4

  ### handlers (6 new rows — employee IDs 150115–150120)
  - Required because only 4 existing handlers were unassigned

  ### mission_officers (6 new rows — employee IDs ICP-K9 001–006)
  - Required because only 4 existing officers were unassigned

  ### dog_handler + dog_officer (10 rows each)
  - Every new dog gets exactly one handler and one officer
  - Respects the unique_dog_in_dog_handler and unique_dog_in_dog_officer constraints

  ## Security
  No RLS changes — existing policies cover new rows.
*/

-- ============================================================
-- 1. Insert 6 new handlers (employee IDs 150115-150120)
-- ============================================================
INSERT INTO handlers (id, employee_id, full_name, email, phone, team_leader, driver, created_at, updated_at) VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', '150115', 'Tariq Al Hamdan',   'tariq.alhamdan@customs.ae',   '+971501234561', false, false, now(), now()),
  ('a1b2c3d4-0002-0002-0002-000000000002', '150116', 'Nouf Al Rashidi',   'nouf.alrashidi@customs.ae',   '+971501234562', false, false, now(), now()),
  ('a1b2c3d4-0003-0003-0003-000000000003', '150117', 'Mansoor Al Khoori', 'mansoor.alkhoori@customs.ae', '+971501234563', false, false, now(), now()),
  ('a1b2c3d4-0004-0004-0004-000000000004', '150118', 'Latifa Al Marri',   'latifa.almarri@customs.ae',   '+971501234564', false, false, now(), now()),
  ('a1b2c3d4-0005-0005-0005-000000000005', '150119', 'Zayed Al Qubaisi',  'zayed.alqubaisi@customs.ae',  '+971501234565', false, false, now(), now()),
  ('a1b2c3d4-0006-0006-0006-000000000006', '150120', 'Reem Al Neyadi',    'reem.alneyadi@customs.ae',    '+971501234566', false, false, now(), now());

-- ============================================================
-- 2. Insert 6 new mission officers (ICP-K9 001–006)
-- ============================================================
INSERT INTO mission_officers (id, employee_id, full_name, email, phone, created_at, updated_at) VALUES
  ('b1c2d3e4-0001-0001-0001-000000000001', 'ICP-K9 001', 'Tariq Al Hamdan',   'tariq.alhamdan@icp.gov.ae',   '+971502345671', now(), now()),
  ('b1c2d3e4-0002-0002-0002-000000000002', 'ICP-K9 002', 'Nouf Al Rashidi',   'nouf.alrashidi@icp.gov.ae',   '+971502345672', now(), now()),
  ('b1c2d3e4-0003-0003-0003-000000000003', 'ICP-K9 003', 'Mansoor Al Khoori', 'mansoor.alkhoori@icp.gov.ae', '+971502345673', now(), now()),
  ('b1c2d3e4-0004-0004-0004-000000000004', 'ICP-K9 004', 'Latifa Al Marri',   'latifa.almarri@icp.gov.ae',   '+971502345674', now(), now()),
  ('b1c2d3e4-0005-0005-0005-000000000005', 'ICP-K9 005', 'Zayed Al Qubaisi',  'zayed.alqubaisi@icp.gov.ae',  '+971502345675', now(), now()),
  ('b1c2d3e4-0006-0006-0006-000000000006', 'ICP-K9 006', 'Reem Al Neyadi',    'reem.alneyadi@icp.gov.ae',    '+971502345676', now(), now());

-- ============================================================
-- 3. Insert 10 new dogs
-- ============================================================
INSERT INTO dogs (id, name, breed, sex, microchip_number, dob, training_level, specialization, location, location_id, origin, note, weight_kg, default_handler_id, created_at, updated_at) VALUES
  ('c1d2e3f4-0001-0001-0001-000000000001',
   'Atlas', 'German Shepherd', 'Male', 'UAE-K9-1111', '2021-03-12',
   'Operational', 'Explosive',
   'Dubai International Airport (DXB)', 'f8c1f5e0-9609-4468-b4b8-59431e1c93f5',
   'Germany', 'High-drive explosive detection specialist', 32.5,
   '511fd9d2-0f14-4d01-b72f-1b9888d3a58c', now(), now()),

  ('c1d2e3f4-0002-0002-0002-000000000002',
   'Bruno', 'Belgian Malinois', 'Male', 'UAE-K9-1112', '2020-07-08',
   'Operational', 'Narcotic',
   'Abu Dhabi International Airport (AUH)', '1d3b9f76-482d-421d-a487-3c531403f06a',
   'Belgium', 'Elite narcotic detection unit', 29.0,
   '214b3826-f651-44c7-b195-f04c162c6807', now(), now()),

  ('c1d2e3f4-0003-0003-0003-000000000003',
   'Cairo', 'Labrador Retriever', 'Male', 'UAE-K9-1113', '2022-01-20',
   'Phase 4', 'Currency',
   'Sharjah International Airport (SHJ)', 'a4b70724-d492-4302-8ab4-41dd5d92320a',
   'UAE', 'Currency detection in training progression', 31.0,
   '08079288-68a8-444d-94a7-028e70de1ef0', now(), now()),

  ('c1d2e3f4-0004-0004-0004-000000000004',
   'Diesel', 'Dutch Shepherd', 'Male', 'UAE-K9-1114', '2019-11-05',
   'Operational', 'Patrol',
   'Al Maktoum International Airport (DWC)', 'ba009c2d-ce43-46a9-912d-6459e0924cdf',
   'Netherlands', 'Experienced patrol and crowd control K9', 34.0,
   '6b0f50db-48a5-4d64-8531-00b5b508df75', now(), now()),

  ('c1d2e3f4-0005-0005-0005-000000000005',
   'Echo', 'Springer Spaniel', 'Female', 'UAE-K9-1115', '2022-06-14',
   'Operational', 'Tobacco',
   'Ras Al Khaimah International Airport (RKT)', '16ebd4e3-f40e-450e-aa07-910a1c2ef73f',
   'UK', 'Specialist tobacco and contraband detection', 22.0,
   'a1b2c3d4-0001-0001-0001-000000000001', now(), now()),

  ('c1d2e3f4-0006-0006-0006-000000000006',
   'Falcon', 'Belgian Malinois', 'Male', 'UAE-K9-1116', '2021-09-30',
   'Operational', 'Explosive',
   'Fujairah International Airport (FJR)', '20707358-7d2d-4f81-8005-e304967bf673',
   'Netherlands', 'IED and explosives detection', 28.5,
   'a1b2c3d4-0002-0002-0002-000000000002', now(), now()),

  ('c1d2e3f4-0007-0007-0007-000000000007',
   'Ghost', 'German Shepherd', 'Male', 'UAE-K9-1117', '2020-04-22',
   'Operational', 'Narcotic',
   'Al Ghuwaifat Border Crossing', 'f2e9c73c-07db-4747-9e51-e83ba875af1a',
   'Czech Republic', 'Multi-substance narcotic detection', 31.5,
   'a1b2c3d4-0003-0003-0003-000000000003', now(), now()),

  ('c1d2e3f4-0008-0008-0008-000000000008',
   'Hunter', 'Labrador Retriever', 'Male', 'UAE-K9-1118', '2021-12-01',
   'Phase 3', 'Currency',
   'Hatta Border Crossing', '47d27c8f-fb64-4e98-adbc-67ff191fb892',
   'UAE', 'Currency detection — Phase 3 evaluation pending', 30.5,
   'a1b2c3d4-0004-0004-0004-000000000004', now(), now()),

  ('c1d2e3f4-0009-0009-0009-000000000009',
   'Indigo', 'Belgian Malinois', 'Female', 'UAE-K9-1119', '2022-08-17',
   'Phase 4', 'Explosive',
   'Al Ain (Mezyad) Border Crossing', 'd9425d0e-c0eb-4e63-b00b-fcd90954149b',
   'Belgium', 'Explosive detection in advanced training', 26.0,
   'a1b2c3d4-0005-0005-0005-000000000005', now(), now()),

  ('c1d2e3f4-0010-0010-0010-000000000010',
   'Jasper', 'Dutch Shepherd', 'Male', 'UAE-K9-1120', '2020-02-28',
   'Operational', 'Patrol',
   'Al Wajajah Border Crossing', 'dfe3a37a-2fad-4a73-a9c6-1f299b3cc81f',
   'Netherlands', 'Patrol specialist — border security operations', 33.0,
   'a1b2c3d4-0006-0006-0006-000000000006', now(), now());

-- ============================================================
-- 4. Assign each dog to exactly one handler (dog_handler)
-- ============================================================
INSERT INTO dog_handler (dog_id, handler_id) VALUES
  ('c1d2e3f4-0001-0001-0001-000000000001', '511fd9d2-0f14-4d01-b72f-1b9888d3a58c'),
  ('c1d2e3f4-0002-0002-0002-000000000002', '214b3826-f651-44c7-b195-f04c162c6807'),
  ('c1d2e3f4-0003-0003-0003-000000000003', '08079288-68a8-444d-94a7-028e70de1ef0'),
  ('c1d2e3f4-0004-0004-0004-000000000004', '6b0f50db-48a5-4d64-8531-00b5b508df75'),
  ('c1d2e3f4-0005-0005-0005-000000000005', 'a1b2c3d4-0001-0001-0001-000000000001'),
  ('c1d2e3f4-0006-0006-0006-000000000006', 'a1b2c3d4-0002-0002-0002-000000000002'),
  ('c1d2e3f4-0007-0007-0007-000000000007', 'a1b2c3d4-0003-0003-0003-000000000003'),
  ('c1d2e3f4-0008-0008-0008-000000000008', 'a1b2c3d4-0004-0004-0004-000000000004'),
  ('c1d2e3f4-0009-0009-0009-000000000009', 'a1b2c3d4-0005-0005-0005-000000000005'),
  ('c1d2e3f4-0010-0010-0010-000000000010', 'a1b2c3d4-0006-0006-0006-000000000006');

-- ============================================================
-- 5. Assign each dog to exactly one officer (dog_officer)
-- ============================================================
INSERT INTO dog_officer (dog_id, officer_id) VALUES
  ('c1d2e3f4-0001-0001-0001-000000000001', 'a88a66c9-97a5-402a-b9c5-35611cfdb062'),
  ('c1d2e3f4-0002-0002-0002-000000000002', 'e4100fe3-afcf-4486-b479-88fe716c42fb'),
  ('c1d2e3f4-0003-0003-0003-000000000003', '634daee5-8429-408c-8343-2911c041ef29'),
  ('c1d2e3f4-0004-0004-0004-000000000004', '2561ea45-c994-461b-85da-e3279eaab0d0'),
  ('c1d2e3f4-0005-0005-0005-000000000005', 'b1c2d3e4-0001-0001-0001-000000000001'),
  ('c1d2e3f4-0006-0006-0006-000000000006', 'b1c2d3e4-0002-0002-0002-000000000002'),
  ('c1d2e3f4-0007-0007-0007-000000000007', 'b1c2d3e4-0003-0003-0003-000000000003'),
  ('c1d2e3f4-0008-0008-0008-000000000008', 'b1c2d3e4-0004-0004-0004-000000000004'),
  ('c1d2e3f4-0009-0009-0009-000000000009', 'b1c2d3e4-0005-0005-0005-000000000005'),
  ('c1d2e3f4-0010-0010-0010-000000000010', 'b1c2d3e4-0006-0006-0006-000000000006');
