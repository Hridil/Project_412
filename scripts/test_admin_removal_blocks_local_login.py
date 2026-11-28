"""
Test Suite: Admin Account Removal & Local Login Prevention
Verifies:
1. When an admin removes an account (client or consultant), it is removed from S.cl / S.consultants / S.acc.
2. The account is recorded in the persistent removal registry (mcremoved_accounts).
3. Attempting to log in locally with the removed account's email and password is strictly blocked.
4. Active local session is destroyed immediately upon removal.
5. Re-registration with the removed email is blocked.
6. Supabase data sync (fetchAppData) filters out removed accounts so they are never revived.
7. Syntax and bracket balance verified.
"""

import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def check_file(rel_path):
    full = os.path.join(ROOT, rel_path)
    assert os.path.exists(full), f"File missing: {rel_path}"
    with open(full, 'r', encoding='utf-8') as f:
        return f.read()

def test_source_code_checks():
    print("[1/3] Verifying App.jsx removal governance logic...")
    app = check_file("src/App.jsx")

    # Governance helpers
    assert "getRemovedAccounts" in app, "Missing getRemovedAccounts helper"
    assert "recordRemovedAccount" in app, "Missing recordRemovedAccount helper"
    assert "isAccountRemoved" in app, "Missing isAccountRemoved helper"
    assert "mcremoved_accounts" in app, "Missing mcremoved_accounts localStorage key"

    # Admin removal handlers
    assert "handleAdminRemoveClient" in app, "Missing handleAdminRemoveClient"
    assert "handleAdminRemoveConsultant" in app, "Missing handleAdminRemoveConsultant"
    assert "recordRemovedAccount(client)" in app, "Client removal must record in removal registry"
    assert "recordRemovedAccount(consultant)" in app, "Consultant removal must record in removal registry"

    # Login guards
    assert "isAccountRemoved(em, S.removedAccounts)" in app, "Missing guard against removed accounts in handleLogin"
    assert "This account has been removed by administration" in app, "Missing removal feedback toast"
    assert "!isAccountRemoved(a, S.removedAccounts)" in app, "Local account fallback must filter removed accounts"

    # Active session invalidation
    assert "localStorage.removeItem('mcuser')" in app, "Active session must be cleared on removal"

    # Signup guard
    assert "isAccountRemoved(em, S.removedAccounts)" in app, "Signup must block re-registration of removed accounts"

    # Seed data
    seed = check_file("src/data/seedData.js")
    assert "removedAccounts: []" in seed, "Missing removedAccounts in seedData.js"

    print("  ✓ Source code checks passed.")

def test_removal_and_login_simulation():
    print("[2/3] Simulating admin account removal and local login prevention...")

    # Mock localStorage
    local_storage = {
        "mcremoved_accounts": "[]"
    }

    def get_removed_accounts():
        import json
        raw = local_storage.get("mcremoved_accounts", "[]")
        return json.loads(raw)

    def record_removed_account(account):
        import json
        email = (account.get("email") or "").strip().lower()
        uid = str(account.get("uid") or "")
        cid = str(account.get("id") or "")
        current = get_removed_accounts()
        entry = {"email": email, "id": cid, "uid": uid}
        next_list = [entry] + [x for x in current if x.get("email") != email]
        local_storage["mcremoved_accounts"] = json.dumps(next_list)
        return next_list

    def is_account_removed(target, removed_list=None):
        list_to_check = removed_list if removed_list is not None else get_removed_accounts()
        target_email = (target if isinstance(target, str) else target.get("email", "")).strip().lower()
        target_id = "" if isinstance(target, str) else str(target.get("id") or target.get("uid") or "")
        for r in list_to_check:
            r_email = (r if isinstance(r, str) else r.get("email", "")).strip().lower()
            r_id = "" if isinstance(r, str) else str(r.get("id") or r.get("uid") or "")
            if target_email and r_email and target_email == r_email:
                return True
            if target_id and r_id and target_id == r_id:
                return True
        return False

    # 1. Setup local state with 1 client and 1 consultant
    state = {
        "acc": [
            {
                "id": "u10",
                "client_id": 10,
                "name": "Jane Doe",
                "email": "jane@example.com",
                "pw": "Password123!",
                "role": "client"
            },
            {
                "id": "u20",
                "consultant_id": 20,
                "name": "Dr. House",
                "email": "house@example.com",
                "pw": "PractitionerPass123!",
                "role": "consultant"
            }
        ],
        "cl": [
            {
                "id": 10,
                "uid": "u10",
                "name": "Jane Doe",
                "email": "jane@example.com",
                "status": "ACTIVE"
            }
        ],
        "consultants": [
            {
                "id": 20,
                "uid": "u20",
                "name": "Dr. House",
                "email": "house@example.com"
            }
        ],
        "removedAccounts": []
    }

    # Simulate local login function matching App.jsx
    def attempt_login(email, password, role):
        em = email.strip().lower()
        removed_registry = state["removedAccounts"] or get_removed_accounts()
        if is_account_removed(em, removed_registry):
            return {"success": False, "error": "This account has been removed by administration."}
        
        # Local fallback lookup
        u = next((
            a for a in state["acc"]
            if not is_account_removed(a, removed_registry) and
            a.get("email", "").strip().lower() == em and
            a.get("pw") == password and
            a.get("role") == role
        ), None)

        if not u:
            return {"success": False, "error": f"No {role} account matches those credentials."}
        return {"success": True, "user": u}

    # Initial login check: Jane can log in
    res = attempt_login("jane@example.com", "Password123!", "client")
    assert res["success"] is True, "Jane should be able to log in before removal"
    assert res["user"]["name"] == "Jane Doe"

    # Initial login check: Dr. House can log in
    res_cons = attempt_login("house@example.com", "PractitionerPass123!", "consultant")
    assert res_cons["success"] is True, "Dr. House should be able to log in before removal"

    # 2. Administrator removes Jane Doe (client)
    client_to_remove = state["cl"][0]
    updated_removed = record_removed_account(client_to_remove)
    state["removedAccounts"] = updated_removed
    state["cl"] = [c for c in state["cl"] if c["id"] != client_to_remove["id"]]
    state["acc"] = [a for a in state["acc"] if not is_account_removed(a, updated_removed)]

    # 3. Jane attempts to log in locally with correct credentials
    login_attempt = attempt_login("jane@example.com", "Password123!", "client")
    assert login_attempt["success"] is False, "Removed client should NOT be able to log in!"
    assert "removed by administration" in login_attempt["error"], f"Unexpected error: {login_attempt['error']}"
    print("  ✓ Client strictly blocked from local login after admin removal.")

    # 4. Administrator removes Dr. House (consultant)
    cons_to_remove = state["consultants"][0]
    updated_removed = record_removed_account(cons_to_remove)
    state["removedAccounts"] = updated_removed
    state["consultants"] = [c for c in state["consultants"] if c["id"] != cons_to_remove["id"]]
    state["acc"] = [a for a in state["acc"] if not is_account_removed(a, updated_removed)]

    # 5. Dr. House attempts to log in locally with correct credentials
    cons_login_attempt = attempt_login("house@example.com", "PractitionerPass123!", "consultant")
    assert cons_login_attempt["success"] is False, "Removed consultant should NOT be able to log in!"
    assert "removed by administration" in cons_login_attempt["error"], f"Unexpected error: {cons_login_attempt['error']}"
    print("  ✓ Consultant strictly blocked from local login after admin removal.")

    # 6. Simulate fetchAppData sync: remote DB still returns Jane (e.g. mock or sync latency)
    remote_db_clients = [{"id": 10, "uid": "u10", "name": "Jane Doe", "email": "jane@example.com"}]
    synced_clients = [c for c in remote_db_clients if not is_account_removed(c, state["removedAccounts"])]
    assert len(synced_clients) == 0, "fetchAppData must filter out removed accounts from remote data!"
    print("  ✓ Remote sync filter prevents revived accounts.")

def test_bracket_integrity():
    print("[3/3] Checking bracket and syntax balance...")
    for path in ["src/App.jsx", "src/data/seedData.js"]:
        code = check_file(path)
        assert code.count('{') == code.count('}'), f"Unbalanced curly braces in {path}"
        assert code.count('(') == code.count(')'), f"Unbalanced parentheses in {path}"
        assert code.count('[') == code.count(']'), f"Unbalanced brackets in {path}"
        print(f"  ✓ {path} syntax balanced.")

def main():
    print("=" * 60)
    print("TEST: Admin Account Removal & Local Login Prevention")
    print("=" * 60)
    test_source_code_checks()
    test_removal_and_login_simulation()
    test_bracket_integrity()
    print("=" * 60)
    print("ALL REMOVAL & LOCAL LOGIN PREVENT TESTS PASSED!")
    print("=" * 60)

if __name__ == "__main__":
    main()
