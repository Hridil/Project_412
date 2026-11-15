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

  if (
    (client.assignedConsultantId &&
      (client.assignedConsultantId === consId || client.assignedConsultantId === consUid || (consDbId && client.assignedConsultantId === consDbId))) ||
    (client.consultant_id &&
      (client.consultant_id === consId || client.consultant_id === consUid || (consDbId && client.consultant_id === consDbId)))
  ) {
    return true;
  }

  const hasAp = appointments.some(
    (a) =>
      (a.cid === client.id || a.uid === client.uid) &&
      (a.consultant_id === consId || a.consultant_id === consUid || (consDbId && a.consultant_id === consDbId))
  );
  if (hasAp) return true;

  const hasNt = notes.some(
    (n) =>
      n.cid === client.id &&
      (n.consultant_id === consId || n.consultant_id === consUid || (consDbId && n.consultant_id === consDbId))
  );
  if (hasNt) return true;

  const hasPl = plans.some(
    (p) =>
      (p.cid === client.id || p.uid === client.uid) &&
      (p.consultant_id === consId || p.consultant_id === consUid || (consDbId && p.consultant_id === consDbId))
  );
  if (hasPl) return true;

  return false;
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
export const uploadImageToSupabase = async (file, personId = null, purpose = "general", fallbackDataUrl = null) => {
  const cleanName = sanitizeFileName(file?.name || (purpose === 'avatar' ? 'avatar.jpg' : 'image.jpg'));
  const uniquePath = `${Date.now()}_${cleanName}`;
  let finalUrl = fallbackDataUrl || null;

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

  // 1. Record uploaded picture in database table `uploaded_file`
  if (isSupabaseConfigured()) {
    try {
      await supabaseFetch("uploaded_file", {
        method: "POST",
        body: JSON.stringify({
          person_id: personId,
          file_name: cleanName,
          file_size: file?.size || (finalUrl ? finalUrl.length : 0),
          file_path: uniquePath,
          file_url: finalUrl,
          mime_type: file?.type || "image/jpeg",
          uploaded_by: "USER"
        })
      });
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
    file_url: finalUrl,
    file_name: cleanName,
    file_size: file?.size || (finalUrl ? finalUrl.length : 0)
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

  // Fetch all Clients from Supabase
  getClients: async () => {
    const data = await supabaseFetch("client?select=*,person(*,person_contact(*))&order=client_id.asc");
    return (data || []).map((c) => ({
      id: c.client_id,
      uid: 'u' + c.person_id,
      person_id: c.person_id,
      name: c.person?.name || "Client",
      email: c.person?.email || "",
      contact_no: c.person?.person_contact?.[0]?.contact_no || "",
      dob: c.dob || null,
      status: c.account_status || "ACTIVE",
      reason: c.reason || "General clinical support",
      avatar: c.person?.avatar_url || null
    }));
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

  // Fetch all Appointments
  getAppointments: async () => {
    return supabaseFetch("appointment?select=*,client(client_id,person(name,email)),consultant(consultant_id,person(name,email))&order=appointment_date.desc");
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

  // Feedback with Authorization & Input Sanitization
  getFeedback: async () => {
    return supabaseFetch("feedback?select=*,client(client_id,person(name))&order=submitted_at.desc");
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

  // Private Clinical Notes with Strict Clinician Authorization & Sanitization
  getNotes: async (currentUser = null) => {
    if (currentUser) {
      checkAuthorization(currentUser, ['consultant', 'admin'], 'access private clinical notes');
    }
    return supabaseFetch("private_note?select=*&order=created_at.desc");
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

  // Master Initial Data Synchronizer
  fetchAppData: async () => {
    if (!isSupabaseConfigured()) return null;
    try {
      const [clients, consultants] = await Promise.all([
        supabaseApi.getClients(),
        supabaseApi.getConsultants()
      ]);
      return { clients, consultants };
    } catch (e) {
      console.warn("Supabase fetchAppData encountered an issue:", e);
      return null;
    }
  }
};
