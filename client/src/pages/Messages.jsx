import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";

export default function Messages() {
  const { user }                          = useAuth();
  const navigate                          = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");

  useEffect(() => {
    axios.get("/api/messages/conversations")
      .then(res => setConversations(res.data.conversations))
      .catch(() => setError("Failed to load conversations"))
      .finally(() => setLoading(false));
  }, []);

  function formatTime(dateStr) {
    const date = new Date(dateStr);
    const now  = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    const hrs  = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1)   return "Just now";
    if (mins < 60)  return `${mins}m ago`;
    if (hrs  < 24)  return `${hrs}h ago`;
    return `${days}d ago`;
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <h2 style={styles.heading}>Messages</h2>

        {loading ? (
          <div style={styles.centered}><Spinner size={24} /></div>
        ) : error ? (
          <div style={styles.errorBox}>{error}</div>
        ) : conversations.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyTitle}>No messages yet</p>
            <p style={styles.emptyText}>
              {user?.role === "seeker"
                ? "Message a lister from any listing page to start a conversation."
                : "When seekers message you about your listings, conversations will appear here."}
            </p>
          </div>
        ) : (
          <div style={styles.list}>
            {conversations.map(conv => (
              <div
                key={`${conv.listing_id}-${conv.other_user_id}`}
                style={{
                  ...styles.convRow,
                  background: !conv.is_read && conv.receiver_id === user?.id
                    ? "var(--color-background-info, #E6F1FB)"
                    : "var(--surface)",
                }}
                onClick={() => navigate(`/messages/${conv.listing_id}/${conv.other_user_id}`)}
              >
                {/* Avatar */}
                <div style={styles.avatar}>
                  {conv.other_user_name?.[0]?.toUpperCase()}
                </div>

                {/* Content */}
                <div style={styles.convContent}>
                  <div style={styles.convTop}>
                    <span style={styles.convName}>{conv.other_user_name}</span>
                    <span style={styles.convTime}>{formatTime(conv.created_at)}</span>
                  </div>
                  <div style={styles.convListing}>{conv.listing_title}</div>
                  <div style={styles.convPreview}>
                    {conv.sender_id === user?.id ? "You: " : ""}{conv.content}
                  </div>
                </div>

                {/* Unread dot */}
                {!conv.is_read && conv.receiver_id === user?.id && (
                  <div style={styles.unreadDot} />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: "100dvh", background: "var(--bg)" },
  main: { maxWidth: "640px", margin: "0 auto", padding: "2rem 1.25rem" },
  heading: { fontSize: "1.5rem", fontWeight: 500, marginBottom: "1.5rem" },
  centered: { display: "flex", justifyContent: "center", padding: "3rem" },
  errorBox: { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: "8px", padding: "12px 16px", fontSize: "13px" },
  emptyState: { textAlign: "center", padding: "4rem 1rem" },
  emptyTitle: { fontSize: "16px", fontWeight: 500, marginBottom: "8px" },
  emptyText: { fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 },
  list: { display: "flex", flexDirection: "column", gap: "2px" },
  convRow: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "14px 16px", borderRadius: "var(--radius)",
    cursor: "pointer", transition: "background .15s",
    border: "1px solid var(--border)",
  },
  avatar: {
    width: "44px", height: "44px", borderRadius: "50%",
    background: "#E6F1FB", color: "#0C447C",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "16px", fontWeight: 500, flexShrink: 0,
  },
  convContent: { flex: 1, minWidth: 0 },
  convTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" },
  convName: { fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" },
  convTime: { fontSize: "11px", color: "var(--text-muted)" },
  convListing: { fontSize: "12px", color: "var(--text-secondary)", marginBottom: "2px" },
  convPreview: { fontSize: "13px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  unreadDot: { width: "8px", height: "8px", borderRadius: "50%", background: "#378ADD", flexShrink: 0 },
};