-- ====================================================================
-- MINDCARE PRO - DATABASE VERIFICATION & DIAGNOSTIC QUERIES
-- File: database/DemoDB/99_verify_database_queries.sql
-- Description: Run these queries in the Supabase SQL Editor to verify
--              that your tables, relations, and demo records are intact.
-- ====================================================================

-- ====================================================================
-- 1. OVERALL HEALTH CHECK: TOTAL ROW COUNT ACROSS ALL TABLES
-- ====================================================================
SELECT 'PERSON' AS table_name, COUNT(*) AS row_count FROM PERSON
UNION ALL
SELECT 'PERSON_CONTACT', COUNT(*) FROM PERSON_CONTACT
UNION ALL
SELECT 'CONSULTANT', COUNT(*) FROM CONSULTANT
UNION ALL
SELECT 'CLIENT', COUNT(*) FROM CLIENT
UNION ALL
SELECT 'AVAILABILITY_SLOT', COUNT(*) FROM AVAILABILITY_SLOT
UNION ALL
SELECT 'APPOINTMENT', COUNT(*) FROM APPOINTMENT
UNION ALL
SELECT 'PRECONSULTATION_FORM', COUNT(*) FROM PRECONSULTATION_FORM
UNION ALL
SELECT 'CONSULTATION_SESSION', COUNT(*) FROM CONSULTATION_SESSION
UNION ALL
SELECT 'PRIVATE_NOTE', COUNT(*) FROM PRIVATE_NOTE
UNION ALL
SELECT 'FEEDBACK', COUNT(*) FROM FEEDBACK
UNION ALL
SELECT 'UPLOADED_FILE', COUNT(*) FROM UPLOADED_FILE;


-- ====================================================================
-- 2. VERIFY USERS & PASSWORDS (PERSON & CONTACTS)
-- ====================================================================
SELECT 
    p.PERSON_ID,
    p.NAME,
    p.EMAIL,
    p.ROLE,
    pc.CONTACT_NO,
    p.CREATED_AT
FROM PERSON p
LEFT JOIN PERSON_CONTACT pc ON pc.PERSON_ID = p.PERSON_ID
ORDER BY p.ROLE, p.NAME;


-- ====================================================================
-- 3. VERIFY PRACTITIONERS (CONSULTANT + PERSON DETAILS)
-- ====================================================================
SELECT 
    c.CONSULTANT_ID,
    p.NAME AS practitioner_name,
    p.EMAIL,
    c.SPECIALIZATION,
    c.QUALIFICATION
FROM CONSULTANT c
JOIN PERSON p ON p.PERSON_ID = c.PERSON_ID;


-- ====================================================================
-- 4. VERIFY CLIENTS (CLIENT + PERSON DETAILS)
-- ====================================================================
SELECT 
    cl.CLIENT_ID,
    p.NAME AS client_name,
    p.EMAIL,
    cl.ACCOUNT_STATUS,
    cl.DOB,
    cl.REASON
FROM CLIENT cl
JOIN PERSON p ON p.PERSON_ID = cl.PERSON_ID;


-- ====================================================================
-- 5. VERIFY CONSULTATION APPOINTMENTS (FULL JOINED DETAILS)
-- ====================================================================
SELECT 
    a.APPOINTMENT_ID,
    cp.NAME AS client_name,
    conp.NAME AS consultant_name,
    a.APPOINTMENT_DATE,
    a.APPOINTMENT_TIME,
    a.STATUS AS appointment_status,
    a.APPOINTMENT_MODE,
    a.REASON
FROM APPOINTMENT a
JOIN CLIENT c ON c.CLIENT_ID = a.CLIENT_ID
JOIN PERSON cp ON cp.PERSON_ID = c.PERSON_ID
LEFT JOIN CONSULTANT con ON con.CONSULTANT_ID = a.CONSULTANT_ID
LEFT JOIN PERSON conp ON conp.PERSON_ID = con.PERSON_ID
ORDER BY a.APPOINTMENT_DATE DESC;


-- ====================================================================
-- 6. VERIFY CONSULTANT CALENDAR SLOTS
-- ====================================================================
SELECT 
    s.SLOT_ID,
    p.NAME AS consultant_name,
    s.SLOT_DATE,
    s.START_TIME,
    s.END_TIME,
    s.SLOT_STATUS
FROM AVAILABILITY_SLOT s
JOIN CONSULTANT c ON c.CONSULTANT_ID = s.CONSULTANT_ID
JOIN PERSON p ON p.PERSON_ID = c.PERSON_ID
ORDER BY s.SLOT_DATE, s.START_TIME;


-- ====================================================================
-- 7. VERIFY INTAKE FORMS (PRECONSULTATION_FORM JSON DATA)
-- ====================================================================
SELECT 
    pf.FORM_ID,
    p.NAME AS client_name,
    a.STATUS AS appointment_status,
    pf.RESPONSES->>'symptoms' AS reported_symptoms,
    pf.RESPONSES->>'medication' AS current_medication,
    pf.RESPONSES->>'emergency_contact' AS emergency_contact,
    pf.SUBMITTED_AT
FROM PRECONSULTATION_FORM pf
JOIN APPOINTMENT a ON a.APPOINTMENT_ID = pf.APPOINTMENT_ID
JOIN CLIENT c ON c.CLIENT_ID = a.CLIENT_ID
JOIN PERSON p ON p.PERSON_ID = c.PERSON_ID;


-- ====================================================================
-- 8. VERIFY TELEHEALTH SESSIONS & STATUS
-- ====================================================================
SELECT 
    cs.SESSION_ID,
    cp.NAME AS client_name,
    conp.NAME AS practitioner_name,
    cs.SESSION_STATUS,
    cs.STARTED_AT,
    cs.ENDED_AT
FROM CONSULTATION_SESSION cs
JOIN APPOINTMENT a ON a.APPOINTMENT_ID = cs.APPOINTMENT_ID
JOIN CLIENT c ON c.CLIENT_ID = a.CLIENT_ID
JOIN PERSON cp ON cp.PERSON_ID = c.PERSON_ID
LEFT JOIN CONSULTANT con ON con.CONSULTANT_ID = a.CONSULTANT_ID
LEFT JOIN PERSON conp ON conp.PERSON_ID = con.PERSON_ID;


-- ====================================================================
-- 9. VERIFY CLINICAL CASE NOTES (DOSSIER ENTRIES)
-- ====================================================================
SELECT 
    n.NOTE_ID,
    cp.NAME AS client_name,
    conp.NAME AS author_practitioner,
    n.TITLE,
    n.TAG,
    n.NOTE_TEXT,
    n.CREATED_AT
FROM PRIVATE_NOTE n
JOIN CLIENT c ON c.CLIENT_ID = n.CLIENT_ID
JOIN PERSON cp ON cp.PERSON_ID = c.PERSON_ID
JOIN CONSULTANT con ON con.CONSULTANT_ID = n.CONSULTANT_ID
JOIN PERSON conp ON conp.PERSON_ID = con.PERSON_ID
ORDER BY n.CREATED_AT DESC;


-- ====================================================================
-- 10. VERIFY CLIENT REVIEWS & RATINGS (FEEDBACK)
-- ====================================================================
SELECT 
    f.FEEDBACK_ID,
    p.NAME AS client_name,
    f.RATING,
    f.CATEGORY,
    f.COMMENT_TEXT,
    f.IS_ANONYMOUS,
    f.CLINICIAN_REPLY,
    f.SUBMITTED_AT
FROM FEEDBACK f
JOIN CLIENT c ON c.CLIENT_ID = f.CLIENT_ID
JOIN PERSON p ON p.PERSON_ID = c.PERSON_ID
ORDER BY f.SUBMITTED_AT DESC;


-- ====================================================================
-- 11. VERIFY UPLOADED VAULT DOCUMENTS & ANCHOR IMAGES
-- ====================================================================
SELECT 
    f.FILE_ID,
    p.NAME AS owner_name,
    p.ROLE,
    f.FILE_NAME,
    ROUND(f.FILE_SIZE / 1024.0, 1) AS size_in_kb,
    f.MIME_TYPE,
    f.UPLOADED_BY,
    f.UPLOADED_AT
FROM UPLOADED_FILE f
LEFT JOIN PERSON p ON p.PERSON_ID = f.PERSON_ID
ORDER BY f.UPLOADED_AT DESC;


-- ====================================================================
-- 12. VERIFY STORAGE BUCKET CONFIGURATION
-- ====================================================================
SELECT id, name, public, created_at FROM storage.buckets WHERE id = 'mindcare-images';
