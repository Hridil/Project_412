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

  // Record in uploaded_file table
  try {
    await supabaseFetch("uploaded_file", {
      method: "POST",
      body: JSON.stringify({
        person_id: personId,
        file_name: file.name,
        file_size: file.size,
        file_path: uniquePath,
        file_url: publicUrl,
        mime_type: file.type || "image/jpeg",
        uploaded_by: "USER"
      })
    });
  } catch (e) {
    console.warn("Could not insert uploaded_file row:", e);
  }

  // Update avatar if specified
  if (purpose === "avatar" && personId) {
    try {
      await supabaseFetch(`person?person_id=eq.${personId}`, {
        method: "PATCH",
        body: JSON.stringify({ avatar_url: publicUrl })
      });
    } catch (e) {
      console.warn("Could not update avatar in person row:", e);
    }
  }

  return {
    file_url: publicUrl,
    file_name: file.name,
    file_size: file.size
  };
};

// Supabase API Operations
export const supabaseApi = {
  // Auth: Register with Salted Password and create linked Client or Consultant record
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
    const salt = generateSalt();
    const hash = await hashPassword(password, salt);

    // 1. Insert into person table
    const [person] = await supabaseFetch("person", {
      method: "POST",
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password_hash: hash,
        password_salt: salt,
        role
      })
    });

    // 2. Insert into person_contact table if phone is provided
    if (phone && phone.trim()) {
      try {
        await supabaseFetch("person_contact", {
          method: "POST",
          body: JSON.stringify({
            person_id: person.person_id,
            contact_no: phone.trim()
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
          specialization: specialization.trim() || "Trauma-Informed Clinical Practice",
          qualification: qualification.trim() || "Licensed Mental Health Clinician"
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
          reason: reason.trim() || "General wellness & clinical support"
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
      contact_no: phone.trim()
    };
  },

  // Auth: Login with Salted Password Check against Supabase
  login: async (email, password, expectedRole = null) => {
    const cleanEmail = encodeURIComponent(email.trim().toLowerCase());
    const query = `person?email=eq.${cleanEmail}&select=*,client(*),consultant(*),person_contact(*)`;
    const users = await supabaseFetch(query);

    if (!users || users.length === 0) {
      throw new Error("No account matches those credentials in Supabase.");
    }

    const user = users[0];

    if (expectedRole && user.role !== expectedRole) {
      throw new Error(`Account exists but is registered as a ${user.role}, not a ${expectedRole}.`);
    }

    const computedHash = await hashPassword(password, user.password_salt);
    if (computedHash !== user.password_hash) {
      throw new Error("Invalid password. Please check your credentials.");
    }

    return {
      id: 'u' + user.person_id,
      person_id: user.person_id,
      client_id: user.client?.[0]?.client_id || null,
      consultant_id: user.consultant?.[0]?.consultant_id || null,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar_url || null,
      contact_no: user.person_contact?.[0]?.contact_no || ''
    };
  },

  // Fetch all Clients from Supabase
  getClients: async () => {
    const data = await supabaseFetch("client?select=*,person(*),person_contact(contact_no)&order=client_id.asc");
    return (data || []).map((c) => ({
      id: c.client_id,
      uid: 'u' + c.person_id,
      person_id: c.person_id,
      name: c.person?.name || "Client",
      email: c.person?.email || "",
      contact_no: c.person_contact?.[0]?.contact_no || "",
      dob: c.dob || null,
      status: c.account_status || "ACTIVE",
      reason: c.reason || "General clinical support",
      avatar: c.person?.avatar_url || null
    }));
  },

  // Fetch all Consultants from Supabase
  getConsultants: async () => {
    const data = await supabaseFetch("consultant?select=*,person(*),person_contact(contact_no)&order=consultant_id.asc");
    return (data || []).map((c) => ({
      id: c.consultant_id,
      uid: 'u' + c.person_id,
      person_id: c.person_id,
      name: c.person?.name || "Practitioner",
      email: c.person?.email || "",
      contact_no: c.person_contact?.[0]?.contact_no || "",
      specialization: c.specialization || "Clinical Practice",
      qualification: c.qualification || "Licensed Clinician",
      avatar: c.person?.avatar_url || null
    }));
  },

  // Fetch all Appointments
  getAppointments: async () => {
    return supabaseFetch("appointment?select=*,client(client_id,person(name,email)),consultant(consultant_id,person(name,email))&order=appointment_date.desc");
  },

  createAppointment: async (appointmentData) => {
    return supabaseFetch("appointment", {
      method: "POST",
      body: JSON.stringify(appointmentData)
    });
  },

  // Feedback
  getFeedback: async () => {
    return supabaseFetch("feedback?select=*,client(client_id,person(name))&order=submitted_at.desc");
  },

  createFeedback: async (feedbackData) => {
    return supabaseFetch("feedback", {
      method: "POST",
      body: JSON.stringify(feedbackData)
    });
  },

  // Notes
  getNotes: async () => {
    return supabaseFetch("private_note?select=*&order=created_at.desc");
  },

  createNote: async (noteData) => {
    return supabaseFetch("private_note", {
      method: "POST",
      body: JSON.stringify(noteData)
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
