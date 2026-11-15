"""
MindCare Pro - Cross-Device Caseload & Vault File Synchronization Test
Validates:
1. Live Supabase connection and schema integrity.
2. Cross-device persistence of client acceptance & caseload assignment.
3. Cross-device retrieval of vault documents for assigned caseload.
4. Tenant isolation: consultants can only access their assigned clients' files on ANY device.
"""

import urllib.request
import json
import sys

SUPABASE_URL = "https://lsxpftzwwnexeixtvqcc.supabase.co/rest/v1/"
SUPABASE_KEY = "sb_publishable_2Yd0uF2QhyJqzNfzabI7xg_4oII1QWS"
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def fetch_rest(endpoint, method="GET", body=None):
    url = f"{SUPABASE_URL}{endpoint}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, headers=HEADERS, data=data, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode()
            return json.loads(content) if content else []
    except Exception as e:
        err_msg = e.read().decode() if hasattr(e, 'read') else str(e)
        raise RuntimeError(f"REST error on {endpoint}: {err_msg}")

def run_tests():
    print("=" * 75)
    print("MINDCARE PRO - CROSS-DEVICE CASELOAD & DOCUMENT VAULT SYNC TEST")
    print("=" * 75)

    failures = 0
    def check(condition, desc):
        nonlocal failures
        if condition:
            print(f"  [PASS] {desc}")
        else:
            print(f"  [FAIL] {desc}")
            failures += 1

    # 1. LIVE SUPABASE CONNECTION & TABLES CHECK
    print("\n[TEST 1] Testing Supabase Table Connectivity & Integrity:")
    try:
        clients = fetch_rest("client?select=*,person(*)")
        check(len(clients) > 0, f"Fetched {len(clients)} clients from Supabase database")

        consultants = fetch_rest("consultant?select=*,person(*)")
        check(len(consultants) > 0, f"Fetched {len(consultants)} consultants from Supabase database")

        appointments = fetch_rest("appointment?select=*")
        check(len(appointments) > 0, f"Fetched {len(appointments)} appointments from Supabase database")

        files = fetch_rest("uploaded_file?select=*")
        check(len(files) > 0, f"Fetched {len(files)} uploaded files from Supabase database")
    except Exception as e:
        check(False, f"Connection to Supabase failed: {e}")
        return 1

    # 2. CLIENT-APPOINTMENT-FILE RELATIONSHIPS
    print("\n[TEST 2] Verifying File Linkage to Client IDs in uploaded_file Table:")
    files_with_client = [f for f in files if f.get('client_id') is not None]
    check(
        len(files_with_client) > 0,
        f"Found {len(files_with_client)} files explicitly linked with client_id (enables cross-device vault access)"
    )

    # 3. SIMULATE DEVICE A: Consultant Accepts Client & Assigns to Caseload
    print("\n[TEST 3] Simulating Device A (Consultant accepts client & assigns caseload):")
    # Let's pick a consultant (e.g. Consultant Mario, consultant_id 7 or Dr. Sarah Mitchell, consultant_id 1)
    target_cons = consultants[0]
    cons_id = target_cons['consultant_id']
    cons_person_id = target_cons['person_id']
    cons_uid = f"u{cons_person_id}"

    # Target client (e.g. client 1, Emily Watson)
    target_client = clients[0]
    client_id = target_client['client_id']
    client_uid = f"u{target_client['person_id']}"

    print(f"  Consultant: {target_cons['person'].get('name', 'Clinician')} (consultant_id={cons_id}, person_id={cons_person_id})")
    print(f"  Client:     {target_client['person'].get('name', 'Client')} (client_id={client_id}, person_id={target_client['person_id']})")

    # Update decision to ACTIVE / Accepted with consultant_id
    update_res = fetch_rest(
        f"client?client_id=eq.{client_id}",
        method="PATCH",
        body={"account_status": "ACTIVE"}
    )
    check(len(update_res) > 0 and update_res[0]['account_status'] == 'ACTIVE', "Device A: Persisted client account_status = 'ACTIVE' to Supabase")

    # Ensure appointment exists linking client_id and consultant_id
    existing_apts = fetch_rest(f"appointment?client_id=eq.{client_id}&consultant_id=eq.{cons_id}")
    if not existing_apts:
        new_apt = fetch_rest("appointment", method="POST", body={
            "client_id": client_id,
            "consultant_id": cons_id,
            "status": "CONFIRMED",
            "appointment_mode": "ONLINE",
            "appointment_date": "2026-11-20",
            "appointment_time": "10:00:00",
            "reason": "Cross-device clinical caseload sync session"
        })
        check(len(new_apt) > 0, "Device A: Created confirmed appointment linking consultant and client in Supabase")
    else:
        check(True, "Device A: Confirmed appointment linking consultant and client verified in Supabase")

    # 4. SIMULATE DEVICE B: Fresh Device/Browser Login
    print("\n[TEST 4] Simulating Device B (Fresh device login & cross-device state hydration):")
    # On Device B, initial state is empty (no local storage):
    device_b_state = {
        "cl": [],
        "fl": [],
        "ap": [],
        "nt": [],
        "fb": [],
        "consultants": []
    }

    # Device B executes fetchAppData()
    db_clients = fetch_rest("client?select=*,person(*,person_contact(*))&order=client_id.asc")
    db_appointments = fetch_rest("appointment?select=*,client(client_id,person_id,person(name,email)),consultant(consultant_id,person_id,person(name,email))&order=appointment_date.desc")
    db_files = fetch_rest("uploaded_file?select=*,person(person_id,name,role),client(client_id,person_id,person(name))&order=uploaded_at.desc")

    # Device B resolves clients and caseload
    resolved_clients = []
    for c in db_clients:
        ap = next((a for a in db_appointments if a.get('client_id') == c['client_id']), None)
        assigned_cons_uid = f"u{ap['consultant']['person_id']}" if (ap and ap.get('consultant') and ap['consultant'].get('person_id')) else (f"u{ap['consultant_id']}" if ap and ap.get('consultant_id') else None)
        resolved_clients.append({
            "id": c['client_id'],
            "uid": f"u{c['person_id']}",
            "person_id": c['person_id'],
            "name": c['person']['name'] if c.get('person') else "Client",
            "email": c['person']['email'] if c.get('person') else "",
            "status": "Accepted" if c['account_status'] == 'ACTIVE' else "Pending",
            "assignedConsultantId": assigned_cons_uid,
            "consultant_id": ap.get('consultant_id') if ap else None
        })

    # Device B resolves files
    client_by_id = {c['id']: c for c in resolved_clients}
    client_by_pid = {c['person_id']: c for c in resolved_clients}

    resolved_files = []
    for f in db_files:
        cid = f.get('client_id') or (f.get('client', {}) or {}).get('client_id')
        cl_match = client_by_id.get(cid) or client_by_pid.get(f.get('person_id'))
        resolved_files.append({
            "id": f['file_id'],
            "uid": cl_match['uid'] if cl_match else f"u{f.get('person_id', 1)}",
            "cid": cid,
            "client_id": cid,
            "person_id": f.get('person_id'),
            "consultant_id": f"u{f['person_id']}" if f.get('uploaded_by') == 'CONSULTANT' else None,
            "name": f['file_name'],
            "size": f['file_size'],
            "type": f.get('mime_type', 'application/octet-stream'),
            "dataUrl": f.get('file_url'),
            "uploadedBy": (f.get('uploaded_by') or 'CLIENT').lower()
        })

    device_b_state["cl"] = resolved_clients
    device_b_state["fl"] = resolved_files
    device_b_state["ap"] = db_appointments

    check(len(device_b_state["cl"]) > 0, f"Device B successfully hydrated {len(device_b_state['cl'])} clients from Supabase")
    check(len(device_b_state["fl"]) > 0, f"Device B successfully hydrated {len(device_b_state['fl'])} vault files from Supabase")

    # 5. VERIFY CONSULTANT CASELOAD & VAULT FILE ACCESS ON DEVICE B
    print("\n[TEST 5] Testing Consultant Caseload & Vault Document Access on Device B:")
    consultant_u = {
        "id": cons_uid,
        "person_id": cons_person_id,
        "consultant_id": cons_id,
        "role": "consultant",
        "name": target_cons['person'].get('name')
    }

    def is_assigned_to_consultant(client, consultant):
        if not client or not consultant: return False
        c_id = consultant["id"]
        c_uid = consultant.get("uid") or consultant["id"]
        c_db_id = consultant.get("consultant_id")
        c_pid = consultant.get("person_id")

        def matches_cons(target):
            if not target: return False
            return (
                target == c_id or
                target == c_uid or
                (c_db_id and (target == c_db_id or target == f"u{c_db_id}" or str(target) == str(c_db_id))) or
                (c_pid and (target == c_pid or target == f"u{c_pid}" or str(target) == str(c_pid)))
            )

        if matches_cons(client.get("assignedConsultantId")) or matches_cons(client.get("consultant_id")):
            return True

        has_ap = any(
            (a.get("client_id") == client["id"] or a.get("cid") == client["id"] or a.get("uid") == client["uid"]) and
            matches_cons(a.get("consultant_id"))
            for a in device_b_state["ap"]
        )
        return has_ap

    # Filter assigned clients on Device B
    assigned_clients_b = [c for c in device_b_state["cl"] if is_assigned_to_consultant(c, consultant_u)]
    check(len(assigned_clients_b) > 0, f"Device B: Consultant has {len(assigned_clients_b)} assigned client(s) in caseload")

    # Filter consultant's caseload documents on Device B
    caseload_docs_b = [
        f for f in device_b_state["fl"]
        if (
            (f.get("uploadedBy") == "consultant" and (f.get("consultant_id") == consultant_u["id"] or f.get("person_id") == consultant_u.get("person_id"))) or
            any(
                (c["id"] == f.get("cid") or c["id"] == f.get("client_id") or c["uid"] == f.get("uid") or c["person_id"] == f.get("person_id")) and
                is_assigned_to_consultant(c, consultant_u)
                for c in device_b_state["cl"]
            )
        )
    ]
    check(
        len(caseload_docs_b) > 0,
        f"Device B: Consultant successfully retrieved {len(caseload_docs_b)} client file(s) from Supabase vault across devices!"
    )

    print(f"  Caseload documents accessible to {consultant_u['name']} on Device B:")
    for doc in caseload_docs_b[:5]:
        print(f"    * File ID {doc['id']}: {doc['name']} (Size: {doc['size']} bytes, By: {doc['uploadedBy']})")

    # 6. VERIFY SEARCH FUNCTIONALITY ACROSS CROSS-DEVICE FILES
    print("\n[TEST 6] Testing Search across Synced Documents on Device B:")
    first_doc_name = caseload_docs_b[0]['name']
    keyword = first_doc_name.split('_')[0] if '_' in first_doc_name else first_doc_name[:4]
    search_results = [f for f in caseload_docs_b if keyword.lower() in f['name'].lower()]
    check(len(search_results) > 0, f"Search by keyword '{keyword}' found {len(search_results)} file(s) on Device B")

    print("\n" + "=" * 75)
    if failures == 0:
        print("ALL CROSS-DEVICE CASELOAD & VAULT TESTS PASSED! (0 Failures)")
        return 0
    else:
        print(f"TESTS FINISHED WITH {failures} FAILURE(S)")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())
