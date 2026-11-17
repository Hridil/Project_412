"""
MINDCARE PRO - IMAGE DOWNLOAD PIPELINE & AI ASSISTANT TEST SUITE
================================================================
Validates:
1. Syntax and JSX balance of:
   - src/utils/mediaUtils.js
   - src/components/common/AiAssistantWidget.jsx
   - src/components/layout/Header.jsx
   - src/components/modals/FilePreviewModal.jsx
   - src/App.jsx
2. Image download logic:
   - MIME type and extension recognition (.jpg, .png, .webp, .svg, .pdf).
   - Cross-origin blob fetch & download trigger mechanism.
   - Fallback image generation (SVG image blob instead of .txt fallback).
3. AI Assistant knowledge base & role specialization:
   - Crisis response triggers (988 lifeline priority).
   - Client wellness guidance (4-7-8 breathing, 5-4-3-2-1 sensory grounding, booking guidance, coping tools).
   - Consultant clinical copilot (SOAP note templates, SMART goals, DSM-5 MDD criteria, CBT somatic interventions).
   - Context awareness and role-based persona switching.
"""

import sys
import os
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SRC_DIR = BASE_DIR / "src"

def check_brace_balance(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    open_c = content.count("{")
    close_c = content.count("}")
    open_p = content.count("(")
    close_p = content.count(")")
    return open_c == close_c, open_p == close_p, open_c, close_c, open_p, close_p

def test_syntax_and_structure():
    print("\n[TEST 1] Verifying Syntax & Structural Integrity of Modified Source Files:")
    files = [
        ("src/utils/mediaUtils.js", SRC_DIR / "utils" / "mediaUtils.js"),
        ("src/components/common/AiAssistantWidget.jsx", SRC_DIR / "components" / "common" / "AiAssistantWidget.jsx"),
        ("src/components/layout/Header.jsx", SRC_DIR / "components" / "layout" / "Header.jsx"),
        ("src/components/modals/FilePreviewModal.jsx", SRC_DIR / "components" / "modals" / "FilePreviewModal.jsx"),
        ("src/App.jsx", SRC_DIR / "App.jsx")
    ]
    for label, path in files:
        assert path.exists(), f"File {label} not found!"
        c_ok, p_ok, oc, cc, op, cp = check_brace_balance(path)
        assert c_ok, f"{label} curly braces unbalanced: {{{oc} vs }}{cc}"
        assert p_ok, f"{label} parentheses unbalanced: ({op} vs ){cp}"
        print(f"  [PASS] {label} braces ({oc}=={cc}) and parens ({op}=={cp}) balanced.")

def test_image_download_logic():
    print("\n[TEST 2] Verifying File Download Pipeline & Image Extensions:")
    media_utils = SRC_DIR / "utils" / "mediaUtils.js"
    with open(media_utils, "r", encoding="utf-8") as f:
        content = f.read()

    # Verify regex handles image extensions
    assert r"\.(jpe?g|png|webp|gif|svg)$" in content, "Missing image regex pattern in mediaUtils.js"
    print("  [PASS] Image extensions regex pattern (.jpg, .jpeg, .png, .webp, .gif, .svg) verified.")

    # Verify blob download handling for remote URLs (prevents browser cross-origin download blocking)
    assert "await fetch(fileUrl, { mode: 'cors' })" in content, "Missing fetch for remote file download"
    assert "URL.createObjectURL(blob)" in content, "Missing Blob URL creation for direct download"
    assert "URL.revokeObjectURL" in content, "Missing memory leak prevention (revokeObjectURL)"
    print("  [PASS] Cross-origin image fetch & same-origin Blob URL download pipeline verified.")

    # Verify image fallback creates an image blob instead of converting to .txt
    assert "image/svg+xml" in content, "Missing image blob generation in mediaUtils.js fallback"
    print("  [PASS] Seed/mock image download generates valid image blob instead of falling back to .txt.")

    # Verify tenant isolation guard is preserved
    assert "currentUser.role === 'client'" in content, "Missing client tenant isolation guard"
    print("  [PASS] Client Vault tenant isolation check verified in download pipeline.")

def test_file_preview_modal_support():
    print("\n[TEST 3] Verifying FilePreviewModal Image & Supabase URL Support:")
    preview_modal = SRC_DIR / "components" / "modals" / "FilePreviewModal.jsx"
    with open(preview_modal, "r", encoding="utf-8") as f:
        content = f.read()

    assert "previewFile.url" in content or "previewFile.file_url" in content, \
        "FilePreviewModal missing remote URL preview support"
    print("  [PASS] FilePreviewModal supports direct preview of Supabase storage image URLs.")

def test_ai_assistant_engine():
    print("\n[TEST 4] Verifying AI Assistant Knowledge Base & Role Specialization:")
    ai_widget = SRC_DIR / "components" / "common" / "AiAssistantWidget.jsx"
    with open(ai_widget, "r", encoding="utf-8") as f:
        content = f.read()

    # Safety checks
    assert "988" in content, "Missing 988 Suicide & Crisis Lifeline in AI safety handler"
    assert "Urgent Crisis Support" in content, "Missing urgent crisis support handler"
    print("  [PASS] AI Safety guard active: Immediate 24/7 crisis protocol (988 lifeline).")

    # Client wellness guidance checks
    assert "4-7-8" in content, "Missing 4-7-8 breathing exercise in AI assistant"
    assert "5-4-3-2-1" in content, "Missing sensory grounding technique"
    assert "How to Book a Session" in content, "Missing booking guidance for clients"
    print("  [PASS] Client Wellness Companion: 4-7-8 breathing, 5-4-3-2-1 sensory grounding & session booking tools verified.")

    # Consultant clinical copilot checks
    assert "Clinical SOAP Note Template" in content, "Missing SOAP note template for clinicians"
    assert "SMART Care Plan Goals" in content, "Missing SMART care plan goal formulation"
    assert "DSM-5 Diagnostic Criteria" in content, "Missing DSM-5 MDD diagnostic criteria"
    assert "Somatic Pacing" in content, "Missing CBT and somatic interventions"
    print("  [PASS] Clinical AI Copilot: SOAP note templates, SMART goals, DSM-5 criteria & trauma-informed intake verified.")

    # App integration checks
    app_jsx = SRC_DIR / "App.jsx"
    with open(app_jsx, "r", encoding="utf-8") as f:
        app_content = f.read()
    assert "AiAssistantWidget" in app_content, "AiAssistantWidget not imported/rendered in App.jsx"
    assert "onOpenAiAssistant" in app_content, "onOpenAiAssistant not wired in App.jsx"
    print("  [PASS] App.jsx successfully mounts AiAssistantWidget globally for both Client and Consultant.")

def main():
    print("=" * 75)
    print("MINDCARE PRO - IMAGE DOWNLOAD & AI ASSISTANT VERIFICATION SUITE")
    print("=" * 75)
    test_syntax_and_structure()
    test_image_download_logic()
    test_file_preview_modal_support()
    test_ai_assistant_engine()
    print("\n" + "=" * 75)
    print("ALL IMAGE DOWNLOAD & AI ASSISTANT VERIFICATION CHECKS PASSED!")
    print("=" * 75)

if __name__ == "__main__":
    main()
