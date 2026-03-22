/*
  # Add Missing Locations and More Missions

  ## Overview
  Restores missing data:

  1. Locations Table
     - Adds all UAE airports and border crossings to match mission_locations table
     - Previously only had 3 airport locations; now has all 12

  2. Missions
     - Adds 12 more missions spread across all location types
     - Mix of Completed, Active, On Standby, and Cancelled statuses
     - Covers airports, border crossings, and special operations
     - Spans from late 2025 through March 2026
*/

-- ============================================
-- 1. ADD MISSING LOCATIONS
-- ============================================

INSERT INTO locations (name) VALUES
  ('Al Maktoum International Airport (DWC)'),
  ('Ras Al Khaimah International Airport (RKT)'),
  ('Fujairah International Airport (FJR)'),
  ('Al Ghuwaifat Border Crossing'),
  ('Hatta Border Crossing'),
  ('Al Ain (Mezyad) Border Crossing'),
  ('Al Wajajah Border Crossing'),
  ('Al Dhafra Border Crossing'),
  ('Khatmat Malaha Border Crossing')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. ADD MORE MISSIONS
-- ============================================

-- Mission 9: Completed - Ras Al Khaimah Airport narcotics
INSERT INTO missions (
  date, mission_location_id, departure_time, return_time,
  explosive_dog_ids, narcotic_dog_ids, handler_ids,
  explosive_teams, narcotic_teams,
  mission_officer_id, team_leader_id, driver_id,
  training, search, num_items_searched, items_searched_ids, items_with_quantities,
  indication, confirmed_indication, comments, status
)
SELECT
  '2026-03-01',
  ml.id,
  '07:00', '15:00',
  ARRAY[]::uuid[],
  ARRAY[luna.id, rocky.id],
  ARRAY[h2.id, h9.id, h3.id],
  '[]'::jsonb,
  jsonb_build_array(
    jsonb_build_object('dog_id', luna.id, 'handler_id', h2.id),
    jsonb_build_object('dog_id', rocky.id, 'handler_id', h9.id)
  ),
  mo3.id, h2.id, h3.id,
  false, true, 280,
  ARRAY[bags.id, backpacks.id],
  jsonb_build_array(
    jsonb_build_object('item_id', bags.id, 'quantity', 180),
    jsonb_build_object('item_id', backpacks.id, 'quantity', 100)
  ),
  false, false,
  'Passenger baggage screening. All items cleared. Good cooperation from airport staff.',
  'Completed'
FROM mission_locations ml, dogs luna, dogs rocky,
     handlers h2, handlers h3, handlers h9,
     mission_officers mo3,
     items bags, items backpacks
WHERE ml.name = 'Ras Al Khaimah International Airport (RKT)'
  AND luna.microchip_number = 'UAE-K9-1102'
  AND rocky.microchip_number = 'UAE-K9-1109'
  AND h2.employee_id = '150102'
  AND h3.employee_id = '150103'
  AND h9.employee_id = '150109'
  AND mo3.employee_id = 'ICP-FCA 003'
  AND bags.name = 'Bags'
  AND backpacks.name = 'Backpacks';

-- Mission 10: Completed - Fujairah Airport explosive sweep
INSERT INTO missions (
  date, mission_location_id, departure_time, return_time,
  explosive_dog_ids, narcotic_dog_ids, handler_ids,
  explosive_teams, narcotic_teams,
  mission_officer_id, team_leader_id, driver_id,
  training, search, num_items_searched, items_searched_ids, items_with_quantities,
  indication, confirmed_indication, comments, status
)
SELECT
  '2026-02-25',
  ml.id,
  '08:00', '14:00',
  ARRAY[thunder.id, rex.id],
  ARRAY[]::uuid[],
  ARRAY[h1.id, h3.id, h4.id],
  jsonb_build_array(
    jsonb_build_object('dog_id', thunder.id, 'handler_id', h1.id),
    jsonb_build_object('dog_id', rex.id, 'handler_id', h3.id)
  ),
  '[]'::jsonb,
  mo4.id, h1.id, h4.id,
  false, true, 320,
  ARRAY[bags.id, cargo.id],
  jsonb_build_array(
    jsonb_build_object('item_id', bags.id, 'quantity', 200),
    jsonb_build_object('item_id', cargo.id, 'quantity', 120)
  ),
  false, false,
  'Joint explosive sweep covering arrivals and cargo terminal. No findings.',
  'Completed'
FROM mission_locations ml, dogs thunder, dogs rex,
     handlers h1, handlers h3, handlers h4,
     mission_officers mo4,
     items bags, items cargo
WHERE ml.name = 'Fujairah International Airport (FJR)'
  AND thunder.microchip_number = 'UAE-K9-1101'
  AND rex.microchip_number = 'UAE-K9-1103'
  AND h1.employee_id = '150101'
  AND h3.employee_id = '150103'
  AND h4.employee_id = '150104'
  AND mo4.employee_id = 'ICP-FCA 004'
  AND bags.name = 'Bags'
  AND cargo.name = 'Cargo Containers';

-- Mission 11: Completed - Al Maktoum Airport (DWC) cargo
INSERT INTO missions (
  date, mission_location_id, departure_time, return_time,
  explosive_dog_ids, narcotic_dog_ids, handler_ids,
  explosive_teams, narcotic_teams,
  mission_officer_id, team_leader_id, driver_id,
  training, search, num_items_searched, items_searched_ids, items_with_quantities,
  indication, confirmed_indication, comments, status
)
SELECT
  '2026-02-20',
  ml.id,
  '05:30', '14:30',
  ARRAY[duke.id],
  ARRAY[bella.id],
  ARRAY[h8.id, h5.id, h6.id],
  jsonb_build_array(
    jsonb_build_object('dog_id', duke.id, 'handler_id', h8.id)
  ),
  jsonb_build_array(
    jsonb_build_object('dog_id', bella.id, 'handler_id', h5.id)
  ),
  mo5.id, h8.id, h6.id,
  false, true, 150,
  ARRAY[cargo.id, vehicles.id],
  jsonb_build_array(
    jsonb_build_object('item_id', cargo.id, 'quantity', 100),
    jsonb_build_object('item_id', vehicles.id, 'quantity', 50)
  ),
  true, true,
  'Narcotic indication confirmed in cargo unit. Substance seized and handed to authorities. Excellent teamwork.',
  'Completed'
FROM mission_locations ml, dogs duke, dogs bella,
     handlers h5, handlers h6, handlers h8,
     mission_officers mo5,
     items cargo, items vehicles
WHERE ml.name = 'Al Maktoum International Airport (DWC)'
  AND duke.microchip_number = 'UAE-K9-1108'
  AND bella.microchip_number = 'UAE-K9-1105'
  AND h5.employee_id = '150105'
  AND h6.employee_id = '150106'
  AND h8.employee_id = '150108'
  AND mo5.employee_id = 'ICP-POL 001'
  AND cargo.name = 'Cargo Containers'
  AND vehicles.name = 'Vehicles';

-- Mission 12: Completed - Al Ain (Mezyad) Border crossing
INSERT INTO missions (
  date, mission_location_id, departure_time, return_time,
  explosive_dog_ids, narcotic_dog_ids, handler_ids,
  explosive_teams, narcotic_teams,
  mission_officer_id, team_leader_id, driver_id,
  training, search, num_items_searched, items_searched_ids, items_with_quantities,
  indication, confirmed_indication, comments, status
)
SELECT
  '2026-02-15',
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
  mo6.id, h1.id, h10.id,
  false, true, 210,
  ARRAY[vehicles.id, parcels.id],
  jsonb_build_array(
    jsonb_build_object('item_id', vehicles.id, 'quantity', 160),
    jsonb_build_object('item_id', parcels.id, 'quantity', 50)
  ),
  false, false,
  'Al Ain land border vehicle and parcel screening. All cleared.',
  'Completed'
FROM mission_locations ml, dogs thunder, dogs nala,
     handlers h1, handlers h7, handlers h10,
     mission_officers mo6,
     items vehicles, items parcels
WHERE ml.name = 'Al Ain (Mezyad) Border Crossing'
  AND thunder.microchip_number = 'UAE-K9-1101'
  AND nala.microchip_number = 'UAE-K9-1107'
  AND h1.employee_id = '150101'
  AND h7.employee_id = '150107'
  AND h10.employee_id = '150110'
  AND mo6.employee_id = 'ICP-POL 001'
  AND vehicles.name = 'Vehicles'
  AND parcels.name = 'Parcels';

-- Mission 13: Completed - Khatmat Malaha Border tobacco find
INSERT INTO missions (
  date, mission_location_id, departure_time, return_time,
  explosive_dog_ids, narcotic_dog_ids, handler_ids,
  explosive_teams, narcotic_teams,
  mission_officer_id, team_leader_id, driver_id,
  training, search, num_items_searched, items_searched_ids, items_with_quantities,
  indication, confirmed_indication, comments, status
)
SELECT
  '2026-02-10',
  ml.id,
  '07:00', '17:00',
  ARRAY[]::uuid[],
  ARRAY[nala.id, luna.id],
  ARRAY[h7.id, h2.id, h4.id],
  '[]'::jsonb,
  jsonb_build_array(
    jsonb_build_object('dog_id', nala.id, 'handler_id', h7.id),
    jsonb_build_object('dog_id', luna.id, 'handler_id', h2.id)
  ),
  mo7.id, h2.id, h4.id,
  false, true, 175,
  ARRAY[vehicles.id, backpacks.id],
  jsonb_build_array(
    jsonb_build_object('item_id', vehicles.id, 'quantity', 130),
    jsonb_build_object('item_id', backpacks.id, 'quantity', 45)
  ),
  true, true,
  'Nala indicated on concealed tobacco in vehicle compartment. Large quantity seized. Report filed.',
  'Completed'
FROM mission_locations ml, dogs nala, dogs luna,
     handlers h2, handlers h4, handlers h7,
     mission_officers mo7,
     items vehicles, items backpacks
WHERE ml.name = 'Khatmat Malaha Border Crossing'
  AND nala.microchip_number = 'UAE-K9-1107'
  AND luna.microchip_number = 'UAE-K9-1102'
  AND h2.employee_id = '150102'
  AND h4.employee_id = '150104'
  AND h7.employee_id = '150107'
  AND mo7.employee_id = 'ICP-POL 002'
  AND vehicles.name = 'Vehicles'
  AND backpacks.name = 'Backpacks';

-- Mission 14: Completed - Al Wajajah Border currency find
INSERT INTO missions (
  date, mission_location_id, departure_time, return_time,
  explosive_dog_ids, narcotic_dog_ids, handler_ids,
  explosive_teams, narcotic_teams,
  mission_officer_id, team_leader_id, driver_id,
  training, search, num_items_searched, items_searched_ids, items_with_quantities,
  indication, confirmed_indication, comments, status
)
SELECT
  '2026-02-05',
  ml.id,
  '06:30', '15:30',
  ARRAY[]::uuid[],
  ARRAY[shadow.id],
  ARRAY[h4.id, h5.id, h9.id],
  '[]'::jsonb,
  jsonb_build_array(
    jsonb_build_object('dog_id', shadow.id, 'handler_id', h4.id)
  ),
  mo8.id, h4.id, h9.id,
  false, true, 140,
  ARRAY[vehicles.id, bags.id],
  jsonb_build_array(
    jsonb_build_object('item_id', vehicles.id, 'quantity', 100),
    jsonb_build_object('item_id', bags.id, 'quantity', 40)
  ),
  true, true,
  'Shadow indicated undeclared currency exceeding legal limit. AED 450,000 seized. Referred to financial crimes unit.',
  'Completed'
FROM mission_locations ml, dogs shadow,
     handlers h4, handlers h5, handlers h9,
     mission_officers mo8,
     items vehicles, items bags
WHERE ml.name = 'Al Wajajah Border Crossing'
  AND shadow.microchip_number = 'UAE-K9-1104'
  AND h4.employee_id = '150104'
  AND h5.employee_id = '150105'
  AND h9.employee_id = '150109'
  AND mo8.employee_id = 'ICP-POL 003'
  AND vehicles.name = 'Vehicles'
  AND bags.name = 'Bags';

-- Mission 15: Completed - DXB mail and parcel sweep
INSERT INTO missions (
  date, mission_location_id, departure_time, return_time,
  explosive_dog_ids, narcotic_dog_ids, handler_ids,
  explosive_teams, narcotic_teams,
  mission_officer_id, team_leader_id, driver_id,
  training, search, num_items_searched, items_searched_ids, items_with_quantities,
  indication, confirmed_indication, comments, status
)
SELECT
  '2026-01-28',
  ml.id,
  '09:00', '17:00',
  ARRAY[rex.id],
  ARRAY[bella.id, rocky.id],
  ARRAY[h3.id, h5.id, h9.id, h1.id],
  jsonb_build_array(
    jsonb_build_object('dog_id', rex.id, 'handler_id', h3.id)
  ),
  jsonb_build_array(
    jsonb_build_object('dog_id', bella.id, 'handler_id', h5.id),
    jsonb_build_object('dog_id', rocky.id, 'handler_id', h9.id)
  ),
  mo2.id, h1.id, h3.id,
  false, true, 520,
  ARRAY[mail.id, parcels.id, bags.id],
  jsonb_build_array(
    jsonb_build_object('item_id', mail.id, 'quantity', 200),
    jsonb_build_object('item_id', parcels.id, 'quantity', 180),
    jsonb_build_object('item_id', bags.id, 'quantity', 140)
  ),
  false, false,
  'Large-scale mail and parcel screening at DXB postal hub. No contraband detected.',
  'Completed'
FROM mission_locations ml, dogs rex, dogs bella, dogs rocky,
     handlers h1, handlers h3, handlers h5, handlers h9,
     mission_officers mo2,
     items mail, items parcels, items bags
WHERE ml.name = 'Dubai International Airport (DXB)'
  AND rex.microchip_number = 'UAE-K9-1103'
  AND bella.microchip_number = 'UAE-K9-1105'
  AND rocky.microchip_number = 'UAE-K9-1109'
  AND h1.employee_id = '150101'
  AND h3.employee_id = '150103'
  AND h5.employee_id = '150105'
  AND h9.employee_id = '150109'
  AND mo2.employee_id = 'ICP-FCA 002'
  AND mail.name = 'Mail'
  AND parcels.name = 'Parcels'
  AND bags.name = 'Bags';

-- Mission 16: Completed - Al Dhafra Border full team
INSERT INTO missions (
  date, mission_location_id, departure_time, return_time,
  explosive_dog_ids, narcotic_dog_ids, handler_ids,
  explosive_teams, narcotic_teams,
  mission_officer_id, team_leader_id, driver_id,
  training, search, num_items_searched, items_searched_ids, items_with_quantities,
  indication, confirmed_indication, comments, status
)
SELECT
  '2026-01-20',
  ml.id,
  '06:00', '18:00',
  ARRAY[duke.id, thunder.id],
  ARRAY[luna.id],
  ARRAY[h8.id, h1.id, h2.id, h6.id],
  jsonb_build_array(
    jsonb_build_object('dog_id', duke.id, 'handler_id', h8.id),
    jsonb_build_object('dog_id', thunder.id, 'handler_id', h1.id)
  ),
  jsonb_build_array(
    jsonb_build_object('dog_id', luna.id, 'handler_id', h2.id)
  ),
  mo9.id, h8.id, h6.id,
  false, true, 190,
  ARRAY[vehicles.id, cargo.id],
  jsonb_build_array(
    jsonb_build_object('item_id', vehicles.id, 'quantity', 130),
    jsonb_build_object('item_id', cargo.id, 'quantity', 60)
  ),
  false, false,
  'Border patrol support at Al Dhafra. Full screening completed without incident.',
  'Completed'
FROM mission_locations ml, dogs duke, dogs thunder, dogs luna,
     handlers h1, handlers h2, handlers h6, handlers h8,
     mission_officers mo9,
     items vehicles, items cargo
WHERE ml.name = 'Al Dhafra Border Crossing'
  AND duke.microchip_number = 'UAE-K9-1108'
  AND thunder.microchip_number = 'UAE-K9-1101'
  AND luna.microchip_number = 'UAE-K9-1102'
  AND h1.employee_id = '150101'
  AND h2.employee_id = '150102'
  AND h6.employee_id = '150106'
  AND h8.employee_id = '150108'
  AND mo9.employee_id = 'ICP-POL 004'
  AND vehicles.name = 'Vehicles'
  AND cargo.name = 'Cargo Containers';

-- Mission 17: Completed - AUH training exercise
INSERT INTO missions (
  date, mission_location_id, departure_time, return_time,
  explosive_dog_ids, narcotic_dog_ids, handler_ids,
  explosive_teams, narcotic_teams,
  mission_officer_id, team_leader_id, driver_id,
  training, search, num_items_searched, items_searched_ids, items_with_quantities,
  indication, confirmed_indication, comments, status
)
SELECT
  '2026-01-15',
  ml.id,
  '07:00', '13:00',
  ARRAY[max_dog.id, rex.id],
  ARRAY[rocky.id, zara.id],
  ARRAY[h6.id, h3.id, h9.id, h10.id, h1.id],
  jsonb_build_array(
    jsonb_build_object('dog_id', max_dog.id, 'handler_id', h6.id),
    jsonb_build_object('dog_id', rex.id, 'handler_id', h3.id)
  ),
  jsonb_build_array(
    jsonb_build_object('dog_id', rocky.id, 'handler_id', h9.id),
    jsonb_build_object('dog_id', zara.id, 'handler_id', h10.id)
  ),
  mo10.id, h1.id, h6.id,
  true, true, 80,
  ARRAY[bags.id, vehicles.id, parcels.id],
  jsonb_build_array(
    jsonb_build_object('item_id', bags.id, 'quantity', 30),
    jsonb_build_object('item_id', vehicles.id, 'quantity', 20),
    jsonb_build_object('item_id', parcels.id, 'quantity', 30)
  ),
  false, false,
  'Training exercise for Phase 3 and 4 dogs at AUH terminal. All trainees showed significant progress.',
  'Completed'
FROM mission_locations ml, dogs max_dog, dogs rex, dogs rocky, dogs zara,
     handlers h1, handlers h3, handlers h6, handlers h9, handlers h10,
     mission_officers mo10,
     items bags, items vehicles, items parcels
WHERE ml.name = 'Abu Dhabi International Airport (AUH)'
  AND max_dog.microchip_number = 'UAE-K9-1106'
  AND rex.microchip_number = 'UAE-K9-1103'
  AND rocky.microchip_number = 'UAE-K9-1109'
  AND zara.microchip_number = 'UAE-K9-1110'
  AND h1.employee_id = '150101'
  AND h3.employee_id = '150103'
  AND h6.employee_id = '150106'
  AND h9.employee_id = '150109'
  AND h10.employee_id = '150110'
  AND mo10.employee_id = 'ICP-POL 005'
  AND bags.name = 'Bags'
  AND vehicles.name = 'Vehicles'
  AND parcels.name = 'Parcels';

-- Mission 18: Completed - Hatta Border Dec 2025
INSERT INTO missions (
  date, mission_location_id, departure_time, return_time,
  explosive_dog_ids, narcotic_dog_ids, handler_ids,
  explosive_teams, narcotic_teams,
  mission_officer_id, team_leader_id, driver_id,
  training, search, num_items_searched, items_searched_ids, items_with_quantities,
  indication, confirmed_indication, comments, status
)
SELECT
  '2025-12-20',
  ml.id,
  '06:00', '16:00',
  ARRAY[duke.id],
  ARRAY[bella.id],
  ARRAY[h8.id, h5.id, h7.id],
  jsonb_build_array(
    jsonb_build_object('dog_id', duke.id, 'handler_id', h8.id)
  ),
  jsonb_build_array(
    jsonb_build_object('dog_id', bella.id, 'handler_id', h5.id)
  ),
  mo1.id, h8.id, h7.id,
  false, true, 115,
  ARRAY[vehicles.id, backpacks.id],
  jsonb_build_array(
    jsonb_build_object('item_id', vehicles.id, 'quantity', 90),
    jsonb_build_object('item_id', backpacks.id, 'quantity', 25)
  ),
  false, false,
  'Pre-holiday border screening. High vehicle volume managed effectively. All clear.',
  'Completed'
FROM mission_locations ml, dogs duke, dogs bella,
     handlers h5, handlers h7, handlers h8,
     mission_officers mo1,
     items vehicles, items backpacks
WHERE ml.name = 'Hatta Border Crossing'
  AND duke.microchip_number = 'UAE-K9-1108'
  AND bella.microchip_number = 'UAE-K9-1105'
  AND h5.employee_id = '150105'
  AND h7.employee_id = '150107'
  AND h8.employee_id = '150108'
  AND mo1.employee_id = 'ICP-FCA 001'
  AND vehicles.name = 'Vehicles'
  AND backpacks.name = 'Backpacks';

-- Mission 19: Completed - SHJ Dec 2025 narcotics
INSERT INTO missions (
  date, mission_location_id, departure_time, return_time,
  explosive_dog_ids, narcotic_dog_ids, handler_ids,
  explosive_teams, narcotic_teams,
  mission_officer_id, team_leader_id, driver_id,
  training, search, num_items_searched, items_searched_ids, items_with_quantities,
  indication, confirmed_indication, comments, status
)
SELECT
  '2025-12-15',
  ml.id,
  '08:00', '16:00',
  ARRAY[thunder.id],
  ARRAY[luna.id],
  ARRAY[h1.id, h2.id, h4.id],
  jsonb_build_array(
    jsonb_build_object('dog_id', thunder.id, 'handler_id', h1.id)
  ),
  jsonb_build_array(
    jsonb_build_object('dog_id', luna.id, 'handler_id', h2.id)
  ),
  mo4.id, h1.id, h4.id,
  false, true, 410,
  ARRAY[bags.id, suitcases.id, mail.id],
  jsonb_build_array(
    jsonb_build_object('item_id', bags.id, 'quantity', 200),
    jsonb_build_object('item_id', suitcases.id, 'quantity', 150),
    jsonb_build_object('item_id', mail.id, 'quantity', 60)
  ),
  true, true,
  'Narcotic substance found concealed in checked luggage. Passenger detained. Case referred to prosecution.',
  'Completed'
FROM mission_locations ml, dogs thunder, dogs luna,
     handlers h1, handlers h2, handlers h4,
     mission_officers mo4,
     items bags, items suitcases, items mail
WHERE ml.name = 'Sharjah International Airport (SHJ)'
  AND thunder.microchip_number = 'UAE-K9-1101'
  AND luna.microchip_number = 'UAE-K9-1102'
  AND h1.employee_id = '150101'
  AND h2.employee_id = '150102'
  AND h4.employee_id = '150104'
  AND mo4.employee_id = 'ICP-FCA 004'
  AND bags.name = 'Bags'
  AND suitcases.name = 'Suitcases'
  AND mail.name = 'Mail';

-- Mission 20: Active - Al Ain (Mezyad) ongoing
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
  '07:00', NULL,
  ARRAY[rex.id],
  ARRAY[nala.id],
  ARRAY[h3.id, h7.id, h9.id],
  jsonb_build_array(
    jsonb_build_object('dog_id', rex.id, 'handler_id', h3.id)
  ),
  jsonb_build_array(
    jsonb_build_object('dog_id', nala.id, 'handler_id', h7.id)
  ),
  mo6.id, h3.id, h9.id,
  false, true, 0,
  ARRAY[vehicles.id],
  '[]'::jsonb,
  false, false,
  'Morning border screening in progress.',
  'Active'
FROM mission_locations ml, dogs rex, dogs nala,
     handlers h3, handlers h7, handlers h9,
     mission_officers mo6,
     items vehicles
WHERE ml.name = 'Al Ain (Mezyad) Border Crossing'
  AND rex.microchip_number = 'UAE-K9-1103'
  AND nala.microchip_number = 'UAE-K9-1107'
  AND h3.employee_id = '150103'
  AND h7.employee_id = '150107'
  AND h9.employee_id = '150109'
  AND mo6.employee_id = 'ICP-POL 001'
  AND vehicles.name = 'Vehicles';

-- Mission 21: On Standby - Fujairah Airport standby team
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
  '09:00', NULL,
  ARRAY[max_dog.id],
  ARRAY[shadow.id],
  ARRAY[h6.id, h4.id, h5.id],
  jsonb_build_array(
    jsonb_build_object('dog_id', max_dog.id, 'handler_id', h6.id)
  ),
  jsonb_build_array(
    jsonb_build_object('dog_id', shadow.id, 'handler_id', h4.id)
  ),
  mo7.id, h6.id, h5.id,
  false, false, 0,
  ARRAY[]::uuid[],
  '[]'::jsonb,
  false, false,
  'Team on standby awaiting flight arrivals.',
  'On Standby'
FROM mission_locations ml, dogs max_dog, dogs shadow,
     handlers h4, handlers h5, handlers h6,
     mission_officers mo7
WHERE ml.name = 'Fujairah International Airport (FJR)'
  AND max_dog.microchip_number = 'UAE-K9-1106'
  AND shadow.microchip_number = 'UAE-K9-1104'
  AND h4.employee_id = '150104'
  AND h5.employee_id = '150105'
  AND h6.employee_id = '150106'
  AND mo7.employee_id = 'ICP-POL 002';
