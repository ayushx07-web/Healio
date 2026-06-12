-- Seed users (password is "password123" bcrypt hashed)
INSERT INTO users (name, email, phone, password_hash, role) VALUES
('Dr. Priya Sharma', 'priya@ambula.com', '9876543210', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHuu', 'DOCTOR'),
('Dr. Rahul Mehta',  'rahul@ambula.com', '9876543211', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHuu', 'DOCTOR'),
('Dr. Ananya Iyer',  'ananya@ambula.com','9876543212', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHuu', 'DOCTOR'),
('Ravi Kumar',       'ravi@test.com',    '9876543213', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHuu', 'PATIENT')
ON CONFLICT DO NOTHING;

INSERT INTO doctors (user_id, specialization, location, consultation_fee, bio, experience_years, rating) VALUES
((SELECT id FROM users WHERE email='priya@ambula.com'),  'Cardiologist',     'Delhi, Connaught Place', 800,  'Senior cardiologist with 12 years experience. Specializes in preventive cardiology.', 12, 4.8),
((SELECT id FROM users WHERE email='rahul@ambula.com'),  'Dermatologist',    'Delhi, Lajpat Nagar',    600,  'Expert in skin conditions, cosmetic dermatology, and hair treatment.', 8, 4.6),
((SELECT id FROM users WHERE email='ananya@ambula.com'), 'General Physician','Delhi, Vasant Kunj',     400,  'General practice with focus on preventive health and chronic disease management.', 6, 4.7)
ON CONFLICT DO NOTHING;

-- Generate slots for the next 7 days for all doctors (9am-5pm, 30-min slots)
DO $$
DECLARE
    d RECORD;
    day_offset INT;
    hour_val INT;
    slot_start TIMESTAMP;
BEGIN
    FOR d IN SELECT id FROM doctors LOOP
        FOR day_offset IN 0..6 LOOP
            FOR hour_val IN 9..16 LOOP
                slot_start := DATE_TRUNC('day', NOW()) + (day_offset || ' days')::INTERVAL + (hour_val || ' hours')::INTERVAL;
                INSERT INTO slots (doctor_id, start_time, end_time, is_blocked)
                VALUES (d.id, slot_start, slot_start + INTERVAL '30 minutes', FALSE)
                ON CONFLICT DO NOTHING;
                -- also add :30 slot
                INSERT INTO slots (doctor_id, start_time, end_time, is_blocked)
                VALUES (d.id, slot_start + INTERVAL '30 minutes', slot_start + INTERVAL '60 minutes', FALSE)
                ON CONFLICT DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;
