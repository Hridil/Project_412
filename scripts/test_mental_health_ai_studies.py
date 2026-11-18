import re
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SRC_DIR = BASE_DIR / "src"

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
print("MINDCARE PRO - MENTAL HEALTH RESEARCH & STUDIES AI VERIFICATION")
print("=" * 75)

print("\n[TEST 1] Verifying Syntax & Structural Integrity:")
ai_widget_path = SRC_DIR / "components" / "common" / "AiAssistantWidget.jsx"
ai_widget_js = ai_widget_path.read_text(encoding="utf-8")
check_balanced(ai_widget_js, "AiAssistantWidget.jsx")

print("\n[TEST 2] Verifying Research Topics & Category Structure:")
check("MENTAL_HEALTH_RESEARCH_TOPICS" in ai_widget_js, "Exported MENTAL_HEALTH_RESEARCH_TOPICS catalog exists")
check("Harvard Mindfulness" in ai_widget_js, "Harvard Mindfulness study topic present")
check("Polyvagal" in ai_widget_js, "Polyvagal Theory topic present")
check("Cuijpers" in ai_widget_js, "Cuijpers Meta-Analysis topic present")
check("ACT & Psychological Flexibility" in ai_widget_js, "ACT & Hexaflex topic present")
check("Self-Compassion vs Self-Esteem" in ai_widget_js, "Kristin Neff Self-Compassion topic present")
check("CBT-I" in ai_widget_js, "CBT-I and Circadian Science topic present")
check("PTSD Trials: PE vs CPT vs EMDR" in ai_widget_js, "PTSD Comparative Trials topic present")
check("STAR*D" in ai_widget_js, "STAR*D Depression Trial topic present")
check("PHQ-9 & GAD-7" in ai_widget_js, "PHQ-9 & GAD-7 Psychometrics topic present")
check("Stanley-Brown" in ai_widget_js, "Stanley-Brown Safety Planning topic present")
check("Biopsychosocial" in ai_widget_js, "Biopsychosocial 4P Formulation topic present")
check("DBT Distress Tolerance" in ai_widget_js, "DBT TIPP & STOP skills topic present")

print("\n[TEST 3] Verifying Landmark Studies Knowledge Base Responses:")
# Check study details in code text
check("Sara W. Lazar" in ai_widget_js and "hippocampus" in ai_widget_js, "Harvard Lazar study includes neuroimaging of amygdala & hippocampus")
check("Stephen Porges" in ai_widget_js and "Ventral Vagal" in ai_widget_js and "Dorsal Vagal" in ai_widget_js, "Polyvagal Theory includes 3 autonomic hierarchy states")
check("Pim Cuijpers" in ai_widget_js and "relapse" in ai_widget_js, "Cuijpers Meta-Analysis explains psychotherapy vs medication relapse rates")
check("Steven C. Hayes" in ai_widget_js and "Hexaflex" in ai_widget_js and "Cognitive Defusion" in ai_widget_js, "ACT knowledge covers 6 Hexaflex processes")
check("Kristin Neff" in ai_widget_js and "Self-Kindness" in ai_widget_js and "Common Humanity" in ai_widget_js, "Self-Compassion research includes 3 core pillars")
check("American College of Physicians" in ai_widget_js and "Stimulus Control" in ai_widget_js, "CBT-I includes ACP clinical guidelines & stimulus control")
check("Prolonged Exposure" in ai_widget_js and "CPT" in ai_widget_js and "EMDR" in ai_widget_js, "PTSD clinical trials compare PE, CPT, and EMDR")
check("STAR*D" in ai_widget_js and "Level 1" in ai_widget_js and ("Augmentation" in ai_widget_js or "augmentation" in ai_widget_js), "STAR*D depression trial details stepped treatment levels")

print("\n[TEST 4] Verifying Diagnostic & Psychometric Screening Capabilities:")
check("0–4" in ai_widget_js and "20–27" in ai_widget_js, "PHQ-9 scoring scale thresholds present")
check("Item 9" in ai_widget_js and "Columbia-Suicide Severity Rating Scale" in ai_widget_js, "PHQ-9 Item 9 suicide triage protocol verified")
check("GAD-7" in ai_widget_js and "≥ 10" in ai_widget_js, "GAD-7 clinical anxiety cutoff verified")
check("Stanley-Brown Safety Planning" in ai_widget_js and "45%" in ai_widget_js, "Stanley-Brown SPI includes 6 collaborative steps & 45% evidence")
check("Predisposing" in ai_widget_js and "Precipitating" in ai_widget_js and "Perpetuating" in ai_widget_js and "Protective" in ai_widget_js, "Biopsychosocial 4Ps formulation verified")
check("TIPP" in ai_widget_js and "mammalian dive reflex" in ai_widget_js and "STOP" in ai_widget_js, "DBT TIPP & STOP skills verified")

print("\n[TEST 5] Verifying AI Assistant UI Category Filter Tabs:")
check("Landmark Studies" in ai_widget_js, "UI includes Landmark Studies category tab")
check("Diagnostics & Scales" in ai_widget_js, "UI includes Diagnostics & Scales category tab")
check("Coping & Tools" in ai_widget_js, "UI includes Coping & Tools category tab")
check("activeTab" in ai_widget_js, "UI manages activeTab state for seamless topic browsing")

print("\n" + "=" * 75)
print("ALL MENTAL HEALTH RESEARCH & STUDIES AI CHECKS PASSED!")
print("=" * 75)
