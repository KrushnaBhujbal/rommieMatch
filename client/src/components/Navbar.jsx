import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";

export default function Navbar() {
  const { user, logout }    = useAuth();
  const navigate            = useNavigate();
  const location            = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    axios.get("/api/messages/unread-count")
      .then(res => setUnread(res.data.unreadCount))
      .catch(() => {});
  }, [user, location.pathname]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const isOnMessages = location.pathname.startsWith("/messages");

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.logo}>RoomieMatch</Link>
      <div style={styles.right}>
        {user && (
          <span style={{
            ...styles.roleBadge,
            ...(user.role === "lister" ? styles.listerBadge : styles.seekerBadge)
          }}>
            {user.role}
          </span>
        )}
        {user && (
          <button
            onClick={() => navigate("/messages")}
            style={{
              ...styles.msgBtn,
              borderColor: isOnMessages ? "#16a34a" : "var(--border)",
              color: isOnMessages ? "#16a34a" : "var(--text-secondary)",
            }}
          >
            Messages
            {unread > 0 && (
              <span style={styles.badge}>{unread > 9 ? "9+" : unread}</span>
            )}
          </button>
        )}
        {user && <span style={styles.name}>{user?.name}</span>}
        {user && (
          <button onClick={handleLogout} style={styles.logoutBtn}>Log out</button>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: { background:"var(--surface)", borderBottom:"1px solid var(--border)", padding:"0 1.5rem", height:"56px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:10 },
  logo: { fontFamily:"var(--font-display)", fontSize:"1.2rem", color:"var(--text-primary)", textDecoration:"none" },
  right: { display:"flex", alignItems:"center", gap:"10px" },
  roleBadge: { fontSize:"11px", fontWeight:500, padding:"3px 10px", borderRadius:"20px", textTransform:"capitalize" },
  listerBadge: { background:"#EAF3DE", color:"#27500A" },
  seekerBadge: { background:"#E6F1FB", color:"#0C447C" },
  name: { fontSize:"13px", color:"var(--text-secondary)" },
  msgBtn: { fontSize:"13px", padding:"6px 14px", borderRadius:"8px", border:"1px solid var(--border)", background:"transparent", cursor:"pointer", color:"var(--text-secondary)", display:"flex", alignItems:"center", gap:"6px", transition:"all .15s" },
  badge: { background:"#dc2626", color:"white", fontSize:"10px", fontWeight:700, padding:"1px 5px", borderRadius:"10px", minWidth:"16px", textAlign:"center", lineHeight:"14px" },
  logoutBtn: { fontSize:"13px", padding:"6px 14px", borderRadius:"8px", border:"1px solid var(--border)", background:"transparent", cursor:"pointer", color:"var(--text-secondary)" },
};