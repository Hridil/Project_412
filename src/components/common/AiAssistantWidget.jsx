import React, { useState, useRef, useEffect } from 'react';

// Pre-defined role-specific prompt suggestions
const CLIENT_PROMPTS = [
  { label: '🧘 4-7-8 Calming Breathing', text: 'Guide me through a 4-7-8 breathing exercise to calm down.' },
  { label: '💡 Managing Anxiety & Overwhelm', text: 'What are some immediate grounding techniques for racing thoughts?' },
  { label: '📅 How to Book a Consultation', text: 'How do I book a session with an assigned consultant on MindCare?' },
  { label: '📝 Mood Journal Reflection', text: 'Help me reflect on why my mood might feel depleted today.' },
  { label: '🌿 5-4-3-2-1 Sensory Grounding', text: 'Walk me through the 5-4-3-2-1 sensory grounding exercise.' }
];

const CONSULTANT_PROMPTS = [
  { label: '📋 Draft Clinical SOAP Note', text: 'Draft a structured clinical SOAP note template for an anxiety consultation.' },
  { label: '🎯 Formulate SMART Care Goals', text: 'Help me write 3 SMART goals for a client recovering from PTSD.' },
  { label: '🧠 DSM-5 Major Depression Summary', text: 'Summarize the core DSM-5 diagnostic criteria and symptom thresholds for Major Depressive Disorder.' },
  { label: '🔬 CBT Somatic Pacing Interventions', text: 'Suggest evidence-based CBT and somatic interventions for autonomic nervous system regulation.' },
  { label: '📝 Post-Session Intake Reflection', text: 'Generate intake reflection questions to assess client safety, coping mechanisms, and support systems.' }
];

// Contextual Knowledge Base for Instant & Intelligent Responses
const generateAiResponse = (userInput, role, userName, appContext = {}) => {
  const query = userInput.toLowerCase().trim();

  // 1. Crisis Check (Immediate safety priority)
  if (
    query.includes('suicide') ||
    query.includes('kill myself') ||
    query.includes('end my life') ||
    query.includes('self harm') ||
    query.includes('hurt myself')
  ) {
    return `### 🚨 Urgent Crisis Support & Safety Lifeline

If you or someone you know is in immediate distress or experiencing thoughts of self-harm, please know that **you are not alone and compassionate help is available 24/7**:

* **988 Suicide & Crisis Lifeline**: Call or text **988** (Free, confidential, available 24/7).
* **The Trevor Project** (LGBTQ Youth): Call **1-866-488-7386** or text **START to 678-678**.
* **Veterans Crisis Line**: Dial **988**, then press **1**, or text **838255**.
* **Emergency Medical Assistance**: Call **911** or go to the nearest emergency room.

Please reach out to one of these resources right away. Your life and wellbeing matter deeply.`;
  }

  // 2. CLIENT-SPECIFIC RESPONSES
  if (role === 'client') {
    if (query.includes('4-7-8') || (query.includes('breath') && (query.includes('exercise') || query.includes('calm')))) {
      return `### 🧘 Guided 4-7-8 Calming Breath Exercise

The 4-7-8 technique is a natural tranquilizer for your nervous system. Find a comfortable seated position, relax your shoulders, and follow these gentle steps:

1. **Empty Your Lungs**: Exhale completely through your mouth with a soft whoosh sound.
2. **Inhale (4 Counts)**: Close your mouth and inhale quietly through your nose to a mental count of **4**.
3. **Hold (7 Counts)**: Gently hold your breath for a count of **7**.
4. **Exhale (8 Counts)**: Exhale completely through your mouth, making a steady whoosh sound for **8**.
5. **Repeat**: Complete this cycle **4 times**.

> **MindCare Tip**: Notice how your heart rate slows and physical tension releases from your jaw and chest. You can log your mood in the **Mood Journal** after completing this.`;
    }

    if (query.includes('grounding') || query.includes('5-4-3-2-1') || query.includes('sensory')) {
      return `### 🌿 5-4-3-2-1 Sensory Grounding Technique

When thoughts feel overwhelming, grounding brings your awareness back to the safe present moment:

* **👀 5 Things You Can SEE**: Look around your space. Notice small details: a pattern on the rug, light reflecting on the wall, a plant.
* **✋ 4 Things You Can FEEL**: Feel the texture of your shirt, the firm floor supporting your feet, or the temperature of the air.
* **👂 3 Things You Can HEAR**: Listen for distant traffic, a ticking clock, birds, or the sound of your own breath.
* **👃 2 Things You Can SMELL**: Notice the scent of coffee, fresh air, a candle, or your soap.
* **👅 1 Thing You Can TASTE**: Sip cool water, notice the lingering taste of mint, or simply swallow mindfully.

*Take a deep breath in through your nose and let it go. You are safe in this present moment.*`;
    }

    if (query.includes('book') || query.includes('schedule') || query.includes('appointment')) {
      return `### 📅 How to Book a Session in MindCare

Booking confidential consultations with your licensed practitioner is simple:

1. Click **Book Session** on the left navigation menu (or click the plus icon on your dashboard).
2. **Select Practitioner**: Choose your licensed consultant from the dropdown (e.g., Dr. Mario or Dr. Ray).
3. **Choose Date & Time**: Pick your preferred appointment date and time slot.
4. **Select Modality**:
   * **Online Telehealth Consultation**: Video/audio session from the comfort of your sanctuary.
   * **In-Person Sanctuary Consultation**: Face-to-face clinical session at the sanctuary office.
5. **State Your Focus**: Share what you'd like to work on so your consultant can prepare ahead.
6. Click **Confirm & Book Clinical Session**. Your consultant will receive your request immediately!`;
    }

    if (query.includes('anxiety') || query.includes('panic') || query.includes('racing') || query.includes('stress')) {
      return `### 💡 Evidence-Based Coping Strategies for Anxiety

When acute anxiety arises, your sympathetic nervous system is in high gear. Here are clinical tools to regain equilibrium:

1. **Physiological Sigh**: Take two quick sniffs in through your nose (one deep, one short top-off), followed by a long, slow sigh out through your mouth. Doing this twice immediately resets autonomic arousal.
2. **Name the Emotion**: Silently say to yourself, *"I am noticing a feeling of anxiety right now, and it is a temporary physiological wave that will pass."*
3. **Temperature Shock (TIPP)**: Splash cold water on your face or hold an ice cube. This triggers the mammalian dive reflex, dropping your heart rate.
4. **Muscle Release**: Clench your fists for 5 seconds, then deliberately let go. Notice the difference between tension and relaxation.
5. **Reach Out**: Your consultant is here to assist. You can schedule a session in **Book Session** or review previous care plans in **My Sessions**.`;
    }

    if (query.includes('sleep') || query.includes('insomnia') || query.includes('rest')) {
      return `### 🌙 Sleep Hygiene & Restorative Rituals

Quality rest is the foundation of mental health and emotional resilience:

* **Consistent Sleep Timing**: Go to sleep and wake up within a 30-minute window every day, even on weekends.
* **Screen Sunset**: Dim screens 60 minutes before bed; blue light suppresses melatonin release.
* **Bed Sanctuary**: Reserve your bed only for sleep and rest, not for work or high-stress activities.
* **Thought Download**: Write down tomorrow's to-do list in a notebook before lying down so your mind isn't working overnight.`;
    }

    // Default Client Synthesis
    return `### Hello ${userName || 'Friend'} 👋

I'm your **MindCare Wellness Assistant**. I'm here to support your mental wellbeing journey.

Here are a few ways I can assist you right now:
* **Calming Breathing & Grounding**: Try asking *"Guide me through 4-7-8 breathing"* or *"Give me a grounding exercise"*.
* **Understanding Anxiety & Mood**: Ask *"How can I manage acute stress?"* or *"Help me reflect on today's mood"*.
* **Appointments & Files**: Ask *"How do I book a session?"* or *"Where can I see my documents?"*.

Feel free to ask me any question or describe how you're feeling right now!`;
  }

  // 3. CONSULTANT-SPECIFIC RESPONSES
  if (role === 'consultant') {
    if (query.includes('soap') || query.includes('note template') || query.includes('clinical note')) {
      return `### 📋 Clinical SOAP Note Template

**Client**: [Client Name / ID]  
**Date & Time**: ${new Date().toLocaleDateString()} | 50-Minute Consultation  
**Modality**: Telehealth Video / In-Person Sanctuary  

#### 1. S (Subjective)
* **Chief Complaint & Mood**: Client reports anxiety symptoms (rated 6/10) following recent workplace transitions.
* **Client Statements**: *"I've had difficulty switching off my mind in the evenings."*
* **Homework Adherence**: Client practiced 4-7-8 breathing 3x weekly with moderate symptom relief.

#### 2. O (Objective)
* **Mental Status Exam (MSE)**: Client is alert, oriented x4, casually groomed, with cooperative engagement. Speech is clear and articulate; affect is mildly anxious but congruent with reported mood. No evidence of cognitive impairment, perceptual disturbances, or active suicidal/homicidal ideation.
* **Standardized Measure**: GAD-7 score: 11 (Moderate Anxiety).

#### 3. A (Assessment)
* **Clinical Impression**: Generalized Anxiety Disorder (DSM-5: F41.1), demonstrating positive responsiveness to cognitive reframing and somatic pacing. Client shows strong self-awareness and motivated therapeutic alliance.
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

#### Goal 2: Cognitive Restructuring (Depression / Negative Self-Talk)
* **Specific**: Client will complete a 3-column thought record (Event, Automatic Thought, Rational Response) when experiencing cognitive distortions.
* **Measurable**: Minimum of 3 completed entries per week, reviewed in bi-weekly sessions.
* **Time-Bound**: Ongoing review over an 8-week treatment arc.`;
    }

    if (query.includes('dsm') || query.includes('depression') || query.includes('criteria') || query.includes('mdd')) {
      return `### 🧠 DSM-5 Diagnostic Criteria: Major Depressive Disorder (MDD)

To meet DSM-5 diagnostic criteria for Major Depressive Disorder (296.xx / F32.x), a client must exhibit **5 or more of the following symptoms** during the same **2-week period**, representing a change from previous functioning, where at least one symptom is either **(1) Depressed mood** or **(2) Loss of interest/pleasure**:

1. **Depressed Mood**: Most of the day, nearly every day (subjective report or observation).
2. **Anhedonia**: Markedly diminished interest or pleasure in all or almost all activities.
3. **Weight/Appetite Changes**: Significant unintentional weight loss/gain (>5% in a month) or daily appetite fluctuations.
4. **Sleep Disturbances**: Insomnia or hypersomnia nearly every day.
5. **Psychomotor Changes**: Observable psychomotor agitation or retardation.
6. **Fatigue / Loss of Energy**: Nearly every day.
7. **Worthlessness / Excessive Guilt**: Inappropriate guilt (not merely self-reproach about being sick).
8. **Diminished Concentration**: Indecisiveness or impaired cognitive pacing.
9. **Recurrent Suicidal Ideation**: Thoughts of death without a specific plan, or a suicide attempt/plan.

*Symptoms must cause clinically significant distress or functional impairment and not be attributable to physiological effects of a substance or another medical condition.*`;
    }

    if (query.includes('cbt') || query.includes('somatic') || query.includes('ptsd') || query.includes('trauma')) {
      return `### 🔬 Evidence-Based Interventions: CBT & Somatic Pacing

When working with trauma, autonomic dysregulation, and hyperarousal:

1. **Dual Awareness & Pendulation**: Help the client alternate between focusing on a sensation of safety/resilience (the resource) and a mildly challenging memory or physical sensation, preventing autonomic flooding.
2. **Cognitive Distortion Reframing**: Address *Catastrophizing*, *All-or-Nothing Thinking*, and *Personalization* using Socratic questioning:
   * *"What is the objective evidence for and against this thought?"*
   * *"What would you tell a trusted friend in this exact circumstance?"*
3. **Vagal Nerve Stimulation & Pacing**: Guide the client through prolonged vocal exhalations (humming or singing) and peripheral vision expansion to switch from sympathetic fight-or-flight to parasympathetic ventral vagal state.
4. **Behavioral Activation Hierarchy**: Co-create a graded activity schedule starting with micro-steps that provide a sense of mastery or pleasure.`;
    }

    if (query.includes('intake') || query.includes('question') || query.includes('assessment')) {
      return `### 📝 Trauma-Informed Initial Intake Questions

Essential diagnostic and rapport-building queries for first consultations:

1. **Presenting Concerns**: *"What brings you to MindCare Sanctuary today, and what would a meaningful breakthrough look like for you?"*
2. **Support Architecture**: *"Who in your life provides genuine emotional safety and non-judgmental listening?"*
3. **Coping & Resilience**: *"When things have felt overwhelming in the past, what strategies or activities helped you hold steady?"*
4. **Safety Assessment**: *"Have you experienced thoughts of giving up, hurting yourself, or feeling hopeless recently?"*
5. **Goals & Therapeutic Style**: *"How do you best receive feedback or guidance: structured and actionable, or exploratory and reflective?"*`;
    }

    // Default Consultant Synthesis
    return `### Clinical Assistant Online 👋

Welcome, **${userName || 'Doctor'}**. I am your **MindCare Clinical Copilot**, tailored for licensed practitioners and consultants.

I can assist you with:
* **Documentation**: Ask *"Draft a clinical SOAP note template"* or *"BIRP note format"*.
* **Treatment Planning**: Ask *"Formulate SMART goals for PTSD"* or *"CBT intervention strategies"*.
* **Clinical Criteria**: Ask *"Summarize DSM-5 criteria for MDD / GAD"*.
* **Intake & Caseload**: Ask *"Trauma-informed intake assessment questions"*.

How can I support your clinical practice today?`;
  }

  // Fallback general mental wellness assistant
  return `### MindCare Assistant

Thank you for your question. MindCare Pro provides a secure, confidential environment designed for clinical collaboration and emotional wellness. 

Whether you are looking for evidence-based coping tools, scheduling support, or clinical documentation templates, please feel free to ask a specific question or choose one of the suggested prompts above!`;
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
  const [messages, setMessages] = useState(() => {
    const role = U?.role || 'client';
    const isClient = role === 'client';
    return [
      {
        id: 1,
        sender: 'ai',
        text: isClient
          ? `Hello **${U?.name || 'there'}**! 🌿 I am your personal **MindCare Wellness Companion**. I can guide you through calming breathing exercises, coping tools for anxiety, reflection prompts, or help you book and prepare for your consultations.`
          : `Hello **${U?.name || 'Doctor'}**! 🧠 I am your **Clinical AI Copilot**. I can assist you with drafting clinical SOAP notes, formulating SMART care plan goals, reviewing DSM-5 diagnostic criteria, or preparing evidence-based interventions for your caseload.`,
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

    // Realistic synthesis delay
    setTimeout(() => {
      const responseText = generateAiResponse(text, U?.role || 'client', U?.name || 'User');
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    const role = U?.role || 'client';
    const isClient = role === 'client';
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: isClient
          ? `Conversation reset. How can I support your wellbeing today, **${U?.name || 'Friend'}**?`
          : `Conversation reset. Ready for clinical documentation or caseload queries, **${U?.name || 'Doctor'}**?`,
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

  const promptSuggestions = U?.role === 'consultant' ? CONSULTANT_PROMPTS : CLIENT_PROMPTS;
  const isConsultant = U?.role === 'consultant';

  // Render markdown-like simple formatting for responses
  const renderFormattedText = (rawText) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-serif font-bold text-sm text-[#14302c] dark:text-[#e3efec] mt-2 mb-1">
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
          <blockquote key={idx} className="border-l-2 border-teal-500 pl-2.5 my-1 text-xs italic text-[#4b635f] dark:text-[#9bb3ae]">
            {line.replace('> ', '')}
          </blockquote>
        );
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const bulletText = line.substring(2);
        return (
          <li key={idx} className="text-xs text-[#2c4743] dark:text-[#d3e4e0] ml-3 list-disc my-0.5">
            {formatInlineText(bulletText)}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={idx} className="text-xs text-[#2c4743] dark:text-[#d3e4e0] ml-3 list-decimal my-0.5">
            {formatInlineText(line.replace(/^\d+\.\s/, ''))}
          </li>
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
    // Bold formatting: **bold**
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
            title="Open MindCare AI Assistant"
            aria-label="Open AI Assistant"
          >
            <span className="material-symbols-outlined text-[20px] animate-pulse">
              {isConsultant ? 'neurology' : 'psychology'}
            </span>
            <span className="font-medium">
              {isConsultant ? 'Clinical Copilot' : 'AI Companion'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 dark:bg-emerald-900 animate-ping"></span>
          </button>
        )}
      </div>

      {/* AI Assistant Chat Modal / Flyout */}
      {isOpen && (
        <div
          className={`fixed bottom-5 right-5 z-50 w-[95vw] sm:w-[440px] bg-white dark:bg-[#14292a] rounded-2xl border border-[#dde7e3] dark:border-[#23403f] shadow-2xl flex flex-col transition-all duration-200 overflow-hidden ${
            isMinimized ? 'h-14' : 'h-[620px] max-h-[85vh]'
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
                  {isConsultant ? 'Evidence-based clinical assistance' : 'Confidential emotional wellness support'}
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
              {/* Quick Prompt Suggestions */}
              <div className="px-3 py-2 bg-[#f4f8f6] dark:bg-[#0f2021] border-b border-[#dde7e3] dark:border-[#23403f] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <span className="text-[10px] uppercase font-bold text-[#5f7571] dark:text-[#8fa8a3] shrink-0 mr-1">
                  Prompts:
                </span>
                {promptSuggestions.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSendMessage(item.text)}
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
                            title="Copy response"
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
                        ? 'Ask clinical queries, request note templates, or DSM criteria...'
                        : 'Ask for calming breathing, coping tools, or booking help...'
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
                  MindCare AI Assistant · For supportive guidance · Call 988 in emergency
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
