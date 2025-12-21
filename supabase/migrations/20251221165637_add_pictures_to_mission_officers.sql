/*
  # Add Pictures to Mission Officers

  1. Changes
    - Update all mission officers with professional profile pictures from Pexels
    - Assign unique pictures to each officer

  2. Notes
    - Pictures are sourced from Pexels stock photos
    - Each officer gets a unique professional portrait
*/

UPDATE mission_officers SET picture_url = 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400' WHERE employee_id = 'ICP-FCA 001';
UPDATE mission_officers SET picture_url = 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400' WHERE employee_id = 'ICP-FCA 002';
UPDATE mission_officers SET picture_url = 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400' WHERE employee_id = 'ICP-FCA 003';
UPDATE mission_officers SET picture_url = 'https://images.pexels.com/photos/1484801/pexels-photo-1484801.jpeg?auto=compress&cs=tinysrgb&w=400' WHERE employee_id = 'ICP-FCA 004';
UPDATE mission_officers SET picture_url = 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=400' WHERE employee_id = 'ICP-FCA 005';
UPDATE mission_officers SET picture_url = 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400' WHERE employee_id = 'ICP-POL 001';
UPDATE mission_officers SET picture_url = 'https://images.pexels.com/photos/1516679/pexels-photo-1516679.jpeg?auto=compress&cs=tinysrgb&w=400' WHERE employee_id = 'ICP-POL 002';
UPDATE mission_officers SET picture_url = 'https://images.pexels.com/photos/1080213/pexels-photo-1080213.jpeg?auto=compress&cs=tinysrgb&w=400' WHERE employee_id = 'ICP-POL 003';
UPDATE mission_officers SET picture_url = 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=400' WHERE employee_id = 'ICP-POL 004';
UPDATE mission_officers SET picture_url = 'https://images.pexels.com/photos/1121796/pexels-photo-1121796.jpeg?auto=compress&cs=tinysrgb&w=400' WHERE employee_id = 'ICP-POL 005';
