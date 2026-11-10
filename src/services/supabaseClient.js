// ====================================================================
// MINDCARE PRO - SUPABASE REST & STORAGE CLIENT
// Uses native fetch() for zero-dependency PostgREST & Storage support
// ====================================================================

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = () => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes("your-project"));
};

// Cryptographic Salt & Hash in Browser Web Crypto API
export const generateSalt = () => {
  const arr = new Uint8Array(16);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
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
  return Array.from(new Uint8Array(derivedBits), b => b.toString(16).padStart(2, '0')).join('');
};

// Generic Supabase REST Fetcher
const supabaseFetch = async (endpoint, options = {}) => {
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

  return response.json();
};

// Supabase Storage Image Upload
export const uploadImageToSupabase = async (file, personId = null, purpose = "general") => {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase Storage: offline fallback using object URL.");
    return {
      file_url: URL.createObjectURL(file),
      file_name: file.name,
      file_size: file.size
    };
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniquePath = `${Date.now()}_${cleanName}`;
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

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Storage upload failed: ${err}`);
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/mindcare-images/${uniquePath}`;

  // Record in UPLOADED_FILE table
  try {
    await supabaseFetch("UPLOADED_FILE", {
      method: "POST",
      body: JSON.stringify({
        PERSON_ID: personId,
        FILE_NAME: file.name,
        FILE_SIZE: file.size,
        FILE_PATH: uniquePath,
        FILE_URL: publicUrl,
        MIME_TYPE: file.type,
        UPLOADED_BY: "USER"
      })
    });
  } catch (e) {
    console.warn("Could not insert UPLOADED_FILE row:", e);
  }

  // Update avatar if specified
  if (purpose === "avatar" && personId) {
    await supabaseFetch(`PERSON?PERSON_ID=eq.${personId}`, {
      method: "PATCH",
      body: JSON.stringify({ AVATAR_URL: publicUrl })
    });
  }

  return {
    file_url: publicUrl,
    file_name: file.name,
    file_size: file.size
  };
};

// Supabase API Operations
export const supabaseApi = {
  // Auth: Register with Salted Password
  register: async ({ name, email, password, role = "client", phone = "", reason = "", dob = null, specialization = "", qualification = "" }) => {
    const salt = generateSalt();
    const hash = await hashPassword(password, salt);

    const [person] = await supabaseFetch("PERSON", {
      method: "POST",
      body: JSON.stringify({
        NAME: name,
        EMAIL: email.toLowerCase(),
        PASSWORD_HASH: hash,
        PASSWORD_SALT: salt,
        ROLE: role
      })
    });

    if (phone) {
      await supabaseFetch("PERSON_CONTACT", {
        method: "POST",
        body: JSON.stringify({ PERSON_ID: person.PERSON_ID, CONTACT_NO: phone })
      });
    }

    let clientId = null;
    let consultantId = null;

    if (role === "consultant") {
      const [cons] = await supabaseFetch("CONSULTANT", {
        method: "POST",
        body: JSON.stringify({
          PERSON_ID: person.PERSON_ID,
          SPECIALIZATION: specialization || "Clinical Psychology",
          QUALIFICATION: qualification || "Licensed Psychologist"
        })
      });
      consultantId = cons?.CONSULTANT_ID;
    } else {
      const [cli] = await supabaseFetch("CLIENT", {
        method: "POST",
        body: JSON.stringify({
          PERSON_ID: person.PERSON_ID,
          ACCOUNT_STATUS: "ACTIVE",
          DOB: dob,
          REASON: reason
        })
      });
      clientId = cli?.CLIENT_ID;
    }

    return {
      person_id: person.PERSON_ID,
      client_id: clientId,
      consultant_id: consultantId,
      name: person.NAME,
      email: person.EMAIL,
      role: person.ROLE
    };
  },

  // Auth: Login with Salted Password Check
  login: async (email, password) => {
    const users = await supabaseFetch(`PERSON?EMAIL=eq.${encodeURIComponent(email.toLowerCase())}&select=*`);
    if (!users || users.length === 0) {
      throw new Error("Invalid email or password");
    }

    const user = users[0];
    const computedHash = await hashPassword(password, user.PASSWORD_SALT);
    if (computedHash !== user.PASSWORD_HASH) {
      throw new Error("Invalid email or password");
    }

    return user;
  },

  // Appointments
  getAppointments: async () => {
    return supabaseFetch("APPOINTMENT?select=*,CLIENT(PERSON(NAME)),CONSULTANT(PERSON(NAME))&order=APPOINTMENT_DATE.desc");
  },

  createAppointment: async (appointmentData) => {
    return supabaseFetch("APPOINTMENT", {
      method: "POST",
      body: JSON.stringify(appointmentData)
    });
  },

  // Feedback
  getFeedback: async () => {
    return supabaseFetch("FEEDBACK?select=*,CLIENT(PERSON(NAME))&order=SUBMITTED_AT.desc");
  },

  createFeedback: async (feedbackData) => {
    return supabaseFetch("FEEDBACK", {
      method: "POST",
      body: JSON.stringify(feedbackData)
    });
  },

  // Notes
  getNotes: async () => {
    return supabaseFetch("PRIVATE_NOTE?select=*&order=CREATED_AT.desc");
  },

  createNote: async (noteData) => {
    return supabaseFetch("PRIVATE_NOTE", {
      method: "POST",
      body: JSON.stringify(noteData)
    });
  }
};
