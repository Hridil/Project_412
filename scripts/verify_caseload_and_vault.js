import {
  sanitizeText,
  sanitizeEmail,
  sanitizeFileName,
  sanitizePhone,
  checkAuthorization,
  canAccessFile,
  canConsultantHandleClient
} from '../src/services/supabaseClient.js';

console.log('='.repeat(70));
console.log('MINDCARE PRO - NODE.JS CLIENT & CASELOAD ISOLATION TEST');
console.log('='.repeat(70));

let failures = 0;
function assert(condition, testName) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName}`);
    failures++;
  }
}

// --------------------------------------------------------------------
// 1. INPUT SANITIZATION
// --------------------------------------------------------------------
console.log('\n[1] Testing Input Sanitization Functions:');
assert(
  sanitizeText('<script>alert("hack")</script>Dr. Sarah <style>body{}</style>') === 'Dr. Sarah',
  'sanitizeText strips script and style tags cleanly'
);
assert(
  sanitizeFileName('../../../confidential_dossier.pdf') === '___confidential_dossier.pdf',
  'sanitizeFileName blocks directory traversal'
);
assert(
  sanitizeEmail('  SARAH.MITCHELL@MINDCARE.COM  ') === 'sarah.mitchell@mindcare.com',
  'sanitizeEmail trims and lowercases email'
);
assert(
  sanitizePhone('+1 (555) 019-2834') === '+1 (555) 019-2834',
  'sanitizePhone validates standard international/local format'
);
try {
  sanitizePhone('+1 555-0192; DROP TABLE PERSON;--');
  assert(false, 'sanitizePhone should reject SQL injection in phone');
} catch {
  assert(true, 'sanitizePhone blocks malicious characters in phone');
}

// --------------------------------------------------------------------
// 2. ROLE-BASED ACCESS CONTROL (RBAC)
// --------------------------------------------------------------------
console.log('\n[2] Testing RBAC checkAuthorization:');
try {
  checkAuthorization({ role: 'consultant' }, ['consultant', 'admin'], 'author note');
  assert(true, 'Consultant authorized for clinician action');
} catch {
  assert(false, 'Consultant authorized for clinician action');
}

try {
  checkAuthorization({ role: 'client' }, ['consultant', 'admin'], 'author note');
  assert(false, 'Client should be denied for clinician action');
} catch (e) {
  assert(e.message.includes('Authorization Denied'), 'Client denied with proper authorization exception');
}

// --------------------------------------------------------------------
// 3. CLIENT DOCUMENT VAULT TENANT ISOLATION
// --------------------------------------------------------------------
console.log('\n[3] Testing Client File Access Isolation:');
const clientA = { id: 'u_client_1', client_id: 101, person_id: 201, email: 'clienta@test.com', role: 'client' };
const clientB = { id: 'u_client_2', client_id: 102, person_id: 202, email: 'clientb@test.com', role: 'client' };

const fileA = { id: 1, name: 'client_a_journal.pdf', uid: 'u_client_1', client_id: 101, person_id: 201 };
const fileB = { id: 2, name: 'client_b_assessment.pdf', uid: 'u_client_2', client_id: 102, person_id: 202 };

assert(canAccessFile(clientA, fileA) === true, 'Client A can access their own file');
assert(canAccessFile(clientA, fileB) === false, 'Client A BLOCKED from Client B file');
assert(canAccessFile(clientB, fileB) === true, 'Client B can access their own file');
assert(canAccessFile(clientB, fileA) === false, 'Client B BLOCKED from Client A file');

// --------------------------------------------------------------------
// 4. CONSULTANT CASELOAD ISOLATION
// --------------------------------------------------------------------
console.log('\n[4] Testing Consultant Caseload Isolation:');
const consultantSarah = { id: 'u_sarah', consultant_id: 1, name: 'Dr. Sarah Mitchell', role: 'consultant' };
const consultantMarcus = { id: 'u_marcus', consultant_id: 2, name: 'Dr. Marcus Vance', role: 'consultant' };

const patientA = { id: 10, uid: 'u_client_1', name: 'Patient A', assignedConsultantId: 'u_sarah', consultant_id: 1 };
const patientB = { id: 20, uid: 'u_client_2', name: 'Patient B', assignedConsultantId: 'u_marcus', consultant_id: 2 };

assert(canConsultantHandleClient(consultantSarah, patientA) === true, 'Dr. Sarah can handle Patient A (assigned)');
assert(canConsultantHandleClient(consultantSarah, patientB) === false, 'Dr. Sarah BLOCKED from Patient B (Marcus caseload)');
assert(canConsultantHandleClient(consultantMarcus, patientB) === true, 'Dr. Marcus can handle Patient B (assigned)');
assert(canConsultantHandleClient(consultantMarcus, patientA) === false, 'Dr. Marcus BLOCKED from Patient A (Sarah caseload)');

// Test appointment-based relationship
const patientC = { id: 30, uid: 'u_client_3', name: 'Patient C' };
const appointments = [
  { id: 99, cid: 30, uid: 'u_client_3', consultant_id: 'u_sarah' }
];
assert(
  canConsultantHandleClient(consultantSarah, patientC, appointments) === true,
  'Dr. Sarah can handle Patient C via booked appointment'
);
assert(
  canConsultantHandleClient(consultantMarcus, patientC, appointments) === false,
  'Dr. Marcus BLOCKED from Patient C (booked with Sarah)'
);

// --------------------------------------------------------------------
// 5. CONSULTANT SEARCH BY FILE & CLIENT NAME
// --------------------------------------------------------------------
console.log('\n[5] Testing Consultant Search by File Name & Client Name:');

const testDocs = [
  { id: 1, name: 'CBT_Restructuring_Worksheet.pdf', uid: 'u_client_1', type: 'application/pdf' },
  { id: 2, name: 'Mindfulness_Guide.pdf', uid: 'u_client_2', type: 'application/pdf' },
  { id: 3, name: 'Sleep_Journal.png', uid: 'u_client_1', type: 'image/png' }
];

const testClients = [
  { uid: 'u_client_1', name: 'Jamie Vance', email: 'jamie@example.com' },
  { uid: 'u_client_2', name: 'Alex Taylor', email: 'alex@example.com' }
];

function searchVault(docs, query, target = 'all') {
  const q = query.trim().toLowerCase();
  if (!q) return docs;
  return docs.filter((f) => {
    const owner = testClients.find((c) => c.uid === f.uid);
    const fileNameMatch = f.name.toLowerCase().includes(q);
    const clientNameMatch = (owner?.name || '').toLowerCase().includes(q) || (owner?.email || '').toLowerCase().includes(q);

    if (target === 'file') return fileNameMatch;
    if (target === 'client') return clientNameMatch;
    return fileNameMatch || clientNameMatch;
  });
}

// Search by file name "CBT"
const resCbt = searchVault(testDocs, 'CBT');
assert(resCbt.length === 1 && resCbt[0].id === 1, 'Search finds file by file name "CBT"');

// Search by client name "Jamie"
const resJamie = searchVault(testDocs, 'Jamie');
assert(resJamie.length === 2 && resJamie.every(f => f.uid === 'u_client_1'), 'Search finds all files for client name "Jamie"');

// Search by client name "Alex"
const resAlex = searchVault(testDocs, 'Alex');
assert(resAlex.length === 1 && resAlex[0].uid === 'u_client_2', 'Search finds files for client name "Alex"');

// Target mode: client only
const resAlexClientOnly = searchVault(testDocs, 'Alex', 'client');
assert(resAlexClientOnly.length === 1, 'Search in target "client" finds client Alex');

// Target mode: file only should NOT match client name "Alex"
const resAlexFileOnly = searchVault(testDocs, 'Alex', 'file');
assert(resAlexFileOnly.length === 0, 'Target "file" strictly excludes client name query "Alex"');

// --------------------------------------------------------------------
// 6. SUMMARY
// --------------------------------------------------------------------
console.log('\n' + '='.repeat(70));
if (failures === 0) {
  console.log('ALL NODE.JS VERIFICATION TESTS PASSED SUCCESSFULLY! (0 Failures)');
  process.exit(0);
} else {
  console.error(`VERIFICATION FAILED: ${failures} check(s) failed.`);
  process.exit(1);
}
