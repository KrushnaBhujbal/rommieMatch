import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function SaveButton({ listingId, initialSaved = false }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  setSaved(initialSaved);
  }, [initialSaved]);

  // Only seekers can save listings
  if (!user || user.role !== "seeker") return null;

  async function toggle(e) {
    // Stop the click bubbling up to the listing card (which would navigate away)
    e.stopPropagation();
    if (loading) return;

    // Optimistic update — change UI immediately before API responds
    setSaved(prev => !prev);
    setLoading(true);

    try {
      if (saved) {
        await axios.delete(`/api/saved-listings/${listingId}`);
      } else {
        await axios.post(`/api/saved-listings/${listingId}`);
      }
    } catch {
      // If API fails — revert the optimistic update
      setSaved(prev => !prev);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      style={{
        ...styles.btn,
        color: saved ? "#dc2626" : "var(--text-muted)",
        borderColor: saved ? "#fecaca" : "var(--border)",
        background: saved ? "#fef2f2" : "var(--surface)",
      }}
      aria-label={saved ? "Unsave listing" : "Save listing"}
      title={saved ? "Remove from saved" : "Save listing"}
    >
      {saved ? "♥" : "♡"}
    </button>
  );
}

const styles = {
  btn: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all .15s",
    flexShrink: 0,
  },
};