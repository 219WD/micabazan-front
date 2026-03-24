import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { uploadAPI } from "../../api/uploadAPI";
import styles from "./MultiImageUploader.module.css";

/**
 * MultiImageUploader
 *
 * Props:
 * - values: string[]           → array de URLs actuales
 * - onChange: (urls) => void   → callback con el nuevo array
 * - folder: string             → carpeta en Cloudinary
 * - max: number                → máximo de imágenes (default: 5)
 * - label: string
 */
const MultiImageUploader = ({
  values = [],
  onChange,
  folder = "productos",
  max = 5,
  label = "Imágenes adicionales",
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFiles = async (files) => {
    const remaining = max - values.length;
    if (remaining <= 0) {
      setError(`Máximo ${max} imágenes`);
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setError(null);
    setUploading(true);

    try {
      const urls = [];
      for (let i = 0; i < toUpload.length; i++) {
        const file = toUpload[i];
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 10 * 1024 * 1024) {
          setError("Alguna imagen supera los 10MB");
          continue;
        }
        setProgress(Math.round(((i) / toUpload.length) * 100));
        const result = await uploadAPI.uploadToCloudinary(file, folder, (p) => {
          setProgress(Math.round(((i + p / 100) / toUpload.length) * 100));
        });
        urls.push(result.url);
      }
      onChange([...values, ...urls]);
    } catch (err) {
      setError("Error al subir alguna imagen");
      console.error(err);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = (index) => {
    const updated = values.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className={styles.wrapper}>
      {label && <p className={styles.label}>{label}</p>}

      <div className={styles.grid}>
        {/* Imágenes existentes */}
        {values.map((url, i) => (
          <div key={i} className={styles.thumb}>
            <img src={url} alt={`Imagen ${i + 1}`} className={styles.thumbImg}
              onError={(e) => { e.target.src = "https://via.placeholder.com/100?text=."; }} />
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => handleRemove(i)}
              title="Eliminar"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        ))}

        {/* Botón agregar — solo si no llegó al max */}
        {values.length < max && (
          <label className={`${styles.addThumb} ${uploading ? styles.disabled : ""}`}>
            {uploading ? (
              <div className={styles.uploadingThumb}>
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>{progress}%</span>
              </div>
            ) : (
              <>
                <FontAwesomeIcon icon={faPlus} className={styles.plusIcon} />
                <span>Agregar</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              disabled={uploading}
              className={styles.hiddenInput}
              capture="environment"
            />
          </label>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}
      <p className={styles.hint}>{values.length}/{max} imágenes</p>
    </div>
  );
};

export default MultiImageUploader;