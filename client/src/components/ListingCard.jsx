import { useNavigate } from "react-router-dom";
import SaveButton from "./SaveButton";

export default function ListingCard({ listing, isSaved = false}) {
  const navigate = useNavigate();

  const {
    id,
    title,
    rent,
    city,
    bedrooms,
    bathrooms,
    furnished,
    images,
    lister_name,
    lister_verified,
    available_from,
  } = listing;

  const mainImage   = images?.[0] || null;
  const availDate   = new Date(available_from).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div
      style={styles.card}
      onClick={() => navigate(`/listings/${id}`)}
    >
      {/* Image */}
      <div style={styles.imgWrap}>
        {mainImage ? (
          <img src={mainImage} alt={title} style={styles.img} />
        ) : (
          <div style={styles.noImg}>No photo</div>
        )}
        {/* Rent badge */}
        <div style={styles.rentBadge}>${Number(rent).toLocaleString()}/mo</div>
      </div>

      {/* Body */}
      <div style={styles.body}>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.city}>{city}</p>

        {/* Details row */}
        <div style={styles.detailRow}>
          <span style={styles.detail}>{bedrooms} bed</span>
          <span style={styles.dot}>·</span>
          <span style={styles.detail}>{bathrooms} bath</span>
          {furnished && (
            <>
              <span style={styles.dot}>·</span>
              <span style={styles.detail}>Furnished</span>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
        <div style={styles.listerInfo}>
            <div style={styles.avatar}>
            {lister_name?.[0]?.toUpperCase()}
            </div>
            <span style={styles.listerName}>
            {lister_name}
            {lister_verified && <span style={styles.verifiedBadge}>✓</span>}
            </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={styles.availDate}>From {availDate}</span>
            <SaveButton listingId={id} initialSaved={isSaved} />
        </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform .15s, box-shadow .15s",
  },
  imgWrap: {
    position: "relative",
    aspectRatio: "4/3",
    background: "var(--bg)",
    overflow: "hidden",
  },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  noImg: {
    width: "100%", height: "100%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "13px", color: "var(--text-muted)",
    background: "var(--border)",
  },
  rentBadge: {
    position: "absolute", bottom: "10px", left: "10px",
    background: "rgba(0,0,0,0.75)",
    color: "white", fontSize: "13px", fontWeight: 500,
    padding: "4px 10px", borderRadius: "20px",
  },
  body: { padding: "14px", display: "flex", flexDirection: "column", gap: "6px" },
  title: { fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.3 },
  city: { fontSize: "12px", color: "var(--text-secondary)" },
  detailRow: { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" },
  detail: { fontSize: "12px", color: "var(--text-secondary)" },
  dot: { fontSize: "12px", color: "var(--text-muted)" },
  footer: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginTop: "4px", paddingTop: "10px",
    borderTop: "1px solid var(--border)",
  },
  listerInfo: { display: "flex", alignItems: "center", gap: "6px" },
  avatar: {
    width: "24px", height: "24px", borderRadius: "50%",
    background: "#E6F1FB", color: "#0C447C",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "11px", fontWeight: 500,
  },
  listerName: { fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" },
  verifiedBadge: { fontSize: "10px", color: "#16a34a", fontWeight: 700 },
  availDate: { fontSize: "11px", color: "var(--text-muted)" },
};