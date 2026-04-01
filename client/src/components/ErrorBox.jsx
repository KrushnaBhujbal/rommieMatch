export default function ErrorBox({ message }) {
  if (!message) return null;

  return (
    <div style={{
      background: "#fef2f2",
      border: "1px solid #fecaca",
      color: "#dc2626",
      borderRadius: "8px",
      padding: "10px 14px",
      fontSize: "13px",
      lineHeight: "1.5",
      marginBottom: "1rem",
      display: "flex",
      alignItems: "flex-start",
      gap: "8px",
    }}>
      <span style={{ flexShrink: 0, marginTop: "1px" }}>!</span>
      <span>{message}</span>
    </div>
  );
}