import api from "./api";

// ─── Pedir firma al backend ───────────────────────────────────────────────────
const getSignature = (folder = 'productos') =>
  api.post('/upload/signature', { folder });

// ─── Subir archivo directo a Cloudinary con la firma ─────────────────────────
const uploadToCloudinary = async (file, folder = 'productos', onProgress) => {
  // 1. Pedir firma
  const { data: sig } = await getSignature(folder);

  // 2. Armar FormData para Cloudinary
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', sig.apiKey);
  formData.append('timestamp', sig.timestamp);
  formData.append('signature', sig.signature);
  formData.append('folder', sig.folder);
  formData.append('eager', 'c_limit,w_1200,q_auto,f_auto');

  // 3. Upload directo a Cloudinary con XMLHttpRequest para tener progreso
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;

    xhr.open('POST', url);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        const result = JSON.parse(xhr.responseText);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
        });
      } else {
        reject(new Error(`Error Cloudinary: ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Error de red al subir imagen'));
    xhr.send(formData);
  });
};

// ─── Eliminar imagen de Cloudinary via backend ────────────────────────────────
const deleteImage = (publicId) =>
  api.delete('/upload', { data: { publicId } });

export const uploadAPI = {
  uploadToCloudinary,
  deleteImage,
};