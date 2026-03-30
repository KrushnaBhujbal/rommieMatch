import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
 
// Usage: <RoleRoute role="lister"><SomePage /></RoleRoute>
export default function RoleRoute({ role, children }) {
  const { user, loading } = useAuth();
 
  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100dvh", color: "var(--text-muted)", fontFamily: "var(--font-body)"
      }}>
        Loading...
      </div>
    );
  }
 
  // Not logged in at all
  if (!user) return <Navigate to="/login" replace />;
 
  // Logged in but wrong role
  if (user.role !== role) return <Navigate to="/dashboard" replace />;
 
  return children;
}
 