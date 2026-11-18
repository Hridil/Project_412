import React, { useState, useRef, useEffect, useMemo } from 'react';

// Mental Health Studies, Clinical Trials, and Evidence-Based Research Knowledge Base
export const MENTAL_HEALTH_RESEARCH_TOPICS = [
  {
    id: 'mindfulness-harvard',
    category: 'studies',
    label: '🔬 Harvard Mindfulness & Amygdala Study',
    query: 'Tell me about the Harvard study on neuroplasticity, mindfulness, and the amygdala.',
    roles: ['client', 'consultant']
  },
  {
    id: 'polyvagal-theory',
    category: 'studies',
    label: '🧠 Polyvagal 3-State Regulation (Porges)',
    query: 'Explain the 3 autonomic states of Polyvagal Theory and how to regulate my nervous system.',
    roles: ['client', 'consultant']
  },
  {
    id: 'cuijpers-meta',
    category: 'studies',
    label: '🔬 Cuijpers Therapy vs SSRI Meta-Analysis',
    query: 'Summarize key clinical findings from Cuijpers meta-analyses comparing psychotherapy, pharmacotherapy, and combination treatment.',
    roles: ['consultant']
  },
  {
    id: 'act-flexibility',
    category: 'studies',
    label: '🌿 ACT & Psychological Flexibility (Hayes)',
    query: 'What is Acceptance and Commitment Therapy (ACT) and the 6 processes of psychological flexibility?',
    roles: ['client', 'consultant']
  },
  {
    id: 'neff-compassion',
    category: 'studies',
    label: '❤️ Self-Compassion vs Self-Esteem (Neff)',
    query: 'What does research say about self-compassion vs self-esteem for emotional resilience?',
    roles: ['client', 'consultant']
  },
  {
    id: 'cbti-sleep',
    category: 'studies',
    label: '🌙 CBT-I & Circadian Sleep Science (Walker/ACP)',
    query: 'What do clinical trials and ACP guidelines show regarding CBT-I and morning sunlight for mental health?',
    roles: ['client', 'consultant']
  },
  {
    id: 'ptsd-modalities',
    category: 'studies',
    label: '🔬 PTSD Trials: PE vs CPT vs EMDR',
    query: 'Compare evidence-based trauma modalities: Prolonged Exposure (PE), Cognitive Processing Therapy (CPT), and EMDR.',
    roles: ['consultant']
  },
  {
    id: 'stard-trial',
    category: 'studies',
    label: '📈 STAR*D Landmark Depression Trial',
    query: 'What did the landmark NIMH STAR*D study teach us about staged depression treatment and remission?',
    roles: ['consultant']
  },
  {
    id: 'phq-gad-scales',
    category: 'diagnostics',
    label: '📊 PHQ-9 & GAD-7 Psychometric Scoring',
    query: 'Provide standard scoring cutoffs, clinical interpretation, and suicide triage protocols for PHQ-9 and GAD-7.',
    roles: ['consultant', 'client']
  },
  {
    id: 'stanley-brown',
    category: 'diagnostics',
    label: '🛡️ Stanley-Brown Safety Planning (SPI)',
    query: 'Detail the 6-step Stanley-Brown Safety Planning Intervention (SPI) protocol and clinical evidence.',
    roles: ['consultant']
  },
  {
    id: 'biopsychosocial-4p',
    category: 'diagnostics',
    label: '📋 Biopsychosocial 4P Case Formulation',
    query: 'Structure a comprehensive Biopsychosocial-Spiritual case formulation using the 4Ps model.',
    roles: ['consultant']
  },
  {
    id: 'dbt-distress',
    category: 'tools',
    label: '⚡ DBT Distress Tolerance (TIPP & STOP)',
    query: 'Explain the DBT distress tolerance tools TIPP and STOP for managing intense emotional waves.',
    roles: ['client', 'consultant']
  },
  {
    id: 'breathing-478',
    category: 'tools',
    label: '🧘 4-7-8 Parasympathetic Breathing',
    query: 'Guide me through a 4-7-8 breathing exercise to calm down.',
    roles: ['client']
  },
  {
    id: 'grounding-54321',
    category: 'tools',
    label: '🌿 5-4-3-2-1 Sensory Grounding',
    query: 'Walk me through the 5-4-3-2-1 sensory grounding exercise.',
    roles: ['client']
  },
  {
    id: 'soap-note',
    category: 'tools',
    label: '📋 Draft Clinical SOAP Note',
    query: 'Draft a structured clinical SOAP note template for an anxiety consultation.',
    roles: ['consultant']
  },
  {
    id: 'smart-goals',
    category: 'tools',
    label: '🎯 Formulate SMART Care Goals',
    query: 'Help me write 3 SMART goals for a client recovering from PTSD.',
    roles: ['consultant']
  },
  {
    id: 'booking-guide',
    category: 'tools',
    label: '📅 How to Book a Consultation',
    query: 'How do I book a session with an assigned consultant on MindCare?',
    roles: ['client']
  }
];

// Contextual Knowledge Base for Evidence-Based & Research-Backed Responses
export const generateAiResponse = (userInput, role, userName, appContext = {}) => {
  const query = (userInput || '').toLowerCase().trim();

  // 1. Immediate Crisis Check (988 Lifeline Priority)
  if (
    query.includes('suicide') ||
    query.includes('kill myself') ||
    query.includes('end my life') ||
    query.includes('self harm') ||
    query.includes('hurt myself') ||
    query.includes('want to die')
  ) {
    return `### 🚨 Urgent Crisis Support & Safety Lifeline

If you or someone you know is in immediate distress or experiencing thoughts of self-harm, please know that **you are not alone and compassionate, non-judgmental help is available 24/7**:

* **988 Suicide & Crisis Lifeline**: Call or text **988** (Free, confidential, available 24/7).
* **The Trevor Project** (LGBTQ Youth): Call **1-866-488-7386** or text **START to 678-678**.
* **Veterans Crisis Line**: Dial **988**, then press **1**, or text **838255**.
* **Emergency Medical Assistance**: Call **911** or go to the nearest hospital emergency room.

Please reach out to one of these resources right away. Your life, presence, and wellbeing matter deeply.`;
  }

  // 2. MENTAL HEALTH STUDIES & SCIENTIFIC RESEARCH INQUIRIES (Universal Access)
  // 2.1 Harvard Neuroplasticity & Mindfulness Study (Lazar et al.)
  if (
    query.includes('lazar') ||
    query.includes('neuroplasticity') ||
    query.includes('amygdala') ||
    (query.includes('harvard') && query.includes('mindful'))
  ) {
    return `### 🔬 Landmark Study: Harvard Neuroplasticity & Mindfulness (Lazar et al., 2011)

**Source**: *Psychiatry Research: Neuroimaging* (Harvard Medical School & Massachusetts General Hospital)  
**Authors**: Dr. Sara W. Lazar, Carmody, Vangel, Congleton, Yerramsetti, Gard, & Kerr.

#### Study Overview & Methodology:
A pioneering longitudinal neuroimaging study investigating anatomical structural brain changes in participants before and after completing an **8-week Mindfulness-Based Stress Reduction (MBSR)** program compared to a control group.

#### Core Findings & Biological Mechanisms:
1. **Right Amygdala Reduction**: MRI volumetric analysis confirmed a **statistically significant reduction in gray-matter concentration within the right amygdala** (the brain's emotional threat center). Crucially, this reduction directly correlated with participant-reported drops in subjective stress.
2. **Hippocampal Neurogenesis**: Increased gray-matter density in the **left hippocampus**, essential for contextual memory, emotional learning, and autonomic dampening.
3. **Prefrontal & Temporoparietal Junction (TPJ) Thickening**: Growth in brain regions responsible for perspective taking, empathy, and executive emotional regulation.

> **Clinical Takeaway**: Consistent mindfulness practice physically alters brain structure within 8 weeks, biologically down-regulating chronic hyperarousal and strengthening emotional regulation circuits.`;
  }

  // 2.2 Polyvagal Theory (Dr. Stephen Porges)
  if (
    query.includes('polyvagal') ||
    query.includes('porges') ||
    query.includes('ventral vagal') ||
    query.includes('dorsal vagal') ||
    query.includes('autonomic state')
  ) {
    return `### 🧠 Polyvagal Theory & Autonomic Regulation (Dr. Stephen Porges)

**Framework**: The Polyvagal Perspective (Porges, 2011; Deb Dana, 2018)  
**Core Concept**: The Autonomic Nervous System (ANS) operates in a **phylogenetic hierarchy of 3 distinct neural circuits** responding to subconscious environmental cues (*neuroception*):

#### The 3 Autonomic States:
1. **🌿 Ventral Vagal State (Social Engagement & Safety)**:
   * *Nerve*: Myelinated 10th cranial vagus nerve originating in the nucleus ambiguus.
   * *State*: Calm, connected, creative, grounded, receptive to eye contact and warm vocal prosody.
   * *Physiology*: Heart rate variability (HRV) increases, digestive rest-and-digest activated, inflammation lowered.
2. **⚡ Sympathetic Nervous System (Mobilization / Fight-or-Flight)**:
   * *Trigger*: Perceived acute threat or hyper-activation.
   * *State*: Anxiety, anger, vigilance, agitation, racing thoughts, urge to flee or fight.
   * *Physiology*: Epinephrine/cortisol surge, pupil dilation, accelerated heart rate, muscle tension.
3. **🧊 Dorsal Vagal State (Immobilization / Freeze & Collapse)**:
   * *Nerve*: Unmyelinated vagal pathway originating in the dorsal motor nucleus.
   * *State*: Numbness, dissociation, depression, despair, feeling disconnected or "shut down".
   * *Physiology*: Bradycardia, drop in blood pressure, lethargy, conservation of vital energy.

#### Evidence-Based Autonomic Pacing Tools:
* **Prolonged Exhalations**: 4-7-8 breathing stimulates ventral vagal braking, directly slowing heart rate.
* **Vocal Cord Stimulation**: Humming, singing, or gargling water exercises the vagus nerve branch innervating the pharynx and larynx.
* **Orienting Reflex**: Slowly turning your neck to visually map 3 neutral objects in your room communicates physiological safety to your brainstem.`;
  }

  // 2.3 Cuijpers Landmark Meta-Analysis on Psychotherapy vs Pharmacotherapy
  if (
    query.includes('cuijpers') ||
    (query.includes('psychotherapy') && (query.includes('ssri') || query.includes('pharmacotherapy') || query.includes('meta-analysis'))) ||
    query.includes('combination treatment')
  ) {
    return `### 🔬 Meta-Analysis: Psychotherapy vs Pharmacotherapy for Depression (Cuijpers et al.)

**Source**: *World Psychiatry* & *The Lancet Psychiatry* (2020, 2023)  
**Lead Author**: Prof. Pim Cuijpers (Vrije Universiteit Amsterdam), synthesizing 300+ randomized clinical trials (RCTs).

#### Key Research Findings:
1. **Equivalence in Acute Unipolar Depression**:
   * Evidence-based psychotherapy (Cognitive Behavioral Therapy - CBT, Interpersonal Psychotherapy - IPT, Behavioral Activation) shows comparable acute efficacy to modern second-generation antidepressants (SSRIs/SNRIs) for mild-to-moderate depression.
2. **Combination Treatment is Superior for Moderate-to-Severe Depression**:
   * The combination of **CBT + Pharmacotherapy** yielded significantly higher response and remission rates (*Hedges' g* ≈ 0.35-0.45 higher) than medication or psychotherapy alone.
3. **Superior Relapse Prevention with Psychotherapy**:
   * Clients receiving psychotherapy developed internal cognitive and behavioral coping skills that provided **durable protection against depressive relapse** up to 2 years post-treatment (relapse rate ~30% vs ~55% for patients discontinuing antidepressant medication without therapy).

> **Clinical Recommendation**: For enduring recovery, combining clinician-guided therapy with medical management when appropriate offers the highest clinical outcomes.`;
  }

  // 2.4 Acceptance and Commitment Therapy (ACT) & Psychological Flexibility
  if (
    query.includes('act') ||
    query.includes('acceptance and commitment') ||
    query.includes('hexaflex') ||
    query.includes('psychological flexibility') ||
    query.includes('steven hayes')
  ) {
    return `### 🌿 Acceptance and Commitment Therapy (ACT) & The Hexaflex Model

**Founder**: Dr. Steven C. Hayes (1999, 2019)  
**Premise**: Suffering stems from *psychological rigidity* and *experiential avoidance* (struggling fruitlessly against painful thoughts). ACT cultivates **psychological flexibility**—the ability to be present, open up to feelings, and take action aligned with your authentic values.

#### The 6 Core Processes of the ACT Hexaflex:
1. **Cognitive Defusion**: Stepping back and observing thoughts as language rather than literal truths. (*"I am having the thought that I will fail"* instead of *"I will fail"*).
2. **Acceptance (Willingness)**: Actively making room for unpleasant sensations or anxiety without trying to numb or avoid them.
3. **Present-Moment Contact (Here & Now)**: Grounding attention flexibly in current sensory experience rather than ruminating on the past or worrying about the future.
4. **Self-as-Context (The Observing Self)**: Recognizing you are the conscious arena holding thoughts and emotions, not the thoughts themselves.
5. **Values Clarification**: Identifying what truly brings meaning, vitality, and purpose (e.g. compassion, creativity, family).
6. **Committed Action**: Setting tangible goals and taking steps that honor your core values, even in the presence of discomfort.`;
  }

  // 2.5 Self-Compassion vs Self-Esteem (Dr. Kristin Neff)
  if (
    query.includes('self-compassion') ||
    query.includes('neff') ||
    (query.includes('compassion') && query.includes('esteem'))
  ) {
    return `### ❤️ Research: Self-Compassion vs Self-Esteem (Dr. Kristin Neff, 2003-2023)

**Source**: *Self and Identity*, *Journal of Personality*  
**Finding**: Self-esteem is contingent on social comparison, ego validation, and success, leading to emotional fragility, narcissism, and defensiveness. **Self-compassion provides stable emotional resilience** independent of external outcomes.

#### The 3 Pillars of Self-Compassion:
1. **Self-Kindness vs Self-Judgment**:
   * Treating yourself with warmth, patience, and understanding during mistakes, rather than harsh internal self-criticism.
2. **Common Humanity vs Isolation**:
   * Recognizing that imperfection, struggle, and emotional pain are universal human experiences, not personal flaws that separate you from others.
3. **Mindfulness vs Over-Identification**:
   * Holding your feelings in balanced awareness without exaggerating (catastrophizing) or suppressing them.

> **Empirical Outcome**: Research shows higher self-compassion predicts lower levels of cortisol, reduced GAD/MDD symptoms, and greater motivation for healthy personal growth without the fear of failure.`;
  }

  // 2.6 Sleep & Circadian Biology (Walker, Huberman, ACP Guidelines)
  if (
    query.includes('cbt-i') ||
    query.includes('insomnia') ||
    query.includes('circadian') ||
    query.includes('matthew walker') ||
    query.includes('morning sun') ||
    query.includes('sleep hygiene')
  ) {
    return `### 🌙 Sleep Science, Circadian Biology & CBT-I Guidelines

**Sources**: American College of Physicians (ACP Guidelines, *Annals of Internal Medicine*); Dr. Matthew Walker (*Why We Sleep*); Salk Institute Circadian Studies.

#### 1. Cognitive Behavioral Therapy for Insomnia (CBT-I):
The **ACP recommends CBT-I as first-line therapy** for chronic insomnia before pharmacotherapy:
* **Stimulus Control**: Re-associating bed with sleep (if awake for 20 minutes, get up and read in dim light until drowsy).
* **Sleep Restriction / Compression**: Limiting time in bed to match actual sleep duration until sleep efficiency exceeds 85%.
* **Cognitive Reframing**: Neutralizing catastrophic thoughts about sleep loss (*"My body will rest even if sleep is delayed"*).

#### 2. Circadian Light & Neurochemical Pacing:
* **Morning Photons (First 30-60 Mins)**: Viewing bright outdoor sunlight stimulates melanopsin-containing *intrinsically photosensitive retinal ganglion cells (ipRGCs)*, setting the master clock in the Suprachiasmatic Nucleus (SCN).
* **Neurochemical Trigger**: Triggers a healthy morning cortisol surge for alertness, while starting a 14-to-16 hour countdown for evening melatonin release.
* **Emotional Processing**: REM sleep specifically processes emotionally charged memories, softening affective charge through cholinergic signaling.`;
  }

  // 2.7 PTSD & Trauma Processing Trials (PE vs CPT vs EMDR)
  if (
    query.includes('ptsd') ||
    query.includes('cpt') ||
    query.includes('emdr') ||
    query.includes('prolonged exposure') ||
    query.includes('trauma modality')
  ) {
    return `### 🔬 PTSD Comparative Clinical Trials: PE vs CPT vs EMDR

**Source**: APA Clinical Practice Guideline for the Treatment of PTSD (2017/2023 update)

| Modality | Theoretical Model | Primary Mechanism | Clinical Strengths |
| :--- | :--- | :--- | :--- |
| **Prolonged Exposure (PE)** *(Edna Foa)* | Emotional Processing Theory | In vivo & imaginal exposure to extinguish conditioned fear | Reduces trauma-related avoidance; high evidence base |
| **Cognitive Processing Therapy (CPT)** *(Patricia Resick)* | Social Cognitive Theory | Identifying and challenging cognitive "stuck points" (safety, trust, power) | Restructures guilt and negative core schemas |
| **EMDR** *(Francine Shapiro)* | Adaptive Information Processing (AIP) | Bilateral eye movement/tactile stimulation during recall | Low linguistic demand; rapid desensitization of somatic charge |

> **Meta-Analytic Consensus**: All three modalities demonstrate large effect sizes (*d* > 1.2) over control conditions. Clinician selection should be guided by client preference, somatic tolerance, and dissociative tendencies.`;
  }

  // 2.8 STAR*D Landmark Depression Trial (NIMH)
  if (
    query.includes('star*d') ||
    query.includes('stard') ||
    query.includes('sequenced treatment') ||
    query.includes('treatment resistant')
  ) {
    return `### 📈 Landmark Trial: NIMH STAR*D (Sequenced Treatment Alternatives to Relieve Depression)

**Source**: *American Journal of Psychiatry* (Rush et al., 2006, N=4,041)  
**Significance**: The largest prospective clinical trial in history assessing stepped, real-world treatment algorithms for Major Depressive Disorder (MDD).

#### Stepped Level Remission Rates:
* **Level 1 (First-line Monotherapy - Citalopram)**: ~33% achieved full remission; ~47% responded.
* **Level 2 (Switch or Augmentation - CBT, Bupropion, Buspirone)**: An additional ~31% of non-remitters achieved remission. Adding CBT was as effective as medication switching and had fewer side effects.
* **Level 3 & 4 (Specialized Combinations - Lithium, T3, MAOIs)**: Remission rates dropped to ~14% and ~13% respectively, with higher relapse rates.

> **Key Clinical Takeaway**: Remission (symptom-free status), rather than partial response, is the key to preventing relapse. Step-by-step collaborative treatment combining evidence-based psychotherapy with medical care is crucial.`;
  }

  // 2.9 Psychometrics: PHQ-9 & GAD-7 Scoring & Clinical Triage
  if (
    query.includes('phq') ||
    query.includes('gad') ||
    query.includes('scoring') ||
    query.includes('cutoff') ||
    query.includes('psychometric')
  ) {
    return `### 📊 Validated Psychometrics: PHQ-9 & GAD-7 Scoring & Protocols

#### 1. PHQ-9 (Patient Health Questionnaire - Depression):
* **0–4**: Minimal or no depression (Supportive psychoeducation).
* **5–9**: Mild depression (Watchful waiting, lifestyle, brief CBT tools).
* **10–14**: Moderate depression (Formal clinical consultation, active CBT/IPT psychotherapy).
* **15–19**: Moderately severe depression (Psychotherapy + psychiatric consultation).
* **20–27**: Severe depression (Intensive multidisciplinary care, active crisis monitoring).

> ⚠️ **Item 9 Safety Protocol**: Any positive score (>0) on Item 9 (*"Thoughts that you would be better off dead, or of hurting yourself"*) mandates immediate clinical risk assessment using the **Columbia-Suicide Severity Rating Scale (C-SSRS)** and collaborative safety planning.

#### 2. GAD-7 (Generalized Anxiety Disorder):
* **0–4**: Minimal anxiety.
* **5–9**: Mild anxiety.
* **10–14**: Moderate anxiety (Clinical cutoff score ≥ 10 has 89% sensitivity and 82% specificity for GAD).
* **15–21**: Severe anxiety (Indicates active panic, autonomic hyperarousal, or generalized impairment).`;
  }

  // 2.10 Stanley-Brown Safety Planning Intervention (SPI)
  if (
    query.includes('stanley-brown') ||
    query.includes('safety plan') ||
    query.includes('spi')
  ) {
    return `### 🛡️ Stanley-Brown Safety Planning Intervention (SPI)

**Source**: *JAMA Psychiatry* (Boudreaux et al., 2018)  
**Evidence**: Implementation of the 6-step collaborative Safety Plan reduces suicidal behavior and emergency room presentations by **45%**.

#### The 6 Evidence-Based Steps:
1. **Personal Warning Signs**: Recognizing physiological cues, intrusive thoughts, or behaviors that signal a crisis is building (e.g. pacing, social withdrawal).
2. **Internal Coping Strategies**: Solo regulation activities that distract and calm without contacting another person (e.g. 4-7-8 breathing, progressive muscle relaxation, cold water splash).
3. **People and Social Places for Distraction**: Trusted individuals or public environments that provide grounding without necessarily discussing the crisis (e.g. walking in a park, visiting a library).
4. **Trusted Friends or Family to Contact for Help**: Specific peers and loved ones informed of their role in supporting the client.
5. **Healthcare Professionals & Urgent Agencies**:
   * Assigned MindCare Clinician
   * **988 Suicide & Crisis Lifeline** (Call/Text 24/7)
   * Local Emergency Care / Crisis Stabilization Center
6. **Lethal Means Restriction**: Collaboratively securing or removing medications, firearms, or sharp objects from immediate access.`;
  }

  // 2.11 Biopsychosocial-Spiritual 4P Case Formulation
  if (
    query.includes('biopsychosocial') ||
    query.includes('4p') ||
    query.includes('case formulation')
  ) {
    return `### 📋 Biopsychosocial-Spiritual 4P Clinical Formulation Model

A comprehensive diagnostic framework synthesizing client etiology and resilience across 4 longitudinal dimensions:

1. **Predisposing Factors (Vulnerability)**:
   * *Bio*: Family history of mood disorders, neurochemical imbalances, chronic health conditions.
   * *Psycho*: Adverse Childhood Experiences (ACEs), perfectionistic cognitive schemas.
   * *Social*: Intergenerational trauma, systemic oppression, early attachment instability.
2. **Precipitating Factors (Triggers)**:
   * Acute stressors that triggered the current episode (e.g. divorce, job loss, medical diagnosis).
3. **Perpetuating Factors (Maintenance)**:
   * Factors keeping symptoms alive (e.g. avoidance behavior, circadian disruption, lack of social safety, rumination).
4. **Protective Factors (Strengths & Resilience)**:
   * Internal and external assets (e.g. high introspective insight, strong therapeutic alliance, supportive partner, commitment to therapy).`;
  }

  // 2.12 DBT Distress Tolerance (TIPP & STOP)
  if (
    query.includes('dbt') ||
    query.includes('tipp') ||
    query.includes('stop skill') ||
    query.includes('marsha linehan')
  ) {
    return `### ⚡ Dialectical Behavior Therapy (DBT): Distress Tolerance Skills

**Creator**: Dr. Marsha Linehan (Behavioral Tech / University of Washington)

#### 1. TIPP (Autonomic Shock & Reset):
* **T - Temperature**: Splash face with ice-cold water or hold an ice cube for 30 seconds. Triggers the *mammalian dive reflex*, rapidly lowering heart rate.
* **I - Intense Exercise**: 1-2 minutes of jumping jacks or fast walking to expend acute adrenaline.
* **P - Paced Breathing**: Inhale for 4 seconds, exhale for 7 seconds to stimulate vagal nerve calming.
* **P - Paired Muscle Relaxation**: Tense muscle groups on the inhale, then deeply release tension on the exhale.

#### 2. STOP (Crisis De-escalation):
* **S - Stop**: Freeze! Do not react, speak, or send that message.
* **T - Take a Step Back**: Remove yourself physically or mentally from the trigger.
* **O - Observe**: Notice thoughts, feelings, and the room objectively without judging.
* **P - Proceed Mindfully**: Ask your *Wise Mind*: *"What action will make this situation better, not worse?"*`;
  }

  // 3. ROLE-SPECIFIC STANDARD HANDLERS

  // 3.1 Client Tools
  if (role === 'client') {
    if (query.includes('4-7-8') || (query.includes('breath') && (query.includes('exercise') || query.includes('calm')))) {
      return `### 🧘 Guided 4-7-8 Calming Breath Exercise

The 4-7-8 technique is a natural tranquilizer for your autonomic nervous system (Dr. Andrew Weil). Follow these steps:

1. **Empty Your Lungs**: Exhale completely through your mouth with a soft whoosh sound.
2. **Inhale (4 Counts)**: Close your mouth and inhale quietly through your nose for **4**.
3. **Hold (7 Counts)**: Gently hold your breath for a count of **7**.
4. **Exhale (8 Counts)**: Exhale completely through your mouth with a steady whoosh for **8**.
5. **Repeat**: Complete this cycle **4 times**.

> **Neuroscience Note**: Prolonged 8-count exhalations activate acetylcholine release, slowing sinus node cardiac firing and reducing acute anxiety.`;
    }

    if (query.includes('grounding') || query.includes('5-4-3-2-1') || query.includes('sensory')) {
      return `### 🌿 5-4-3-2-1 Sensory Grounding Technique

When your thoughts race, sensory grounding pulls attention from the overactive default mode network (DMN) into somatic present awareness:

* **👀 5 Things You Can SEE**: Notice 5 specific textures, colors, or shadows around you.
* **✋ 4 Things You Can FEEL**: Notice the support of your chair, your feet on the floor, or the texture of your clothing.
* **👂 3 Things You Can HEAR**: Listen for distant ambient hums, birds, or your own slow breath.
* **👃 2 Things You Can SMELL**: The aroma of tea, fresh air, wood, or a clean shirt.
* **👅 1 Thing You Can TASTE**: Take a mindful sip of water or notice the clean taste in your mouth.

*Take a long, nourishing breath. You are safe in this present moment.*`;
    }

    if (query.includes('book') || query.includes('schedule') || query.includes('appointment')) {
      return `### 📅 How to Book a Session in MindCare

Booking confidential consultations with your licensed practitioner is simple:

1. Navigate to **Book Session** in your dashboard menu.
2. **Clinical Intake**: Complete the pre-consultation intake form (concern category, 1-10 distress rating, symptom duration).
3. **Choose Practitioner & Slot**: Select your practitioner, date, and preferred time slot.
4. **Live Slot Verification**: MindCare automatically checks that the slot is free. If occupied, the system will immediately alert you so you can pick an available time.
5. **Modality**: Choose between **Online Telehealth** or **In-Person Sanctuary** consultation.
6. Click **Submit Pre-Consultation Intake & Book Session**!`;
    }

    if (query.includes('anxiety') || query.includes('panic') || query.includes('racing') || query.includes('stress')) {
      return `### 💡 Evidence-Based Coping Strategies for Anxiety

When acute anxiety arises, your sympathetic nervous system is in hyper-drive. Here are clinical tools to regain equilibrium:

1. **Physiological Sigh (Stanford Neurobiology)**: Take two quick sniffs in through your nose (one deep, one short top-off), followed by a long, slow sigh out through your mouth. Doing this twice immediately resets autonomic arousal.
2. **Name the Emotion**: Silently say to yourself, *"I am noticing a sensation of anxiety right now; it is a temporary physiological wave that will peak and subside."*
3. **TIPP Cold Water Dive**: Splash cold water on your face for 20 seconds.
4. **Consultation**: Schedule a session with your assigned clinician in **Book Session** for tailored therapeutic guidance.`;
    }

    // Default Client Fallback
    return `### Hello ${userName || 'Friend'} 👋

I'm your **MindCare Wellness & Research Assistant**. I can guide you through evidence-based coping tools, psychological studies, and scheduling support.

**Explore topics with me:**
* **Scientific Studies**: Ask *"Tell me about the Harvard mindfulness study"*, *"Explain Polyvagal Theory"*, or *"What is ACT?"*
* **Somatic Coping**: Ask *"Guide me through 4-7-8 breathing"* or *"Give me a 5-4-3-2-1 grounding exercise"*.
* **Sleep & Stress**: Ask *"What does science say about sleep and anxiety?"*
* **Booking**: Ask *"How do I book a consultation?"*

How are you feeling right now?`;
  }

  // 3.2 Consultant Tools
  if (role === 'consultant') {
    if (query.includes('soap') || query.includes('note template') || query.includes('clinical note')) {
      return `### 📋 Clinical SOAP Note Template

**Client**: [Client Name / ID]  
**Date**: ${new Date().toLocaleDateString()} | 50-Minute Consultation  
**Modality**: Telehealth Video / In-Person Sanctuary  

#### 1. S (Subjective)
* **Chief Complaint & Mood**: Client reports anxiety symptoms (rated 6/10) following recent workplace transitions.
* **Client Statements**: *"I've had difficulty switching off my mind in the evenings."*
* **Adherence**: Client practiced 4-7-8 breathing 3x weekly with moderate symptom relief.

#### 2. O (Objective)
* **Mental Status Exam (MSE)**: Client is alert, oriented x4, casually groomed, with cooperative engagement. Speech is normal in rate and rhythm; affect is mildly anxious but congruent. No evidence of cognitive impairment, perceptual disturbances, or active suicidal/homicidal ideation.
* **Standardized Measures**: GAD-7 score: 11 (Moderate Anxiety); PHQ-9: 6 (Mild).

#### 3. A (Assessment)
* **Clinical Impression**: Generalized Anxiety Disorder (DSM-5: F41.1), showing positive responsiveness to cognitive reframing and somatic grounding.
* **Risk Assessment**: Low acute risk. Protective factors: stable housing, supportive social circle, active engagement in therapy.

#### 4. P (Plan)
* **Interventions**: Continue CBT thought-record challenging and progressive muscle relaxation.
* **Assigned Practice**: Complete 5-minute somatic grounding journal entry on high-stress days.
* **Next Session**: Scheduled for next week; will review cognitive distortion logs.`;
    }

    if (query.includes('smart') || query.includes('care plan') || query.includes('goal')) {
      return `### 🎯 Evidence-Based SMART Care Plan Goals

Here are measurable, trauma-informed SMART goals suitable for client care plans:

#### Goal 1: Anxiety Regulation (Somatic & Cognitive)
* **Specific**: Client will identify 2 physiological precursors to panic/anxiety and employ the 4-7-8 breathing method.
* **Measurable**: Self-reported reduction of peak distress from 8/10 to 4/10 on the Subjective Units of Distress Scale (SUDS).
* **Achievable**: Scaffolded during 1-on-1 consultations with practitioner guided practice.
* **Relevant**: Supports client's goal of improving workplace and social functioning.
* **Time-Bound**: Achieve consistent daily practice within 4 weeks.

#### Goal 2: Cognitive Restructuring (Depression / Negative Schemas)
* **Specific**: Client will complete a 3-column thought record (Event, Automatic Thought, Rational Response) when experiencing cognitive distortions.
* **Measurable**: Minimum of 3 completed entries per week, reviewed in bi-weekly sessions.
* **Time-Bound**: Ongoing review over an 8-week treatment arc.`;
    }

    if (query.includes('cbt') || query.includes('somatic') || query.includes('somatic pacing')) {
      return `### 🔬 Evidence-Based Interventions: CBT & Somatic Pacing

When working with trauma, autonomic dysregulation, and hyperarousal:

1. **Dual Awareness & Pendulation**: Help the client alternate between focusing on a sensation of safety/resilience (the resource) and a mildly challenging memory or physical sensation, preventing autonomic flooding.
2. **Cognitive Distortion Reframing**: Address *Catastrophizing*, *All-or-Nothing Thinking*, and *Personalization* using Socratic questioning:
   * *"What is the objective evidence for and against this thought?"*
   * *"What would you tell a trusted friend in this exact circumstance?"*
3. **Vagal Nerve Stimulation & Pacing**: Guide the client through prolonged vocal exhalations (humming or singing) and peripheral vision expansion to switch from sympathetic fight-or-flight to parasympathetic ventral vagal state.
4. **Behavioral Activation Hierarchy**: Co-create a graded activity schedule starting with micro-steps that provide a sense of mastery or pleasure.`;
    }

    if (query.includes('dsm') || query.includes('depression') || query.includes('criteria') || query.includes('mdd')) {
      return `### 🧠 DSM-5 Diagnostic Criteria: Major Depressive Disorder (MDD)

To meet DSM-5 diagnostic criteria for Major Depressive Disorder (296.xx / F32.x), a client must exhibit **5 or more of the following symptoms** during the same **2-week period**, representing a change from previous functioning, where at least one symptom is either **(1) Depressed mood** or **(2) Loss of interest/pleasure (anhedonia)**:

1. **Depressed Mood**: Most of the day, nearly every day.
2. **Anhedonia**: Markedly diminished interest or pleasure in all or almost all activities.
3. **Weight/Appetite Changes**: Significant unintentional weight change (>5% in a month) or daily appetite fluctuations.
4. **Sleep Disturbances**: Insomnia or hypersomnia nearly every day.
5. **Psychomotor Changes**: Observable agitation or retardation.
6. **Fatigue / Anergia**: Nearly every day.
7. **Worthlessness / Excessive Guilt**: Unwarranted guilt or feeling like a burden.
8. **Diminished Concentration**: Indecisiveness or impaired cognitive pacing.
9. **Recurrent Suicidal Ideation**: Passive thoughts of death or active suicidal plans/attempts.

*Symptoms must cause clinically significant distress/functional impairment and not be attributable to substance use or a general medical condition.*`;
    }

    // Default Consultant Fallback
    return `### Clinical AI Copilot 👋

Welcome, **${userName || 'Doctor'}**. I am your **MindCare Clinical & Research Copilot**, equipped with mental health studies, validated psychometrics, and clinical documentation models.

**Available Clinical Modules:**
* **Landmark Studies**: Ask *"Cuijpers meta-analysis"*, *"Harvard Lazar study"*, *"Polyvagal clinical application"*, or *"STAR*D trial"*.
* **Psychometrics**: Ask *"PHQ-9 and GAD-7 scoring interpretation"* or *"Stanley-Brown Safety Plan"*.
* **Formulations & Notes**: Ask *"Draft clinical SOAP note"* or *"Biopsychosocial 4P case formulation"*.
* **Trauma Processing**: Ask *"Compare PE, CPT, and EMDR for PTSD"*.

How may I assist your clinical practice today?`;
  }

  // Fallback
  return `### MindCare Pro Assistant

MindCare Pro provides a secure, HIPAA-conscious sanctuary for evidence-based clinical collaboration and emotional wellness. 

Ask about landmark mental health studies, autonomic nervous system regulation, validated psychometrics (PHQ-9/GAD-7), or scheduling assistance!`;
};

export default function AiAssistantWidget({
  U,
  S,
  isClientAssignedToConsultant,
  showToast,
  isOpen: controlledIsOpen,
  setIsOpen: controlledSetIsOpen
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = controlledSetIsOpen || setInternalIsOpen;
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'studies', 'tools', 'diagnostics'

  const role = U?.role || 'client';
  const isConsultant = role === 'consultant';

  const [messages, setMessages] = useState(() => {
    return [
      {
        id: 1,
        sender: 'ai',
        text: !isConsultant
          ? `Hello **${U?.name || 'there'}**! 🌿 I am your **MindCare Wellness & Research Companion**. I can guide you through evidence-based coping tools, psychological studies (like Harvard's neuroplasticity research & Polyvagal Theory), or help you book and prepare for your consultations.`
          : `Hello **${U?.name || 'Doctor'}**! 🧠 I am your **Clinical AI Copilot**. I can provide evidence-based studies (Cuijpers, STAR*D, PE/EMDR), validated psychometric scoring (PHQ-9, GAD-7, Stanley-Brown SPI), clinical SOAP notes, and Biopsychosocial-Spiritual formulations.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  const handleSendMessage = (textToSend = null) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const responseText = generateAiResponse(text, role, U?.name || 'User');
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: !isConsultant
          ? `Conversation reset. How can I support your wellbeing and mental health exploration today, **${U?.name || 'Friend'}**?`
          : `Conversation reset. Ready for clinical research queries, documentation, or caseload consultations, **${U?.name || 'Doctor'}**?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    if (showToast) showToast('Conversation cleared.');
  };

  const handleCopyText = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (showToast) showToast('Copied text to clipboard!');
    }
  };

  // Filter prompt suggestions based on role and active category tab
  const filteredPrompts = useMemo(() => {
    return MENTAL_HEALTH_RESEARCH_TOPICS.filter((t) => {
      const roleMatch = t.roles.includes(role);
      const categoryMatch = activeTab === 'all' || t.category === activeTab;
      return roleMatch && categoryMatch;
    });
  }, [role, activeTab]);

  // Markdown-like parser for structured clinical & study outputs
  const renderFormattedText = (rawText) => {
    const lines = (rawText || '').split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-serif font-bold text-sm text-[#14302c] dark:text-[#e3efec] mt-2.5 mb-1.5 flex items-center gap-1.5">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('#### ')) {
        return (
          <h5 key={idx} className="font-semibold text-xs text-teal-800 dark:text-teal-300 mt-2 mb-0.5">
            {line.replace('#### ', '')}
          </h5>
        );
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-3 border-teal-600 dark:border-teal-400 bg-teal-50/50 dark:bg-teal-950/30 pl-2.5 py-1 my-1.5 text-xs italic text-[#34514c] dark:text-[#a0bcb6] rounded-r-md">
            {line.replace('> ', '')}
          </blockquote>
        );
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return (
          <li key={idx} className="text-xs text-[#2c4743] dark:text-[#d3e4e0] ml-3.5 list-disc my-0.5 leading-relaxed">
            {formatInlineText(line.substring(2))}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={idx} className="text-xs text-[#2c4743] dark:text-[#d3e4e0] ml-3.5 list-decimal my-0.5 leading-relaxed">
            {formatInlineText(line.replace(/^\d+\.\s/, ''))}
          </li>
        );
      }
      if (line.startsWith('|')) {
        return (
          <div key={idx} className="text-[11px] font-mono text-[#2c4743] dark:text-[#d3e4e0] bg-[#eef5f2] dark:bg-[#102223] px-2 py-0.5 rounded my-0.5 overflow-x-auto whitespace-pre">
            {line}
          </div>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1" />;
      }
      return (
        <p key={idx} className="text-xs text-[#2c4743] dark:text-[#d3e4e0] my-1 leading-relaxed">
          {formatInlineText(line)}
        </p>
      );
    });
  };

  const formatInlineText = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-[#14302c] dark:text-[#f0f7f5]">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      <div className="fixed bottom-5 right-5 z-40">
        {!isOpen && (
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 hover:from-teal-800 hover:to-emerald-900 dark:from-teal-500 dark:to-emerald-500 text-white dark:text-[#052321] font-semibold text-xs shadow-lg hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer ring-2 ring-white/30 dark:ring-black/20"
            title="Open MindCare AI Research & Clinical Assistant"
            aria-label="Open AI Assistant"
          >
            <span className="material-symbols-outlined text-[20px] animate-pulse">
              {isConsultant ? 'neurology' : 'psychology'}
            </span>
            <span className="font-medium">
              {isConsultant ? 'Clinical Copilot & Research' : 'AI Companion & Studies'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 dark:bg-emerald-900 animate-ping"></span>
          </button>
        )}
      </div>

      {/* AI Assistant Chat Modal / Flyout */}
      {isOpen && (
        <div
          className={`fixed bottom-5 right-5 z-50 w-[95vw] sm:w-[460px] bg-white dark:bg-[#14292a] rounded-2xl border border-[#dde7e3] dark:border-[#23403f] shadow-2xl flex flex-col transition-all duration-200 overflow-hidden ${
            isMinimized ? 'h-14' : 'h-[640px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-teal-800 via-teal-900 to-[#0c3b37] text-white flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                <span className="material-symbols-outlined text-[19px]">
                  {isConsultant ? 'neurology' : 'psychology'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif text-sm font-bold tracking-tight text-white leading-none">
                    {isConsultant ? 'Clinical AI Copilot' : 'Sanctuary AI Companion'}
                  </h3>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-teal-700/80 text-teal-200 uppercase tracking-wider">
                    {isConsultant ? 'Clinician' : 'Wellness'}
                  </span>
                </div>
                <p className="text-[10px] text-teal-300 mt-0.5 leading-none">
                  {isConsultant ? 'Evidence-based studies, psychometrics & notes' : 'Mental health studies & calming emotional guidance'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                title="Clear conversation"
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 text-teal-200 hover:text-white transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 text-teal-200 hover:text-white transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isMinimized ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close"
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 text-teal-200 hover:text-white transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">close</span>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Mental Health Research & Category Filter Tabs */}
              <div className="px-3 pt-2 pb-1 bg-[#edf4f1] dark:bg-[#0c1a1b] border-b border-[#dde7e3] dark:border-[#23403f] flex items-center gap-1 shrink-0 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'All Topics', icon: 'apps' },
                  { id: 'studies', label: '🔬 Landmark Studies', icon: 'science' },
                  { id: 'diagnostics', label: '📊 Diagnostics & Scales', icon: 'analytics' },
                  { id: 'tools', label: '🧘 Coping & Tools', icon: 'self_improvement' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`text-[10px] px-2 py-1 rounded-lg font-semibold flex items-center gap-1 transition cursor-pointer shrink-0 ${
                      activeTab === tab.id
                        ? 'bg-teal-700 text-white shadow-2xs'
                        : 'bg-white/80 dark:bg-[#172f30] text-[#4b635f] dark:text-[#a1beba] hover:text-teal-800 dark:hover:text-teal-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Quick Prompt Suggestions Scrollbar */}
              <div className="px-3 py-2 bg-[#f4f8f6] dark:bg-[#0f2021] border-b border-[#dde7e3] dark:border-[#23403f] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <span className="text-[10px] uppercase font-bold text-[#5f7571] dark:text-[#8fa8a3] shrink-0 mr-1 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[13px]">lightbulb</span>
                  Prompts:
                </span>
                {filteredPrompts.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSendMessage(item.query)}
                    className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-[#193233] border border-[#dde7e3] dark:border-[#264a48] text-[#14302c] dark:text-[#e3efec] hover:border-teal-500 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition shadow-2xs cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-gradient-to-b from-white to-[#f8fbf9] dark:from-[#14292a] dark:to-[#0f2021]">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-3 text-xs shadow-xs relative group ${
                        msg.sender === 'user'
                          ? 'bg-teal-700 text-white dark:bg-teal-500 dark:text-[#052321] rounded-br-xs'
                          : 'bg-white dark:bg-[#1a3334] border border-[#dde7e3] dark:border-[#284c4a] text-[#14302c] dark:text-[#e3efec] rounded-bl-xs'
                      }`}
                    >
                      {msg.sender === 'ai' ? (
                        <>
                          <div className="prose prose-xs max-w-none">
                            {renderFormattedText(msg.text)}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyText(msg.text)}
                            title="Copy clinical response"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-1 rounded bg-[#eaf2ef] dark:bg-[#14292a] text-[#5f7571] dark:text-[#8fa8a3] hover:text-teal-700 dark:hover:text-teal-300 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[13px]">content_copy</span>
                          </button>
                        </>
                      ) : (
                        <p className="whitespace-pre-wrap leading-relaxed m-0">{msg.text}</p>
                      )}
                    </div>
                    <span className="text-[9px] text-[#8fa8a3] dark:text-[#5f7571] mt-0.5 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-1.5 p-2.5 rounded-2xl bg-white dark:bg-[#1a3334] border border-[#dde7e3] dark:border-[#284c4a] w-20 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-2.5 bg-white dark:bg-[#14292a] border-t border-[#dde7e3] dark:border-[#23403f] shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      isConsultant
                        ? 'Ask clinical studies (Cuijpers, STAR*D, PE), scales (PHQ-9), or SOAP notes...'
                        : 'Ask studies (Harvard, Polyvagal, ACT), calming tools, or booking help...'
                    }
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#dde7e3] dark:border-[#23403f] bg-[#f9fbfa] dark:bg-[#0f2021] text-[#14302c] dark:text-[#e3efec] focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isTyping}
                    className="w-8 h-8 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-400 dark:hover:bg-teal-300 text-white dark:text-[#052321] flex items-center justify-center disabled:opacity-50 transition cursor-pointer shadow-xs shrink-0"
                  >
                    <span className="material-symbols-outlined text-[17px]">send</span>
                  </button>
                </div>
                <div className="mt-1 text-[9px] text-center text-[#8fa8a3] dark:text-[#5f7571]">
                  MindCare Evidence-Based AI Assistant · Clinical Research & Practice · In emergency call 988
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
