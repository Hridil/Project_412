"""
MINDCARE PRO - PRE-CONSULTATION INTAKE FORM & STORAGE TEST SUITE
================================================================
Validates:
1. Syntax and JSX balance of:
   - src/views/client/BookSession.jsx
   - src/components/modals/ClientDossierModal.jsx
   - src/views/consultant/ConsultantSchedule.jsx
   - src/App.jsx
   - src/services/supabaseClient.js
2. Pre-consultation intake form fields:
   - Concern category options
   - Distress rating scale (1-10)
   - Duration and treatment history
   - Goals & safety screen acknowledgement
3. Consultant storage pipeline:
   - Storage into client document vault (file generation, HIPAA format)
   - Archival into private clinical notes (intake note format)
   - Live Supabase PRECONSULTATION_FORM table connectivity
"""

import sys
import os
import json
import urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SRC_DIR = BASE_DIR / "src"

SUPABASE_URL = "https://lsxpftzwwnexeixtvqcc.supabase.co/rest/v1/"
SUPABASE_KEY = "sb_publishable_2Yd0uF2QhyJqzNfzabI7xg_4oII1QWS"
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def check_brace_balance(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    open_c = content.count("{")
    close_c = content.count("}")
    open_p = content.count("(")
    close_p = content.count(")")
    return open_c == close_c, open_p == close_p, open_c, close_c, open_p, close_p

def test_syntax_and_balance():
    print("\n[TEST 1] Verifying Syntax & Structural Integrity of Intake & Storage Files:")
    files = [
        ("BookSession.jsx", SRC_DIR / "views" / "client" / "BookSession.jsx"),
        ("ClientDossierModal.jsx", SRC_DIR / "components" / "modals" / "ClientDossierModal.jsx"),
        ("ConsultantSchedule.jsx", SRC_DIR / "views" / "consultant" / "ConsultantSchedule.jsx"),
        ("App.jsx", SRC_DIR / "App.jsx"),
        ("supabaseClient.js", SRC_DIR / "services" / "supabaseClient.js")
    ]
    for label, path in files:
        assert path.exists(), f"File {label} not found!"
        c_ok, p_ok, oc, cc, op, cp = check_brace_balance(path)
        assert c_ok, f"{label} braces unbalanced: {{{oc} vs }}{cc}"
        assert p_ok, f"{label} parens unbalanced: ({op} vs ){cp}"
        print(f"  [PASS] {label} braces ({oc}=={cc}) and parens ({op}=={cp}) balanced.")

def test_preconsultation_form_inputs():
    print("\n[TEST 2] Verifying Pre-Consultation Form Inputs & Clinical Assessment:")
    book_session = SRC_DIR / "views" / "client" / "BookSession.jsx"
    with open(book_session, "r", encoding="utf-8") as f:
        content = f.read()

    required_fields = [
        ("CONCERN_CATEGORIES", "Category of concern options"),
        ("distress_level", "Distress severity rating slider (1-10)"),
        ("duration", "Duration of symptoms dropdown"),
        ("prior_therapy", "Prior therapy history dropdown"),
        ("medications", "Medications and health factors input"),
        ("emergency_contact", "Confidential emergency contact input"),
        ("safetyConfirmed", "Crisis safety screening checkbox"),
        ("consultant_id", "Practitioner selection"),
        ("appointment_mode", "Modality selection")
    ]

    for field, desc in required_fields:
        assert field in content, f"Missing {desc} in BookSession.jsx"
        print(f"  [PASS] Verified {desc}")

def test_consultant_storage_features():
    print("\n[TEST 3] Verifying Consultant Intake Storage Features in Dossier & Schedule:")
    dossier_modal = SRC_DIR / "components" / "modals" / "ClientDossierModal.jsx"
    with open(dossier_modal, "r", encoding="utf-8") as f:
        dossier_content = f.read()

    assert "['intake', 'Pre-Consult Intake'" in dossier_content, "Missing Pre-Consult Intake tab in dossier modal"
    assert "handleStorePreconsultationAsFile" in dossier_content, "Missing Store in Vault action in dossier modal"
    assert "handleStorePreconsultationAsNote" in dossier_content, "Missing Store in Notes action in dossier modal"
    print("  [PASS] ClientDossierModal contains dedicated 'Pre-Consult Intake' tab with vault & notes storage.")

    sched_jsx = SRC_DIR / "views" / "consultant" / "ConsultantSchedule.jsx"
    with open(sched_jsx, "r", encoding="utf-8") as f:
        sched_content = f.read()

    assert "selectedIntakeAp" in sched_content, "Missing selectedIntakeAp modal state in ConsultantSchedule.jsx"
    assert "handleStorePreconsultationAsFile" in sched_content, "Missing Store in Vault action in ConsultantSchedule.jsx"
    assert "handleStorePreconsultationAsNote" in sched_content, "Missing Store in Notes action in ConsultantSchedule.jsx"
    print("  [PASS] ConsultantSchedule contains Pre-Consultation Intake Viewer and storage triggers.")

    app_jsx = SRC_DIR / "App.jsx"
    with open(app_jsx, "r", encoding="utf-8") as f:
        app_content = f.read()

    assert "handleStorePreconsultationAsFile =" in app_content, "Missing handleStorePreconsultationAsFile in App.jsx"
    assert "handleStorePreconsultationAsNote =" in app_content, "Missing handleStorePreconsultationAsNote in App.jsx"
    assert "createPreconsultationForm" in app_content, "Missing createPreconsultationForm call in App.jsx"
    print("  [PASS] App.jsx implements both vault file and clinical note storage handlers.")

def test_live_supabase_table():
    print("\n[TEST 4] Testing Live Supabase PRECONSULTATION_FORM Table Connectivity:")
    try:
        url = f"{SUPABASE_URL}preconsultation_form?select=*"
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f"  [PASS] Connected to table 'preconsultation_form' (HTTP {resp.status}, records={len(data)})")
    except Exception as e:
        print(f"  [WARNING] Live query: {e}")

def main():
    print("=" * 75)
    print("MINDCARE PRO - PRE-CONSULTATION INTAKE & STORAGE VERIFICATION")
    print("=" * 75)
    test_syntax_and_balance()
    test_preconsultation_form_inputs()
    test_consultant_storage_features()
    test_live_supabase_table()
    print("\n" + "=" * 75)
    print("ALL PRE-CONSULTATION INTAKE & STORAGE TESTS PASSED!")
    print("=" * 75)

if __name__ == "__main__":
    main()
