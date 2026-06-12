CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(15),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('PATIENT', 'DOCTOR')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctors (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id),
    specialization VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    consultation_fee INTEGER NOT NULL,
    bio TEXT,
    experience_years INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 4.5
);

CREATE TABLE IF NOT EXISTS slots (
    id BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL REFERENCES doctors(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    is_blocked BOOLEAN DEFAULT FALSE,
    UNIQUE (doctor_id, start_time)
);

CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    slot_id BIGINT UNIQUE NOT NULL REFERENCES slots(id),
    patient_name VARCHAR(100) NOT NULL,
    patient_age INTEGER NOT NULL,
    patient_phone VARCHAR(15) NOT NULL,
    patient_user_id BIGINT REFERENCES users(id),
    booking_ref VARCHAR(36) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS health_summaries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id),
    blood_group VARCHAR(5),
    known_conditions TEXT,
    current_medications TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consultations (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT UNIQUE NOT NULL REFERENCES bookings(id),
    diagnosis_notes TEXT,
    prescription TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
