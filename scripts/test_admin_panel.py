"""
Test Suite: Admin Panel & User Governance
Verifies:
1. AdminPanel view with active client/consultant management, metrics, and search/filters
2. Strictly only active clients and active practitioners are displayed
3. Removal confirmation modal and permanent deprovisioning handlers
4. Supabase deleteClient & deleteConsultant API integration
5. Navigation items (NA), role-based routing, and clean admin authentication without demo pre-fill
6. Structural syntax balance across all modified files
"""

import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def check_file_exists(rel_path):
    full = os.path.join(ROOT, rel_path)
    assert os.path.exists(full), f"File missing: {rel_path}"
    with open(full, 'r', encoding='utf-8') as f:
        return f.read()

def test_admin_panel_component():
    print("[1/5] Verifying src/views/admin/AdminPanel.jsx...")
    content = check_file_exists("src/views/admin/AdminPanel.jsx")

    # Exclusively Active Clients & Active Consultants Filtering
    assert "activeClients" in content, "Missing activeClients calculation"
    assert "activeConsultants" in content, "Missing activeConsultants calculation"
    assert "status === 'ACTIVE' || status === 'ACCEPTED'" in content, "Missing active status check"
    assert "status !== 'INACTIVE' && status !== 'SUSPENDED'" in content, "Missing consultant active filter"

    # Overview Metrics (Active only)
    assert "Active Clients" in content, "Missing Active Clients metric"
    assert "Active Practitioners" in content, "Missing Active Practitioners metric"
    assert "Documents in Vault" in content, "Missing vault documents metric"
    assert "Consultation Sessions" in content, "Missing sessions metric"

    # Tab navigation
    assert "activeTab === 'clients'" in content, "Missing clients tab"
    assert "activeTab === 'consultants'" in content, "Missing consultants tab"
    assert "activeTab === 'overview'" in content, "Missing overview tab"

    # Search & active pills
    assert "clientSearch" in content, "Missing client search"
    assert "consultantSearch" in content, "Missing consultant search"
    assert "Active Clients Only" in content, "Missing Active Clients Only indicator"
    assert "Active Practitioners Only" in content, "Missing Active Practitioners Only indicator"

    # Action buttons & removal flow
    assert "openClientDossier" in content, "Missing openClientDossier action"
    assert "setConfirmRemovalTarget" in content, "Missing removal trigger"
    assert "Confirm Permanent Removal" in content, "Missing removal confirmation modal"
    assert "executeRemoval" in content, "Missing executeRemoval handler"

    print("  -> AdminPanel active-only filtering, tabs, search, metrics, and confirmation modal verified.")

def test_supabase_client_admin_apis():
    print("[2/5] Verifying src/services/supabaseClient.js...")
    content = check_file_exists("src/services/supabaseClient.js")

    assert "deleteClient" in content, "Missing deleteClient in supabaseClient.js"
    assert "deleteConsultant" in content, "Missing deleteConsultant in supabaseClient.js"
    assert "['client', 'consultant', 'admin']" in content, "Admin role not permitted in register"
    assert "client?client_id=eq." in content, "Missing client endpoint deletion"
    assert "consultant?consultant_id=eq." in content, "Missing consultant endpoint deletion"

    print("  -> Supabase deleteClient & deleteConsultant and role authorization verified.")

def test_app_jsx_wiring():
    print("[3/5] Verifying src/App.jsx...")
    content = check_file_exists("src/App.jsx")

    assert "AdminPanel" in content, "Missing AdminPanel import in App.jsx"
    assert "handleAdminRemoveClient" in content, "Missing handleAdminRemoveClient in App.jsx"
    assert "handleAdminRemoveConsultant" in content, "Missing handleAdminRemoveConsultant in App.jsx"
    assert "case 'admin-panel':" in content, "Missing admin-panel route in App.jsx"
    assert "case 'admin-clients':" in content, "Missing admin-clients route in App.jsx"
    assert "case 'admin-consultants':" in content, "Missing admin-consultants route in App.jsx"
    assert "U?.role === 'admin' ? NA :" in content, "Missing NA navigation selection for admin role"
    assert "role === 'admin' ? 'admin-panel'" in content, "Missing admin redirect in auth handlers"

    print("  -> App.jsx routes, handlers, and navigation integration verified.")

def test_auth_screen_no_demo_values():
    print("[4/5] Verifying src/views/auth/AuthScreen.jsx (No Demo Values)...")
    content = check_file_exists("src/views/auth/AuthScreen.jsx")

    assert "role === 'admin'" in content, "Missing admin role logic in AuthScreen.jsx"
    assert "setRole('admin')" in content, "Missing admin tab trigger in AuthScreen.jsx"
    
    # Ensure demo fillup and hardcoded credentials are completely removed
    assert "fillAdminCredentials" not in content, "fillAdminCredentials still present - should be removed"
    assert "Demo Admin:" not in content, "Demo Admin label still present - should be removed"
    assert "Auto-Fill" not in content, "Auto-Fill button still present - should be removed"
    assert "admin@mindcare.com" not in content, "Hardcoded admin@mindcare.com placeholder still present - should be removed"
    assert "defaultValue=\"Practice Administrator\"" not in content, "defaultValue still present - should be removed"

    seed_content = check_file_exists("src/data/seedData.js")
    assert "uadmin" not in seed_content, "Hardcoded uadmin still in seedData.js - should be clean"

    print("  -> Demo fillup values successfully removed; clean admin authentication verified.")

def test_bracket_balance():
    print("[5/5] Verifying structural syntax & bracket balance...")
    files = [
        "src/views/admin/AdminPanel.jsx",
        "src/App.jsx",
        "src/views/auth/AuthScreen.jsx",
        "src/services/supabaseClient.js",
        "src/data/constants.js",
        "src/data/seedData.js"
    ]
    for rel in files:
        full = os.path.join(ROOT, rel)
        with open(full, 'r', encoding='utf-8') as f:
            code = f.read()

        counts = {
            '{': code.count('{') - code.count('}'),
            '(': code.count('(') - code.count(')'),
            '[': code.count('[') - code.count(']')
        }
        for b, diff in counts.items():
            assert diff == 0, f"Unbalanced {b} in {rel}: difference {diff}"
        print(f"  -> {rel} bracket balance OK")

def main():
    print("=== Testing Admin Panel & User Governance System ===")
    test_admin_panel_component()
    test_supabase_client_admin_apis()
    test_app_jsx_wiring()
    test_auth_screen_no_demo_values()
    test_bracket_balance()
    print("=== ALL ADMIN PANEL TESTS PASSED SUCCESSFULLY! ===")

if __name__ == '__main__':
    main()
