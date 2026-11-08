import { dOff, getNowDateString } from '../utils/formatters.js';

export const seed = () => ({
  acc: [
    { id: 'cons', name: 'Dr. Demo Consultant', email: 'demo@mindcare.com', pw: 'MindCare123', role: 'consultant', avatar: null },
    { id: 'cdemo', name: 'Demo Client', email: 'client@mindcare.com', pw: 'Client123', role: 'client', avatar: null },
    { id: 'jamie', name: 'Jamie Lee', email: 'jamie@example.com', pw: 'Jamie1234', role: 'client', avatar: null }
  ],
  cl: [
    { id: 1, uid: 'cdemo', name: 'Demo Client', email: 'client@mindcare.com', status: 'Pending', reason: 'General wellness & stress management' },
    { id: 2, uid: 'jamie', email: 'jamie@example.com', name: 'Jamie Lee', status: 'Accepted', reason: 'Anxiety pacing & mindfulness CBT' }
  ],
  ap: [
    { id: 5, uid: 'jamie', cid: 2, date: dOff(1), time: '10:00', type: 'Online Telehealth Consultation', status: 'Confirmed' }
  ],
  nt: [
    { id: 101, cid: 2, title: 'Intake Reflection', tag: 'Observation', body: 'Client responded well to grounding techniques. Demonstrates high commitment to consistent daily check-ins.', date: new Date().toLocaleDateString() }
  ],
  pl: [
    { id: 201, cid: 2, uid: 'jamie', title: '5-Minute Morning Box Breathing', due: dOff(3), details: 'Perform 4 breath cycles before checking digital notifications.', done: false },
    { id: 202, cid: 2, uid: 'jamie', title: 'Nature walk & sensory grounding', due: dOff(5), details: 'Practice 5-4-3-2-1 technique outdoors during afternoon recess.', done: true }
  ],
  nf: [
    { id: 301, to: 'cons', msg: 'Jamie Lee scheduled a session for tomorrow at 10:00 AM.', date: new Date().toLocaleDateString(), read: false },
    { id: 302, to: 'jamie', msg: 'Your session with Dr. Demo Consultant is confirmed.', date: new Date().toLocaleDateString(), read: false }
  ],
  fl: [
    { id: 401, uid: 'jamie', name: 'Intake_Wellness_Questionnaire.pdf', size: 142000, date: dOff(-2), uploadedBy: 'client' },
    { id: 402, uid: 'jamie', name: 'Mindfulness_Grounding_Worksheet.pdf', size: 98000, date: dOff(-1), uploadedBy: 'consultant' },
    { id: 403, uid: 'cdemo', name: 'Initial_Assessment_Packet.pdf', size: 215000, date: dOff(0), uploadedBy: 'client' }
  ],
  md: [3, 2, 3, 4, 3, 4, 4].map((v, i) => ({
    uid: 'jamie',
    date: dOff(i - 6),
    v,
    note: i === 6 ? 'Feeling calm and centered after mindfulness practice.' : ''
  })),
  fb: [
    {
      id: 501,
      clientId: 'jamie',
      clientName: 'Jamie Lee',
      consultantId: 'cons',
      date: dOff(-2),
      rating: 5,
      category: 'Session Experience',
      message: 'The grounding exercises and box breathing we practiced in yesterday\'s session were exceptionally helpful during a high-stress moment today. Thank you for creating such a safe and supportive space.',
      isAnonymous: false,
      read: true,
      reply: 'So glad to hear the box breathing supported you, Jamie. We will build on this in our next session!'
    },
    {
      id: 502,
      clientId: 'cdemo',
      clientName: 'Demo Client',
      consultantId: 'cons',
      date: dOff(0),
      rating: 4,
      category: 'Care Plan & Exercises',
      message: 'I really appreciate having access to the shared documents and care plan tasks. It would be great to continue focusing on sensory pacing next week.',
      isAnonymous: true,
      read: false,
      reply: null
    }
  ],
  dashImages: {
    cons: [
      {
        id: 'img-seed-cons',
        name: 'Sanctuary_Practice_Atrium.jpg',
        title: 'MindCare Clinical Sanctuary Center',
        caption: 'Trauma-informed physical suites and digital telehealth consultation rooms.',
        dataUrl: '',
        dimensions: '1920 × 1080',
        date: getNowDateString(),
        size: '185 KB',
        uploadedBy: 'consultant'
      }
    ],
    jamie: [
      {
        id: 'img-seed-jamie',
        name: 'Coastal_Serenity_Anchor.jpg',
        title: 'Coastal Morning Serenity',
        caption: 'Visual anchor for 5-4-3-2-1 nervous system grounding and box breathing.',
        dataUrl: '',
        dimensions: '1600 × 900',
        date: getNowDateString(),
        size: '142 KB',
        uploadedBy: 'client'
      }
    ]
  },
  avatars: {
    cons: null,
    jamie: null,
    cdemo: null
  }
});
