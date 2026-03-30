import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SeekerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <span style={styles.logo}>RoomieMatch</span>
        <div style={styles.navRight}>
          <span style={styles.navName}>{user?.name}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Log out</button>
        </div>
      </nav>

      <main style={styles.main}>
        <div style={styles.welcome}>
          <h2 style={styles.heading}>Welcome back, {user?.name?.split(" ")[0]}</h2>
          <span style={styles.roleBadge}>Seeker</span>
        </div>

        <div style={styles.cardGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNum}>0</div>
            <div style={styles.statLabel}>Saved listings</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNum}>0</div>
            <div style={styles.statLabel}>Messages sent</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNum}>0</div>
            <div style={styles.statLabel}>Rooms viewed</div>
          </div>
        </div>

        <div style={styles.emptySection}>
          <p style={styles.emptyText}>No listings to browse yet.</p>
          <button style={styles.primaryBtn}>
            Browse rooms
          </button>
          <p style={styles.comingSoon}>Search + listings coming in Week 2</p>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight:"100dvh", background:"var(--bg)" },
  nav: { background:"var(--surface)", borderBottom:"1px solid var(--border)", padding:"0 1.5rem", height:"56px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  logo: { fontFamily:"var(--font-display)", fontSize:"1.2rem" },
  navRight: { display:"flex", alignItems:"center", gap:"1rem" },
  navName: { fontSize:"13px", color:"var(--text-secondary)" },
  logoutBtn: { fontSize:"13px", padding:"6px 14px", borderRadius:"8px", border:"1px solid var(--border)", background:"transparent", cursor:"pointer", color:"var(--text-secondary)" },
  main: { maxWidth:"680px", margin:"0 auto", padding:"2rem 1.25rem" },
  welcome: { display:"flex", alignItems:"center", gap:"12px", marginBottom:"1.5rem" },
  heading: { fontSize:"1.4rem", fontWeight:500 },
  roleBadge: { fontSize:"11px", fontWeight:500, padding:"3px 10px", borderRadius:"20px", background:"#E6F1FB", color:"#0C447C" },
  cardGrid: { display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"12px", marginBottom:"2rem" },
  statCard: { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"1rem", textAlign:"center" },
  statNum: { fontSize:"1.8rem", fontWeight:500, marginBottom:"4px" },
  statLabel: { fontSize:"12px", color:"var(--text-secondary)" },
  emptySection: { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"2rem", textAlign:"center" },
  emptyText: { color:"var(--text-secondary)", fontSize:"14px", marginBottom:"1rem" },
  primaryBtn: { padding:"10px 24px", borderRadius:"8px", border:"none", background:"var(--accent)", color:"#fff", fontSize:"14px", fontWeight:500, cursor:"pointer" },
  comingSoon: { marginTop:"12px", fontSize:"12px", color:"var(--text-muted)" },
};