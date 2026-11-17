export const getFileIcon = (name = '') => {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'picture_as_pdf';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) return 'image';
  if (['doc', 'docx', 'txt', 'rtf', 'md'].includes(ext)) return 'description';
  if (['mp3', 'wav', 'm4a', 'aac'].includes(ext)) return 'audio_file';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'table_chart';
  return 'draft';
};

export const readFileAsDataUrl = (file) => {
  return new Promise((resolve) => {
    // Avoid localStorage crashes if user uploads a huge file (> 3MB)
    if (file.size > 3 * 1024 * 1024) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

export const compressImage = (file, maxWidth = 1280, maxHeight = 800, quality = 0.85) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({ dataUrl, width, height });
      };
      img.onerror = () => resolve({ dataUrl: e.target.result, width: 0, height: 0 });
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

export const handleDownloadFile = async (f, showToast = () => {}, currentUser = null) => {
  if (!f) return;

  // Client Vault Isolation Check: clients can ONLY access and download their own files
  if (currentUser && currentUser.role === 'client') {
    const isOwner =
      f.uid === currentUser.id ||
      (currentUser.client_id && f.client_id === currentUser.client_id) ||
      (currentUser.person_id && f.person_id === currentUser.person_id) ||
      (currentUser.email && f.email === currentUser.email);
    if (!isOwner) {
      showToast('Security Alert: You are strictly authorized to download your own confidential files.');
      return;
    }
  }

  const fileUrl = f.dataUrl || f.url || f.file_url;
  const fileName = f.name || 'document';
  const isImage = /\.(jpe?g|png|webp|gif|svg)$/i.test(fileName);
  const isPdf = /\.pdf$/i.test(fileName);

  // Helper to trigger browser download
  const triggerDownload = (url, name) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Case 1: Base64 Data URL
  if (fileUrl && fileUrl.startsWith('data:')) {
    triggerDownload(fileUrl, fileName);
    showToast(`Downloaded: ${fileName}`);
    return;
  }

  // Case 2: Remote HTTP/HTTPS URL (e.g. Supabase Storage public URL)
  // Cross-origin URLs do NOT trigger direct download via the HTML download attribute unless converted to a local Blob!
  if (fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'))) {
    try {
      const resp = await fetch(fileUrl, { mode: 'cors' });
      if (resp.ok) {
        const blob = await resp.blob();
        const blobUrl = URL.createObjectURL(blob);
        triggerDownload(blobUrl, fileName);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        showToast(`Downloaded: ${fileName}`);
        return;
      }
    } catch (err) {
      console.warn('Direct fetch download failed (cross-origin / CORS), trying fallback:', err);
    }

    // Canvas fallback for images with crossOrigin
    if (isImage) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const loaded = await new Promise((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = fileUrl;
        });
        if (loaded) {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 800;
          canvas.height = img.naturalHeight || 600;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const mime = fileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
          const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime));
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            triggerDownload(blobUrl, fileName);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
            showToast(`Downloaded: ${fileName}`);
            return;
          }
        }
      } catch (canvasErr) {
        console.warn('Canvas download fallback failed:', canvasErr);
      }
    }

    // Fallback: window open or direct link
    window.open(fileUrl, '_blank');
    showToast(`Opening file: ${fileName}`);
    return;
  }

  // Case 3: Mock/seed files
  if (isImage) {
    // Generate a valid image blob so it downloads as a real image file!
    const cleanTitle = fileName.replace(/[^a-zA-Z0-9._-]/g, ' ');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#14302c"/>
          <stop offset="100%" stop-color="#071b19"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bg)"/>
      <circle cx="400" cy="220" r="70" fill="#1f4e47"/>
      <path d="M 370 220 L 395 245 L 435 195" stroke="#4fd1c5" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="400" y="340" font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="bold" fill="#e3efec" text-anchor="middle">MindCare Sanctuary Clinical Record</text>
      <text x="400" y="380" font-family="Helvetica, Arial, sans-serif" font-size="18" fill="#8fa8a3" text-anchor="middle">${cleanTitle}</text>
      <text x="400" y="420" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#5f7571" text-anchor="middle">Confidential Clinical Vault Record · HIPAA Verified</text>
    </svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const downloadName = fileName.toLowerCase().endsWith('.svg') ? fileName : `${fileName.replace(/\.[^/.]+$/, '')}.svg`;
    triggerDownload(blobUrl, downloadName);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    showToast(`Downloaded: ${downloadName}`);
    return;
  }

  if (isPdf) {
    const cleanTitle = fileName.replace(/[^a-zA-Z0-9._-]/g, ' ');
    const pdf = `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>>/Contents 4 0 R>>endobj\n4 0 obj<</Length 120>>stream\nBT\n/F1 16 Tf\n50 720 Td\n(MindCare Sanctuary - Clinical Document) Tj\n/F1 12 Tf\n50 690 Td\n(${cleanTitle}) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000056 00000 n \n0000000111 00000 n \n0000000257 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n427\n%%EOF`;
    const blob = new Blob([pdf], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    triggerDownload(blobUrl, fileName);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    showToast(`Downloaded: ${fileName}`);
    return;
  }

  // Other text/general files
  const content = `MindCare Sanctuary - Confidential Clinical Vault Record\n\nFilename: ${fileName}\nSize: ${f.size || 0} bytes\nDate: ${f.date || 'Recent'}\nSource: ${f.uploadedBy === 'consultant' ? 'Dr. Demo Consultant' : 'Client Upload'}\nAccess Level: HIPAA/HITECH Certified Secure File\n\nThis is a verified document record within MindCare Pro Sanctuary.`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  let downloadName = fileName;
  if (!downloadName.toLowerCase().endsWith('.txt')) {
    downloadName = `${downloadName}.txt`;
  }
  const blobUrl = URL.createObjectURL(blob);
  triggerDownload(blobUrl, downloadName);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  showToast(`Downloaded: ${downloadName}`);
};
