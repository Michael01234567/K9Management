/*
  # Assign New Dogs to Mission Officers

  1. Assignments
    - Assign the 10 newly created dogs to various mission officers
    - Each dog gets assigned to 1-2 officers for realistic scenarios
    - Random distribution across all available officers

  2. Notes
    - Using dog_officer table for assignments
    - Dogs can have multiple officers assigned
*/

-- Assign dogs to officers (1-2 officers per dog for realistic scenarios)
-- Thunder -> Abdullah Al Suwaidi, Ahmed Al Mansoori
INSERT INTO dog_officer (dog_id, officer_id)
SELECT d.id, o.id
FROM dogs d
CROSS JOIN mission_officers o
WHERE d.name = 'Thunder' 
  AND o.full_name IN ('Abdullah Al Suwaidi', 'Ahmed Al Mansoori');

-- Luna -> Ali Al Qubaisi
INSERT INTO dog_officer (dog_id, officer_id)
SELECT d.id, o.id
FROM dogs d
CROSS JOIN mission_officers o
WHERE d.name = 'Luna' 
  AND o.full_name = 'Ali Al Qubaisi';

-- Rex -> Hassan Al Zaabi, Khalid Al Mazrouei
INSERT INTO dog_officer (dog_id, officer_id)
SELECT d.id, o.id
FROM dogs d
CROSS JOIN mission_officers o
WHERE d.name = 'Rex' 
  AND o.full_name IN ('Hassan Al Zaabi', 'Khalid Al Mazrouei');

-- Shadow -> Mohammed Al Shamsi
INSERT INTO dog_officer (dog_id, officer_id)
SELECT d.id, o.id
FROM dogs d
CROSS JOIN mission_officers o
WHERE d.name = 'Shadow' 
  AND o.full_name = 'Mohammed Al Shamsi';

-- Bella -> Omar Al Ketbi, Rashid Al Nuaimi
INSERT INTO dog_officer (dog_id, officer_id)
SELECT d.id, o.id
FROM dogs d
CROSS JOIN mission_officers o
WHERE d.name = 'Bella' 
  AND o.full_name IN ('Omar Al Ketbi', 'Rashid Al Nuaimi');

-- Max -> Saeed Al Dhaheri
INSERT INTO dog_officer (dog_id, officer_id)
SELECT d.id, o.id
FROM dogs d
CROSS JOIN mission_officers o
WHERE d.name = 'Max' 
  AND o.full_name = 'Saeed Al Dhaheri';

-- Nala -> Sultan Al Ameri
INSERT INTO dog_officer (dog_id, officer_id)
SELECT d.id, o.id
FROM dogs d
CROSS JOIN mission_officers o
WHERE d.name = 'Nala' 
  AND o.full_name = 'Sultan Al Ameri';

-- Duke -> Abdullah Al Suwaidi, Ali Al Qubaisi
INSERT INTO dog_officer (dog_id, officer_id)
SELECT d.id, o.id
FROM dogs d
CROSS JOIN mission_officers o
WHERE d.name = 'Duke' 
  AND o.full_name IN ('Abdullah Al Suwaidi', 'Ali Al Qubaisi');

-- Rocky -> Khalid Al Mazrouei
INSERT INTO dog_officer (dog_id, officer_id)
SELECT d.id, o.id
FROM dogs d
CROSS JOIN mission_officers o
WHERE d.name = 'Rocky' 
  AND o.full_name = 'Khalid Al Mazrouei';

-- Zara -> Omar Al Ketbi, Sultan Al Ameri
INSERT INTO dog_officer (dog_id, officer_id)
SELECT d.id, o.id
FROM dogs d
CROSS JOIN mission_officers o
WHERE d.name = 'Zara' 
  AND o.full_name IN ('Omar Al Ketbi', 'Sultan Al Ameri');
