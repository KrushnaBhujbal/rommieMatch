import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
 
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
 
  function handleLogout() {
    logout();
    navigate("/login");
  }
 
  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.logo}>RoomieMatch</Link>
 
      <div style={styles.right}>
        {/* Role badge */}
        <span style={{
          ...styles.roleBadge,
          ...(user?.role === "lister" ? styles.listerBadge : styles.seekerBadge)
        }}>
          {user?.role}
        </span>
        <button
        onClick={() => navigate("/messages")}
        style={styles.msgBtn}
        >
        Messages
        </button>
 
        {/* User name */}
        <span style={styles.name}>{user?.name}</span>
 
        {/* Logout */}
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Log out
        </button>
      </div>
    </nav>
  );
}
 
const styles = {
  nav: {
    background: "var(--surface)",
    borderBottom: "1px solid var(--border)",
    padding: "0 1.5rem",
    height: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  msgBtn: {
  fontSize: "13px", padding: "6px 14px",
  borderRadius: "8px", border: "1px solid var(--border)",
  background: "transparent", cursor: "pointer",
  color: "var(--text-secondary)",
},
  logo: {
    fontFamily: "var(--font-display)",
    fontSize: "1.2rem",
    color: "var(--text-primary)",
    textDecoration: "none",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  roleBadge: {
    fontSize: "11px",
    fontWeight: 500,
    padding: "3px 10px",
    borderRadius: "20px",
    textTransform: "capitalize",
  },
  listerBadge: {
    background: "#EAF3DE",
    color: "#27500A",
  },
  seekerBadge: {
    background: "#E6F1FB",
    color: "#0C447C",
  },
  name: {
    fontSize: "13px",
    color: "var(--text-secondary)",
  },
  logoutBtn: {
    fontSize: "13px",
    padding: "6px 14px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "transparent",
    cursor: "pointer",
    color: "var(--text-secondary)",
    transition: "all .15s",
  },
};