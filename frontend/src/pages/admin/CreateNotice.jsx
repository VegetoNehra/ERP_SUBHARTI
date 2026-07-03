import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import api from "../../services/api";

export default function CreateNotice() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/admin/create-notice", { title, content });
      setSuccess(true);
      setTitle("");
      setContent("");
      setTimeout(() => navigate("/admin/dashboard"), 1500);
    } catch (err) {
      console.error(err);
      alert("Failed to create notice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", backgroundColor: "#F1F5F9", fontFamily: "'Inter', sans-serif", padding: "32px 28px" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Page Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, #D97706, #92400E)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(217,119,6,0.25)" }}>
              <Bell size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0F2557" }}>Create Notice</h1>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748B" }}>Broadcast a notice to all students</p>
            </div>
          </div>
          <button onClick={() => navigate("/admin/dashboard")}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px solid #E2E8F0", backgroundColor: "#fff", color: "#64748B", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F8FAFC"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff"}
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        {/* Success banner */}
        {success && (
          <div style={{ padding: "14px 18px", borderRadius: "12px", backgroundColor: "#ECFDF5", border: "1px solid #6EE7B7", color: "#065F46", fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={18} color="#059669" /> Notice created! Redirecting…
          </div>
        )}

        {/* Form Card */}
        <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          {/* Card header */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 22px", borderBottom: "1px solid #F1F5F9", backgroundColor: "#FAFBFF" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", backgroundColor: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={15} color="#D97706" />
            </div>
            <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0F2557" }}>Notice Details</h2>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Title */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Title</label>
              <input
                type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Fee Submission Reminder"
                required style={inputStyle}
                onFocus={e => { e.target.style.borderColor = "#D97706"; e.target.style.boxShadow = "0 0 0 3px rgba(217,119,6,0.1)"; e.target.style.backgroundColor = "#fff"; }}
                onBlur={e =>  { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#F8FAFC"; }}
              />
            </div>

            {/* Content */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Content</label>
              <textarea
                value={content} onChange={e => setContent(e.target.value)}
                placeholder="Write the full notice content here…"
                required rows={7}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                onFocus={e => { e.target.style.borderColor = "#D97706"; e.target.style.boxShadow = "0 0 0 3px rgba(217,119,6,0.1)"; e.target.style.backgroundColor = "#fff"; }}
                onBlur={e =>  { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#F8FAFC"; }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "4px" }}>
              <button type="submit" disabled={loading}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 28px", borderRadius: "10px", border: "none", background: loading ? "#FDE68A" : "linear-gradient(135deg, #D97706, #92400E)", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 14px rgba(217,119,6,0.3)", transition: "all 0.2s" }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
              >
                {loading
                  ? <><Spinner /> Sending…</>
                  : <><Bell size={15} /> Send Notice <ArrowRight size={14} /></>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Spinner() {
  return <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />;
}

const labelStyle = { fontSize: "11.5px", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" };
const inputStyle = { width: "100%", padding: "11px 14px", fontSize: "14px", color: "#0F172A", border: "1.5px solid #E2E8F0", borderRadius: "10px", backgroundColor: "#F8FAFC", outline: "none", boxSizing: "border-box", transition: "all 0.15s", fontFamily: "'Inter', sans-serif" };
