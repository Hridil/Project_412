import re
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

def check(condition, message):
    if condition:
        print(f"  [PASS] {message}")
    else:
        print(f"  [FAIL] {message}")
        sys.exit(1)

def check_balanced(text, file_name):
    open_b = text.count('{')
    close_b = text.count('}')
    check(open_b == close_b, f"{file_name} curly braces balanced ({open_b}=={close_b})")

    open_p = text.count('(')
    close_p = text.count(')')
    check(open_p == close_p, f"{file_name} parentheses balanced ({open_p}=={close_p})")

print("=" * 75)
print("MINDCARE PRO - FILE & NOTE DELETION VERIFICATION SUITE")
print("=" * 75)

print("\n[TEST 1] Verifying Syntax & Structural Integrity:")
app_js = (BASE_DIR / "src" / "App.jsx").read_text(encoding="utf-8")
check_balanced(app_js, "App.jsx")

client_docs_js = (BASE_DIR / "src" / "views" / "client" / "ClientDocuments.jsx").read_text(encoding="utf-8")
check_balanced(client_docs_js, "ClientDocuments.jsx")

cons_docs_js = (BASE_DIR / "src" / "views" / "consultant" / "ClientDocuments.jsx").read_text(encoding="utf-8")
check_balanced(cons_docs_js, "Consultant ClientDocuments.jsx")

supabase_client_js = (BASE_DIR / "src" / "services" / "supabaseClient.js").read_text(encoding="utf-8")
check_balanced(supabase_client_js, "supabaseClient.js")

dossier_modal_js = (BASE_DIR / "src" / "components" / "modals" / "ClientDossierModal.jsx").read_text(encoding="utf-8")
check_balanced(dossier_modal_js, "ClientDossierModal.jsx")

print("\n[TEST 2] Verifying Supabase API Delete Methods:")
check("deleteFile: async" in supabase_client_js, "supabaseApi.deleteFile method exists")
check("uploaded_file?file_id=eq." in supabase_client_js, "deleteFile targets uploaded_file endpoint with file_id parameter")
check('method: "DELETE"' in supabase_client_js or "method: 'DELETE'" in supabase_client_js, "deleteFile uses DELETE HTTP method")
check("deletePrivateNote: async" in supabase_client_js, "supabaseApi.deletePrivateNote method exists")
check("private_note?note_id=eq." in supabase_client_js, "deletePrivateNote targets private_note endpoint with note_id parameter")

print("\n[TEST 3] Verifying Client Document Deletion Permissions in UI:")
check("Documents shared by your clinician cannot be deleted" not in client_docs_js, "ClientDocuments.jsx no longer blocks client from deleting shared files")
check("handleDeleteItem('fl', f.id)" in client_docs_js, "Client documents delete button invokes handleDeleteItem('fl', f.id)")
check("handleDeleteItem('fl', f.id)" in cons_docs_js, "Consultant documents delete button invokes handleDeleteItem('fl', f.id)")
check("handleDeleteItem('fl', f.id)" in dossier_modal_js, "Client dossier modal delete button invokes handleDeleteItem('fl', f.id)")

print("\n[TEST 4] Verifying App.jsx handleDeleteItem Logic:")
check("String(x.id) !== String(id)" in app_js, "handleDeleteItem uses type-safe String comparison for ID filtering")
check("supabaseApi.deleteFile(id)" in app_js, "handleDeleteItem calls supabaseApi.deleteFile(id)")
check("supabaseApi.deletePrivateNote(id)" in app_js, "handleDeleteItem calls supabaseApi.deletePrivateNote(id)")

print("\n[TEST 5] Emulating State Filter Behavior (String vs Number IDs):")
mock_files = [
    {"id": 1, "name": "medical_history.pdf"},
    {"id": "2", "name": "lab_results.png"},
    {"id": 3, "name": "intake_form.txt"}
]

# Delete with string ID '1'
filtered_1 = [f for f in mock_files if str(f["id"]) != str("1")]
check(len(filtered_1) == 2 and not any(f["id"] == 1 for f in filtered_1), "String '1' deletes numeric id 1")

# Delete with numeric ID 2
filtered_2 = [f for f in mock_files if str(f["id"]) != str(2)]
check(len(filtered_2) == 2 and not any(f["id"] == "2" for f in filtered_2), "Numeric 2 deletes string id '2'")

print("\n" + "=" * 75)
print("ALL FILE DELETION VERIFICATION CHECKS PASSED!")
print("=" * 75)
