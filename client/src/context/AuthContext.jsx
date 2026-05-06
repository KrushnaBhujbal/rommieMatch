import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
 
// 1. Create the context object
const AuthContext = createContext(null);
 
// 2. Set axios base URL — all requests go to Express automatically
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "";
 
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
 
  // On app load — if a token exists in localStorage, fetch the current user
  useEffect(() => {
    if (token) {
      // Attach token to every axios request automatically
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
 
      axios.get("/api/auth/me")
        .then((res) => setUser(res.data.user))
        .catch(() => {
          // Token is invalid or expired — clear everything
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
          delete axios.defaults.headers.common["Authorization"];
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Intercept every axios response
    const interceptor = axios.interceptors.response.use(
      (response) => response, // success — pass through
      (error) => {
        // If any request returns 401 — token expired or invalid
        if (error.response?.status === 401) {
          // Don't logout if we're already on the login/register page
          const publicPaths = ["/login", "/register"];
          if (!publicPaths.includes(window.location.pathname)) {
            logout();
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup — remove interceptor when component unmounts
    return () => axios.interceptors.response.eject(interceptor);
  }, []);
 
  // Called after successful login or register
  function login(userData, jwt) {
    localStorage.setItem("token", jwt);
    axios.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
    setToken(jwt);
    setUser(userData);
  }
 
  // Called on logout
  function logout() {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  }
 
  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
 
// Custom hook — any component calls useAuth() to get user/login/logout
export function useAuth() {
  return useContext(AuthContext);
}