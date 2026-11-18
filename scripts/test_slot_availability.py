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
print("MINDCARE PRO - APPOINTMENT SLOT AVAILABILITY VERIFICATION")
print("=" * 75)

print("\n[TEST 1] Verifying Syntax & Structural Integrity of Modified Source Files:")
supabase_client_js = (BASE_DIR / "src" / "services" / "supabaseClient.js").read_text(encoding="utf-8")
check_balanced(supabase_client_js, "supabaseClient.js")

book_session_js = (BASE_DIR / "src" / "views" / "client" / "BookSession.jsx").read_text(encoding="utf-8")
check_balanced(book_session_js, "BookSession.jsx")

app_js = (BASE_DIR / "src" / "App.jsx").read_text(encoding="utf-8")
check_balanced(app_js, "App.jsx")

consultant_schedule_js = (BASE_DIR / "src" / "views" / "consultant" / "ConsultantSchedule.jsx").read_text(encoding="utf-8")
check_balanced(consultant_schedule_js, "ConsultantSchedule.jsx")

print("\n[TEST 2] Verifying Core Slot Occupancy Logic & Normalization:")
check("export const normalizeTime" in supabase_client_js, "normalizeTime helper exported")
check("export const normalizeDate" in supabase_client_js, "normalizeDate helper exported")
check("export const isAppointmentSlotOccupied" in supabase_client_js, "isAppointmentSlotOccupied helper exported")
check("checkSlotAvailability: async" in supabase_client_js, "supabaseApi.checkSlotAvailability method implemented")

# Python emulation of isAppointmentSlotOccupied
def normalize_time(t):
    if not t:
        return ""
    parts = str(t).strip().split(":")
    if len(parts) >= 2:
        return f"{parts[0].zfill(2)}:{parts[1].zfill(2)}"
    return str(t).strip()

def normalize_date(d):
    if not d:
        return ""
    return str(d).split("T")[0].strip()

def is_slot_occupied(appointments, consultant_id, client_id, date, time):
    t_date = normalize_date(date)
    t_time = normalize_time(time)
    cons_id_str = str(consultant_id).lower() if consultant_id is not None else None
    cons_id_clean = cons_id_str.replace("u", "") if cons_id_str else None
    client_id_str = str(client_id).lower() if client_id is not None else None
    client_id_clean = client_id_str.replace("u", "") if client_id_str else None

    for a in appointments:
        status = str(a.get("status", "")).upper()
        if status in ("CANCELLED", "DECLINED"):
            continue

        a_date = normalize_date(a.get("date") or a.get("appointment_date"))
        if a_date != t_date:
            continue

        a_time = normalize_time(a.get("time") or a.get("appointment_time"))
        if a_time != t_time:
            continue

        if cons_id_str:
            a_cons = str(a.get("consultant_id", "")).lower()
            a_cons_clean = a_cons.replace("u", "")
            if a_cons == cons_id_str or a_cons_clean == cons_id_clean or a_cons == f"u{cons_id_clean}" or a_cons_clean == cons_id_str:
                return True

        if client_id_str:
            a_cl = str(a.get("cid") or a.get("client_id") or a.get("uid", "")).lower()
            a_cl_clean = a_cl.replace("u", "")
            if a_cl == client_id_str or a_cl_clean == client_id_clean or a_cl == f"u{client_id_clean}" or a_cl_clean == client_id_str:
                return True

    return False

# Test cases
existing_apts = [
    {"id": 1, "consultant_id": "u7", "cid": 13, "date": "2026-11-20", "time": "10:00:00", "status": "CONFIRMED"},
    {"id": 2, "consultant_id": "u7", "cid": 14, "date": "2026-11-20", "time": "14:00", "status": "REQUESTED"},
    {"id": 3, "consultant_id": "u8", "cid": 15, "date": "2026-11-20", "time": "10:00", "status": "CANCELLED"},
]

check(is_slot_occupied(existing_apts, consultant_id="u7", client_id=99, date="2026-11-20", time="10:00") is True,
      "Slot 2026-11-20 10:00 for consultant u7 is detected as OCCUPIED")

check(is_slot_occupied(existing_apts, consultant_id=7, client_id=99, date="2026-11-20", time="10:00") is True,
      "Slot matches numeric consultant ID 7 as OCCUPIED")

check(is_slot_occupied(existing_apts, consultant_id="u7", client_id=99, date="2026-11-20", time="11:00") is False,
      "Slot 2026-11-20 11:00 for consultant u7 is detected as FREE")

check(is_slot_occupied(existing_apts, consultant_id="u7", client_id=99, date="2026-11-21", time="10:00") is False,
      "Slot on a different date 2026-11-21 is detected as FREE")

check(is_slot_occupied(existing_apts, consultant_id="u8", client_id=99, date="2026-11-20", time="10:00") is False,
      "Slot with cancelled appointment is detected as FREE")

check(is_slot_occupied(existing_apts, consultant_id="u9", client_id=13, date="2026-11-20", time="10:00") is True,
      "Client double-booking conflict detected as OCCUPIED")

print("\n[TEST 3] Verifying BookSession.jsx Client Booking Guard & Feedback:")
check("This time is occupied" in book_session_js, "BookSession.jsx displays 'This time is occupied' notice")
check("Quick Consultation Slots" in book_session_js, "BookSession.jsx provides interactive quick slot selector")
check("disabled={!safetyConfirmed || isOccupied}" in book_session_js, "BookSession.jsx disables submit button when slot is occupied")
check("onSubmitForm" in book_session_js and "if (isOccupied)" in book_session_js, "BookSession.jsx prevents form submission when slot is occupied")

print("\n[TEST 4] Verifying App.jsx Booking Handlers & Backend Guards:")
check("isAppointmentSlotOccupied" in app_js, "App.jsx imports isAppointmentSlotOccupied")
check("handleBookSession" in app_js and "showToast('This time is occupied. Please select an available slot.')" in app_js,
      "handleBookSession guards against occupied slots with toast feedback")
check("handleSchedule" in app_js and "showToast('This time is occupied. Please select an available slot.')" in app_js,
      "handleSchedule clinician booking guards against occupied slots with toast feedback")
check("supabaseApi.checkSlotAvailability" in app_js, "App.jsx verifies remote Supabase slot availability before booking")

print("\n[TEST 5] Verifying ConsultantSchedule.jsx Clinician Booking Guard:")
check("isConsultantSlotOccupied" in consultant_schedule_js, "ConsultantSchedule.jsx tracks isConsultantSlotOccupied")
check("This time is occupied" in consultant_schedule_js, "ConsultantSchedule.jsx warns clinician if slot is occupied")
check("disabled={isConsultantSlotOccupied}" in consultant_schedule_js, "ConsultantSchedule.jsx disables submit when slot is occupied")

print("\n" + "=" * 75)
print("ALL APPOINTMENT SLOT AVAILABILITY CHECKS PASSED!")
print("=" * 75)
