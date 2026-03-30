import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ name:"", email:"", password:"", role:"seeker" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!form.name || !form.email || !form.password) {
      return setError("All fields are required");
    }
    if (form.password.length < 8) {
      return setError("Password must be at least 8 characters");
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/register", form);
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>RoomieMatch</h1>
        <p style={styles.subtitle}>Create your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full name</label>
            <input
              name="name"
              type="text"
              placeholder="Alex Johnson"
              value={form.name}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              name="email"
              type="email"
              placeholder="alex@example.com"
              value={form.email}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>I want to...</label>
            <div style={styles.roleRow}>
              {["seeker", "lister"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  style={{
                    ...styles.roleBtn,
                    ...(form.role === r ? styles.roleBtnActive : {}),
                  }}
                >
                  {r === "seeker" ? "Find a room" : "List a room"}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" style={styles.submit} disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight:"100dvh", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" },
  card: { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"2rem", width:"100%", maxWidth:"400px" },
  title: { fontFamily:"var(--font-display)", fontSize:"1.8rem", fontWeight:400, marginBottom:"4px" },
  subtitle: { color:"var(--text-secondary)", fontSize:"14px", marginBottom:"1.5rem" },
  error: { background:"#fef2f2", border:"1px solid #fecaca", color:"var(--danger)", borderRadius:"8px", padding:"10px 14px", fontSize:"13px", marginBottom:"1rem" },
  form: { display:"flex", flexDirection:"column", gap:"1rem" },
  field: { display:"flex", flexDirection:"column", gap:"6px" },
  label: { fontSize:"13px", fontWeight:500, color:"var(--text-secondary)" },
  input: { padding:"10px 14px", borderRadius:"8px", border:"1px solid var(--border)", fontSize:"14px", outline:"none", background:"var(--bg)", color:"var(--text-primary)" },
  roleRow: { display:"flex", gap:"8px" },
  roleBtn: { flex:1, padding:"10px", borderRadius:"8px", border:"1px solid var(--border)", background:"transparent", fontSize:"13px", cursor:"pointer", color:"var(--text-secondary)", transition:"all .15s" },
  roleBtnActive: { border:"1.5px solid var(--accent)", color:"var(--accent)", background:"#f0fdf4" },
  submit: { padding:"12px", borderRadius:"8px", border:"none", background:"var(--accent)", color:"#fff", fontSize:"14px", fontWeight:500, cursor:"pointer", marginTop:"0.5rem" },
  footer: { textAlign:"center", fontSize:"13px", color:"var(--text-secondary)", marginTop:"1.5rem" },
  link: { color:"var(--accent)", textDecoration:"none", fontWeight:500 },
};