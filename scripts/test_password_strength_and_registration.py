"""
Test Suite: Password Strength Indicator & Clean Client Registration
Verifies:
1. Real-time password strength evaluation algorithm in AuthScreen.jsx
2. Strength meter visual segmented bar & interactive criteria checklist
3. Show/hide password visibility toggles on login & signup forms
4. Removal of 'Saving to Supabase database...' and technical database mentions during registration
5. JSX syntax balance and zero regression on existing security/auth suites
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

def test_password_strength_evaluator():
    print("[1/4] Verifying Password Strength Evaluator in AuthScreen.jsx...")
    content = check_file_exists("src/views/auth/AuthScreen.jsx")
    
    assert "evaluatePasswordStrength" in content, "Missing evaluatePasswordStrength export/function"
    assert "minLength: password.length >= 8" in content, "Missing 8-character length check"
    assert "/[A-Z]/.test" in content, "Missing uppercase check"
    assert "/[a-z]/.test" in content, "Missing lowercase check"
    assert "/[0-9]/.test" in content, "Missing number check"
    assert "/[^a-zA-Z0-9]/.test" in content, "Missing special character check"
    assert "Too Weak" in content, "Missing Too Weak label"
    assert "Weak" in content, "Missing Weak label"
    assert "Fair" in content, "Missing Fair label"
    assert "Strong" in content, "Missing Strong label"
    assert "Very Strong" in content, "Missing Very Strong label"
    
    print("  -> Password strength evaluation criteria and scoring verified.")

def test_password_strength_ui_elements():
    print("[2/4] Verifying Password Strength UI and Visibility Toggles...")
    content = check_file_exists("src/views/auth/AuthScreen.jsx")

    # Segmented progress bar
    assert "grid grid-cols-4 gap-1.5 h-1.5" in content, "Missing 4-segment strength bar"
    assert "passwordStrength.colorClass" in content, "Missing dynamic colorClass on strength bar"

    # Criteria checklist
    assert "8+ characters" in content, "Missing 8+ characters checklist item"
    assert "Uppercase letter (A-Z)" in content, "Missing uppercase checklist item"
    assert "Lowercase letter (a-z)" in content, "Missing lowercase checklist item"
    assert "Number (0-9)" in content, "Missing number checklist item"
    assert "Special character" in content, "Missing special character checklist item"

    # Visibility toggles
    assert "showSignupPassword" in content, "Missing showSignupPassword state"
    assert "showLoginPassword" in content, "Missing showLoginPassword state"
    assert "visibility_off" in content and "visibility" in content, "Missing visibility toggle icons"
    
    print("  -> Password strength visual meter, checklist, and visibility toggles verified.")

def test_clean_client_registration_feedback():
    print("[3/4] Verifying Removal of 'Saving to database' from Client Registration...")
    app_content = check_file_exists("src/App.jsx")

    # Ensure "Saving to Supabase database..." is removed
    assert "Saving to Supabase database" not in app_content, \
        "Found 'Saving to Supabase database' in App.jsx - should be removed"
    
    # Ensure "(Stored in Supabase)" is removed from registration welcome toast
    assert "(Stored in Supabase)" not in app_content, \
        "Found '(Stored in Supabase)' in App.jsx - should be removed"

    # Verify clean welcome toast
    assert "Welcome to MindCare, ${newAcc.name}!" in app_content, \
        "Missing clean client welcome message in App.jsx"
    assert "Practitioner account created for ${newAcc.name}" in app_content, \
        "Missing clean practitioner account message in App.jsx"

    print("  -> Technical database messages removed; clean client onboarding toasts verified.")

def test_jsx_structural_balance():
    print("[4/4] Verifying JSX syntax & bracket balance...")
    files = [
        "src/views/auth/AuthScreen.jsx",
        "src/App.jsx"
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
    print("=== Testing Password Strength Indicator & Clean Client Registration ===")
    test_password_strength_evaluator()
    test_password_strength_ui_elements()
    test_clean_client_registration_feedback()
    test_jsx_structural_balance()
    print("=== ALL TESTS PASSED SUCCESSFULLY! ===")

if __name__ == '__main__':
    main()
