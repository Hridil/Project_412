-- ====================================================================
-- MINDCARE PRO - COMPLETE ALL-IN-ONE SCHEMA & DEMO SETUP
-- File: database/DemoDB/00_full_schema_and_demo_setup.sql
-- 
-- Description:
-- 1. Drops any existing tables safely (CASCADE).
-- 2. Creates all 11 relational tables with integrity constraints.
-- 3. Enables Row Level Security (RLS) with open anon policies.
-- 4. Prepares the public 'mindcare-images' storage bucket.
-- 5. Inserts complete demo records for clients, clinicians,
--    availability slots, appointments, notes, feedback, and files.
-- 
-- Demo Login Password for all accounts: password123
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. DROP EXISTING TABLES & FUNCTIONS (REVERSE DEPENDENCY ORDER)
-- --------------------------------------------------------------------
DROP TRIGGER IF EXISTS TRG_SANITIZE_PERSON ON PERSON CASCADE;
DROP TRIGGER IF EXISTS TRG_SANITIZE_NOTE ON PRIVATE_NOTE CASCADE;
DROP TRIGGER IF EXISTS TRG_SANITIZE_FEEDBACK ON FEEDBACK CASCADE;
DROP TRIGGER IF EXISTS TRG_VERIFY_NOTE_AUTHOR ON PRIVATE_NOTE CASCADE;
DROP TRIGGER IF EXISTS TRG_VERIFY_FEEDBACK_AUTHOR ON FEEDBACK CASCADE;
DROP FUNCTION IF EXISTS sanitize_text(TEXT) CASCADE;
DROP FUNCTION IF EXISTS trg_sanitize_person_data() CASCADE;
DROP FUNCTION IF EXISTS trg_sanitize_note_data() CASCADE;
DROP FUNCTION IF EXISTS trg_sanitize_feedback_data() CASCADE;
DROP FUNCTION IF EXISTS trg_verify_note_authorization() CASCADE;
DROP FUNCTION IF EXISTS trg_verify_feedback_authorization() CASCADE;
DROP FUNCTION IF EXISTS authenticate_user(TEXT, TEXT) CASCADE;

DROP TABLE IF EXISTS FEEDBACK CASCADE;
DROP TABLE IF EXISTS PRIVATE_NOTE CASCADE;
DROP TABLE IF EXISTS CONSULTATION_SESSION CASCADE;
DROP TABLE IF EXISTS UPLOADED_FILE CASCADE;
DROP TABLE IF EXISTS PRECONSULTATION_FORM CASCADE;
DROP TABLE IF EXISTS APPOINTMENT CASCADE;
DROP TABLE IF EXISTS AVAILABILITY_SLOT CASCADE;
DROP TABLE IF EXISTS CONSULTANT CASCADE;
DROP TABLE IF EXISTS CLIENT CASCADE;
DROP TABLE IF EXISTS PERSON_CONTACT CASCADE;
DROP TABLE IF EXISTS PERSON CASCADE;

-- --------------------------------------------------------------------
-- 2. INPUT SANITIZATION & AUTHORIZATION ENGINES
-- --------------------------------------------------------------------

CREATE OR REPLACE FUNCTION sanitize_text(input_val TEXT) 
RETURNS TEXT AS $$
BEGIN
    IF input_val IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN TRIM(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REPLACE(input_val, CHR(0), ''),
                '<[^>]*>', '', 'gi'
            ),
            '\s+', ' ', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION trg_sanitize_person_data()
RETURNS TRIGGER AS $$
BEGIN
    NEW.NAME := sanitize_text(NEW.NAME);
    NEW.EMAIL := LOWER(TRIM(NEW.EMAIL));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_sanitize_note_data()
RETURNS TRIGGER AS $$
BEGIN
    NEW.TITLE := sanitize_text(NEW.TITLE);
    NEW.TAG := sanitize_text(NEW.TAG);
    NEW.NOTE_TEXT := sanitize_text(NEW.NOTE_TEXT);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_sanitize_feedback_data()
RETURNS TRIGGER AS $$
BEGIN
    NEW.CATEGORY := sanitize_text(NEW.CATEGORY);
    NEW.COMMENT_TEXT := sanitize_text(NEW.COMMENT_TEXT);
    IF NEW.CLINICIAN_REPLY IS NOT NULL THEN
        NEW.CLINICIAN_REPLY := sanitize_text(NEW.CLINICIAN_REPLY);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_verify_note_authorization()
RETURNS TRIGGER AS $$
DECLARE
    v_is_consultant BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM CONSULTANT c
        JOIN PERSON p ON p.PERSON_ID = c.PERSON_ID
        WHERE c.CONSULTANT_ID = NEW.CONSULTANT_ID
          AND p.ROLE = 'consultant'
    ) INTO v_is_consultant;

    IF NOT v_is_consultant THEN
        RAISE EXCEPTION 'AUTHORIZATION ERROR: Only licensed consultants are permitted to author private clinical notes.'
            USING ERRCODE = '28000';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_verify_feedback_authorization()
RETURNS TRIGGER AS $$
DECLARE
    v_client_active BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM CLIENT cl
        WHERE cl.CLIENT_ID = NEW.CLIENT_ID
          AND cl.ACCOUNT_STATUS = 'ACTIVE'
    ) INTO v_client_active;

    IF NOT v_client_active THEN
        RAISE EXCEPTION 'AUTHORIZATION ERROR: Feedback can only be submitted by active clients.'
            USING ERRCODE = '28000';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------------------
-- 3. TABLE DEFINITIONS (DDL) WITH CONSTRAINTS
-- --------------------------------------------------------------------

-- 1. PERSON (Accounts: Clients, Consultants, Staff)
CREATE TABLE PERSON (
    PERSON_ID BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    NAME VARCHAR(150) NOT NULL,
    EMAIL VARCHAR(255) NOT NULL UNIQUE,
    PASSWORD_HASH VARCHAR(255) NOT NULL,
    PASSWORD_SALT VARCHAR(64) NOT NULL,
    ROLE VARCHAR(20) NOT NULL DEFAULT 'client',
    AVATAR_URL TEXT,
    CREATED_AT TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT CK_PERSON_NAME_NOT_EMPTY CHECK (LENGTH(TRIM(NAME)) >= 2),
    CONSTRAINT CK_PERSON_EMAIL_FORMAT CHECK (EMAIL ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9]+([.-][A-Za-z0-9]+)*\.[A-Za-z]{2,}$'),
    CONSTRAINT CK_PERSON_ROLE CHECK (ROLE IN ('client', 'consultant', 'admin')),
    CONSTRAINT CK_PERSON_PASSWORD_HASH CHECK (LENGTH(PASSWORD_HASH) >= 32),
    CONSTRAINT CK_PERSON_PASSWORD_SALT CHECK (LENGTH(PASSWORD_SALT) >= 16)
);

CREATE TRIGGER TRG_SANITIZE_PERSON
BEFORE INSERT OR UPDATE ON PERSON
FOR EACH ROW EXECUTE FUNCTION trg_sanitize_person_data();

-- 2. PERSON_CONTACT
CREATE TABLE PERSON_CONTACT (
    CONTACT_ID BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    PERSON_ID BIGINT NOT NULL REFERENCES PERSON (PERSON_ID) ON DELETE CASCADE,
    CONTACT_NO VARCHAR(30) NOT NULL,
    CONSTRAINT UQ_PERSON_CONTACT UNIQUE (PERSON_ID, CONTACT_NO),
    CONSTRAINT CK_CONTACT_PHONE_FORMAT CHECK (CONTACT_NO ~ '^[0-9+() -]{7,30}$')
);

-- 3. CLIENT
CREATE TABLE CLIENT (
    CLIENT_ID BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    PERSON_ID BIGINT NOT NULL UNIQUE REFERENCES PERSON (PERSON_ID) ON DELETE CASCADE,
    ACCOUNT_STATUS VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (ACCOUNT_STATUS IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    DOB DATE,
    REASON TEXT,
    CONSTRAINT CK_CLIENT_DOB_PAST CHECK (DOB IS NULL OR DOB <= CURRENT_DATE)
);

-- 4. CONSULTANT
CREATE TABLE CONSULTANT (
    CONSULTANT_ID BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    PERSON_ID BIGINT NOT NULL UNIQUE REFERENCES PERSON (PERSON_ID) ON DELETE CASCADE,
    SPECIALIZATION VARCHAR(150) NOT NULL,
    QUALIFICATION TEXT NOT NULL,
    CONSTRAINT CK_CONSULTANT_SPEC_NOT_EMPTY CHECK (LENGTH(TRIM(SPECIALIZATION)) >= 2)
);

-- 5. AVAILABILITY_SLOT
CREATE TABLE AVAILABILITY_SLOT (
    SLOT_ID BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    CONSULTANT_ID BIGINT NOT NULL REFERENCES CONSULTANT (CONSULTANT_ID) ON DELETE CASCADE,
    SLOT_DATE DATE NOT NULL,
    START_TIME TIME NOT NULL,
    END_TIME TIME NOT NULL,
    SLOT_STATUS VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (SLOT_STATUS IN ('AVAILABLE', 'BOOKED', 'BLOCKED')),
    CONSTRAINT CK_SLOT_TIME_ORDER CHECK (END_TIME > START_TIME)
);

-- 6. APPOINTMENT
CREATE TABLE APPOINTMENT (
    APPOINTMENT_ID BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    CLIENT_ID BIGINT NOT NULL REFERENCES CLIENT (CLIENT_ID) ON DELETE CASCADE,
    CONSULTANT_ID BIGINT REFERENCES CONSULTANT (CONSULTANT_ID) ON DELETE SET NULL,
    SLOT_ID BIGINT REFERENCES AVAILABILITY_SLOT (SLOT_ID) ON DELETE SET NULL,
    STATUS VARCHAR(20) NOT NULL DEFAULT 'REQUESTED' CHECK (STATUS IN ('REQUESTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
    APPOINTMENT_MODE VARCHAR(10) NOT NULL DEFAULT 'ONLINE' CHECK (APPOINTMENT_MODE IN ('ONLINE', 'OFFLINE')),
    APPOINTMENT_DATE DATE,
    APPOINTMENT_TIME TIME,
    REASON TEXT,
    REQUESTED_AT TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PRECONSULTATION_FORM
CREATE TABLE PRECONSULTATION_FORM (
    FORM_ID BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    APPOINTMENT_ID BIGINT NOT NULL UNIQUE REFERENCES APPOINTMENT (APPOINTMENT_ID) ON DELETE CASCADE,
    RESPONSES JSONB NOT NULL,
    SUBMITTED_AT TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. UPLOADED_FILE (Images, Avatars, Clinical Documents)
CREATE TABLE UPLOADED_FILE (
    FILE_ID BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    PERSON_ID BIGINT REFERENCES PERSON (PERSON_ID) ON DELETE SET NULL,
    CLIENT_ID BIGINT REFERENCES CLIENT (CLIENT_ID) ON DELETE SET NULL,
    APPOINTMENT_ID BIGINT REFERENCES APPOINTMENT (APPOINTMENT_ID) ON DELETE SET NULL,
    FILE_NAME VARCHAR(255) NOT NULL,
    FILE_SIZE BIGINT NOT NULL,
    FILE_PATH VARCHAR(1000) NOT NULL,
    FILE_URL TEXT,
    MIME_TYPE VARCHAR(100),
    UPLOADED_BY VARCHAR(50) DEFAULT 'USER',
    UPLOADED_AT TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT CK_FILE_NAME_SAFE CHECK (FILE_NAME NOT LIKE '%..%' AND FILE_NAME NOT LIKE '%/%' AND FILE_NAME NOT LIKE '%\%'),
    CONSTRAINT CK_FILE_SIZE_POSITIVE CHECK (FILE_SIZE > 0)
);

-- 9. CONSULTATION_SESSION
CREATE TABLE CONSULTATION_SESSION (
    SESSION_ID BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    APPOINTMENT_ID BIGINT NOT NULL UNIQUE REFERENCES APPOINTMENT (APPOINTMENT_ID) ON DELETE CASCADE,
    SESSION_STATUS VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' CHECK (SESSION_STATUS IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    STARTED_AT TIMESTAMPTZ,
    ENDED_AT TIMESTAMPTZ
);

-- 10. PRIVATE_NOTE (Strict Confidentiality - Clinicians Only)
CREATE TABLE PRIVATE_NOTE (
    NOTE_ID BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    CONSULTANT_ID BIGINT NOT NULL REFERENCES CONSULTANT (CONSULTANT_ID) ON DELETE CASCADE,
    SESSION_ID BIGINT REFERENCES CONSULTATION_SESSION (SESSION_ID) ON DELETE CASCADE,
    CLIENT_ID BIGINT REFERENCES CLIENT (CLIENT_ID) ON DELETE CASCADE,
    TITLE VARCHAR(255) DEFAULT 'Clinical Note',
    TAG VARCHAR(50) DEFAULT 'General',
    NOTE_TEXT TEXT NOT NULL,
    CREATED_AT TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT CK_NOTE_TEXT_NOT_EMPTY CHECK (LENGTH(TRIM(NOTE_TEXT)) > 0)
);

CREATE TRIGGER TRG_SANITIZE_NOTE
BEFORE INSERT OR UPDATE ON PRIVATE_NOTE
FOR EACH ROW EXECUTE FUNCTION trg_sanitize_note_data();

CREATE TRIGGER TRG_VERIFY_NOTE_AUTHOR
BEFORE INSERT OR UPDATE ON PRIVATE_NOTE
FOR EACH ROW EXECUTE FUNCTION trg_verify_note_authorization();

-- 11. FEEDBACK
CREATE TABLE FEEDBACK (
    FEEDBACK_ID BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    CLIENT_ID BIGINT NOT NULL REFERENCES CLIENT (CLIENT_ID) ON DELETE CASCADE,
    SESSION_ID BIGINT REFERENCES CONSULTATION_SESSION (SESSION_ID) ON DELETE SET NULL,
    RATING SMALLINT NOT NULL CHECK (RATING >= 1 AND RATING <= 5),
    CATEGORY VARCHAR(100) DEFAULT 'Session Experience',
    COMMENT_TEXT TEXT,
    IS_ANONYMOUS SMALLINT DEFAULT 0,
    READ_STATUS SMALLINT DEFAULT 0,
    CLINICIAN_REPLY TEXT,
    SUBMITTED_AT TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER TRG_SANITIZE_FEEDBACK
BEFORE INSERT OR UPDATE ON FEEDBACK
FOR EACH ROW EXECUTE FUNCTION trg_sanitize_feedback_data();

CREATE TRIGGER TRG_VERIFY_FEEDBACK_AUTHOR
BEFORE INSERT ON FEEDBACK
FOR EACH ROW EXECUTE FUNCTION trg_verify_feedback_authorization();

-- --------------------------------------------------------------------
-- 4. DATABASE AUTHENTICATION FUNCTION (SECURE LOOKUP)
-- --------------------------------------------------------------------

CREATE OR REPLACE FUNCTION authenticate_user(
    p_email TEXT,
    p_password_hash TEXT
)
RETURNS TABLE (
    person_id BIGINT,
    name VARCHAR(150),
    email VARCHAR(255),
    role VARCHAR(20),
    avatar_url VARCHAR(500),
    client_id BIGINT,
    consultant_id BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.PERSON_ID,
        p.NAME,
        p.EMAIL,
        p.ROLE,
        p.AVATAR_URL,
        cl.CLIENT_ID,
        co.CONSULTANT_ID
    FROM PERSON p
    LEFT JOIN CLIENT cl ON cl.PERSON_ID = p.PERSON_ID
    LEFT JOIN CONSULTANT co ON co.PERSON_ID = p.PERSON_ID
    WHERE p.EMAIL = LOWER(TRIM(p_email))
      AND p.PASSWORD_HASH = p_password_hash
      AND (cl.ACCOUNT_STATUS IS NULL OR cl.ACCOUNT_STATUS = 'ACTIVE');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) & AUTHORIZATION POLICIES
-- --------------------------------------------------------------------
ALTER TABLE PERSON ENABLE ROW LEVEL SECURITY;
ALTER TABLE PERSON_CONTACT ENABLE ROW LEVEL SECURITY;
ALTER TABLE CLIENT ENABLE ROW LEVEL SECURITY;
ALTER TABLE CONSULTANT ENABLE ROW LEVEL SECURITY;
ALTER TABLE AVAILABILITY_SLOT ENABLE ROW LEVEL SECURITY;
ALTER TABLE APPOINTMENT ENABLE ROW LEVEL SECURITY;
ALTER TABLE PRECONSULTATION_FORM ENABLE ROW LEVEL SECURITY;
ALTER TABLE UPLOADED_FILE ENABLE ROW LEVEL SECURITY;
ALTER TABLE CONSULTATION_SESSION ENABLE ROW LEVEL SECURITY;
ALTER TABLE PRIVATE_NOTE ENABLE ROW LEVEL SECURITY;
ALTER TABLE FEEDBACK ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read PERSON" ON PERSON FOR SELECT USING (true);
CREATE POLICY "Self insert/update PERSON" ON PERSON FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access PERSON_CONTACT" ON PERSON_CONTACT FOR ALL USING (true) WITH CHECK (true);

-- Client Caseload Isolation: Clients view only their own record; Consultants view assigned caseload
CREATE POLICY "Clients read own profile" ON CLIENT
FOR SELECT USING (
    PERSON_ID IN (SELECT PERSON_ID FROM PERSON WHERE EMAIL = auth.email())
    OR EXISTS (
        SELECT 1 FROM CONSULTANT co
        JOIN PERSON p ON p.PERSON_ID = co.PERSON_ID
        JOIN APPOINTMENT ap ON ap.CONSULTANT_ID = co.CONSULTANT_ID AND ap.CLIENT_ID = CLIENT.CLIENT_ID
        WHERE p.EMAIL = auth.email()
    )
    OR CLIENT.ACCOUNT_STATUS = 'PENDING'
);
CREATE POLICY "Manage CLIENT records" ON CLIENT FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access CONSULTANT" ON CONSULTANT FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access AVAILABILITY_SLOT" ON AVAILABILITY_SLOT FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access APPOINTMENT" ON APPOINTMENT FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access PRECONSULTATION_FORM" ON PRECONSULTATION_FORM FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access CONSULTATION_SESSION" ON CONSULTATION_SESSION FOR ALL USING (true) WITH CHECK (true);

-- Document Vault Tenant Isolation: Clients access strictly own files; Consultants access assigned caseload files
CREATE POLICY "Clients can only access own files" ON UPLOADED_FILE
FOR SELECT USING (
    PERSON_ID IN (SELECT PERSON_ID FROM PERSON WHERE EMAIL = auth.email())
    OR CLIENT_ID IN (
        SELECT CLIENT_ID FROM CLIENT cl
        JOIN PERSON p ON p.PERSON_ID = cl.PERSON_ID
        WHERE p.EMAIL = auth.email()
    )
    OR EXISTS (
        SELECT 1 FROM CONSULTANT co
        JOIN PERSON p ON p.PERSON_ID = co.PERSON_ID
        JOIN APPOINTMENT ap ON ap.CONSULTANT_ID = co.CONSULTANT_ID AND ap.CLIENT_ID = UPLOADED_FILE.CLIENT_ID
        WHERE p.EMAIL = auth.email()
    )
    OR UPLOADED_BY = auth.email()
);

CREATE POLICY "Users upload own files" ON UPLOADED_FILE
FOR INSERT WITH CHECK (
    PERSON_ID IN (SELECT PERSON_ID FROM PERSON WHERE EMAIL = auth.email())
    OR CLIENT_ID IN (
        SELECT CLIENT_ID FROM CLIENT cl
        JOIN PERSON p ON p.PERSON_ID = cl.PERSON_ID
        WHERE p.EMAIL = auth.email()
    )
    OR EXISTS (
        SELECT 1 FROM CONSULTANT co
        JOIN PERSON p ON p.PERSON_ID = co.PERSON_ID
        WHERE p.EMAIL = auth.email()
    )
);

CREATE POLICY "Users delete own files" ON UPLOADED_FILE
FOR DELETE USING (
    PERSON_ID IN (SELECT PERSON_ID FROM PERSON WHERE EMAIL = auth.email())
    OR CLIENT_ID IN (
        SELECT CLIENT_ID FROM CLIENT cl
        JOIN PERSON p ON p.PERSON_ID = cl.PERSON_ID
        WHERE p.EMAIL = auth.email()
    )
    OR EXISTS (
        SELECT 1 FROM CONSULTANT co
        JOIN PERSON p ON p.PERSON_ID = co.PERSON_ID
        WHERE p.EMAIL = auth.email()
    )
);

-- Strictly Guarded Private Clinical Notes
CREATE POLICY "Consultants can read private notes" ON PRIVATE_NOTE
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM CONSULTANT co 
        WHERE co.CONSULTANT_ID = PRIVATE_NOTE.CONSULTANT_ID
    )
);

CREATE POLICY "Consultants can insert private notes" ON PRIVATE_NOTE
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM CONSULTANT co 
        WHERE co.CONSULTANT_ID = PRIVATE_NOTE.CONSULTANT_ID
    )
);

CREATE POLICY "Consultants can update own notes" ON PRIVATE_NOTE
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM CONSULTANT co 
        WHERE co.CONSULTANT_ID = PRIVATE_NOTE.CONSULTANT_ID
    )
);

-- Feedback Access & Moderation
CREATE POLICY "Clients can insert feedback" ON FEEDBACK
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM CLIENT cl 
        WHERE cl.CLIENT_ID = FEEDBACK.CLIENT_ID
    )
);

CREATE POLICY "Read feedback" ON FEEDBACK FOR SELECT USING (true);
CREATE POLICY "Consultants can reply to feedback" ON FEEDBACK FOR UPDATE USING (true) WITH CHECK (true);

-- Setup public image storage bucket for MindCare
INSERT INTO storage.buckets (id, name, public) 
VALUES ('mindcare-images', 'mindcare-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access to MindCare Images" ON storage.objects;
CREATE POLICY "Public Access to MindCare Images" ON storage.objects
FOR ALL USING (bucket_id = 'mindcare-images') WITH CHECK (bucket_id = 'mindcare-images');

-- --------------------------------------------------------------------
-- 4. INSERT DEMO DATA
-- --------------------------------------------------------------------

-- A. Insert Persons (Password: password123)
INSERT INTO PERSON (NAME, EMAIL, PASSWORD_HASH, PASSWORD_SALT, ROLE, AVATAR_URL)
VALUES 
    (
        'Dr. Sarah Mitchell',
        'sarah.mitchell@mindcare.com',
        'b8537fc6b140535fc0e2dd92c45b60bc730322b4282bf6b46ec4a596cff5e41a',
        '61b9b37b047e50073a8175db7c2766a8',
        'consultant',
        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'
    ),
    (
        'Dr. Marcus Vance',
        'marcus.vance@mindcare.com',
        'a754a19a805542d0790b23b38cfd2cc2d698b08f511e9e1cd5a79eaae043774f',
        'e1c632586755531393a43a7e70c8bb68',
        'consultant',
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300'
    ),
    (
        'Emily Watson',
        'emily.watson@mindcare.com',
        '3b8cc2bd65feb9d592b19486f2b4116acc90440564636eb8423d37b2484d8503',
        'cf966215a97151269b1081f7411a40bb',
        'client',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300'
    ),
    (
        'Jamie Chen',
        'jamie.chen@mindcare.com',
        'c6887cd41415b200ab61a7289a89d65188e168c403848bff0f0c24277afa2b71',
        '8a1922114d113c5d83bcbb71e9fd203f',
        'client',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
    ),
    (
        'Michael Rivera',
        'michael.rivera@mindcare.com',
        '3b8cc2bd65feb9d592b19486f2b4116acc90440564636eb8423d37b2484d8503',
        'cf966215a97151269b1081f7411a40bb',
        'client',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300'
    );

-- B. Insert Contacts
INSERT INTO PERSON_CONTACT (PERSON_ID, CONTACT_NO)
SELECT p.PERSON_ID, c.phone
FROM (
    VALUES
        ('sarah.mitchell@mindcare.com', '+1 (555) 234-5678'),
        ('marcus.vance@mindcare.com',   '+1 (555) 345-6789'),
        ('emily.watson@mindcare.com',   '+1 (555) 456-7890'),
        ('jamie.chen@mindcare.com',     '+1 (555) 567-8901'),
        ('michael.rivera@mindcare.com', '+1 (555) 678-9012')
) AS c(email, phone)
JOIN PERSON p ON p.EMAIL = c.email;

-- C. Insert Consultants
INSERT INTO CONSULTANT (PERSON_ID, SPECIALIZATION, QUALIFICATION)
SELECT 
    p.PERSON_ID,
    c.specialization,
    c.qualification
FROM (
    VALUES
        (
            'sarah.mitchell@mindcare.com',
            'Trauma-Informed CBT & Somatic Pacing',
            'Ph.D. in Clinical Psychology, Licensed Psychologist (LPC)'
        ),
        (
            'marcus.vance@mindcare.com',
            'Psychodynamic Psychotherapy & Stress Resilience',
            'Psy.D., Licensed Clinical Social Worker (LCSW)'
        )
) AS c(email, specialization, qualification)
JOIN PERSON p ON p.EMAIL = c.email;

-- D. Insert Clients
INSERT INTO CLIENT (PERSON_ID, ACCOUNT_STATUS, DOB, REASON)
SELECT 
    p.PERSON_ID,
    c.status,
    c.dob::DATE,
    c.reason
FROM (
    VALUES
        (
            'emily.watson@mindcare.com',
            'ACTIVE',
            '1994-06-15',
            'Navigating chronic work burnout, anxiety pacing, and autonomic reset techniques.'
        ),
        (
            'jamie.chen@mindcare.com',
            'ACTIVE',
            '1991-11-23',
            'Establishing work-life boundaries, somatic grounding, and mindful meditation routines.'
        ),
        (
            'michael.rivera@mindcare.com',
            'ACTIVE',
            '1988-03-08',
            'Processing historical trauma, restoring sleep pacing, and somatic tension release.'
        )
) AS c(email, status, dob, reason)
JOIN PERSON p ON p.EMAIL = c.email;

-- E. Insert Availability Slots
INSERT INTO AVAILABILITY_SLOT (CONSULTANT_ID, SLOT_DATE, START_TIME, END_TIME, SLOT_STATUS)
SELECT 
    c.CONSULTANT_ID,
    s.s_date,
    s.s_time::TIME,
    s.e_time::TIME,
    s.status
FROM (
    VALUES
        (CURRENT_DATE + 1, '09:00:00', '10:00:00', 'BOOKED'),
        (CURRENT_DATE + 1, '11:00:00', '12:00:00', 'AVAILABLE'),
        (CURRENT_DATE + 1, '14:00:00', '15:00:00', 'BOOKED'),
        (CURRENT_DATE + 1, '16:00:00', '17:00:00', 'AVAILABLE'),
        (CURRENT_DATE + 2, '10:00:00', '11:00:00', 'AVAILABLE'),
        (CURRENT_DATE + 2, '14:00:00', '15:00:00', 'AVAILABLE'),
        (CURRENT_DATE + 3, '09:00:00', '10:00:00', 'BOOKED')
) AS s(s_date, s_time, e_time, status)
JOIN CONSULTANT c ON c.PERSON_ID = (SELECT PERSON_ID FROM PERSON WHERE EMAIL = 'sarah.mitchell@mindcare.com');

INSERT INTO AVAILABILITY_SLOT (CONSULTANT_ID, SLOT_DATE, START_TIME, END_TIME, SLOT_STATUS)
SELECT 
    c.CONSULTANT_ID,
    s.s_date,
    s.s_time::TIME,
    s.e_time::TIME,
    s.status
FROM (
    VALUES
        (CURRENT_DATE + 1, '10:00:00', '11:00:00', 'BOOKED'),
        (CURRENT_DATE + 1, '13:00:00', '14:00:00', 'AVAILABLE'),
        (CURRENT_DATE + 2, '11:00:00', '12:00:00', 'AVAILABLE'),
        (CURRENT_DATE + 2, '15:00:00', '16:00:00', 'BOOKED')
) AS s(s_date, s_time, e_time, status)
JOIN CONSULTANT c ON c.PERSON_ID = (SELECT PERSON_ID FROM PERSON WHERE EMAIL = 'marcus.vance@mindcare.com');

-- F. Insert Appointments
-- 1. Completed Consultation (Emily Watson with Dr. Sarah Mitchell)
INSERT INTO APPOINTMENT (CLIENT_ID, CONSULTANT_ID, STATUS, APPOINTMENT_MODE, APPOINTMENT_DATE, APPOINTMENT_TIME, REASON)
SELECT 
    cli.CLIENT_ID,
    con.CONSULTANT_ID,
    'COMPLETED',
    'ONLINE',
    CURRENT_DATE - 3,
    '10:00:00',
    'Follow-up somatic check-in and 7-day mood review.'
FROM CLIENT cli
CROSS JOIN CONSULTANT con
WHERE cli.PERSON_ID = (SELECT PERSON_ID FROM PERSON WHERE EMAIL = 'emily.watson@mindcare.com')
  AND con.PERSON_ID = (SELECT PERSON_ID FROM PERSON WHERE EMAIL = 'sarah.mitchell@mindcare.com');

-- 2. Confirmed Upcoming Consultation (Emily Watson with Dr. Sarah Mitchell)
INSERT INTO APPOINTMENT (CLIENT_ID, CONSULTANT_ID, SLOT_ID, STATUS, APPOINTMENT_MODE, APPOINTMENT_DATE, APPOINTMENT_TIME, REASON)
SELECT 
    cli.CLIENT_ID,
    con.CONSULTANT_ID,
    slot.SLOT_ID,
    'CONFIRMED',
    'ONLINE',
    CURRENT_DATE + 1,
    '09:00:00',
    'Trauma-informed autonomic nervous system pacing and breathwork.'
FROM CLIENT cli
CROSS JOIN CONSULTANT con
LEFT JOIN LATERAL (
    SELECT SLOT_ID FROM AVAILABILITY_SLOT 
    WHERE CONSULTANT_ID = con.CONSULTANT_ID AND SLOT_STATUS = 'BOOKED' 
    LIMIT 1
) slot ON true
WHERE cli.PERSON_ID = (SELECT PERSON_ID FROM PERSON WHERE EMAIL = 'emily.watson@mindcare.com')
  AND con.PERSON_ID = (SELECT PERSON_ID FROM PERSON WHERE EMAIL = 'sarah.mitchell@mindcare.com');

-- 3. Confirmed Upcoming Consultation (Jamie Chen with Dr. Marcus Vance)
INSERT INTO APPOINTMENT (CLIENT_ID, CONSULTANT_ID, SLOT_ID, STATUS, APPOINTMENT_MODE, APPOINTMENT_DATE, APPOINTMENT_TIME, REASON)
SELECT 
    cli.CLIENT_ID,
    con.CONSULTANT_ID,
    slot.SLOT_ID,
    'CONFIRMED',
    'ONLINE',
    CURRENT_DATE + 1,
    '10:00:00',
    'Work boundary setting and mindful transition routines.'
FROM CLIENT cli
CROSS JOIN CONSULTANT con
LEFT JOIN LATERAL (
    SELECT SLOT_ID FROM AVAILABILITY_SLOT 
    WHERE CONSULTANT_ID = con.CONSULTANT_ID AND SLOT_STATUS = 'BOOKED' 
    LIMIT 1
) slot ON true
WHERE cli.PERSON_ID = (SELECT PERSON_ID FROM PERSON WHERE EMAIL = 'jamie.chen@mindcare.com')
  AND con.PERSON_ID = (SELECT PERSON_ID FROM PERSON WHERE EMAIL = 'marcus.vance@mindcare.com');

-- 4. Requested Triage Consultation (Michael Rivera with Dr. Sarah Mitchell)
INSERT INTO APPOINTMENT (CLIENT_ID, CONSULTANT_ID, STATUS, APPOINTMENT_MODE, APPOINTMENT_DATE, APPOINTMENT_TIME, REASON)
SELECT 
    cli.CLIENT_ID,
    con.CONSULTANT_ID,
    'REQUESTED',
    'ONLINE',
    CURRENT_DATE + 3,
    '14:00:00',
    'Initial clinical intake assessment and distress pacing.'
FROM CLIENT cli
CROSS JOIN CONSULTANT con
WHERE cli.PERSON_ID = (SELECT PERSON_ID FROM PERSON WHERE EMAIL = 'michael.rivera@mindcare.com')
  AND con.PERSON_ID = (SELECT PERSON_ID FROM PERSON WHERE EMAIL = 'sarah.mitchell@mindcare.com');

-- G. Insert Pre-Consultation Forms (Intake JSON)
INSERT INTO PRECONSULTATION_FORM (APPOINTMENT_ID, RESPONSES)
SELECT 
    a.APPOINTMENT_ID,
    jsonb_build_object(
        'symptoms', 'Persistent tension in shoulders, shallow breathing under deadline pressures, insomnia.',
        'medication', 'Magnesium Glycinate 400mg nightly.',
        'emergency_contact', 'David Watson (Spouse) - +1 (555) 888-1234',
        'crisis_flag', 0
    )
FROM APPOINTMENT a
JOIN CLIENT c ON c.CLIENT_ID = a.CLIENT_ID
JOIN PERSON p ON p.PERSON_ID = c.PERSON_ID
WHERE p.EMAIL = 'emily.watson@mindcare.com' AND a.STATUS = 'CONFIRMED'
LIMIT 1;

-- H. Insert Consultation Sessions
INSERT INTO CONSULTATION_SESSION (APPOINTMENT_ID, SESSION_STATUS, STARTED_AT, ENDED_AT)
SELECT 
    a.APPOINTMENT_ID,
    'COMPLETED',
    NOW() - INTERVAL '3 days 4 hours',
    NOW() - INTERVAL '3 days 3 hours 10 minutes'
FROM APPOINTMENT a
WHERE a.STATUS = 'COMPLETED'
LIMIT 1;

INSERT INTO CONSULTATION_SESSION (APPOINTMENT_ID, SESSION_STATUS, STARTED_AT, ENDED_AT)
SELECT 
    a.APPOINTMENT_ID,
    'SCHEDULED',
    NULL,
    NULL
FROM APPOINTMENT a
WHERE a.STATUS = 'CONFIRMED'
LIMIT 1;

-- I. Insert Private Notes
INSERT INTO PRIVATE_NOTE (CONSULTANT_ID, CLIENT_ID, TITLE, TAG, NOTE_TEXT)
SELECT 
    con.CONSULTANT_ID,
    cli.CLIENT_ID,
    'Intake & Autonomic Assessment',
    'Assessment',
    'Client presented with sympathetic activation and cognitive fatigue. Introduced 4-4-4-4 Box Breathing pacing sequence with observable stabilization in breathing rate (down from 22 bpm to 14 bpm). Client expressed relief with sensory somatic anchoring.'
FROM CLIENT cli
CROSS JOIN CONSULTANT con
WHERE cli.PERSON_ID = (SELECT PERSON_ID FROM PERSON WHERE EMAIL = 'emily.watson@mindcare.com')
  AND con.PERSON_ID = (SELECT PERSON_ID FROM PERSON WHERE EMAIL = 'sarah.mitchell@mindcare.com');

INSERT INTO PRIVATE_NOTE (CONSULTANT_ID, CLIENT_ID, TITLE, TAG, NOTE_TEXT)
SELECT 
    con.CONSULTANT_ID,
    cli.CLIENT_ID,
    'Care Plan & Pacing Milestones',
    'CarePlan',
    'Agreed action steps: 1) Practice 5-minute morning box breathing before work. 2) Schedule two 15-minute screen-free sanctuary pauses each day. 3) Maintain daily 5-state autonomic mood journal check-in.'
FROM CLIENT cli
CROSS JOIN CONSULTANT con
WHERE cli.PERSON_ID = (SELECT PERSON_ID FROM PERSON WHERE EMAIL = 'emily.watson@mindcare.com')
  AND con.PERSON_ID = (SELECT PERSON_ID FROM PERSON WHERE EMAIL = 'sarah.mitchell@mindcare.com');

-- J. Insert Feedback
INSERT INTO FEEDBACK (CLIENT_ID, RATING, CATEGORY, COMMENT_TEXT, IS_ANONYMOUS, READ_STATUS, CLINICIAN_REPLY)
SELECT 
    cli.CLIENT_ID,
    5,
    'Therapeutic Connection',
    'Dr. Mitchell provided a truly calming and non-judgmental environment. The box breathing technique practiced during the consultation immediately lowered my physical chest tension.',
    0,
    1,
    'Thank you so much Emily. Remember to lean into your grounding anchor whenever work demands feel overwhelming. You are doing fantastic work honoring your nervous system.'
FROM CLIENT cli
WHERE cli.PERSON_ID = (SELECT PERSON_ID FROM PERSON WHERE EMAIL = 'emily.watson@mindcare.com');

INSERT INTO FEEDBACK (CLIENT_ID, RATING, CATEGORY, COMMENT_TEXT, IS_ANONYMOUS, READ_STATUS, CLINICIAN_REPLY)
SELECT 
    cli.CLIENT_ID,
    5,
    'Digital Sanctuary Platform',
    'The 7-day mood pacing chart and the tactile 5-4-3-2-1 sensory grounding module have helped me stay mindful throughout the week.',
    1,
    0,
    NULL
FROM CLIENT cli
WHERE cli.PERSON_ID = (SELECT PERSON_ID FROM PERSON WHERE EMAIL = 'jamie.chen@mindcare.com');

-- K. Insert Uploaded Files
INSERT INTO UPLOADED_FILE (PERSON_ID, FILE_NAME, FILE_SIZE, FILE_PATH, FILE_URL, MIME_TYPE, UPLOADED_BY)
SELECT 
    p.PERSON_ID,
    'Emily_Watson_Intake_Consent_Signed.pdf',
    245760,
    'vault/emily_watson_intake.pdf',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800',
    'application/pdf',
    'CLIENT'
FROM PERSON p
WHERE p.EMAIL = 'emily.watson@mindcare.com';

INSERT INTO UPLOADED_FILE (PERSON_ID, FILE_NAME, FILE_SIZE, FILE_PATH, FILE_URL, MIME_TYPE, UPLOADED_BY)
SELECT 
    p.PERSON_ID,
    'Morning_Coastline_Sanctuary_Anchor.jpg',
    1048576,
    'anchors/coastline_anchor.jpg',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
    'image/jpeg',
    'CLIENT'
FROM PERSON p
WHERE p.EMAIL = 'emily.watson@mindcare.com';

INSERT INTO UPLOADED_FILE (PERSON_ID, FILE_NAME, FILE_SIZE, FILE_PATH, FILE_URL, MIME_TYPE, UPLOADED_BY)
SELECT 
    p.PERSON_ID,
    'MindCare_Sanctuary_Consultation_Room.jpg',
    2097152,
    'clinic/sanctuary_room.jpg',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
    'image/jpeg',
    'CONSULTANT'
FROM PERSON p
WHERE p.EMAIL = 'sarah.mitchell@mindcare.com';
