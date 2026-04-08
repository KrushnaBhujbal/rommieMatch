import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ListerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const [listingCount, setListingCount]   = useState(0);
  const [conversations, setConversations] = useState([]);
  const [loadingConvs, setLoadingConvs]   = useState(true);

  useEffect(() => {
    axios.get("/api/listings")
      .then(res => {
        const mine = res.data.listings.filter(l => l.lister_id === user?.id);
        setListingCount(mine.length);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    axios.get("/api/messages/conversations")
      .then(res => setConversations(res.data.conversations))
      .catch(() => {})
      .finally(() => setLoadingConvs(false));
  }, []);

  return (
    <div style={styles.page}>
      <Navbar />

      {successMessage && (
        <div style={styles.successBanner}>{successMessage}</div>
      )}

      <main style={styles.main}>
        <div style={styles.welcome}>
          <div>
            <h2 style={styles.heading}>Welcome back, {user?.name?.split(" ")[0]}</h2>
            <p style={styles.subheading}>Manage your listings and track enquiries</p>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <StatCard label="Active listings"    value={listingCount} />
          <StatCard label="Enquiries received" value={conversations.length} />
          <StatCard label="Profile views"      value={0} />
        </div>

        {/* Listings section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Your listings</h3>
            <button style={styles.primaryBtn} onClick={() => navigate("/post-listing")}>
              + Post a room
            </button>
          </div>
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>
              {listingCount > 0
                ? `You have ${listingCount} active listing${listingCount > 1 ? "s" : ""}.`
                : "No listings yet."}
            </p>
            {listingCount === 0 && (
              <p style={styles.comingSoon}>Click "+ Post a room" to create your first listing.</p>
            )}
          </div>
        </div>

        {/* Messages section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Recent messages</h3>
            <button style={styles.primaryBtn} onClick={() => navigate("/messages")}>
              View all
            </button>
          </div>

          {loadingConvs ? (
            <p style={styles.emptyText}>Loading...</p>
          ) : conversations.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>No messages yet.</p>
              <p style={styles.comingSoon}>When seekers message you, conversations appear here.</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {conversations.slice(0, 3).map(conv => (
                <div
                  key={`${conv.listing_id}-${conv.other_user_id}`}
                  onClick={() => navigate(`/messages/${conv.listing_id}/${conv.other_user_id}`)}
                  style={styles.convRow}
                >
                  <div style={styles.convAvatar}>
                    {conv.other_user_name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={styles.convName}>{conv.other_user_name}</div>
                    <div style={styles.convPreview}>
                      {conv.listing_title} — {conv.content}
                    </div>
                  </div>
                  {!conv.is_read && conv.receiver_id === user?.id && (
                    <div style={styles.unreadDot} />
                  )}
                </div>
              ))}
              {conversations.length > 3 && (
                <button
                  onClick={() => navigate("/messages")}
                  style={styles.viewMoreBtn}
                >
                  View {conversations.length - 3} more conversation{conversations.length - 3 > 1 ? "s" : ""}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Account info */}
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
          <div style={{ ...styles.infoRow, borderBottom:"none" }}>
            <span style={styles.infoLabel}>Member since</span>
            <span style={styles.infoValue}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month:"long", year:"numeric" }) : "—"}
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
  page: { minHeight:"100dvh", background:"var(--bg)" },
  successBanner: { background:"#f0fdf4", border:"1px solid #bbf7d0", color:"#15803d", padding:"12px 1.5rem", fontSize:"13px", textAlign:"center" },
  main: { maxWidth:"720px", margin:"0 auto", padding:"2rem 1.25rem", display:"flex", flexDirection:"column", gap:"1.5rem" },
  welcome: { display:"flex", alignItems:"flex-start", justifyContent:"space-between" },
  heading: { fontSize:"1.5rem", fontWeight:500, marginBottom:"4px" },
  subheading: { fontSize:"13px", color:"var(--text-secondary)" },
  statsGrid: { display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"12px" },
  statCard: { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"1.25rem", textAlign:"center" },
  statNum: { fontSize:"2rem", fontWeight:500, color:"var(--text-primary)", marginBottom:"4px" },
  statLabel: { fontSize:"12px", color:"var(--text-secondary)" },
  section: { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"1.25rem" },
  sectionHeader: { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.25rem" },
  sectionTitle: { fontSize:"15px", fontWeight:500 },
  primaryBtn: { padding:"8px 18px", borderRadius:"8px", border:"none", background:"var(--accent)", color:"#fff", fontSize:"13px", fontWeight:500, cursor:"pointer" },
  emptyState: { textAlign:"center", padding:"1.5rem 0" },
  emptyText: { fontSize:"14px", color:"var(--text-secondary)", marginBottom:"6px" },
  comingSoon: { fontSize:"12px", color:"var(--text-muted)" },
  convRow: { display:"flex", alignItems:"center", gap:"12px", padding:"10px 12px", borderRadius:"8px", border:"1px solid var(--border)", cursor:"pointer", background:"var(--bg)", transition:"background .15s" },
  convAvatar: { width:"32px", height:"32px", borderRadius:"50%", background:"#E6F1FB", color:"#0C447C", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:500, flexShrink:0 },
  convName: { fontSize:"13px", fontWeight:500, color:"var(--text-primary)" },
  convPreview: { fontSize:"12px", color:"var(--text-secondary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  unreadDot: { width:"8px", height:"8px", borderRadius:"50%", background:"#378ADD", flexShrink:0 },
  viewMoreBtn: { fontSize:"12px", color:"var(--text-secondary)", background:"none", border:"none", cursor:"pointer", textAlign:"center", padding:"4px" },
  infoCard: { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius)", overflow:"hidden" },
  infoRow: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 1.25rem", borderBottom:"1px solid var(--border)" },
  infoLabel: { fontSize:"13px", color:"var(--text-secondary)" },
  infoValue: { fontSize:"13px", color:"var(--text-primary)", fontWeight:500 },
};