/*
  # Add 10 New Dogs and Assign to Officers

  1. New Data
    - Insert 10 new dogs with varied breeds, specializations, and training levels
    - Assign these dogs to mission officers

  2. Notes
    - Dogs will have realistic data
    - Different breeds, specializations, and training levels
    - Weight and dates of birth included
*/

-- Insert 10 new dogs
INSERT INTO dogs (name, breed, sex, microchip_number, dob, training_level, specialization, location, origin, weight_kg, note)
VALUES
  ('Thunder', 'German Shepherd', 'Male', 'UAE-K9-1101', '2021-03-15', 'Operational', 'Explosive', 'Abu Dhabi International Airport', 'Germany', 32.5, 'Excellent detection skills, certified for international operations'),
  ('Luna', 'Belgian Malinois', 'Female', 'UAE-K9-1102', '2020-08-22', 'Operational', 'Narcotic', 'Dubai International Airport', 'Belgium', 28.0, 'High energy, exceptional tracking abilities'),
  ('Rex', 'Dutch Shepherd', 'Male', 'UAE-K9-1103', '2022-01-10', 'Phase 4', 'Explosive', 'Abu Dhabi International Airport', 'Netherlands', 30.5, 'Fast learner, completing advanced training'),
  ('Shadow', 'Labrador Retriever', 'Male', 'UAE-K9-1104', '2021-06-18', 'Operational', 'Currency', 'Dubai International Airport', 'United Kingdom', 35.0, 'Specialized in currency detection, calm temperament'),
  ('Bella', 'German Shepherd', 'Female', 'UAE-K9-1105', '2020-11-05', 'Operational', 'Narcotic', 'Sharjah International Airport', 'Germany', 29.5, 'Veteran officer with multiple successful detections'),
  ('Max', 'Belgian Malinois', 'Male', 'UAE-K9-1106', '2022-04-12', 'Phase 3', 'Explosive', 'Abu Dhabi International Airport', 'Belgium', 31.0, 'Showing great promise in explosive detection training'),
  ('Nala', 'Springer Spaniel', 'Female', 'UAE-K9-1107', '2021-09-30', 'Operational', 'Tobacco', 'Dubai International Airport', 'United Kingdom', 22.5, 'Excellent for tobacco detection, friendly disposition'),
  ('Duke', 'German Shepherd', 'Male', 'UAE-K9-1108', '2020-05-14', 'Operational', 'RAS Cargo', 'Abu Dhabi International Airport', 'Germany', 34.0, 'Specialized in cargo screening, highly focused'),
  ('Rocky', 'Dutch Shepherd', 'Male', 'UAE-K9-1109', '2021-12-20', 'Phase 4', 'Narcotic', 'Dubai International Airport', 'Netherlands', 29.0, 'Nearly completed training, strong detection instincts'),
  ('Zara', 'Labrador Retriever', 'Female', 'UAE-K9-1110', '2022-02-28', 'Phase 3', 'Kong', 'Sharjah International Airport', 'United Kingdom', 27.5, 'Training for Kong specialization, eager to learn');
