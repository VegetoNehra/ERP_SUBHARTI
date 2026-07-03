import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import api from "../../services/api";

export default function EditNotice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api.get(`/admin/notices/${id}`)
      .then(r => setNotice(r.data.notice))
      .catch(() => setError("Failed to load notice."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = e => setNotice(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notice.title.trim() || !notice.content.trim()) { setError("Title and content cannot be empty."); return; }
    setSubmitting(true); setError("");
    try {
      await api.put(`/admin/notices/${id}`, notice);
      setSuccess(true);
      setTimeout(() => navigate("/admin/dashboard"), 1500);
    } catch (err) {
      setError("Failed to update notice. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "calc(100vh - 64px)", flexDirection: "column", gap: "12px", backgroundColor: "#F1F5F9" }}>
      <div style={{ width: "36px", height: "36px", border: "3px solid #E2E8F0", borderTopColor: "#1E4DB7", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#94A3B8", fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>Loading notice…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", backgroundColor: "#F1F5F9", fontFamily: "'Inter', sans-serif", padding: "32px 28px" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Page Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, #1E4DB7, #0F2557)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(30,77,183,0.25)" }}>
              <Pencil size={18} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0F2557" }}>Edit Notice</h1>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748B" }}>Update the notice details below</p>
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
            <ShieldCheck size={18} color="#059669" /> Notice updated! Redirecting…
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div style={{ padding: "14px 18px", borderRadius: "12px", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: "14px", fontWeight: 500 }}>
            {error}
          </div>
        )}

        {/* Form Card */}
        <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 22px", borderBottom: "1px solid #F1F5F9", backgroundColor: "#FAFBFF" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", backgroundColor: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Pencil size={14} color="#1E4DB7" />
            </div>
            <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0F2557" }}>Notice Details</h2>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Title</label>
              <input type="text" name="title" value={notice.title} onChange={handleChange} required disabled={submitting}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = "#1E4DB7"; e.target.style.boxShadow = "0 0 0 3px rgba(30,77,183,0.1)"; e.target.style.backgroundColor = "#fff"; }}
                onBlur={e =>  { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#F8FAFC"; }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Content</label>
              <textarea name="content" value={notice.content} onChange={handleChange} required rows={8} disabled={submitting}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                onFocus={e => { e.target.style.borderColor = "#1E4DB7"; e.target.style.boxShadow = "0 0 0 3px rgba(30,77,183,0.1)"; e.target.style.backgroundColor = "#fff"; }}
                onBlur={e =>  { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#F8FAFC"; }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "4px" }}>
              <button type="button" onClick={() => navigate("/admin/dashboard")} disabled={submitting}
                style={{ padding: "11px 22px", borderRadius: "10px", border: "1.5px solid #E2E8F0", backgroundColor: "#fff", color: "#64748B", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F8FAFC"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff"}
              >
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "11px 26px", borderRadius: "10px", border: "none", background: submitting ? "#93C5FD" : "linear-gradient(135deg, #1E4DB7, #0F2557)", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", boxShadow: submitting ? "none" : "0 4px 14px rgba(30,77,183,0.3)", transition: "all 0.2s" }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
              >
                {submitting ? <><Spinner />Updating…</> : <><Pencil size={14} />Update Notice<ArrowRight size={14} /></>}
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
  return <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginRight: "4px" }} />;
}

const labelStyle = { fontSize: "11.5px", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" };
const inputStyle = { width: "100%", padding: "11px 14px", fontSize: "14px", color: "#0F172A", border: "1.5px solid #E2E8F0", borderRadius: "10px", backgroundColor: "#F8FAFC", outline: "none", boxSizing: "border-box", transition: "all 0.15s", fontFamily: "'Inter', sans-serif" };
