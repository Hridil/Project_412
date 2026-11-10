# MindCare Pro · MySQL Database Schema

This directory contains the relational database definition, table structures, and constraints for the **MindCare Pro** clinical platform.

---

## 1. Overview & Connection Details

- **Database Name**: `mindcare_pro`
- **Character Set**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`
- **Storage Engine**: `InnoDB`

---

## 2. Table Architecture

The schema models a multi-role mental health & clinical consultation platform with the following core entities:

### 2.1 Identity & User Management
- `PERSON`: Base user account entity with authentication credentials (`EMAIL`, `PASSWORD_HASH`).
- `PERSON_CONTACT`: Multi-phone contact registry per person.
- `CLIENT`: Client profile details, account status (`ACTIVE`, `INACTIVE`, `SUSPENDED`), date of birth.
- `CONSULTANT`: Clinician profile containing specialization details.

### 2.2 Availability & Scheduling
- `AVAILABILITY_SLOT`: Consultant working availability blocks (`START_TIME`, `END_TIME`, `IS_BOOKED`).
- `APPOINTMENT`: Booked consultations linking client, consultant, slot, booking status, and pre-consultation status.

### 2.3 Clinical Documentation & Intake
- `PRECONSULTATION_FORM`: Trauma-informed intake questionnaire (`SYMPTOMS`, `CURRENT_MEDICATION`, `CRISIS_FLAG`).
- `UPLOADED_FILE`: Confidential medical documents & vault attachments with checksum verification.
- `CONSULTATION_SESSION`: Clinical session encounter logs (`MEETING_LINK`, `START_TIME`, `END_TIME`, `SESSION_STATUS`).
- `PRIVATE_NOTE`: Confidential clinical practitioner case notes (`NOTE_CONTENT`, `CREATED_AT`).
- `FEEDBACK`: Patient care reflections and rating evaluations (`RATING`, `COMMENTS`, `CREATED_AT`).

### 2.4 Clinical AI & Resource Knowledgebase
- `RESOURCE_QUERY`: Clinician search/prompt queries for therapy guides and grounding techniques.
- `RESOURCE_DOCUMENT`: Reference clinical documents, CBT exercises, and therapeutic guides.
- `AI_RESPONSE`: AI-generated clinical assistance and evidence-based summaries.
- `CONSULTANT_RESOURCE_DOCUMENT`: Many-to-many relationship tracking consultant access to resource documents.
- `AI_RESPONSE_RESOURCE_DOCUMENT`: Citation links connecting AI responses with clinical resource documents.

---

## 3. Quick Setup & Import

To initialize the database locally in MySQL:

```bash
# 1. Login to MySQL
mysql -u root -p

# 2. Run the schema creation script
source database/MindCare_Pro_MySQL.sql;
```

Or directly via terminal:

```bash
mysql -u <username> -p < database/MindCare_Pro_MySQL.sql
```
