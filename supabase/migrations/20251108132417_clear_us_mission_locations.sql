/*
  # Clear US Mission Locations Data

  1. Purpose
    - Remove existing US-based airport and border crossing data
    - Prepare table for UAE-specific mission locations

  2. Actions
    - Delete all existing records from mission_locations table
    - Table structure remains intact for new data

  3. Notes
    - This migration should be followed by adding UAE location data
    - No structural changes to the table
*/

DELETE FROM mission_locations;
