import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";

export default function SeekerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedListings, setSavedListings] = useState([]);
  const [savedIds, setSavedIds]           = useState([]);
  const [loadingSaved, setLoadingSaved]   = useState(true);
  const [activeTab, setActiveTab]         = useState("overview");

  useEffect(() => {
    axios.get("/api/saved-listings")
      .then(res => {
        setSavedListings(res.data.savedListings);
        setSavedIds(res.data.savedListings.map(l => l.id));
      })
      .catch(() => {})
      .finally(() => setLoadingSaved(false));
  }, []);

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
          <StatCard label="Saved listings" value={savedListings.length} />
          <StatCard label="Messages sent"  value={0} />
          <StatCard label="Rooms viewed"   value={0} />
        </div>
        <div style={styles.tabRow}>
          {["overview", "saved"].map(tab => (
            <button key={tab}
              style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
              onClick={() => setActiveTab(tab)}>
              {tab === "overview" ? "Overview" : `Saved listings (${savedListings.length})`}
            </button>
          ))}
        </div>
        {activeTab === "overview" && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Browse rooms</h3>
              <button style={styles.primaryBtn} onClick={() => navigate("/listings")}>Browse rooms</button>
            </div>
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>
                {savedListings.length > 0
                  ? `You have ${savedListings.length} saved listing${savedListings.length > 1 ? "s" : ""}. Check the Saved tab.`
                  : "Browse rooms and heart the ones you like — they'll appear here."}
              </p>
            </div>
          </div>
        )}
        {activeTab === "saved" && (
          <div>
            {loadingSaved ? (
              <p style={styles.emptyText}>Loading...</p>
            ) : savedListings.length === 0 ? (
              <div style={styles.section}>
                <div style={styles.emptyState}>
                  <p style={styles.emptyText}>No saved listings yet.</p>
                  <button style={styles.primaryBtn} onClick={() => navigate("/listings")}>Browse rooms</button>
                </div>
              </div>
            ) : (
              <div style={styles.grid}>
                {savedListings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} isSaved={savedIds.includes(listing.id)} />
                ))}
              </div>
            )}
          </div>
        )}
        <div style={styles.infoCard}>
          <div style={styles.infoRow}><span style={styles.infoLabel}>Email</span><span style={styles.infoValue}>{user?.email}</span></div>
          <div style={styles.infoRow}><span style={styles.infoLabel}>Role</span><span style={styles.infoValue}>{user?.role}</span></div>
          <div style={styles.infoRow}><span style={styles.infoLabel}>Verified</span><span style={styles.infoValue}>{user?.is_verified ? "Yes" : "Not yet"}</span></div>
          <div style={{ ...styles.infoRow, borderBottom: "none" }}>
            <span style={styles.infoLabel}>Member since</span>
            <span style={styles.infoValue}>{user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}</span>
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
  tabRow: { display: "flex", gap: "4px", borderBottom: "1px solid var(--border)" },
  tab: { padding: "8px 16px", border: "none", background: "transparent", fontSize: "13px", color: "var(--text-secondary)", cursor: "pointer", borderBottom: "2px solid transparent", marginBottom: "-1px" },
  tabActive: { color: "var(--text-primary)", borderBottom: "2px solid var(--text-primary)", fontWeight: 500 },
  section: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.25rem" },
  sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" },
  sectionTitle: { fontSize: "15px", fontWeight: 500 },
  primaryBtn: { padding: "8px 18px", borderRadius: "8px", border: "none", background: "var(--accent)", color: "#fff", fontSize: "13px", fontWeight: 500, cursor: "pointer" },
  emptyState: { textAlign: "center", padding: "1.5rem 0" },
  emptyText: { fontSize: "14px", color: "var(--text-secondary)", marginBottom: "12px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" },
  infoCard: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" },
  infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 1.25rem", borderBottom: "1px solid var(--border)" },
  infoLabel: { fontSize: "13px", color: "var(--text-secondary)" },
  infoValue: { fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 },
};