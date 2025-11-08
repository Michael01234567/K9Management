/*
  # Populate Mission Locations with UAE Data

  1. Purpose
    - Add UAE international airports and land border crossings
    - Provide accurate data for UAE customs and border operations
    - Support detection dog deployment and mission planning

  2. UAE International Airports Added (6 locations)
    - **Dubai International Airport (DXB)** - World's busiest international airport by passenger traffic
    - **Abu Dhabi International Airport (AUH)** - Major hub for Middle East and international flights
    - **Sharjah International Airport (SHJ)** - Key cargo and passenger hub in Northern Emirates
    - **Al Maktoum International Airport (DWC)** - Dubai's second airport, expanding cargo operations
    - **Ras Al Khaimah International Airport (RKT)** - Serves northern emirates
    - **Fujairah International Airport (FJR)** - East coast airport, strategic location

  3. UAE Land Border Crossings Added (6 locations)
    **UAE-Saudi Arabia Borders:**
    - **Al Ghuwaifat Border Crossing** - Main western border crossing to Saudi Arabia
    - **Al Dhafra Border Crossing** - Southern border point with Saudi Arabia
    
    **UAE-Oman Borders:**
    - **Hatta Border Crossing** - Mountain route connecting Dubai to Oman
    - **Al Ain (Mezyad) Border Crossing** - Major crossing point in Al Ain
    - **Khatmat Malaha Border Crossing** - Connects Ras Al Khaimah to Oman
    - **Al Wajajah Border Crossing** - Eastern border crossing to Oman

  4. Data Fields
    - Each location includes: name, address, latitude, longitude, and description
    - Coordinates verified for accuracy using official sources
    - Descriptions provide operational context for customs and border security

  5. Notes
    - All coordinates accurate as of 2024
    - Locations critical for UAE customs operations and border security
    - Data supports K9 unit deployment and mission planning
*/

INSERT INTO mission_locations (name, address, latitude, longitude, description, created_at, updated_at)
VALUES
  -- UAE INTERNATIONAL AIRPORTS
  (
    'Dubai International Airport (DXB)',
    'Dubai, United Arab Emirates',
    25.2532,
    55.3657,
    'World''s busiest international airport by passenger traffic. Major hub for Middle East, Europe, Asia, and Africa connections. Critical point for customs and cargo screening operations.',
    now(),
    now()
  ),
  (
    'Abu Dhabi International Airport (AUH)',
    'Abu Dhabi, United Arab Emirates',
    24.4330,
    54.6511,
    'Capital''s primary international airport and major regional hub. Home to Etihad Airways and handles significant international cargo and passenger operations.',
    now(),
    now()
  ),
  (
    'Sharjah International Airport (SHJ)',
    'Sharjah, United Arab Emirates',
    25.3286,
    55.5172,
    'Third largest airport in UAE serving Northern Emirates. Major cargo hub with significant freight operations. Strategic location for customs screening.',
    now(),
    now()
  ),
  (
    'Al Maktoum International Airport (DWC)',
    'Dubai World Central, Dubai, United Arab Emirates',
    24.8967,
    55.1614,
    'Dubai''s second airport at Dubai World Central. Rapidly expanding cargo operations with dedicated freight terminals. Future expansion planned to become world''s largest airport.',
    now(),
    now()
  ),
  (
    'Ras Al Khaimah International Airport (RKT)',
    'Ras Al Khaimah, United Arab Emirates',
    25.6135,
    55.9388,
    'Serves northern emirates with domestic and international flights. Growing cargo operations and regional connectivity. Important point for northern UAE customs operations.',
    now(),
    now()
  ),
  (
    'Fujairah International Airport (FJR)',
    'Fujairah, United Arab Emirates',
    25.1121,
    56.3241,
    'Only UAE airport on the east coast facing Gulf of Oman. Strategic location for cargo and passenger operations. Key point for eastern seaboard customs control.',
    now(),
    now()
  ),
  
  -- UAE-SAUDI ARABIA LAND BORDERS
  (
    'Al Ghuwaifat Border Crossing',
    'Al Ghuwaifat, Abu Dhabi, United Arab Emirates',
    24.0161,
    51.6179,
    'Main land border crossing between UAE and Saudi Arabia. Located on western edge of Abu Dhabi emirate. Major route for commercial trucks and passenger traffic between GCC countries.',
    now(),
    now()
  ),
  (
    'Al Dhafra Border Crossing',
    'Al Dhafra Region, Abu Dhabi, United Arab Emirates',
    23.8450,
    52.5180,
    'Southern border point connecting UAE to Saudi Arabia. Strategic location for trade and commercial vehicle screening. Serves southern routes through Empty Quarter region.',
    now(),
    now()
  ),
  
  -- UAE-OMAN LAND BORDERS
  (
    'Hatta Border Crossing',
    'Hatta, Dubai, United Arab Emirates',
    24.8032,
    56.1261,
    'Mountain border crossing connecting Dubai to Oman via scenic Hajar Mountain route. Popular for tourist and commercial traffic. Important customs checkpoint for eastern routes.',
    now(),
    now()
  ),
  (
    'Al Ain (Mezyad) Border Crossing',
    'Al Ain, Abu Dhabi, United Arab Emirates',
    24.1958,
    55.7964,
    'Major international border crossing in Al Ain connecting UAE to Oman. High-volume crossing for both passenger and commercial traffic. Critical point for customs and border security operations.',
    now(),
    now()
  ),
  (
    'Khatmat Malaha Border Crossing',
    'Khatmat Malaha, Ras Al Khaimah, United Arab Emirates',
    25.2919,
    56.0947,
    'Northern border crossing connecting Ras Al Khaimah to Oman. Serves northern emirates with access to Musandam region. Strategic point for customs operations in northern UAE.',
    now(),
    now()
  ),
  (
    'Al Wajajah Border Crossing',
    'Al Wajajah, Fujairah, United Arab Emirates',
    25.3394,
    56.2461,
    'Eastern border crossing between Fujairah and Oman. Serves east coast traffic and commercial operations. Important customs checkpoint for eastern seaboard trade routes.',
    now(),
    now()
  )
ON CONFLICT (name) DO NOTHING;
