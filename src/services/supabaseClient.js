// ====================================================================
// MINDCARE PRO - SUPABASE REST & STORAGE CLIENT
// Uses native fetch() for zero-dependency PostgREST & Storage support
// ====================================================================

const SUPABASE_URL =
  import.meta.env?.VITE_SUPABASE_URL ||
  "https://lsxpftzwwnexeixtvqcc.supabase.co";

const SUPABASE_ANON_KEY =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_2Yd0uF2QhyJqzNfzabI7xg_4oII1QWS";

export const isSupabaseConfigured = () => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes("your-project"));
};

// ====================================================================
// INPUT SANITIZATION & SECURITY VALIDATION
// ====================================================================

// Strip HTML tags, script injection, style blocks, control characters, and trim whitespace
export const sanitizeText = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/\0/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

// Validate RFC 5322 email regex and normalize
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  const cleaned = email.trim().toLowerCase();
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9]+([.-][A-Za-z0-9]+)*\.[A-Za-z]{2,}$/;
  if (!emailRegex.test(cleaned)) {
    throw new Error(`Invalid email format: "${email}". Must be a valid email address.`);
  }
  return cleaned;
};

// Prevent path traversal attacks and dangerous file characters
export const sanitizeFileName = (fileName) => {
  if (typeof fileName !== 'string') return 'document';
  return fileName
    .replace(/(\.\.[/\\]|[/\\])/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 255);
};

// Validate phone numbers against injection
export const sanitizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  const cleaned = phone.trim();
  const phoneRegex = /^[0-9+() -]{7,30}$/;
  if (!phoneRegex.test(cleaned)) {
    throw new Error(`Invalid phone number format: "${phone}". Only digits, +, -, and () are allowed.`);
  }
  return cleaned;
};

// Role-Based Authorization Guard
export const checkAuthorization = (currentUser, allowedRoles, action = 'this action') => {
  if (!currentUser) {
    throw new Error(`Authentication Required: Please sign in to perform ${action}.`);
  }
  const role = currentUser.role;
  if (!allowedRoles.includes(role)) {
    throw new Error(`Authorization Denied: Role "${role}" is not permitted to perform ${action}. Permitted roles: [${allowedRoles.join(', ')}].`);
  }
  return true;
};

// Tenant Isolation Verification for Document Vault
export const canAccessFile = (currentUser, file, client = null) => {
  if (!currentUser || !file) return false;
  if (currentUser.role === 'admin') return true;

  // Clients can strictly access ONLY their own files
  if (currentUser.role === 'client') {
    return Boolean(
      (file.uid && file.uid === currentUser.id) ||
      (currentUser.client_id && file.client_id === currentUser.client_id) ||
      (currentUser.person_id && file.person_id === currentUser.person_id) ||
      (currentUser.email && file.email === currentUser.email)
    );
  }

  // Consultants can access files for clients handled by them or uploaded by them
  if (currentUser.role === 'consultant') {
    if (
      file.uploadedBy === 'consultant' &&
      (file.consultant_id === currentUser.id || file.consultant_id === currentUser.consultant_id)
    ) {
      return true;
    }
    if (client) {
      return canConsultantHandleClient(currentUser, client);
    }
    return true;
  }

  return false;
};

// Tenant Isolation Verification for Consultant Client Handling
export const canConsultantHandleClient = (consultant, client, appointments = [], notes = [], plans = []) => {
  if (!consultant || !client) return false;
  const consId = consultant.id;
  const consUid = consultant.uid || consultant.id;
  const consDbId = consultant.consultant_id;
  const consPersonId = consultant.person_id;

  const matchesCons = (targetId) => {
    if (!targetId) return false;
    return (
      targetId === consId ||
      targetId === consUid ||
      (consDbId && (targetId === consDbId || targetId === ('u' + consDbId) || +targetId === +consDbId)) ||
      (consPersonId && (targetId === consPersonId || targetId === ('u' + consPersonId) || +targetId === +consPersonId))
    );
  };

  if (
    matchesCons(client.assignedConsultantId) ||
    matchesCons(client.consultant_id)
  ) {
    return true;
  }

  const hasAp = appointments.some(
    (a) =>
      (a.cid === client.id || a.uid === client.uid || a.client_id === client.id || (client.person_id && a.uid === ('u' + client.person_id))) &&
      matchesCons(a.consultant_id)
  );
  if (hasAp) return true;

  const hasNt = notes.some(
    (n) =>
      (n.cid === client.id || n.client_id === client.id) &&
      matchesCons(n.consultant_id)
  );
  if (hasNt) return true;

  const hasPl = plans.some(
    (p) =>
      (p.cid === client.id || p.uid === client.uid) &&
      matchesCons(p.consultant_id)
  );
  if (hasPl) return true;

  return false;
};

// Normalizes time into HH:MM (24-hour)
export const normalizeTime = (t) => {
  if (!t) return '';
  const s = String(t).trim();
  const parts = s.split(':');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  return s;
};

// Normalizes date into YYYY-MM-DD
export const normalizeDate = (d) => {
  if (!d) return '';
  return String(d).split('T')[0].trim();
};

// Authoritative Slot Occupancy Checker
export const isAppointmentSlotOccupied = (
  appointments = [],
  { consultantId, clientId, date, time, excludeAppointmentId = null }
) => {
  if (!date || !time) return false;
  const targetDate = normalizeDate(date);
  const targetTime = normalizeTime(time);

  // Normalize consultant identifiers
  const consIdStr = consultantId != null ? String(consultantId).toLowerCase() : null;
  const consIdClean = consIdStr ? consIdStr.replace(/^u/, '') : null;

  // Normalize client identifiers
  const clientIdStr = clientId != null ? String(clientId).toLowerCase() : null;
  const clientIdClean = clientIdStr ? clientIdStr.replace(/^u/, '') : null;

  return (appointments || []).some((a) => {
    // Optionally exclude an appointment (e.g. when editing or rescheduling)
    if (excludeAppointmentId && (String(a.id) === String(excludeAppointmentId) || String(a.appointment_id) === String(excludeAppointmentId))) {
      return false;
    }

    // Ignore cancelled or declined sessions
    const status = String(a.status || '').toUpperCase();
    if (status === 'CANCELLED' || status === 'DECLINED') return false;

    // Check date
    const aDate = normalizeDate(a.date || a.appointment_date);
    if (aDate !== targetDate) return false;

    // Check time
    const aTime = normalizeTime(a.time || a.appointment_time);
    if (aTime !== targetTime) return false;

    // Check consultant conflict
    if (consIdStr) {
      const aConsId = String(
        a.consultant_id || a.consultant?.consultant_id || a.consultant?.person_id || ''
      ).toLowerCase();
      const aConsClean = aConsId.replace(/^u/, '');
      if (
        aConsId === consIdStr ||
        aConsClean === consIdClean ||
        aConsId === `u${consIdClean}` ||
        aConsClean === consIdStr
      ) {
        return true;
      }
    }

    // Check client conflict (client cannot be double-booked)
    if (clientIdStr) {
      const aClientId = String(a.cid || a.client_id || a.uid || '').toLowerCase();
      const aClientClean = aClientId.replace(/^u/, '');
      if (
        aClientId === clientIdStr ||
        aClientClean === clientIdClean ||
        aClientId === `u${clientIdClean}` ||
        aClientClean === clientIdStr
      ) {
        return true;
      }
    }

    return false;
  });
};

// Cryptographic Salt & Hash in Browser Web Crypto API (PBKDF2 SHA-256)
export const generateSalt = () => {
  const arr = new Uint8Array(16);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
};

export const hashPassword = async (password, salt) => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );
  return Array.from(new Uint8Array(derivedBits), (b) => b.toString(16).padStart(2, '0')).join('');
};

// Generic Supabase REST Fetcher (PostgREST uses lowercase table names)
export const supabaseFetch = async (endpoint, options = {}) => {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env");
  }

  const headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
    ...(options.headers || {})
  };

  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase Error (${response.status}): ${errorText}`);
  }

  // Handle 204 No Content
  if (response.status === 204) return null;

  return response.json();
};

// Supabase Storage & Database Image/Picture Upload
export const uploadImageToSupabase = async (
  file,
  personId = null,
  purposeOrOptions = "general",
  fallbackDataUrl = null,
  extraClientId = null,
  extraUploadedBy = null
) => {
  let purpose = "general";
  let clientId = extraClientId || null;
  let uploadedBy = extraUploadedBy || "USER";
  let finalUrl = fallbackDataUrl || null;

  if (typeof purposeOrOptions === "object" && purposeOrOptions !== null) {
    purpose = purposeOrOptions.purpose || purpose;
    clientId = purposeOrOptions.clientId !== undefined ? purposeOrOptions.clientId : clientId;
    uploadedBy = purposeOrOptions.uploadedBy || uploadedBy;
    if (purposeOrOptions.fallbackDataUrl) {
      finalUrl = purposeOrOptions.fallbackDataUrl;
    }
  } else if (typeof purposeOrOptions === "string") {
    purpose = purposeOrOptions;
  }

  const cleanName = sanitizeFileName(file?.name || (purpose === 'avatar' ? 'avatar.jpg' : 'image.jpg'));
  const uniquePath = `${Date.now()}_${cleanName}`;

  if (isSupabaseConfigured() && file) {
    try {
      const storageUrl = `${SUPABASE_URL}/storage/v1/object/mindcare-images/${uniquePath}`;
      const res = await fetch(storageUrl, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": file.type || "image/jpeg"
        },
        body: file
      });

      if (res.ok) {
        finalUrl = `${SUPABASE_URL}/storage/v1/object/public/mindcare-images/${uniquePath}`;
      } else {
        const errText = await res.text();
        console.warn(`Supabase Storage upload returned ${res.status}: ${errText}. Using persistent database fallback.`);
      }
    } catch (storageErr) {
      console.warn("Storage endpoint unreachable, persisting directly to database:", storageErr);
    }
  }

  // If finalUrl is still null (e.g. offline or no storage), use object URL or data URL
  if (!finalUrl) {
    finalUrl = fallbackDataUrl || (file ? URL.createObjectURL(file) : '');
  }

  let insertedRecord = null;

  // 1. Record uploaded picture in database table `uploaded_file`
  if (isSupabaseConfigured()) {
    try {
      const payload = {
        file_name: cleanName,
        file_size: file?.size || (finalUrl ? finalUrl.length : 0),
        file_path: uniquePath,
        file_url: finalUrl,
        mime_type: file?.type || "image/jpeg",
        uploaded_by: (uploadedBy || "USER").toUpperCase()
      };
      if (personId) payload.person_id = personId;
      if (clientId) payload.client_id = clientId;

      const rows = await supabaseFetch("uploaded_file", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (Array.isArray(rows) && rows.length > 0) {
        insertedRecord = rows[0];
      }
    } catch (e) {
      console.warn("Could not insert uploaded_file row in database:", e);
    }
  }

  // 2. If this is an avatar picture, update `person.avatar_url` in the database table `person`
  if (purpose === "avatar" && personId && isSupabaseConfigured()) {
    try {
      await supabaseFetch(`person?person_id=eq.${personId}`, {
        method: "PATCH",
        body: JSON.stringify({ avatar_url: finalUrl })
      });
    } catch (e) {
      console.warn("Could not update avatar in person database row:", e);
    }
  }

  return {
    file_id: insertedRecord?.file_id || null,
    file_url: finalUrl,
    file_name: cleanName,
    file_size: file?.size || (finalUrl ? finalUrl.length : 0),
    mime_type: file?.type || "image/jpeg",
    uploaded_by: uploadedBy
  };
};

// Supabase API Operations
export const supabaseApi = {
  // Auth: Register with Sanitized Input & Salted Password
  register: async ({
    name,
    email,
    password,
    role = "client",
    phone = "",
    reason = "",
    dob = null,
    specialization = "",
    qualification = ""
  }) => {
    // 0. Input Sanitization & Authorization Validations
    const cleanName = sanitizeText(name);
    if (!cleanName || cleanName.length < 2) {
      throw new Error("Validation Error: Name must be at least 2 characters.");
    }

    const cleanEmail = sanitizeEmail(email);

    if (!['client', 'consultant'].includes(role)) {
      throw new Error(`Validation Error: Unauthorized role "${role}". Allowed roles: client, consultant.`);
    }

    if (!password || password.length < 6) {
      throw new Error("Validation Error: Password must be at least 6 characters.");
    }

    const cleanPhone = phone ? sanitizePhone(phone) : "";
    const cleanReason = sanitizeText(reason);
    const cleanSpecialization = sanitizeText(specialization);
    const cleanQualification = sanitizeText(qualification);

    const salt = generateSalt();
    const hash = await hashPassword(password, salt);

    // 1. Insert into person table
    const [person] = await supabaseFetch("person", {
      method: "POST",
      body: JSON.stringify({
        name: cleanName,
        email: cleanEmail,
        password_hash: hash,
        password_salt: salt,
        role
      })
    });

    // 2. Insert into person_contact table if phone is provided
    if (cleanPhone) {
      try {
        await supabaseFetch("person_contact", {
          method: "POST",
          body: JSON.stringify({
            person_id: person.person_id,
            contact_no: cleanPhone
          })
        });
      } catch (e) {
        console.warn("Error inserting phone contact:", e);
      }
    }

    let clientId = null;
    let consultantId = null;

    // 3. Insert linked role profile
    if (role === "consultant") {
      const [cons] = await supabaseFetch("consultant", {
        method: "POST",
        body: JSON.stringify({
          person_id: person.person_id,
          specialization: cleanSpecialization || "Trauma-Informed Clinical Practice",
          qualification: cleanQualification || "Licensed Mental Health Clinician"
        })
      });
      consultantId = cons?.consultant_id;
    } else {
      const [cli] = await supabaseFetch("client", {
        method: "POST",
        body: JSON.stringify({
          person_id: person.person_id,
          account_status: "ACTIVE",
          dob: dob || null,
          reason: cleanReason || "General wellness & clinical support"
        })
      });
      clientId = cli?.client_id;
    }

    return {
      id: 'u' + person.person_id,
      person_id: person.person_id,
      client_id: clientId,
      consultant_id: consultantId,
      name: person.name,
      email: person.email,
      role: person.role,
      avatar: person.avatar_url || null,
      contact_no: cleanPhone
    };
  },

  // Auth: Login with Sanitized Email & Salted Password Check against Supabase
  login: async (email, password, expectedRole = null) => {
    const cleanEmail = sanitizeEmail(email);
    const encodedEmail = encodeURIComponent(cleanEmail);
    const query = `person?email=eq.${encodedEmail}&select=*,client(*),consultant(*),person_contact(*)`;
    const users = await supabaseFetch(query);

    if (!users || users.length === 0) {
      throw new Error("No account matches those credentials in Supabase.");
    }

    const user = users[0];

    // Authorization: Check Role Access
    if (expectedRole && user.role !== expectedRole) {
      throw new Error(`Authorization Error: Account is registered as a ${user.role}, not authorized as a ${expectedRole}.`);
    }

    const computedHash = await hashPassword(password, user.password_salt);
    if (computedHash !== user.password_hash) {
      throw new Error("Invalid password. Please check your credentials.");
    }

    return {
      id: 'u' + user.person_id,
      person_id: user.person_id,
      client_id: user.client?.client_id || (Array.isArray(user.client) ? user.client[0]?.client_id : null) || null,
      consultant_id: user.consultant?.consultant_id || (Array.isArray(user.consultant) ? user.consultant[0]?.consultant_id : null) || null,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar_url || null,
      contact_no: user.person_contact?.[0]?.contact_no || ''
    };
  },

  // Fetch all Clients from Supabase with Caseload & Status Resolution
  getClients: async () => {
    const [clientsData, appointmentsData] = await Promise.all([
      supabaseFetch("client?select=*,person(*,person_contact(*))&order=client_id.asc"),
      supabaseFetch("appointment?select=client_id,consultant_id,status,consultant(person_id)&order=appointment_id.desc").catch(() => [])
    ]);

    return (clientsData || []).map((c) => {
      // Find latest appointment for this client to determine assigned clinician & active status
      const ap = (appointmentsData || []).find((a) => a.client_id === c.client_id);
      const assignedConsUid = ap?.consultant?.person_id
        ? 'u' + ap.consultant.person_id
        : ap?.consultant_id
        ? 'u' + ap.consultant_id
        : null;

      let resolvedStatus = 'ACTIVE';
      if (c.account_status === 'SUSPENDED') {
        resolvedStatus = 'SUSPENDED';
      } else if (c.account_status === 'INACTIVE' || ap?.status === 'REQUESTED') {
        resolvedStatus = 'Pending';
      } else if (c.account_status === 'ACTIVE' || ap?.status === 'CONFIRMED' || ap?.status === 'COMPLETED') {
        resolvedStatus = 'Accepted';
      }

      return {
        id: c.client_id,
        uid: 'u' + c.person_id,
        person_id: c.person_id,
        name: c.person?.name || "Client",
        email: c.person?.email || "",
        contact_no: c.person?.person_contact?.[0]?.contact_no || "",
        dob: c.dob || null,
        status: resolvedStatus,
        reason: c.reason || "General clinical support",
        avatar: c.person?.avatar_url || null,
        assignedConsultantId: assignedConsUid,
        consultant_id: ap?.consultant_id || null
      };
    });
  },

  // Fetch all Consultants from Supabase
  getConsultants: async () => {
    const data = await supabaseFetch("consultant?select=*,person(*,person_contact(*))&order=consultant_id.asc");
    return (data || []).map((c) => ({
      id: c.consultant_id,
      uid: 'u' + c.person_id,
      person_id: c.person_id,
      name: c.person?.name || "Practitioner",
      email: c.person?.email || "",
      contact_no: c.person?.person_contact?.[0]?.contact_no || "",
      specialization: c.specialization || "Clinical Practice",
      qualification: c.qualification || "Licensed Clinician",
      avatar: c.person?.avatar_url || null
    }));
  },

  // Fetch all Vault & Overview Files from Supabase
  getFiles: async () => {
    const data = await supabaseFetch(
      "uploaded_file?select=*,person(person_id,name,role),client(client_id,person_id,person(name))&order=uploaded_at.desc"
    );
    return (data || []).map((f) => {
      const resolvedClientId = f.client_id || f.client?.client_id || null;
      const clientPersonId = f.client?.person_id || (f.uploaded_by !== 'CONSULTANT' ? f.person_id : null);
      const targetUid = clientPersonId
        ? 'u' + clientPersonId
        : resolvedClientId
        ? 'u' + resolvedClientId
        : f.person_id
        ? 'u' + f.person_id
        : 'u1';

      return {
        id: f.file_id,
        uid: targetUid,
        cid: resolvedClientId,
        client_id: resolvedClientId,
        person_id: f.person_id,
        consultant_id: f.uploaded_by === 'CONSULTANT' && f.person_id ? 'u' + f.person_id : null,
        name: f.file_name,
        size: f.file_size,
        type: f.mime_type || 'application/octet-stream',
        dataUrl: f.file_url,
        date: (f.uploaded_at || '').split('T')[0] || new Date().toISOString().split('T')[0],
        uploadedBy: (f.uploaded_by || 'CLIENT').toLowerCase()
      };
    });
  },

  // Update Client Acceptance / Triage Decision in Supabase
  updateClientDecision: async (clientId, status, consultantId = null) => {
    const dbStatus = (status === 'Accepted' || status === 'ACTIVE')
      ? 'ACTIVE'
      : (status === 'Rejected' || status === 'SUSPENDED')
      ? 'SUSPENDED'
      : 'INACTIVE';

    // 1. Update account status in client table
    await supabaseFetch(`client?client_id=eq.${clientId}`, {
      method: "PATCH",
      body: JSON.stringify({ account_status: dbStatus })
    });

    // 2. Synchronize appointment record
    try {
      const existingApts = await supabaseFetch(`appointment?client_id=eq.${clientId}&order=appointment_id.desc&limit=1`);
      if (existingApts && existingApts.length > 0) {
        const apt = existingApts[0];
        const newAptStatus = (dbStatus === 'ACTIVE') ? 'CONFIRMED' : (dbStatus === 'SUSPENDED') ? 'CANCELLED' : 'REQUESTED';
        const aptPatch = { status: newAptStatus };
        if (consultantId && dbStatus === 'ACTIVE') {
          aptPatch.consultant_id = consultantId;
        }
        await supabaseFetch(`appointment?appointment_id=eq.${apt.appointment_id}`, {
          method: "PATCH",
          body: JSON.stringify(aptPatch)
        });
      } else if (dbStatus === 'ACTIVE' && consultantId) {
        // Create confirmed consultation session to establish persistent caseload relationship
        const todayStr = new Date().toISOString().split('T')[0];
        await supabaseFetch("appointment", {
          method: "POST",
          body: JSON.stringify({
            client_id: clientId,
            consultant_id: consultantId,
            status: 'CONFIRMED',
            appointment_mode: 'ONLINE',
            appointment_date: todayStr,
            appointment_time: '10:00:00',
            reason: 'Caseload Consultation Intake'
          })
        });
      }
    } catch (e) {
      console.warn("Could not synchronize appointment on client decision:", e);
    }
  },

  // Assign Client to Consultant Caseload in Supabase
  assignClientToConsultant: async (clientId, consultantId) => {
    // 1. Mark client as ACTIVE
    await supabaseFetch(`client?client_id=eq.${clientId}`, {
      method: "PATCH",
      body: JSON.stringify({ account_status: 'ACTIVE' })
    });

    // 2. Update or create confirmed appointment linking client and consultant
    try {
      const existingApts = await supabaseFetch(`appointment?client_id=eq.${clientId}&order=appointment_id.desc&limit=1`);
      if (existingApts && existingApts.length > 0) {
        const apt = existingApts[0];
        const aptPatch = { status: 'CONFIRMED' };
        if (consultantId) aptPatch.consultant_id = consultantId;
        await supabaseFetch(`appointment?appointment_id=eq.${apt.appointment_id}`, {
          method: "PATCH",
          body: JSON.stringify(aptPatch)
        });
      } else if (consultantId) {
        const todayStr = new Date().toISOString().split('T')[0];
        await supabaseFetch("appointment", {
          method: "POST",
          body: JSON.stringify({
            client_id: clientId,
            consultant_id: consultantId,
            status: 'CONFIRMED',
            appointment_mode: 'ONLINE',
            appointment_date: todayStr,
            appointment_time: '10:00:00',
            reason: 'Caseload Assignment'
          })
        });
      }
    } catch (e) {
      console.warn("Could not link appointment on caseload assignment:", e);
    }
  },

  // Fetch all Appointments (with Pre-Consultation Intake Forms)
  getAppointments: async () => {
    const data = await supabaseFetch(
      "appointment?select=*,preconsultation_form(*),client(client_id,person_id,person(name,email)),consultant(consultant_id,person_id,person(name,email))&order=appointment_date.desc"
    );
    return (data || []).map((a) => {
      const preForm = Array.isArray(a.preconsultation_form)
        ? a.preconsultation_form[0]?.responses
        : a.preconsultation_form?.responses;

      return {
        id: a.appointment_id,
        uid: a.client?.person_id ? 'u' + a.client.person_id : 'u' + a.client_id,
        cid: a.client_id,
        consultant_id: a.consultant?.person_id
          ? 'u' + a.consultant.person_id
          : a.consultant_id
          ? 'u' + a.consultant_id
          : 'cons',
        date: a.appointment_date,
        time: a.appointment_time,
        type: a.appointment_mode === 'ONLINE' ? 'Online Telehealth Consultation' : 'In-Person Sanctuary Consultation',
        appointment_mode: a.appointment_mode || 'ONLINE',
        status: a.status,
        reason: a.reason || '',
        pre: preForm || (a.reason ? { reason: a.reason } : null)
      };
    });
  },

  // Verify slot availability in database table appointment
  checkSlotAvailability: async (consultantId, date, time) => {
    if (!consultantId || !date || !time) return true;
    const cleanConsId = typeof consultantId === 'string' && consultantId.startsWith('u') ? consultantId.replace('u', '') : consultantId;
    if (isNaN(Number(cleanConsId))) return true;
    const cleanTime = time.length === 5 ? `${time}:00` : time;
    const cleanDate = date.split('T')[0];
    try {
      const data = await supabaseFetch(
        `appointment?consultant_id=eq.${cleanConsId}&appointment_date=eq.${cleanDate}&appointment_time=eq.${cleanTime}&status=neq.CANCELLED`
      );
      return !data || data.length === 0;
    } catch (e) {
      console.warn("Could not check slot availability in Supabase:", e);
      return true;
    }
  },

  createAppointment: async (appointmentData, currentUser = null) => {
    if (currentUser) {
      checkAuthorization(currentUser, ['client', 'consultant', 'admin'], 'book or schedule an appointment');
    }
    const cleanReason = sanitizeText(appointmentData.reason || '');
    return supabaseFetch("appointment", {
      method: "POST",
      body: JSON.stringify({
        ...appointmentData,
        reason: cleanReason
      })
    });
  },

  // Pre-Consultation Form Management
  createPreconsultationForm: async (formData, currentUser = null) => {
    if (currentUser) {
      checkAuthorization(currentUser, ['client', 'consultant', 'admin'], 'submit pre-consultation intake form');
    }
    return supabaseFetch("preconsultation_form", {
      method: "POST",
      body: JSON.stringify(formData)
    });
  },

  getPreconsultationForms: async () => {
    const data = await supabaseFetch("preconsultation_form?select=*,appointment(*,client(*,person(*)),consultant(*,person(*)))&order=submitted_at.desc").catch(() => []);
    return (data || []).map((p) => ({
      form_id: p.form_id,
      appointment_id: p.appointment_id,
      responses: p.responses,
      submitted_at: p.submitted_at
    }));
  },

  // Feedback with Authorization & Input Sanitization
  getFeedback: async () => {
    const data = await supabaseFetch("feedback?select=*,client(client_id,person_id,person(name))&order=submitted_at.desc");
    return (data || []).map((f) => ({
      id: f.feedback_id,
      cid: f.client_id,
      client_name: f.is_anonymous ? 'Anonymous Client' : (f.client?.person?.name || 'Client'),
      rating: f.rating,
      category: f.category || 'Session Experience',
      comment: f.comment_text,
      reply: f.clinician_reply,
      isAnonymous: f.is_anonymous === 1,
      read: f.read_status === 1,
      date: (f.submitted_at || '').split('T')[0] || new Date().toISOString().split('T')[0]
    }));
  },

  createFeedback: async (feedbackData, currentUser = null) => {
    if (currentUser) {
      checkAuthorization(currentUser, ['client'], 'submit session feedback');
    }
    const cleanComment = sanitizeText(feedbackData.comment_text || '');
    const cleanCategory = sanitizeText(feedbackData.category || 'Session Experience');
    const rating = Number(feedbackData.rating);
    if (!rating || rating < 1 || rating > 5) {
      throw new Error("Validation Error: Feedback rating must be an integer between 1 and 5.");
    }

    return supabaseFetch("feedback", {
      method: "POST",
      body: JSON.stringify({
        ...feedbackData,
        category: cleanCategory,
        comment_text: cleanComment,
        rating
      })
    });
  },

  // Clinician Reply & Acknowledgment to Feedback
  updateFeedbackReply: async (feedbackId, replyText) => {
    if (!feedbackId) return false;
    const cleanId = typeof feedbackId === 'string' && feedbackId.startsWith('u') ? feedbackId.replace('u', '') : feedbackId;
    if (isNaN(Number(cleanId))) return true;
    return supabaseFetch(`feedback?feedback_id=eq.${cleanId}`, {
      method: "PATCH",
      body: JSON.stringify({
        clinician_reply: sanitizeText(replyText || ''),
        read_status: 1
      })
    });
  },

  // Private Clinical Notes with Strict Clinician Authorization & Sanitization
  getNotes: async (currentUser = null) => {
    if (currentUser) {
      checkAuthorization(currentUser, ['consultant', 'admin'], 'access private clinical notes');
    }
    const data = await supabaseFetch(
      "private_note?select=*,consultant(person_id),client(client_id,person_id)&order=created_at.desc"
    );
    return (data || []).map((n) => ({
      id: n.note_id,
      cid: n.client_id,
      consultant_id: n.consultant?.person_id
        ? 'u' + n.consultant.person_id
        : n.consultant_id
        ? 'u' + n.consultant_id
        : 'cons',
      title: n.title,
      tag: n.tag,
      body: n.note_text,
      date: (n.created_at || '').split('T')[0] || new Date().toISOString().split('T')[0]
    }));
  },

  createNote: async (noteData, currentUser = null) => {
    if (currentUser) {
      checkAuthorization(currentUser, ['consultant', 'admin'], 'author private clinical notes');
    }
    const cleanTitle = sanitizeText(noteData.title || 'Clinical Note');
    const cleanTag = sanitizeText(noteData.tag || 'General');
    const cleanText = sanitizeText(noteData.note_text || '');

    if (!cleanText || cleanText.length < 2) {
      throw new Error("Validation Error: Clinical note text cannot be empty.");
    }

    return supabaseFetch("private_note", {
      method: "POST",
      body: JSON.stringify({
        ...noteData,
        title: cleanTitle,
        tag: cleanTag,
        note_text: cleanText
      })
    });
  },

  // Insert verified clinical file record into database table uploaded_file
  uploadFileRecord: async (fileRecord) => {
    return supabaseFetch("uploaded_file", {
      method: "POST",
      body: JSON.stringify(fileRecord)
    });
  },

  // Delete uploaded file record from database table uploaded_file
  deleteFile: async (fileId) => {
    if (!fileId) return false;
    const cleanId = typeof fileId === 'string' && fileId.startsWith('u') ? fileId.replace('u', '') : fileId;
    if (isNaN(Number(cleanId))) return true;
    return supabaseFetch(`uploaded_file?file_id=eq.${cleanId}`, {
      method: "DELETE"
    });
  },

  // Delete private clinical note from database table private_note
  deletePrivateNote: async (noteId) => {
    if (!noteId) return false;
    const cleanId = typeof noteId === 'string' && noteId.startsWith('u') ? noteId.replace('u', '') : noteId;
    if (isNaN(Number(cleanId))) return true;
    return supabaseFetch(`private_note?note_id=eq.${cleanId}`, {
      method: "DELETE"
    });
  },

  // Master Initial Data Synchronizer Across All Devices
  fetchAppData: async () => {
    if (!isSupabaseConfigured()) return null;
    try {
      const [clients, consultants, files, appointments, notes, feedback] = await Promise.all([
        supabaseApi.getClients().catch((e) => { console.warn("getClients notice:", e); return []; }),
        supabaseApi.getConsultants().catch((e) => { console.warn("getConsultants notice:", e); return []; }),
        supabaseApi.getFiles().catch((e) => { console.warn("getFiles notice:", e); return []; }),
        supabaseApi.getAppointments().catch((e) => { console.warn("getAppointments notice:", e); return []; }),
        supabaseApi.getNotes().catch((e) => { console.warn("getNotes notice:", e); return []; }),
        supabaseApi.getFeedback().catch((e) => { console.warn("getFeedback notice:", e); return []; })
      ]);
      return { clients, consultants, files, appointments, notes, feedback };
    } catch (e) {
      console.warn("Supabase fetchAppData encountered an issue:", e);
      return null;
    }
  }
};
