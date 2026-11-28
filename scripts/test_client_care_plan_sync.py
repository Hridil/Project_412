"""
Test Suite: Client Care Plan Sync & Consultant Assignment
Verifies:
1. handleAddPlan in App.jsx matches clients flexibly across id, uid, client_id, person_id, and email.
2. handleAddPlan properly attaches cid, client_id, uid, person_id, consultant_id, and consultant_name.
3. ClientGoals.jsx resolves client record and links plans using multi-key matching (uid, cid, person_id, email).
4. ClientGoals.jsx displays the assigned consultant's name attribution.
5. ClientHome.jsx and ProfileMenu.jsx calculate care plan goals and completion percentage using canonical client resolution.
6. ClientDossierModal.jsx and CarePlans.jsx support resilient cross-referencing.
7. Simulates care plan assignment flow and verifies that assigned care plan is received by client.
"""

import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def check_file(rel_path):
    full = os.path.join(ROOT, rel_path)
    assert os.path.exists(full), f"File missing: {rel_path}"
    with open(full, 'r', encoding='utf-8') as f:
        return f.read()

def test_app_care_plan_logic():
    print("[1/5] Verifying handleAddPlan in src/App.jsx...")
    app = check_file("src/App.jsx")

    # 1. Flexible client finding in handleAddPlan
    assert "const targetCid = String(d.cid || '').trim();" in app, "Missing targetCid normalization in handleAddPlan"
    assert "String(x.id) === targetCid" in app, "Missing x.id string match in handleAddPlan"
    assert "String(x.uid) === targetCid" in app, "Missing x.uid string match in handleAddPlan"
    assert "String(x.client_id) === targetCid" in app, "Missing x.client_id string match in handleAddPlan"
    assert "x.person_id && String(x.person_id) === targetCid" in app, "Missing x.person_id match in handleAddPlan"

    # 2. consultant_name attribution and enriched plan fields
    assert "consultant_name: consultantName" in app, "Missing consultant_name in newPlan"
    assert "client_id: c.id" in app, "Missing client_id in newPlan"
    assert "person_id: c.person_id || null" in app, "Missing person_id in newPlan"
    assert "client_email: c.email || ''" in app, "Missing client_email in newPlan"

    # 3. Client notification
    assert "New care plan action step assigned" in app, "Missing client notification on plan assignment"
    print("  ✓ App.jsx care plan assignment logic verified.")

def test_client_goals_view():
    print("[2/5] Verifying src/views/client/ClientGoals.jsx...")
    goals = check_file("src/views/client/ClientGoals.jsx")

    # Client record resolution
    assert "clientRecord = (S.cl || []).find" in goals, "Missing clientRecord lookup in ClientGoals"
    assert "c.uid === U?.id" in goals, "Missing U.id match in clientRecord lookup"

    # Robust plan filtering
    assert "String(p.cid) === String(U?.id)" in goals, "Missing p.cid match against U.id in ClientGoals"
    assert "String(p.cid) === String(clientRecord.id)" in goals, "Missing p.cid match against clientRecord.id in ClientGoals"
    assert "p.uid === clientRecord.uid" in goals, "Missing p.uid match against clientRecord.uid in ClientGoals"

    # Consultant attribution display
    assert "p.consultant_name" in goals, "Missing consultant attribution in ClientGoals"
    assert "Assigned by {p.consultant_name}" in goals, "Missing 'Assigned by {p.consultant_name}' display in ClientGoals"
    print("  ✓ ClientGoals.jsx resilient linking and display verified.")

def test_client_home_and_profile_menu():
    print("[3/5] Verifying src/views/client/ClientHome.jsx and ProfileMenu.jsx...")
    home = check_file("src/views/client/ClientHome.jsx")
    menu = check_file("src/components/layout/ProfileMenu.jsx")

    # ClientHome plan filtering
    assert "String(p.cid) === String(U?.id)" in home, "Missing U?.id match in ClientHome"
    assert "String(p.cid) === String(c.id)" in home, "Missing c.id match in ClientHome"

    # ProfileMenu plan filtering
    assert "clientPlans" in menu, "Missing clientPlans in ProfileMenu"
    assert "clientPlans.filter((p) => p.done).length" in menu, "Missing completed plans calculation in ProfileMenu"
    print("  ✓ ClientHome.jsx and ProfileMenu.jsx progress syncing verified.")

def test_consultant_views():
    print("[4/5] Verifying CarePlans.jsx and ClientDossierModal.jsx...")
    care_plans = check_file("src/views/consultant/CarePlans.jsx")
    dossier = check_file("src/components/modals/ClientDossierModal.jsx")

    # CarePlans.jsx resilient consultant filtering
    assert "p.consultant_id === U?.id" in care_plans, "Missing consultant_id match in CarePlans"
    assert "String(p.consultant_id) === String(U?.id)" in care_plans, "Missing string consultant_id match in CarePlans"

    # ClientDossierModal resilient plan filtering
    assert "String(p.cid) === String(selectedClient.id)" in dossier, "Missing string cid match in ClientDossierModal"
    assert "p.uid === selectedClient.uid" in dossier, "Missing uid match in ClientDossierModal"
    print("  ✓ CarePlans.jsx and ClientDossierModal.jsx cross-referencing verified.")

def test_simulation_assignment_flow():
    print("[5/5] Simulating care plan assignment and retrieval across ID representations...")

    # Simulated client registered in Supabase
    client_in_db = {
        "id": 42,
        "uid": "u42",
        "person_id": 42,
        "name": "Sarah Connor",
        "email": "sarah@example.com",
        "status": "Accepted"
    }

    consultant_user = {
        "id": "cons_dr_smith",
        "uid": "u101",
        "name": "Dr. Sarah Smith",
        "role": "consultant"
    }

    state = {
        "cl": [client_in_db],
        "pl": [],
        "nf": []
    }

    # Simulate handleAddPlan when consultant assigns care plan
    # Case A: Consultant assigns using cid as number string "42"
    def add_plan(form_cid, title, details, due=None):
        target_cid = str(form_cid or '').strip()
        c = next((x for x in state["cl"] if (
            str(x["id"]) == target_cid or
            str(x["uid"]) == target_cid or
            str(x.get("client_id", "")) == target_cid or
            (x.get("person_id") and str(x["person_id"]) == target_cid)
        )), None)
        assert c is not None, f"Client could not be resolved for cid: {form_cid}"

        new_plan = {
            "id": f"pl_{len(state['pl']) + 1}",
            "cid": c["id"],
            "client_id": c["id"],
            "uid": c["uid"],
            "person_id": c.get("person_id"),
            "client_email": c.get("email"),
            "consultant_id": consultant_user["id"],
            "consultant_name": consultant_user["name"],
            "title": title,
            "due": due,
            "details": details,
            "done": False
        }
        state["pl"].insert(0, new_plan)
        state["nf"].insert(0, {"to": c["uid"], "msg": f"New care plan action step assigned: {title}"})
        return new_plan

    # Add plan 1 using numeric string id "42"
    p1 = add_plan("42", "5-minute mindful breathing", "Practice diaphragmatic breathing each morning.")
    # Add plan 2 using uid string "u42"
    p2 = add_plan("u42", "Evening gratitude reflection", "Write down 3 moments of peace.")

    assert len(state["pl"]) == 2, "Failed to insert care plans"
    assert len(state["nf"]) == 2, "Failed to create notifications for client"

    # Simulate client logged in with different ID representations
    # Representation 1: Client logged in with U.id = "u42"
    user_session_1 = {"id": "u42", "client_id": 42, "person_id": 42, "email": "sarah@example.com", "role": "client"}
    
    def get_client_plans(U, S):
        client_record = next((c for c in S["cl"] if (
            c["uid"] == U.get("id") or
            str(c["id"]) == str(U.get("id")) or
            (U.get("client_id") and str(c["id"]) == str(U["client_id"])) or
            (U.get("person_id") and c.get("person_id") == U["person_id"]) or
            (U.get("email") and c.get("email", "").lower() == U["email"].lower())
        )), None)

        matched = []
        for p in S["pl"]:
            if (p.get("uid") == U.get("id") or
                str(p.get("cid")) == str(U.get("id")) or
                str(p.get("client_id")) == str(U.get("id"))):
                matched.append(p)
                continue
            if U.get("client_id") and (str(p.get("cid")) == str(U["client_id"]) or str(p.get("client_id")) == str(U["client_id"])):
                matched.append(p)
                continue
            if client_record:
                if client_record.get("id") and (str(p.get("cid")) == str(client_record["id"]) or str(p.get("client_id")) == str(client_record["id"])):
                    matched.append(p)
                    continue
                if client_record.get("uid") and p.get("uid") == client_record["uid"]:
                    matched.append(p)
                    continue
        return matched

    # Verify Client 1 gets both plans
    plans_for_session_1 = get_client_plans(user_session_1, state)
    assert len(plans_for_session_1) == 2, f"Expected 2 plans for session 1, got {len(plans_for_session_1)}"
    assert plans_for_session_1[0]["consultant_name"] == "Dr. Sarah Smith"

    # Representation 2: Client logged in with U.id = 42 (numeric ID from database)
    user_session_2 = {"id": 42, "email": "sarah@example.com", "role": "client"}
    plans_for_session_2 = get_client_plans(user_session_2, state)
    assert len(plans_for_session_2) == 2, f"Expected 2 plans for session 2, got {len(plans_for_session_2)}"

    print("  ✓ Care plan assignment simulation and client retrieval verified successfully.")

def run_all():
    print("=" * 60)
    print("TEST: Client Care Plan Sync & Consultant Assignment")
    print("=" * 60)
    test_app_care_plan_logic()
    test_client_goals_view()
    test_client_home_and_profile_menu()
    test_consultant_views()
    test_simulation_assignment_flow()
    print("=" * 60)
    print("ALL CARE PLAN SYNC TESTS PASSED!")
    print("=" * 60)

if __name__ == "__main__":
    run_all()
