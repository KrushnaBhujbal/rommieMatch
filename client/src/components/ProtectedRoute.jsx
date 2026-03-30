import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
 
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
 
  // Still checking localStorage / verifying token — don't redirect yet
  if (loading) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100dvh", color:"var(--text-muted)", fontFamily:"var(--font-body)" }}>
        Loading...
      </div>
    );
  }
 
  // No user — send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
 
  // Logged in — render the page
  return children;
}
 