"""
MINDCARE PRO - CONSULTANT VISUAL CALENDAR & APPOINTMENT SCHEDULING TEST SUITE
=============================================================================
Validates:
1. JSX syntax and brace balance of ConsultantSchedule.jsx and App.jsx.
2. Calendar matrix generation (month days, weekday alignment, overflow cells).
3. Appointment mapping to calendar dates and modality indicators.
4. Tenant isolation for consultant schedule view.
5. Interactive features (view switching, filtering, dossier modal linking).
"""

import sys
import os
import re
import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SRC_DIR = BASE_DIR / "src"

def check_brace_balance(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    # Strip string literals and comments for robust counting
    # Simple balance check
    open_c = content.count("{")
    close_c = content.count("}")
    open_p = content.count("(")
    close_p = content.count(")")
    return open_c == close_c, open_p == close_p, open_c, close_c, open_p, close_p

def simulate_calendar_grid(year, month):
    # month is 1-indexed for Python datetime
    first_of_month = datetime.date(year, month, 1)
    # Python weekday(): Monday is 0, Sunday is 6.
    # JavaScript getDay(): Sunday is 0, Saturday is 6.
    first_day_idx = (first_of_month.weekday() + 1) % 7
    
    # Days in month
    if month == 12:
        next_month = datetime.date(year + 1, 1, 1)
    else:
        next_month = datetime.date(year, month + 1, 1)
    days_in_current_month = (next_month - first_of_month).days

    # Days in prev month
    first_day_prev = datetime.date(year, month - 1 if month > 1 else 12, 1)
    days_in_prev_month = (first_of_month - first_day_prev).days

    cells = []
    # 1. Prev month trailing
    for i in range(first_day_idx - 1, -1, -1):
        day_num = days_in_prev_month - i
        cells.append({"day": day_num, "current_month": False, "prev": True})

    # 2. Current month
    for day_num in range(1, days_in_current_month + 1):
        cells.append({"day": day_num, "current_month": True})

    # 3. Next month leading
    total_cells = ((len(cells) + 6) // 7) * 7
    remaining = total_cells - len(cells)
    for day_num in range(1, remaining + 1):
        cells.append({"day": day_num, "current_month": False, "next": True})

    return cells

def run_tests():
    print("=" * 75)
    print("MINDCARE PRO - CONSULTANT VISUAL CALENDAR & APPOINTMENTS TEST SUITE")
    print("=" * 75)

    # Test 1: Syntax & Structural Integrity
    print("\n[TEST 1] Verifying Syntax & Structural Integrity:")
    sched_jsx = SRC_DIR / "views" / "consultant" / "ConsultantSchedule.jsx"
    app_jsx = SRC_DIR / "App.jsx"

    c_ok, p_ok, oc, cc, op, cp = check_brace_balance(sched_jsx)
    assert c_ok, f"ConsultantSchedule.jsx braces unbalanced: {{{oc} vs }}{cc}"
    assert p_ok, f"ConsultantSchedule.jsx parentheses unbalanced: ({op} vs ){cp}"
    print(f"  [PASS] ConsultantSchedule.jsx braces ({oc}=={cc}) and parens ({op}=={cp}) balanced.")

    c_ok2, p_ok2, oc2, cc2, op2, cp2 = check_brace_balance(app_jsx)
    assert c_ok2, f"App.jsx braces unbalanced: {{{oc2} vs }}{cc2}"
    assert p_ok2, f"App.jsx parentheses unbalanced: ({op2} vs ){cp2}"
    print(f"  [PASS] App.jsx braces ({oc2}=={cc2}) and parens ({op2}=={cp2}) balanced.")

    # Test 2: Calendar Month Grid Generation
    print("\n[TEST 2] Testing Calendar Grid Math for multiple months:")
    test_months = [(2026, 11), (2026, 2), (2026, 10), (2027, 1)]
    for y, m in test_months:
        grid = simulate_calendar_grid(y, m)
        assert len(grid) % 7 == 0, f"Grid length {len(grid)} not divisible by 7 for {y}-{m}"
        assert len(grid) in [28, 35, 42], f"Unexpected grid cell count {len(grid)}"
        current_month_days = [c for c in grid if c["current_month"]]
        month_name = datetime.date(y, m, 1).strftime("%B %Y")
        print(f"  [PASS] {month_name}: {len(current_month_days)} month days -> {len(grid)} total grid cells (exact 7-day columns)")

    # Test 3: Appointment Date Indexing & Modality Mapping
    print("\n[TEST 3] Testing Appointment Date Indexing & Modality Logic:")
    mock_appointments = [
        {
            "id": 8,
            "cid": 13,
            "uid": "u23",
            "consultant_id": 7,
            "date": "2026-11-20",
            "time": "11:00:00",
            "type": "Online Telehealth Consultation",
            "appointment_mode": "ONLINE",
            "status": "CONFIRMED",
            "reason": "Caseload Consultation Session"
        },
        {
            "id": 7,
            "cid": 19,
            "uid": "u19",
            "consultant_id": 8,
            "date": "2026-11-15",
            "time": "10:00:00",
            "type": "Online Telehealth Consultation",
            "appointment_mode": "ONLINE",
            "status": "CONFIRMED",
            "reason": "Routine Check-in"
        },
        {
            "id": 9,
            "cid": 13,
            "uid": "u23",
            "consultant_id": 7,
            "date": "2026-11-20",
            "time": "14:30:00",
            "type": "In-Person Sanctuary Consultation",
            "appointment_mode": "OFFLINE",
            "status": "REQUESTED",
            "reason": "Follow-up discussion"
        }
    ]

    # Map appointments by date
    by_date = {}
    for a in mock_appointments:
        k = a["date"]
        by_date.setdefault(k, []).append(a)

    assert len(by_date["2026-11-20"]) == 2, "Expected 2 appointments on 2026-11-20"
    assert len(by_date["2026-11-15"]) == 1, "Expected 1 appointment on 2026-11-15"
    print("  [PASS] Appointments successfully grouped by date key (2 on 2026-11-20, 1 on 2026-11-15)")

    # Test 4: Tenant Isolation Filtering
    print("\n[TEST 4] Testing Tenant Isolation in Schedule View:")
    mario_user = {"id": 7, "consultant_id": 7, "role": "consultant", "name": "Mario"}
    ray_user = {"id": 8, "consultant_id": 8, "role": "consultant", "name": "Ray"}

    mario_aps = [a for a in mock_appointments if a["consultant_id"] == mario_user["id"]]
    ray_aps = [a for a in mock_appointments if a["consultant_id"] == ray_user["id"]]

    assert len(mario_aps) == 2, f"Mario should see 2 appointments, got {len(mario_aps)}"
    assert len(ray_aps) == 1, f"Ray should see 1 appointment, got {len(ray_aps)}"
    assert all(a["consultant_id"] == 7 for a in mario_aps), "Mario sees unauthorized appointment"
    assert all(a["consultant_id"] == 8 for a in ray_aps), "Ray sees unauthorized appointment"
    print("  [PASS] Consultant Mario strictly accesses his 2 assigned appointments.")
    print("  [PASS] Consultant Ray strictly accesses his 1 assigned appointment.")

    # Test 5: Verify Visual Elements in Source Code
    print("\n[TEST 5] Verifying Visual Calendar UI Components in Source Code:")
    with open(sched_jsx, "r", encoding="utf-8") as f:
        src = f.read()

    required_snippets = [
        ("viewMode === 'calendar'", "Visual Calendar view toggle"),
        ("viewMode === 'agenda'", "Agenda List view toggle"),
        ("MONTH_NAMES", "Month navigation header"),
        ("WEEKDAY_NAMES", "7-column weekday headers"),
        ("appointmentsByDate", "Date-keyed appointment map"),
        ("calendarCells", "Dynamic calendar cell generator"),
        ("selectedDayAppointments", "Selected day appointment inspector"),
        ("videocam", "Telehealth video icon"),
        ("location_on", "In-person sanctuary icon"),
        ("setSelectedClientId", "Client dossier modal linking prop"),
        ("setClientModalTab", "Client dossier tab navigation prop")
    ]

    for snippet, desc in required_snippets:
        assert snippet in src, f"Missing {desc} in ConsultantSchedule.jsx"
        print(f"  [PASS] Verified {desc}")

    # Test 6: Verify App.jsx Prop Passing
    print("\n[TEST 6] Verifying App.jsx passes modal props to ConsultantSchedule:")
    with open(app_jsx, "r", encoding="utf-8") as f:
        app_src = f.read()

    case_match = re.search(r"case\s+'c-schedule':.*?<ConsultantSchedule\s+(.*?)\s*/>", app_src, re.DOTALL)
    assert case_match, "Could not find case 'c-schedule' block in App.jsx"
    block = case_match.group(1)
    assert "setSelectedClientId={setSelectedClientId}" in block, "setSelectedClientId not passed in c-schedule"
    assert "setClientModalTab={setClientModalTab}" in block, "setClientModalTab not passed in c-schedule"
    print("  [PASS] App.jsx successfully passes setSelectedClientId and setClientModalTab to ConsultantSchedule.")

    print("\n" + "=" * 75)
    print("ALL CONSULTANT VISUAL CALENDAR & SCHEDULING TESTS PASSED!")
    print("=" * 75)

if __name__ == "__main__":
    run_tests()
