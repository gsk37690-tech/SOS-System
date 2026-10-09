-- Non-destructive foundation data. INSERT IGNORE preserves any existing zone data.
-- Coordinates are fictional prototype coordinates, not real-world campus locations.
INSERT IGNORE INTO campus_zones (name, description, risk_level, latitude, longitude, active) VALUES
('Main Gate', 'Prototype campus entry zone.', 'MODERATE', 12.9716000, 77.5946000, TRUE),
('Academic Block', 'Prototype academic zone.', 'LOW', 12.9718000, 77.5948000, TRUE),
('Library', 'Prototype library zone.', 'LOW', 12.9720000, 77.5950000, TRUE),
('Hostel Block A', 'Prototype residential zone.', 'MODERATE', 12.9722000, 77.5952000, TRUE),
('Hostel Block B', 'Prototype residential zone.', 'MODERATE', 12.9724000, 77.5954000, TRUE),
('Canteen', 'Prototype dining zone.', 'MODERATE', 12.9726000, 77.5956000, TRUE),
('Parking Area', 'Prototype parking zone.', 'HIGH', 12.9728000, 77.5958000, TRUE),
('Sports Ground', 'Prototype recreation zone.', 'LOW', 12.9730000, 77.5960000, TRUE);

-- Demo user accounts are added in Phase 2 through BCrypt-backed application seeding.
