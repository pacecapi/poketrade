export const inputStyle = {
  width: "100%",
  background: "#1B1B22",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  padding: "9px 10px",
  fontSize: 14,
  color: "#F5F3EE",
  outline: "none",
};

export function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 12.5, color: "#8B8B95" }}>{label}</span>
      {children}
    </label>
  );
}
