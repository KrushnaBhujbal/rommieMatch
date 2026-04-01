import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import ErrorBox from "../components/ErrorBox";
import Spinner from "../components/Spinner";

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]               = useState({ name:"", email:"", password:"", role:"seeker" });
  const [errors, setErrors]           = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading]         = useState(false);
  const [focused, setFocused]         = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  }

  function validate() {
    const e = {};
    if (!form.name.trim())  e.name     = "Name is required";
    if (!form.email)        e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password)     e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) return setErrors(fieldErrors);

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/register", form);
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.error;
      setServerError(msg === "Email already in use"
        ? "An account with this email already exists. Try logging in."
        : msg || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function inputStyle(name) {
    return {
      ...styles.input,
      borderColor: errors[name] ? "#dc2626" : focused === name ? "#16a34a" : "var(--border)",
    };
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>RoomieMatch</h1>
        <p style={styles.subtitle}>Create your account</p>
        <ErrorBox message={serverError} />
        <form onSubmit={handleSubmit} style={styles.form} noValidate>

          <div style={styles.field}>
            <label style={styles.label}>Full name</label>
            <input name="name" type="text" placeholder="Alex Johnson"
              value={form.name} onChange={handleChange}
              onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
              style={inputStyle("name")} disabled={loading} />
            {errors.name && <span style={styles.fieldError}>{errors.name}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input name="email" type="email" placeholder="alex@example.com"
              value={form.email} onChange={handleChange}
              onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
              style={inputStyle("email")} disabled={loading} />
            {errors.email && <span style={styles.fieldError}>{errors.email}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input name="password" type="password" placeholder="Min. 8 characters"
              value={form.password} onChange={handleChange}
              onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
              style={inputStyle("password")} disabled={loading} />
            {errors.password && <span style={styles.fieldError}>{errors.password}</span>}
            {form.password && (
              <div style={styles.strengthBar}>
                <div style={{
                  ...styles.strengthFill,
                  width: form.password.length >= 12 ? "100%" : form.password.length >= 8 ? "60%" : "30%",
                  background: form.password.length >= 12 ? "#16a34a" : form.password.length >= 8 ? "#ca8a04" : "#dc2626",
                }} />
              </div>
            )}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>I want to...</label>
            <div style={styles.roleRow}>
              {["seeker", "lister"].map((r) => (
                <button key={r} type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  style={{ ...styles.roleBtn, ...(form.role === r ? styles.roleBtnActive : {}) }}>
                  {r === "seeker" ? "Find a room" : "List a room"}
                </button>
              ))}
            </div>
          </div>

          <button type="submit"
            style={{ ...styles.submit, opacity: loading ? 0.7 : 1 }}
            disabled={loading}>
            {loading
              ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}><Spinner size={16} color="white" /> Creating account...</span>
              : "Create account"}
          </button>

        </form>
        <p style={styles.footer}>Already have an account? <Link to="/login" style={styles.link}>Sign in</Link></p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight:"100dvh", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" },
  card: { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"2rem", width:"100%", maxWidth:"400px" },
  title: { fontFamily:"var(--font-display)", fontSize:"1.8rem", fontWeight:400, marginBottom:"4px" },
  subtitle: { color:"var(--text-secondary)", fontSize:"14px", marginBottom:"1.5rem" },
  form: { display:"flex", flexDirection:"column", gap:"1rem" },
  field: { display:"flex", flexDirection:"column", gap:"5px" },
  label: { fontSize:"13px", fontWeight:500, color:"var(--text-secondary)" },
  input: { padding:"10px 14px", borderRadius:"8px", border:"1px solid var(--border)", fontSize:"14px", background:"var(--bg)", color:"var(--text-primary)", transition:"border-color .15s", outline:"none" },
  fieldError: { fontSize:"12px", color:"#dc2626" },
  strengthBar: { height:"3px", background:"var(--border)", borderRadius:"10px", overflow:"hidden", marginTop:"4px" },
  strengthFill: { height:"100%", borderRadius:"10px", transition:"width .3s, background .3s" },
  roleRow: { display:"flex", gap:"8px" },
  roleBtn: { flex:1, padding:"10px", borderRadius:"8px", border:"1px solid var(--border)", background:"transparent", fontSize:"13px", cursor:"pointer", color:"var(--text-secondary)", transition:"all .15s" },
  roleBtnActive: { border:"1.5px solid var(--accent)", color:"var(--accent)", background:"#f0fdf4" },
  submit: { padding:"12px", borderRadius:"8px", border:"none", background:"var(--accent)", color:"#fff", fontSize:"14px", fontWeight:500, cursor:"pointer", marginTop:"0.25rem" },
  footer: { textAlign:"center", fontSize:"13px", color:"var(--text-secondary)", marginTop:"1.5rem" },
  link: { color:"var(--accent)", textDecoration:"none", fontWeight:500 },
};  