import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudArrowUp,
  faXmark,
  faSpinner,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import { uploadAPI } from "../../api/uploadAPI";
import styles from "./ImageUploader.module.css";

/**
 * ImageUploader
 *
 * Props:
 * - value: string | null       → URL actual de la imagen
 * - onChange: (url) => void    → callback cuando se sube o borra
 * - folder: string             → carpeta en Cloudinary (default: 'productos')
 * - label: string              → etiqueta del campo
 * - required: bool
 */
const ImageUploader = ({
  value = null,
  onChange,
  folder = "productos",
  label = "Imagen",
  required = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes (JPG, PNG, WEBP)");
      return;
    }

    // Validar tamaño — 10MB max
    if (file.size > 10 * 1024 * 1024) {
      setError("La imagen no puede superar los 10MB");
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadAPI.uploadToCloudinary(file, folder, setProgress);
      onChange(result.url);
    } catch (err) {
      setError("Error al subir la imagen. Intentá de nuevo.");
      console.error(err);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input para poder subir el mismo archivo de nuevo
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    onChange(null);
    setError(null);
  };

  return (
    <div className={styles.wrapper}>
      {label && (
        <p className={styles.label}>
          {label} {required && <span className={styles.req}>*</span>}
        </p>
      )}

      {/* Preview si ya hay imagen */}
      {value && !uploading ? (
        <div className={styles.preview}>
          <img src={value} alt="Preview" className={styles.previewImg} />
          <button
            type="button"
            className={styles.removeBtn}
            onClick={handleRemove}
            title="Eliminar imagen"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
          {/* Botón para reemplazar */}
          <button
            type="button"
            className={styles.replaceBtn}
            onClick={() => inputRef.current?.click()}
          >
            Cambiar
          </button>
        </div>
      ) : (
        /* Drop zone */
        <div
          className={`${styles.dropZone} ${dragOver ? styles.dragOver : ""} ${uploading ? styles.uploading : ""}`}
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className={styles.progressWrap}>
              <FontAwesomeIcon icon={faSpinner} spin className={styles.spinIcon} />
              <p className={styles.progressText}>Subiendo... {progress}%</p>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className={styles.dropContent}>
              <FontAwesomeIcon icon={faCloudArrowUp} className={styles.uploadIcon} />
              <p className={styles.dropTitle}>Arrastrá o tocá para subir</p>
              <p className={styles.dropSub}>JPG, PNG, WEBP · Máx 10MB</p>
            </div>
          )}
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className={styles.hiddenInput}
        capture="environment" // En mobile abre la cámara directamente
      />
    </div>
  );
};

export default ImageUploader;