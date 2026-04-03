import { useState, useRef } from "react";
import axios from "axios";
import Spinner from "./Spinner";

export default function ImageUploader({ images, setImages }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState("");
  const inputRef                  = useRef(null);

  async function handleFiles(files) {
    setError("");
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      // Client-side validation before even hitting the server
      if (!allowed.includes(file.type)) {
        setError("Only jpg, png, and webp images are allowed");
        return;
      }
      if (file.size > maxSize) {
        setError("Each image must be under 5MB");
        return;
      }
    }

    setUploading(true);
    try {
      // Upload each file one by one
      const uploadedUrls = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);

        const res = await axios.post("/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedUrls.push(res.data.url);
      }

      // Add new URLs to existing images array
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(e) {
    handleFiles(Array.from(e.target.files));
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFiles(Array.from(e.dataTransfer.files));
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        style={styles.dropZone}
        onClick={() => inputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleInputChange}
          style={{ display: "none" }}
        />
        {uploading ? (
          <div style={styles.uploadingState}>
            <Spinner size={20} />
            <span>Uploading...</span>
          </div>
        ) : (
          <div style={styles.dropContent}>
            <div style={styles.uploadIcon}>+</div>
            <span style={styles.dropText}>Click or drag photos here</span>
            <span style={styles.dropHint}>jpg, png, webp — max 5MB each</span>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && <p style={styles.error}>{error}</p>}

      {/* Image previews */}
      {images.length > 0 && (
        <div style={styles.previewGrid}>
          {images.map((url, i) => (
            <div key={i} style={styles.previewItem}>
              <img src={url} alt={`Upload ${i + 1}`} style={styles.previewImg} />
              <button
                type="button"
                onClick={() => removeImage(i)}
                style={styles.removeBtn}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  dropZone: {
    border: "1.5px dashed var(--border)",
    borderRadius: "10px",
    padding: "2rem",
    cursor: "pointer",
    textAlign: "center",
    transition: "border-color .15s",
    background: "var(--bg)",
  },
  dropContent: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" },
  uploadIcon: { fontSize: "1.5rem", color: "var(--text-muted)", lineHeight: 1 },
  dropText: { fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 },
  dropHint: { fontSize: "12px", color: "var(--text-muted)" },
  uploadingState: { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", color: "var(--text-secondary)", fontSize: "14px" },
  error: { fontSize: "12px", color: "#dc2626", marginTop: "6px" },
  previewGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginTop: "12px" },
  previewItem: { position: "relative", borderRadius: "8px", overflow: "hidden", aspectRatio: "4/3" },
  previewImg: { width: "100%", height: "100%", objectFit: "cover" },
  removeBtn: {
    position: "absolute", top: "4px", right: "4px",
    width: "22px", height: "22px", borderRadius: "50%",
    border: "none", background: "rgba(0,0,0,0.6)",
    color: "white", fontSize: "10px", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
};