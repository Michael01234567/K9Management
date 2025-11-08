/*
  # Populate Mission Locations with Sample Data

  1. Purpose
    - Add 10 sample mission locations including major international airports and land border crossings
    - Provide realistic data for testing and demonstration purposes

  2. Sample Locations Added
    **International Airports:**
    - John F. Kennedy International Airport (JFK), New York, USA
    - Los Angeles International Airport (LAX), California, USA
    - Hartsfield-Jackson Atlanta International Airport (ATL), Georgia, USA
    - Dallas/Fort Worth International Airport (DFW), Texas, USA
    - Miami International Airport (MIA), Florida, USA

    **Major Land Border Crossings:**
    - San Ysidro Port of Entry (US-Mexico Border, California)
    - El Paso Port of Entry (US-Mexico Border, Texas)
    - Peace Arch Border Crossing (US-Canada Border, Washington)
    - Ambassador Bridge Border Crossing (US-Canada Border, Michigan-Ontario)
    - Nogales Port of Entry (US-Mexico Border, Arizona)

  3. Data Fields
    - Each location includes: name, address, latitude, longitude, and description
    - Coordinates are accurate for mapping and navigation purposes
    - Descriptions provide context about the location's significance

  4. Notes
    - Uses INSERT with ON CONFLICT to prevent duplicate entries
    - Locations can be updated or removed as needed
    - All coordinates verified for accuracy
*/

INSERT INTO mission_locations (name, address, latitude, longitude, description, created_at, updated_at)
VALUES
  (
    'John F. Kennedy International Airport (JFK)',
    'Queens, NY 11430, USA',
    40.6413,
    -73.7781,
    'Major international airport serving New York City. One of the busiest airports in the United States, handling domestic and international cargo and passenger traffic.',
    now(),
    now()
  ),
  (
    'Los Angeles International Airport (LAX)',
    '1 World Way, Los Angeles, CA 90045, USA',
    33.9416,
    -118.4085,
    'Primary international airport serving Los Angeles and the Greater Los Angeles area. Major gateway for trans-Pacific flights.',
    now(),
    now()
  ),
  (
    'Hartsfield-Jackson Atlanta International Airport (ATL)',
    '6000 N Terminal Pkwy, Atlanta, GA 30320, USA',
    33.6407,
    -84.4277,
    'World''s busiest airport by passenger traffic. Major hub for domestic and international flights in the southeastern United States.',
    now(),
    now()
  ),
  (
    'Dallas/Fort Worth International Airport (DFW)',
    '2400 Aviation Dr, DFW Airport, TX 75261, USA',
    32.8998,
    -97.0403,
    'Major international airport serving the Dallas-Fort Worth metroplex. Strategic location for central United States operations.',
    now(),
    now()
  ),
  (
    'Miami International Airport (MIA)',
    '2100 NW 42nd Ave, Miami, FL 33126, USA',
    25.7959,
    -80.2870,
    'Primary gateway between the United States and Latin America. Handles significant international cargo and passenger traffic.',
    now(),
    now()
  ),
  (
    'San Ysidro Port of Entry',
    'San Ysidro, CA 92173, USA',
    32.5423,
    -117.0382,
    'Busiest land border crossing in the Western Hemisphere. Located at the US-Mexico border between San Diego and Tijuana.',
    now(),
    now()
  ),
  (
    'El Paso Port of Entry',
    'El Paso, TX 79901, USA',
    31.7619,
    -106.4850,
    'Major international bridge crossing between El Paso, Texas and Ciudad Juárez, Mexico. Critical point for cross-border operations.',
    now(),
    now()
  ),
  (
    'Peace Arch Border Crossing',
    'Blaine, WA 98230, USA',
    49.0022,
    -122.7575,
    'International border crossing between Blaine, Washington and Surrey, British Columbia. Major route between Seattle and Vancouver.',
    now(),
    now()
  ),
  (
    'Ambassador Bridge Border Crossing',
    'Detroit, MI 48209, USA',
    42.3084,
    -83.0756,
    'International suspension bridge connecting Detroit, Michigan with Windsor, Ontario. Busiest US-Canada border crossing.',
    now(),
    now()
  ),
  (
    'Nogales Port of Entry',
    'Nogales, AZ 85621, USA',
    31.3340,
    -110.9390,
    'International port of entry between Nogales, Arizona and Nogales, Sonora. Key crossing point for the southwestern United States.',
    now(),
    now()
  )
ON CONFLICT (name) DO NOTHING;
