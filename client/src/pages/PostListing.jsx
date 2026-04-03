import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import ImageUploader from "../components/ImageUploader";
import ErrorBox from "../components/ErrorBox";
import Spinner from "../components/Spinner";

export default function PostListing() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title:          "",
    description:    "",
    rent:           "",
    city:           "",
    address:        "",
    available_from: "",
    bedrooms:       "1",
    bathrooms:      "1",
    furnished:      false,
    pets_allowed:   false,
  });

  const [images, setImages]       = useState([]);
  const [errors, setErrors]       = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading]     = useState(false);
  const [focused, setFocused]     = useState("");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  }

  function validate() {
    const e = {};
    if (!form.title.trim())       e.title          = "Title is required";
    if (!form.rent)                e.rent           = "Rent is required";
    else if (isNaN(form.rent) || Number(form.rent) <= 0)
                                   e.rent           = "Enter a valid rent amount";
    if (!form.city.trim())         e.city           = "City is required";
    if (!form.available_from)      e.available_from = "Available from date is required";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) return setErrors(fieldErrors);

    setLoading(true);
    try {
      const res = await axios.post("/api/listings", {
        ...form,
        rent:     Number(form.rent),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        images,
      });

      // Success — go to dashboard
      navigate("/dashboard", {
        state: { message: "Listing posted successfully!" }
      });

    } catch (err) {
      setServerError(err.response?.data?.error || "Failed to post listing");
    } finally {
      setLoading(false);
    }
  }

  function inputStyle(name) {
    return {
      ...styles.input,
      borderColor: errors[name]
        ? "#dc2626"
        : focused === name
        ? "#16a34a"
        : "var(--border)",
    };
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>

        <div style={styles.header}>
          <h2 style={styles.heading}>Post a room</h2>
          <p style={styles.subheading}>Fill in the details about your listing</p>
        </div>

        <ErrorBox message={serverError} />

        <form onSubmit={handleSubmit} style={styles.form} noValidate>

          {/* ── Basic info ── */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Basic info</h3>

            <div style={styles.field}>
              <label style={styles.label}>Title</label>
              <input
                name="title"
                placeholder="e.g. Sunny room near UT Arlington"
                value={form.title}
                onChange={handleChange}
                onFocus={() => setFocused("title")}
                onBlur={() => setFocused("")}
                style={inputStyle("title")}
                disabled={loading}
              />
              {errors.title && <span style={styles.fieldError}>{errors.title}</span>}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                name="description"
                placeholder="Describe the room, amenities, neighbourhood..."
                value={form.description}
                onChange={handleChange}
                onFocus={() => setFocused("description")}
                onBlur={() => setFocused("")}
                style={{ ...inputStyle("description"), minHeight: "100px", resize: "vertical" }}
                disabled={loading}
              />
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Monthly rent ($)</label>
                <input
                  name="rent"
                  type="number"
                  placeholder="750"
                  value={form.rent}
                  onChange={handleChange}
                  onFocus={() => setFocused("rent")}
                  onBlur={() => setFocused("")}
                  style={inputStyle("rent")}
                  disabled={loading}
                  min="0"
                />
                {errors.rent && <span style={styles.fieldError}>{errors.rent}</span>}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Available from</label>
                <input
                  name="available_from"
                  type="date"
                  value={form.available_from}
                  onChange={handleChange}
                  onFocus={() => setFocused("available_from")}
                  onBlur={() => setFocused("")}
                  style={inputStyle("available_from")}
                  disabled={loading}
                />
                {errors.available_from && <span style={styles.fieldError}>{errors.available_from}</span>}
              </div>
            </div>
          </div>

          {/* ── Location ── */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Location</h3>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>City</label>
                <input
                  name="city"
                  placeholder="Arlington"
                  value={form.city}
                  onChange={handleChange}
                  onFocus={() => setFocused("city")}
                  onBlur={() => setFocused("")}
                  style={inputStyle("city")}
                  disabled={loading}
                />
                {errors.city && <span style={styles.fieldError}>{errors.city}</span>}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Address (optional)</label>
                <input
                  name="address"
                  placeholder="123 Main St"
                  value={form.address}
                  onChange={handleChange}
                  onFocus={() => setFocused("address")}
                  onBlur={() => setFocused("")}
                  style={inputStyle("address")}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* ── Details ── */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Room details</h3>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Bedrooms</label>
                <select
                  name="bedrooms"
                  value={form.bedrooms}
                  onChange={handleChange}
                  style={inputStyle("bedrooms")}
                  disabled={loading}
                >
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Bathrooms</label>
                <select
                  name="bathrooms"
                  value={form.bathrooms}
                  onChange={handleChange}
                  style={inputStyle("bathrooms")}
                  disabled={loading}
                >
                  {[1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <div style={styles.checkboxRow}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="furnished"
                  checked={form.furnished}
                  onChange={handleChange}
                  disabled={loading}
                />
                Furnished
              </label>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="pets_allowed"
                  checked={form.pets_allowed}
                  onChange={handleChange}
                  disabled={loading}
                />
                Pets allowed
              </label>
            </div>
          </div>

          {/* ── Photos ── */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Photos</h3>
            <p style={styles.photoHint}>Upload at least one photo. Good photos get more enquiries.</p>
            <ImageUploader images={images} setImages={setImages} />
          </div>

          {/* ── Submit ── */}
          <div style={styles.submitRow}>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              style={styles.cancelBtn}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading
                ? <span style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <Spinner size={16} color="white" /> Posting...
                  </span>
                : "Post listing"}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: "100dvh", background: "var(--bg)" },
  main: { maxWidth: "640px", margin: "0 auto", padding: "2rem 1.25rem 4rem" },
  header: { marginBottom: "1.5rem" },
  heading: { fontSize: "1.5rem", fontWeight: 500, marginBottom: "4px" },
  subheading: { fontSize: "13px", color: "var(--text-secondary)" },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  section: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" },
  sectionTitle: { fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "4px" },
  field: { display: "flex", flexDirection: "column", gap: "5px", flex: 1 },
  label: { fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" },
  input: { padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "14px", background: "var(--bg)", color: "var(--text-primary)", outline: "none", transition: "border-color .15s", width: "100%" },
  fieldError: { fontSize: "12px", color: "#dc2626" },
  row: { display: "flex", gap: "12px" },
  checkboxRow: { display: "flex", gap: "1.5rem" },
  checkboxLabel: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-secondary)", cursor: "pointer" },
  photoHint: { fontSize: "12px", color: "var(--text-muted)", marginTop: "-8px" },
  submitRow: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "0.5rem" },
  cancelBtn: { padding: "10px 20px", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", fontSize: "14px", cursor: "pointer", color: "var(--text-secondary)" },
  submitBtn: { padding: "10px 24px", borderRadius: "8px", border: "none", background: "var(--accent)", color: "#fff", fontSize: "14px", fontWeight: 500, cursor: "pointer" },
};