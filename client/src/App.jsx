import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ListerDashboard from "./pages/ListerDashboard";
import SeekerDashboard from "./pages/SeekerDashboard";
import PostListing from "./pages/PostListing";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import Messages     from "./pages/Messages";
import Conversation from "./pages/Conversation";

function Dashboard() {
  const { user } = useAuth();
  if (user?.role === "lister") return <ListerDashboard />;
  return <SeekerDashboard />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login"    element={<Login />} />

          <Route path="/listings"     element={<Listings />} />
          <Route path="/listings/:id" element={<ListingDetail />} />

          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/post-listing"
            element={<RoleRoute role="lister"><PostListing /></RoleRoute>}
          />
          <Route
            path="/lister"
            element={<RoleRoute role="lister"><ListerDashboard /></RoleRoute>}
          />
          <Route
            path="/seeker"
            element={<RoleRoute role="seeker"><SeekerDashboard /></RoleRoute>}
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

          <Route path="/messages"                      element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/messages/:listingId/:otherUserId" element={<ProtectedRoute><Conversation /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}