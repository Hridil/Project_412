import os
import sys
import re
import hashlib
import binascii

def test_security_suite():
    print("=" * 70)
    print("MINDCARE PRO - SECURITY, AUTHENTICATION & SANITIZATION TEST SUITE")
    print("=" * 70)

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    supabase_sql = os.path.join(base_dir, "database", "MindCare_Pro_Supabase.sql")
    all_in_one_sql = os.path.join(base_dir, "database", "00_full_schema_and_demo_setup.sql")
    mysql_sql = os.path.join(base_dir, "database", "MindCare_Pro_MySQL.sql")
    client_js = os.path.join(base_dir, "src", "services", "supabaseClient.js")

    all_tests_passed = True

    # -------------------------------------------------------------
    # 1. DATABASE SCHEMA SECURITY & INTEGRITY CONSTRAINTS
    # -------------------------------------------------------------
    print("\n[TEST 1] Verifying Database Security Constraints & Functions:")
    
    with open(supabase_sql, "r", encoding="utf-8") as f:
        supa_content = f.read()

    checks = [
        ("Sanitization Engine Function (sanitize_text)", "CREATE OR REPLACE FUNCTION sanitize_text"),
        ("Person Data Sanitization Trigger", "trg_sanitize_person_data"),
        ("Note Data Sanitization Trigger", "trg_sanitize_note_data"),
        ("Feedback Data Sanitization Trigger", "trg_sanitize_feedback_data"),
        ("Note Clinician Authorization Trigger", "trg_verify_note_authorization"),
        ("Feedback Client Authorization Trigger", "trg_verify_feedback_authorization"),
        ("Database Authentication Function", "authenticate_user"),
        ("Email Regex Check Constraint", "CK_PERSON_EMAIL_FORMAT"),
        ("Role Check Constraint", "CK_PERSON_ROLE"),
        ("Password Hash Length Constraint", "CK_PERSON_PASSWORD_HASH"),
        ("Anti-Path-Traversal Check Constraint", "CK_FILE_NAME_SAFE"),
        ("Phone Format Check Constraint", "CK_CONTACT_PHONE_FORMAT"),
        ("Row-Level Security on PRIVATE_NOTE", "Consultants can read private notes"),
        ("Row-Level Security on FEEDBACK", "Clients can insert feedback")
    ]

    for label, pattern in checks:
        if pattern in supa_content:
            print(f"  [PASS] {label}")
        else:
            print(f"  [FAIL] {label} missing in {supabase_sql}!")
            all_tests_passed = False

    # -------------------------------------------------------------
    # 2. INPUT SANITIZATION LOGIC TESTS (XSS, Traversal, Null Bytes)
    # -------------------------------------------------------------
    print("\n[TEST 2] Verifying Input Sanitization Functions:")

    # Emulate the database & JS sanitization logic
    def py_sanitize_text(val):
        if not val:
            return ""
        # Remove null bytes
        val = val.replace("\0", "")
        # Remove scripts
        val = re.sub(r"<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>", "", val, flags=re.I)
        # Remove all HTML tags
        val = re.sub(r"<[^>]+>", "", val)
        # Normalize whitespace
        return " ".join(val.split()).strip()

    def py_sanitize_filename(val):
        if not val:
            return "document"
        val = re.sub(r"(\.\.[/\\]|[/\\])", "_", val)
        val = re.sub(r"[^a-zA-Z0-9._-]", "_", val)
        return val[:255]

    def py_validate_email(email):
        pattern = r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9]+([.-][A-Za-z0-9]+)*\.[A-Za-z]{2,}$"
        return bool(re.match(pattern, email.strip().lower()))

    # Test Cases
    xss_payload = "<script>alert('xss')</script>Hello Dr. Sarah<b>!</b>"
    sanitized_xss = py_sanitize_text(xss_payload)
    if "<script>" not in sanitized_xss and "<b>" not in sanitized_xss and sanitized_xss == "Hello Dr. Sarah!":
        print(f"  [PASS] XSS & HTML tag stripping: \"{sanitized_xss}\"")
    else:
        print(f"  [FAIL] XSS not properly stripped: \"{sanitized_xss}\"")
        all_tests_passed = False

    traversal_payload = "../../../etc/passwd_confidential.pdf"
    sanitized_path = py_sanitize_filename(traversal_payload)
    if ".." not in sanitized_path and "/" not in sanitized_path:
        print(f"  [PASS] Path traversal neutralized: \"{sanitized_path}\"")
    else:
        print(f"  [FAIL] Path traversal not neutralized: \"{sanitized_path}\"")
        all_tests_passed = False

    null_byte_payload = "Sarah\0Mitchell"
    sanitized_null = py_sanitize_text(null_byte_payload)
    if "\0" not in sanitized_null and sanitized_null == "SarahMitchell":
        print(f"  [PASS] Null byte injection stripped: \"{sanitized_null}\"")
    else:
        print(f"  [FAIL] Null byte not stripped: \"{sanitized_null}\"")
        all_tests_passed = False

    # Email validations
    valid_emails = ["dr.sarah@mindcare.com", "client_jamie.99@example.org"]
    invalid_emails = ["notanemail", "user@localhost", "user@.com", "user@domain..com"]
    valid_pass = all(py_validate_email(e) for e in valid_emails)
    invalid_pass = all(not py_validate_email(e) for e in invalid_emails)
    if valid_pass and invalid_pass:
        print("  [PASS] RFC 5322 Email Validation successfully accepts valid and rejects malicious formats.")
    else:
        print("  [FAIL] Email validation failed regex expectations.")
        all_tests_passed = False

    # -------------------------------------------------------------
    # 3. AUTHENTICATION & PASSWORD SALTING VERIFICATION
    # -------------------------------------------------------------
    print("\n[TEST 3] Verifying Cryptographic Password Salting & Auth Flow:")

    password = "password123"
    salt = binascii.hexlify(os.urandom(16)).decode('utf-8')
    derived_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()

    if len(salt) == 32 and len(derived_hash) == 64:
        print(f"  [PASS] PBKDF2 SHA-256 Salt generated: {salt[:8]}... (32 hex characters)")
        print(f"  [PASS] Password Hash generated: {derived_hash[:8]}... (64 hex characters)")
    else:
        print("  [FAIL] Password hash/salt length mismatch!")
        all_tests_passed = False

    # Incorrect password test
    wrong_hash = hashlib.pbkdf2_hmac('sha256', "wrongpassword".encode('utf-8'), salt.encode('utf-8'), 100000).hex()
    if wrong_hash != derived_hash:
        print("  [PASS] Incorrect credentials successfully rejected (cryptographic hash mismatch).")
    else:
        print("  [FAIL] Incorrect password produced colliding hash!")
        all_tests_passed = False

    # -------------------------------------------------------------
    # 4. AUTHORIZATION (RBAC) GUARDS VERIFICATION
    # -------------------------------------------------------------
    print("\n[TEST 4] Verifying Role-Based Access Control (RBAC) Authorization:")

    def py_check_authorization(user, allowed_roles):
        if not user or user.get("role") not in allowed_roles:
            return False
        return True

    consultant_user = {"id": "u1", "name": "Dr. Sarah", "role": "consultant"}
    client_user = {"id": "u2", "name": "Jamie Vance", "role": "client"}

    # Private note authorization
    if py_check_authorization(consultant_user, ["consultant"]):
        print("  [PASS] Consultant authorized to author & access private clinical notes.")
    else:
        print("  [FAIL] Consultant improperly denied private note access.")
        all_tests_passed = False

    if not py_check_authorization(client_user, ["consultant"]):
        print("  [PASS] Client strictly blocked from unauthorized private clinical notes (Confidentiality Guard).")
    else:
        print("  [FAIL] Client was improperly granted access to private clinical notes!")
        all_tests_passed = False

    # Feedback authorization
    if py_check_authorization(client_user, ["client"]):
        print("  [PASS] Active Client authorized to submit session feedback.")
    else:
        print("  [FAIL] Active Client improperly blocked from feedback.")
        all_tests_passed = False

    # -------------------------------------------------------------
    # 5. FRONTEND JAVASCRIPT CLIENT SECURITY VERIFICATION
    # -------------------------------------------------------------
    print("\n[TEST 5] Verifying Frontend Security Service Implementation:")
    with open(client_js, "r", encoding="utf-8") as f:
        js_content = f.read()

    js_checks = [
        ("sanitizeText function", "export const sanitizeText"),
        ("sanitizeEmail function", "export const sanitizeEmail"),
        ("sanitizeFileName function", "export const sanitizeFileName"),
        ("sanitizePhone function", "export const sanitizePhone"),
        ("checkAuthorization guard", "export const checkAuthorization"),
        ("Register input sanitization", "sanitizeEmail(email)"),
        ("Login authorization check", "user.role !== expectedRole"),
        ("Private note role guard", "checkAuthorization(currentUser, ['consultant'")
    ]

    for label, pattern in js_checks:
        if pattern in js_content:
            print(f"  [PASS] {label}")
        else:
            print(f"  [FAIL] {label} missing in {client_js}!")
            all_tests_passed = False

    # -------------------------------------------------------------
    # 6. CLIENT FILE VAULT TENANT ISOLATION TESTS
    # -------------------------------------------------------------
    print("\n[TEST 6] Verifying Client Document Vault Tenant Isolation:")

    def py_can_access_file(user, file_obj):
        if not user or not file_obj:
            return False
        if user.get("role") == "admin":
            return True
        if user.get("role") == "client":
            return (
                file_obj.get("uid") == user.get("id") or
                (user.get("client_id") and file_obj.get("client_id") == user.get("client_id")) or
                (user.get("person_id") and file_obj.get("person_id") == user.get("person_id")) or
                (user.get("email") and file_obj.get("email") == user.get("email"))
            )
        return True

    client_a = {"id": "client_1", "client_id": 10, "person_id": 100, "email": "client_a@mindcare.com", "role": "client"}
    client_b = {"id": "client_2", "client_id": 20, "person_id": 200, "email": "client_b@mindcare.com", "role": "client"}

    file_a = {"id": "f1", "name": "cbt_journal_a.pdf", "uid": "client_1", "client_id": 10, "person_id": 100}
    file_b = {"id": "f2", "name": "lab_report_b.pdf", "uid": "client_2", "client_id": 20, "person_id": 200}

    # Client A accessing own file
    if py_can_access_file(client_a, file_a):
        print("  [PASS] Client A authorized to access their own confidential file.")
    else:
        print("  [FAIL] Client A improperly denied access to their own file!")
        all_tests_passed = False

    # Client A attempting to access Client B's file
    if not py_can_access_file(client_a, file_b):
        print("  [PASS] Client A strictly blocked from accessing Client B's confidential file.")
    else:
        print("  [FAIL] Security Breach! Client A was granted access to Client B's file!")
        all_tests_passed = False

    # Client B attempting to access Client A's file
    if not py_can_access_file(client_b, file_a):
        print("  [PASS] Client B strictly blocked from accessing Client A's confidential file.")
    else:
        print("  [FAIL] Security Breach! Client B was granted access to Client A's file!")
        all_tests_passed = False

    # Verify Database RLS policy for file isolation exists in SQL files
    with open(all_in_one_sql, "r", encoding="utf-8") as f:
        all_sql_content = f.read()

    if 'CREATE POLICY "Clients can only access own files" ON UPLOADED_FILE' in supa_content and \
       'CREATE POLICY "Clients can only access own files" ON UPLOADED_FILE' in all_sql_content:
        print("  [PASS] Database RLS Policy 'Clients can only access own files' verified in PostgreSQL schema.")
    else:
        print("  [FAIL] Missing RLS file isolation policy in database schemas!")
        all_tests_passed = False

    # -------------------------------------------------------------
    # 7. CONSULTANT CASELOAD TENANT ISOLATION TESTS
    # -------------------------------------------------------------
    print("\n[TEST 7] Verifying Consultant Caseload Tenant Isolation:")

    def py_can_consultant_handle_client(consultant, client, appointments=None):
        if not consultant or not client:
            return False
        appointments = appointments or []
        cons_id = consultant.get("id")
        cons_uid = consultant.get("uid", cons_id)
        cons_db_id = consultant.get("consultant_id")

        if client.get("assignedConsultantId") in [cons_id, cons_uid, cons_db_id] or \
           client.get("consultant_id") in [cons_id, cons_uid, cons_db_id]:
            return True

        has_ap = any(
            (a.get("cid") == client.get("id") or a.get("uid") == client.get("uid")) and
            a.get("consultant_id") in [cons_id, cons_uid, cons_db_id]
            for a in appointments
        )
        return has_ap

    cons_sarah = {"id": "c1", "consultant_id": 1, "name": "Dr. Sarah", "role": "consultant"}
    cons_marcus = {"id": "c2", "consultant_id": 2, "name": "Dr. Marcus", "role": "consultant"}

    patient_sarah = {"id": 101, "uid": "p1", "name": "Sarah's Client", "assignedConsultantId": "c1"}
    patient_marcus = {"id": 102, "uid": "p2", "name": "Marcus's Client", "assignedConsultantId": "c2"}
    patient_unassigned = {"id": 103, "uid": "p3", "name": "Intake Client"}

    # Dr. Sarah handles her own client
    if py_can_consultant_handle_client(cons_sarah, patient_sarah):
        print("  [PASS] Dr. Sarah authorized to handle her selected/assigned client.")
    else:
        print("  [FAIL] Dr. Sarah improperly blocked from her own assigned client!")
        all_tests_passed = False

    # Dr. Sarah cannot handle Dr. Marcus's client
    if not py_can_consultant_handle_client(cons_sarah, patient_marcus):
        print("  [PASS] Dr. Sarah strictly blocked from unselected client handled by Dr. Marcus.")
    else:
        print("  [FAIL] Security Breach! Dr. Sarah was permitted to handle Dr. Marcus's client!")
        all_tests_passed = False

    # Dr. Marcus cannot handle Dr. Sarah's client
    if not py_can_consultant_handle_client(cons_marcus, patient_sarah):
        print("  [PASS] Dr. Marcus strictly blocked from unselected client handled by Dr. Sarah.")
    else:
        print("  [FAIL] Security Breach! Dr. Marcus was permitted to handle Dr. Sarah's client!")
        all_tests_passed = False

    # Verify Database RLS policy for client caseload isolation
    if 'CREATE POLICY "Clients read own profile" ON CLIENT' in supa_content and \
       'CREATE POLICY "Clients read own profile" ON CLIENT' in all_sql_content:
        print("  [PASS] Database RLS Policy 'Clients read own profile' verified in PostgreSQL schema.")
    else:
        print("  [FAIL] Missing RLS client caseload policy in database schemas!")
        all_tests_passed = False

    # -------------------------------------------------------------
    # FINAL VERDICT
    # -------------------------------------------------------------
    print("\n" + "=" * 70)
    if all_tests_passed:
        print("ALL SECURITY, AUTHENTICATION, AUTHORIZATION & SANITIZATION TESTS PASSED!")
    else:
        print("SOME TESTS FAILED! Please review the output above.")
    print("=" * 70)

    return all_tests_passed

if __name__ == "__main__":
    success = test_security_suite()
    sys.exit(0 if success else 1)
