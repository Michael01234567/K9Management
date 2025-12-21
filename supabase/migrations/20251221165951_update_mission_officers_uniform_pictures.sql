/*
  # Update Mission Officers Pictures with Uniformed Personnel

  1. Changes
    - Update ICP-FCA officers with marine blue uniform and beret images
    - Update ICP-POL officers with khaki uniform and beret images
    - All images sourced from Pexels stock photos

  2. Notes
    - ICP-FCA: Marine blue uniforms with berets
    - ICP-POL: Khaki/tan uniforms with berets
*/

UPDATE mission_officers SET picture_url = 'https://images.pexels.com/photos/8728382/pexels-photo-8728382.jpeg?auto=compress&cs=tinysrgb&w=400' WHERE employee_id = 'ICP-FCA 001';
UPDATE mission_officers SET picture_url = 'https://images.pexels.com/photos/6003802/pexels-photo-6003802.jpeg?auto=compress&cs=tinysrgb&w=400' WHERE employee_id = 'ICP-FCA 002';
UPDATE mission_officers SET picture_url = 'https://images.pexels.com/photos/8728556/pexels-photo-8728556.jpeg?auto=compress&cs=tinysrgb&w=400' WHERE employee_id = 'ICP-FCA 003';
UPDATE mission_officers SET picture_url = 'https://images.pexels.com/photos/8728395/pexels-photo-8728395.jpeg?auto=compress&cs=tinysrgb&w=400' WHERE employee_id = 'ICP-FCA 004';
UPDATE mission_officers SET picture_url = 'https://images.pexels.com/photos/8728401/pexels-photo-8728401.jpeg?auto=compress&cs=tinysrgb&w=400' WHERE employee_id = 'ICP-FCA 005';
UPDATE mission_officers SET picture_url = 'https://images.pexels.com/photos/806532/pexels-photo-806532.jpeg?auto=compress&cs=tinysrgb&w=400' WHERE employee_id = 'ICP-POL 001';
UPDATE mission_officers SET picture_url = 'https://images.pexels.com/photos/6003721/pexels-photo-6003721.jpeg?auto=compress&cs=tinysrgb&w=400' WHERE employee_id = 'ICP-POL 002';
UPDATE mission_officers SET picture_url = 'https://images.pexels.com/photos/5257646/pexels-photo-5257646.jpeg?auto=compress&cs=tinysrgb&w=400' WHERE employee_id = 'ICP-POL 003';
UPDATE mission_officers SET picture_url = 'https://images.pexels.com/photos/7862463/pexels-photo-7862463.jpeg?auto=compress&cs=tinysrgb&w=400' WHERE employee_id = 'ICP-POL 004';
UPDATE mission_officers SET picture_url = 'https://images.pexels.com/photos/5257645/pexels-photo-5257645.jpeg?auto=compress&cs=tinysrgb&w=400' WHERE employee_id = 'ICP-POL 005';
