"""
Test Suite: Consultant Feedback & Details Storage Feature
Verifies that consultants have options to store client feedbacks and details:
1. Store feedback as confidential record in Client Vault (uploaded_file / S.fl)
2. Archive feedback into Private Clinical Notes (private_note / S.nt)
3. Download/export feedback details as formatted .txt report
4. Dedicated "Stored Feedback & Details Archive" view in ConsultantFeedback
5. 1-click storage actions in ClientDossierModal Feedback tab
6. Supabase integration: updateFeedbackReply, uploadFileRecord, createNote
"""

import os
import sys
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def check_file_exists(rel_path):
    full = os.path.join(ROOT, rel_path)
    assert os.path.exists(full), f"File missing: {rel_path}"
    with open(full, 'r', encoding='utf-8') as f:
        return f.read()

def test_supabase_client():
    print("[1/5] Verifying src/services/supabaseClient.js...")
    content = check_file_exists("src/services/supabaseClient.js")
    assert "updateFeedbackReply" in content, "Missing updateFeedbackReply in supabaseClient.js"
    assert "clinician_reply" in content, "Missing clinician_reply field update in updateFeedbackReply"
    print("  -> updateFeedbackReply API successfully found")

def test_app_jsx():
    print("[2/5] Verifying src/App.jsx storage handlers & props wiring...")
    content = check_file_exists("src/App.jsx")
    
    # Check handleStoreFeedbackAsFile
    assert "handleStoreFeedbackAsFile" in content, "Missing handleStoreFeedbackAsFile in App.jsx"
    assert "Feedback_Record_" in content, "Missing Feedback_Record_ filename prefix"
    assert "CLIENT CARE FEEDBACK & EVALUATION RECORD" in content, "Missing formal clinical record template"
    assert "uploadFileRecord" in content, "Missing uploadFileRecord call for Supabase persistence"
    assert "tag: 'Client Feedback'" in content or 'tag: "Client Feedback"' in content, "Missing Client Feedback tag"

    # Check handleStoreFeedbackAsNote
    assert "handleStoreFeedbackAsNote" in content, "Missing handleStoreFeedbackAsNote in App.jsx"
    assert "createNote" in content, "Missing createNote call for Supabase persistence"
    assert "Care Feedback:" in content, "Missing Care Feedback: title format"

    # Check handleDownloadFeedback
    assert "handleDownloadFeedback" in content, "Missing handleDownloadFeedback in App.jsx"
    assert "download" in content, "Missing download trigger"

    # Check prop passing to ConsultantFeedback
    assert "handleStoreFeedbackAsFile={handleStoreFeedbackAsFile}" in content, "ConsultantFeedback missing handleStoreFeedbackAsFile prop"
    assert "handleStoreFeedbackAsNote={handleStoreFeedbackAsNote}" in content, "ConsultantFeedback missing handleStoreFeedbackAsNote prop"
    assert "handleDownloadFeedback={handleDownloadFeedback}" in content, "ConsultantFeedback missing handleDownloadFeedback prop"

    # Check prop passing to ClientDossierModal
    assert "<ClientDossierModal" in content, "ClientDossierModal invocation not found"
    pos_modal = content.find("<ClientDossierModal")
    modal_chunk = content[pos_modal:pos_modal + 2000]
    assert "handleStoreFeedbackAsFile" in modal_chunk, "ClientDossierModal missing handleStoreFeedbackAsFile prop"
    assert "handleStoreFeedbackAsNote" in modal_chunk, "ClientDossierModal missing handleStoreFeedbackAsNote prop"
    assert "handleDownloadFeedback" in modal_chunk, "ClientDossierModal missing handleDownloadFeedback prop"
    print("  -> App.jsx storage handlers and modal wiring verified")

def test_consultant_feedback_view():
    print("[3/5] Verifying src/views/consultant/ConsultantFeedback.jsx...")
    content = check_file_exists("src/views/consultant/ConsultantFeedback.jsx")

    # View Mode state & Toggle
    assert "viewMode" in content, "Missing viewMode in ConsultantFeedback.jsx"
    assert "Stored Feedback & Details Archive" in content, "Missing Stored Feedback & Details Archive button/view"
    
    # Filter for stored files and notes
    assert "storedVaultFiles" in content, "Missing storedVaultFiles calculation"
    assert "storedNotes" in content, "Missing storedNotes calculation"
    assert "Client Vault Feedback Records" in content, "Missing Client Vault Feedback Records section"
    assert "Archived Private Clinical Notes" in content, "Missing Archived Private Clinical Notes section"

    # Action bar on feedback cards
    assert "Store Feedback & Details:" in content, "Missing Store Feedback & Details action bar"
    assert "Store in Vault" in content, "Missing Store in Vault button"
    assert "Archive to Notes" in content, "Missing Archive to Notes button"
    assert "Export" in content, "Missing Export button"

    # Storage handlers in component
    assert "handleStoreVault" in content, "Missing handleStoreVault helper"
    assert "handleStoreNote" in content, "Missing handleStoreNote helper"
    assert "handleDownload" in content, "Missing handleDownload helper"
    print("  -> ConsultantFeedback.jsx stored archive view & card action buttons verified")

def test_client_dossier_modal():
    print("[4/5] Verifying src/components/modals/ClientDossierModal.jsx...")
    content = check_file_exists("src/components/modals/ClientDossierModal.jsx")

    assert "handleStoreFeedbackAsFile" in content, "ClientDossierModal missing handleStoreFeedbackAsFile"
    assert "handleStoreFeedbackAsNote" in content, "ClientDossierModal missing handleStoreFeedbackAsNote"
    assert "handleDownloadFeedback" in content, "ClientDossierModal missing handleDownloadFeedback"
    assert "Store in Vault" in content, "ClientDossierModal missing Store in Vault option on feedback"
    assert "Archive to Notes" in content or "Archived in Notes" in content, "ClientDossierModal missing Archive to Notes option"
    print("  -> ClientDossierModal.jsx 1-click storage actions verified")

def test_jsx_parenthesis_balance():
    print("[5/5] Checking structural balance of JSX files...")
    files = [
        "src/views/consultant/ConsultantFeedback.jsx",
        "src/components/modals/ClientDossierModal.jsx",
        "src/App.jsx",
        "src/services/supabaseClient.js"
    ]
    for rel in files:
        full = os.path.join(ROOT, rel)
        with open(full, 'r', encoding='utf-8') as f:
            code = f.read()
        
        # Check matching curly braces, parentheses, square brackets (outside of strings and comments)
        # Simple count check for balanced brackets
        counts = {
            '{': code.count('{') - code.count('}'),
            '(': code.count('(') - code.count(')'),
            '[': code.count('[') - code.count(']')
        }
        for b, diff in counts.items():
            assert diff == 0, f"Unbalanced {b} in {rel}: difference {diff}"
        print(f"  -> {rel} bracket balance OK")

def main():
    print("=== Testing Consultant Feedback Storage Feature ===")
    test_supabase_client()
    test_app_jsx()
    test_consultant_feedback_view()
    test_client_dossier_modal()
    test_jsx_parenthesis_balance()
    print("=== ALL TESTS PASSED SUCCESSFULLY! ===")

if __name__ == '__main__':
    main()
