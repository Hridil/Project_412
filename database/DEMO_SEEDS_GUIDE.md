# MindCare Pro · Demo Database Seeds & Diagnostic Queries

This directory contains modular SQL test seed scripts designed specifically for **Supabase (PostgreSQL)**. They populate realistic clinical consultations, intake questionnaires, practitioner schedules, and client feedback to thoroughly test your frontend UI.

---

## ⚡ The Ultimate 1-Click File: `00_full_schema_and_demo_setup.sql`

If you want to set up your entire database in **one single step**, use:

👉 **[`00_full_schema_and_demo_setup.sql`](./00_full_schema_and_demo_setup.sql)**

This script executes everything in the proper order:
1. Safely drops any existing tables (`DROP TABLE IF EXISTS ... CASCADE`).
2. Creates all 11 relational tables (`PERSON`, `CLIENT`, `APPOINTMENT`, etc.).
3. Enables Row Level Security (RLS) with full read/write policies for your API keys.
4. Prepares the public `mindcare-images` storage bucket.
5. Populates all demo users, doctors, appointments, notes, and feedback.

Just paste it into the Supabase SQL Editor and click **Run**!

---

## 🔍 Diagnostic Queries: `00_Test_query.sql` & `99_verify_database_queries.sql`

To view your tables, check row counts, or query clients together with their full names from `PERSON`, use:

👉 **[`00_Test_query.sql`](./00_Test_query.sql)** or **[`99_verify_database_queries.sql`](./99_verify_database_queries.sql)**

**Example - Query all clients with their names and reasons:**
```sql
SELECT 
    cl.CLIENT_ID,
    p.NAME AS client_name,
    p.EMAIL,
    cl.ACCOUNT_STATUS,
    cl.DOB,
    cl.REASON
FROM CLIENT cl
JOIN PERSON p ON p.PERSON_ID = cl.PERSON_ID
ORDER BY cl.CLIENT_ID ASC;
```

---

## 🔑 Demo Login Credentials

All demo accounts use the exact same password and have valid cryptographic `PBKDF2` password hashes that work with [`src/services/supabaseClient.js`](../src/services/supabaseClient.js):

* **Password for all demo accounts**: `password123`

| Name | Role | Email | Password |
| :--- | :--- | :--- | :--- |
| **Dr. Sarah Mitchell** | Consultant (Practitioner) | `sarah.mitchell@mindcare.com` | `password123` |
| **Dr. Marcus Vance** | Consultant (Practitioner) | `marcus.vance@mindcare.com` | `password123` |
| **Emily Watson** | Client | `emily.watson@mindcare.com` | `password123` |
| **Jamie Chen** | Client | `jamie.chen@mindcare.com` | `password123` |
| **Michael Rivera** | Client (Pending Triage) | `michael.rivera@mindcare.com` | `password123` |

---

## 📁 Step-by-Step Serial Order (If Running Individually)

If you prefer to inspect and run each step individually:

1. **[`01_demo_persons_and_contacts.sql`](./01_demo_persons_and_contacts.sql)**: Creates user accounts & phone numbers.
2. **[`02_demo_consultants_and_clients.sql`](./02_demo_consultants_and_clients.sql)**: Creates clinician and client profiles.
3. **[`03_demo_availability_slots.sql`](./03_demo_availability_slots.sql)**: Generates calendar booking time slots.
4. **[`04_demo_appointments.sql`](./04_demo_appointments.sql)**: Links clients to consultants in appointments.
5. **[`05_demo_preconsultation_forms.sql`](./05_demo_preconsultation_forms.sql)**: Inserts pre-session intake questions.
6. **[`06_demo_consultation_sessions.sql`](./06_demo_consultation_sessions.sql)**: Creates telehealth sessions with meeting links.
7. **[`07_demo_clinical_notes.sql`](./07_demo_clinical_notes.sql)**: Adds private clinical notes to client dossiers.
8. **[`08_demo_feedback.sql`](./08_demo_feedback.sql)**: Adds 5-star patient reflection ratings and replies.
9. **[`09_demo_uploaded_files.sql`](./09_demo_uploaded_files.sql)**: Adds document vault items & calming photos.
10. **[`10_demo_all_in_one.sql`](./10_demo_all_in_one.sql)**: Runs all 9 seed files without altering existing schema tables.
