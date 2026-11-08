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

export const handleDownloadFile = (f, showToast = () => {}) => {
  // If original uploaded data exists, download real binary data
  if (f.dataUrl) {
    const a = document.createElement('a');
    a.href = f.dataUrl;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloaded original file: ${f.name}`);
    return;
  }

  // Fallback for seed mock files: generate valid PDF or text file
  let blob;
  let downloadName = f.name;
  if (f.name.toLowerCase().endsWith('.pdf')) {
    const cleanTitle = f.name.replace(/[^a-zA-Z0-9._-]/g, ' ');
    const pdf = `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>>/Contents 4 0 R>>endobj\n4 0 obj<</Length 120>>stream\nBT\n/F1 16 Tf\n50 720 Td\n(MindCare Sanctuary - Clinical Document) Tj\n/F1 12 Tf\n50 690 Td\n(${cleanTitle}) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000056 00000 n \n0000000111 00000 n \n0000000257 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n427\n%%EOF`;
    blob = new Blob([pdf], { type: 'application/pdf' });
  } else {
    const content = `MindCare Sanctuary - Confidential Clinical Vault Record\n\nFilename: ${f.name}\nSize: ${f.size} bytes\nDate: ${f.date || 'Recent'}\nSource: ${f.uploadedBy === 'consultant' ? 'Dr. Demo Consultant' : 'Client Upload'}\nAccess Level: HIPAA/HITECH Certified Secure File\n\nThis is a verified document record within MindCare Pro Sanctuary.`;
    blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    if (!downloadName.toLowerCase().endsWith('.txt')) {
      downloadName = `${downloadName}.txt`;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = downloadName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Downloaded: ${downloadName}`);
};
