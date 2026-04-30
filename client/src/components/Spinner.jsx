export default function Spinner({ size = 32, color = "var(--accent)" }) {
  return (
    <div style={{
      width: size, height: size,
      border: `3px solid rgba(108,99,255,0.15)`,
      borderTopColor: color,
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
      flexShrink: 0,
    }} />
  );
}
