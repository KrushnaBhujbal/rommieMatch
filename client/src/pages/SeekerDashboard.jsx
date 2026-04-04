import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function SeekerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.welcome}>
          <div>
            <h2 style={styles.heading}>Welcome back, {user?.name?.split(" ")[0]}</h2>
            <p style={styles.subheading}>Find your perfect room and connect with listers</p>
          </div>
        </div>
        <div style={styles.statsGrid}>
          <StatCard label="Saved listings" value={0} />
          <StatCard label="Messages sent" value={0} />
          <StatCard label="Rooms viewed" value={0} />
        </div>
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Browse rooms</h3>
            <button style={styles.primaryBtn} onClick={() => navigate("/listings")}>Browse rooms</button>
          </div>
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No listings to browse yet.</p>
            <p style={styles.comingSoon}>Search + listings coming in Week 2</p>
          </div>
        </div>
        <div style={styles.infoCard}>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Email</span>
            <span style={styles.infoValue}>{user?.email}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Role</span>
            <span style={styles.infoValue}>{user?.role}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Verified</span>
            <span style={styles.infoValue}>{user?.is_verified ? "Yes" : "Not yet"}</span>
          </div>
          <div style={{ ...styles.infoRow, borderBottom: "none" }}>
            <span style={styles.infoLabel}>Member since</span>
            <span style={styles.infoValue}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statNum}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100dvh", background: "var(--bg)" },
  main: { maxWidth: "720px", margin: "0 auto", padding: "2rem 1.25rem", display: "flex", flexDirection: "column", gap: "1.5rem" },
  welcome: { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  heading: { fontSize: "1.5rem", fontWeight: 500, marginBottom: "4px" },
  subheading: { fontSize: "13px", color: "var(--text-secondary)" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" },
  statCard: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.25rem", textAlign: "center" },
  statNum: { fontSize: "2rem", fontWeight: 500, color: "var(--text-primary)", marginBottom: "4px" },
  statLabel: { fontSize: "12px", color: "var(--text-secondary)" },
  section: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.25rem" },
  sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" },
  sectionTitle: { fontSize: "15px", fontWeight: 500 },
  primaryBtn: { padding: "8px 18px", borderRadius: "8px", border: "none", background: "var(--accent)", color: "#fff", fontSize: "13px", fontWeight: 500, cursor: "pointer" },
  emptyState: { textAlign: "center", padding: "2rem 0" },
  emptyText: { fontSize: "14px", color: "var(--text-secondary)", marginBottom: "6px" },
  comingSoon: { fontSize: "12px", color: "var(--text-muted)" },
  infoCard: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" },
  infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 1.25rem", borderBottom: "1px solid var(--border)" },
  infoLabel: { fontSize: "13px", color: "var(--text-secondary)" },
  infoValue: { fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 },
};