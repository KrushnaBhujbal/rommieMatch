import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";
import LoadingSkeleton from "../components/LoadingSkeleton";

export default function Listings() {
  const { user,loading: authLoading} = useAuth();
  const [listings, setListings]     = useState([]);
  const [savedIds, setSavedIds]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const city    = searchParams.get("city")    || "";
  const maxRent = searchParams.get("maxRent") || "";

  const [cityInput,    setCityInput]    = useState(city);
  const [maxRentInput, setMaxRentInput] = useState(maxRent);

useEffect(() => {
  if (authLoading) return;
  if (!user || user.role !== "seeker") return;

  axios.get("/api/saved-listings/ids")
    .then(res => setSavedIds(res.data.savedIds))
    .catch(() => {});
}, [authLoading, user?.id]); 

  

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (city)    params.city    = city;
      if (maxRent) params.maxRent = maxRent;
      const res = await axios.get("/api/listings", { params });
      setListings(res.data.listings);
    } catch {
      setError("Failed to load listings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [city, maxRent]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = {};
      if (cityInput)    params.city    = cityInput;
      if (maxRentInput) params.maxRent = maxRentInput;
      setSearchParams(params);
    }, 400);
    return () => clearTimeout(timer);
  }, [cityInput, maxRentInput]);

  function clearFilters() {
    setCityInput(""); setMaxRentInput(""); setSearchParams({});
  }

  const hasFilters = city || maxRent;

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.header}>
          <h2 style={styles.heading}>Browse rooms</h2>
          <p style={styles.subheading}>
            {loading ? "Loading..." : `${listings.length} listing${listings.length !== 1 ? "s" : ""} available`}
          </p>
        </div>
        <div style={styles.filterBar}>
          <input placeholder="Search by city..." value={cityInput}
            onChange={e => setCityInput(e.target.value)} style={styles.filterInput} />
          <div style={styles.rentFilter}>
            <label style={styles.filterLabel}>Max rent</label>
            <input type="number" placeholder="Any" value={maxRentInput}
              onChange={e => setMaxRentInput(e.target.value)}
              style={{ ...styles.filterInput, width: "120px" }} min="0" />
          </div>
          {hasFilters && <button onClick={clearFilters} style={styles.clearBtn}>Clear filters</button>}
        </div>
        {error && <div style={styles.errorBox}>{error}</div>}
        {loading ? <LoadingSkeleton count={6} /> : listings.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyTitle}>No listings found</p>
            <p style={styles.emptyText}>{hasFilters ? "Try adjusting your filters" : "No rooms available right now"}</p>
            {hasFilters && <button onClick={clearFilters} style={styles.clearBtn}>Clear filters</button>}
          </div>
        ) : (
          <div style={styles.grid}>
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} isSaved={savedIds.includes(listing.id)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: "100dvh", background: "var(--bg)" },
  main: { maxWidth: "960px", margin: "0 auto", padding: "2rem 1.25rem" },
  header: { marginBottom: "1.5rem" },
  heading: { fontSize: "1.5rem", fontWeight: 500, marginBottom: "4px" },
  subheading: { fontSize: "13px", color: "var(--text-secondary)" },
  filterBar: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "1.5rem", padding: "14px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)" },
  filterInput: { padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px", background: "var(--bg)", color: "var(--text-primary)", outline: "none", flex: 1, minWidth: "140px" },
  rentFilter: { display: "flex", alignItems: "center", gap: "8px" },
  filterLabel: { fontSize: "12px", color: "var(--text-secondary)", whiteSpace: "nowrap" },
  clearBtn: { padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", fontSize: "12px", color: "var(--text-secondary)", cursor: "pointer", whiteSpace: "nowrap" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" },
  emptyState: { textAlign: "center", padding: "4rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" },
  emptyTitle: { fontSize: "16px", fontWeight: 500, color: "var(--text-primary)" },
  emptyText: { fontSize: "13px", color: "var(--text-secondary)" },
  errorBox: { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", marginBottom: "1rem" },
};