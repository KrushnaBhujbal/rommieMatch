import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import ListingMap from "../components/ListingMap";

export default function ListingDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [listing, setListing]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    axios.get(`/api/listings/${id}`)
      .then(res => setListing(res.data.listing))
      .catch(err => {
        if (err.response?.status === 404) setError("This listing doesn't exist or has been removed.");
        else setError("Failed to load listing.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={styles.page}>
        <Navbar />
        <div style={styles.centered}>
          <Spinner size={28} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <Navbar />
        <div style={styles.centered}>
          <p style={styles.errorText}>{error}</p>
          <button onClick={() => navigate("/listings")} style={styles.backBtn}>
            Back to listings
          </button>
        </div>
      </div>
    );
  }

  const {
    title, description, rent, city, address,
    available_from, bedrooms, bathrooms,
    furnished, pets_allowed, images,
    lister_name, lister_verified, lister_since,
    created_at,
  } = listing;

  const availDate  = new Date(available_from).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const memberSince = new Date(lister_since).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>

        {/* Back link */}
        <button onClick={() => navigate("/listings")} style={styles.backLink}>
          ← Back to listings
        </button>

        {/* Image gallery */}
        {images?.length > 0 ? (
          <div style={styles.gallery}>
            <div style={styles.mainImgWrap}>
              <img src={images[activeImg]} alt={title} style={styles.mainImg} />
            </div>
            {images.length > 1 && (
              <div style={styles.thumbRow}>
                {images.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`View ${i + 1}`}
                    style={{
                      ...styles.thumb,
                      border: i === activeImg ? "2px solid var(--accent)" : "2px solid transparent",
                    }}
                    onClick={() => setActiveImg(i)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={styles.noImgBanner}>No photos provided</div>
        )}

        <div style={styles.contentGrid}>
          {/* Left — listing details */}
          <div style={styles.details}>
            <h1 style={styles.title}>{title}</h1>
            <p style={styles.location}>{address ? `${address}, ` : ""}{city}</p>

            {/* Price + availability */}
            <div style={styles.priceRow}>
              <span style={styles.price}>${Number(rent).toLocaleString()}</span>
              <span style={styles.priceLabel}>/month</span>
            </div>

            <p style={styles.availText}>Available from {availDate}</p>

            {/* Specs */}
            <div style={styles.specsGrid}>
              <SpecItem label="Bedrooms"  value={bedrooms} />
              <SpecItem label="Bathrooms" value={bathrooms} />
              <SpecItem label="Furnished" value={furnished ? "Yes" : "No"} />
              <SpecItem label="Pets"      value={pets_allowed ? "Allowed" : "Not allowed"} />
            </div>
            
            {/* Map */}
              <div style={styles.mapSection}>
                <h3 style={styles.descTitle}>Location</h3>
                <ListingMap
                  latitude={listing.latitude}
                  longitude={listing.longitude}
                  address={listing.address}
                  city={listing.city}
                />
              </div>


            {/* Description */}
            {description && (
              <div style={styles.descSection}>
                <h3 style={styles.descTitle}>About this room</h3>
                <p style={styles.desc}>{description}</p>
              </div>
            )}
          </div>

          {/* Right — lister card */}
          <div style={styles.listerCard}>
            <div style={styles.listerHeader}>
              <div style={styles.listerAvatar}>
                {lister_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={styles.listerName}>
                  {lister_name}
                  {lister_verified && <span style={styles.verifiedBadge}>✓ Verified</span>}
                </div>
                <div style={styles.listerSince}>Member since {memberSince}</div>
              </div>
            </div>

          <button
            style={styles.contactBtn}
            onClick={() => {
                if (!user) { navigate("/login"); return; }
                navigate(`/messages/${listing.id}/${listing.lister_id}`);
            }}
            >
            {user?.role === "lister" ? "View messages" : "Message lister"}
            </button>
            <p style={styles.contactHint}>
            {user ? "" : "Sign in to message the lister"}
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}

function SpecItem({ label, value }) {
  return (
    <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "8px", padding: "12px 14px" }}>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "3px", textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
      <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>{value}</div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100dvh", background: "var(--bg)" },
  main: { maxWidth: "900px", margin: "0 auto", padding: "1.5rem 1.25rem 4rem" },
  centered: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "50vh", gap: "16px" },
  errorText: { fontSize: "15px", color: "var(--text-secondary)" },
  backBtn: { padding: "8px 18px", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", fontSize: "13px", cursor: "pointer", color: "var(--text-secondary)" },
  backLink: { background: "none", border: "none", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer", marginBottom: "1.25rem", padding: 0 },
  gallery: { marginBottom: "2rem" },
  mapSection: { display: "flex", flexDirection: "column", gap: "8px" },
  mainImgWrap: { borderRadius: "var(--radius)", overflow: "hidden", aspectRatio: "16/9", marginBottom: "8px" },
  mainImg: { width: "100%", height: "100%", objectFit: "cover" },
  thumbRow: { display: "flex", gap: "8px" },
  thumb: { width: "72px", height: "54px", objectFit: "cover", borderRadius: "6px", cursor: "pointer" },
  noImgBanner: { background: "var(--border)", borderRadius: "var(--radius)", height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "13px", marginBottom: "2rem" },
  contentGrid: { display: "grid", gridTemplateColumns: "1fr 280px", gap: "2rem", alignItems: "start" },
  details: { display: "flex", flexDirection: "column", gap: "1rem" },
  title: { fontSize: "1.6rem", fontWeight: 500, lineHeight: 1.2 },
  location: { fontSize: "14px", color: "var(--text-secondary)" },
  priceRow: { display: "flex", alignItems: "baseline", gap: "4px" },
  price: { fontSize: "1.8rem", fontWeight: 500 },
  priceLabel: { fontSize: "14px", color: "var(--text-secondary)" },
  availText: { fontSize: "13px", color: "var(--text-secondary)" },
  specsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" },
  descSection: { display: "flex", flexDirection: "column", gap: "8px" },
  descTitle: { fontSize: "15px", fontWeight: 500 },
  desc: { fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7 },
  listerCard: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem", position: "sticky", top: "72px" },
  listerHeader: { display: "flex", gap: "12px", alignItems: "center" },
  listerAvatar: { width: "44px", height: "44px", borderRadius: "50%", background: "#E6F1FB", color: "#0C447C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 500, flexShrink: 0 },
  listerName: { fontSize: "14px", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" },
  verifiedBadge: { fontSize: "11px", color: "#16a34a", fontWeight: 500 },
  listerSince: { fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" },
  contactBtn: { padding: "10px", borderRadius: "8px", border: "none", background: "var(--accent)", color: "#fff", fontSize: "14px", fontWeight: 500, cursor: "pointer", width: "100%" },
  contactHint: { fontSize: "11px", color: "var(--text-muted)", textAlign: "center", marginTop: "-6px" },
};