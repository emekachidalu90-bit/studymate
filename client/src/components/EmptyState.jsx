export default function EmptyState({ icon: Icon, title, description, action, actionLabel }) {
  return (
    <div style={{
      textAlign: "center", padding: "64px 24px",
      background: "var(--bg-card)", borderRadius: "var(--radius)",
      border: "1px solid var(--border-light)",
    }}>
      {Icon && (
        <div style={{
          width: 64, height: 64, background: "var(--bg-secondary)",
          borderRadius: 18, display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 16px",
        }}>
          <Icon size={28} color="var(--text-muted)" />
        </div>
      )}
      <h3 style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 8 }}>{title}</h3>
      {description && <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", maxWidth: 320, margin: "0 auto 24px", lineHeight: 1.6 }}>{description}</p>}
      {action && (
        <button onClick={action} className="btn btn-primary">
          {actionLabel || "Get Started"}
        </button>
      )}
    </div>
  );
}
