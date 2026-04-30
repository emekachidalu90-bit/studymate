import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const alreadyDismissed = localStorage.getItem("pwa_dismissed");
    if (alreadyDismissed) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
      setDeferredPrompt(null);
    }
  };

  const dismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem("pwa_dismissed", "1");
  };

  if (!show || dismissed) return null;

  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "var(--radius)", padding: "14px 20px",
      display: "flex", alignItems: "center", gap: 14,
      boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(108,99,255,0.2)",
      zIndex: 9999, animation: "slideIn 0.3s ease",
      maxWidth: "calc(100vw - 32px)", width: 400,
    }}>
      <div style={{ width: 40, height: 40, background: "linear-gradient(135deg,var(--accent),var(--accent-2))", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Smartphone size={20} color="white" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 2 }}>Install StudyMate</div>
        <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Add to your home screen for the best experience</div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button onClick={install} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
          <Download size={13} /> Install
        </button>
        <button onClick={dismiss} className="btn btn-secondary btn-icon" style={{ padding: 7 }}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
