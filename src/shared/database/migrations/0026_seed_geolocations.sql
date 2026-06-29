INSERT INTO "attendance_locations" ("location_name", "latitude", "longitude", "allowed_radius", "is_active", "fk_hl_id", "created_at") VALUES 
('Main Office', 19.096388750705227, 73.01687580932347, 25.00, true, 1, NOW()),
('Koparkhairne', 19.1026651, 73.0090135, 25.00, false, 2, NOW()),
('Texto', 19.1110101, 73.0155262, 25.00, false, 3, NOW()),
('Satish Office', 19.062938, 72.891391, 25.00, true, 4, NOW())
ON CONFLICT DO NOTHING;
