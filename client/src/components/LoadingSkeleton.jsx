export default function LoadingSkeleton({ count = 6 }) {
  return (
    <div style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={styles.card}>
          <div style={styles.imgPlaceholder} />
          <div style={styles.body}>
            <div style={{ ...styles.line, width: "70%" }} />
            <div style={{ ...styles.line, width: "40%", height: "12px" }} />
            <div style={{ ...styles.line, width: "55%", height: "12px", marginTop: "8px" }} />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes shimmer {
          0%   { opacity: 1; }
          50%  { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "16px",
  },
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    overflow: "hidden",
    animation: "shimmer 1.4s ease-in-out infinite",
  },
  imgPlaceholder: {
    width: "100%",
    aspectRatio: "4/3",
    background: "var(--border)",
  },
  body: {
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  line: {
    height: "16px",
    background: "var(--border)",
    borderRadius: "4px",
  },
};