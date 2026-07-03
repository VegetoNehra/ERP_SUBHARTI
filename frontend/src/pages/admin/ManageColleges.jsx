import { useEffect, useState } from "react";
import { School, Plus, Pencil, Trash2, X, Check, AlertCircle, Search } from "lucide-react";
import api from "../../services/api";

export default function ManageColleges() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState(null); // null | { mode: "add"|"edit", data? }
  const [form, setForm]         = useState({ college_code: "", college_name: "" });
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [toast, setToast]       = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/academic/colleges");
      setColleges(res.data.colleges);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm({ college_code: "", college_name: "" }); setError(""); setModal({ mode: "add" }); };
  const openEdit = (c) => { setForm({ college_code: c.college_code, college_name: c.college_name }); setError(""); setModal({ mode: "edit", data: c }); };
  const close    = () => { setModal(null); setError(""); };

  const handleSave = async () => {
    if (!form.college_code.trim() || !form.college_name.trim()) {
      setError("Both college code and name are required."); return;
    }
    setSaving(true); setError("");
    try {
      if (modal.mode === "add") {
        await api.post("/academic/colleges", form);
        showToast("College added successfully.");
      } else {
        await api.put(`/academic/colleges/${modal.data.college_id}`, form);
        showToast("College updated.");
      }
      close(); load();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete "${c.college_name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/academic/colleges/${c.college_id}`);
      showToast("College deleted.");
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete.");
    }
  };

  const term     = search.toLowerCase();
  const filtered = colleges.filter(c =>
    c.college_name?.toLowerCase().includes(term) ||
    c.college_code?.toLowerCase().includes(term)
  );

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", backgroundColor: "#F1F5F9", fontFamily: "'Inter', sans-serif", padding: "36px 32px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #7C3AED, #4C1D95)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(124,58,237,0.30)" }}>
              <School size={22} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0F2557" }}>Manage Colleges</h1>
              <p style={{ margin: "3px 0 0", fontSize: "13px", color: "#94A3B8" }}>{colleges.length} colleges registered</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Search */}
            <div style={{ position: "relative", width: "260px" }}>
              <Search size={14} color="#94A3B8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search colleges…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: "100%", padding: "10px 14px 10px 36px", fontSize: "13.5px", border: "1.5px solid #E2E8F0", borderRadius: "10px", backgroundColor: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "'Inter', sans-serif", color: "#0F172A" }}
                onFocus={e => { e.target.style.borderColor = "#7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.10)"; }}
                onBlur={e  => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            <button onClick={openAdd} style={btnPrimary}>
              <Plus size={15} /> Add College
            </button>
          </div>
        </div>

        {/* ── Toast ── */}
        {toast && (
          <div style={{ padding: "12px 18px", borderRadius: "10px", backgroundColor: "#ECFDF5", border: "1px solid #6EE7B7", color: "#065F46", fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
            <Check size={16} color="#059669" /> {toast}
          </div>
        )}

        {/* ── Table Card ── */}
        <div style={{ backgroundColor: "#fff", borderRadius: "18px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px", fontFamily: "'Inter', sans-serif" }}>
              <colgroup>
                <col style={{ minWidth: "80px"  }} /> {/* # */}
                <col style={{ minWidth: "110px" }} /> {/* Code */}
                <col style={{ minWidth: "280px" }} /> {/* College Name */}
                <col style={{ minWidth: "130px" }} /> {/* Created */}
                <col style={{ minWidth: "120px" }} /> {/* Actions */}
              </colgroup>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #EEF2F7" }}>
                  {["#", "Code", "College Name", "Created On", "Actions"].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      {[1,2,3,4,5].map(j => (
                        <td key={j} style={cell}>
                          <div style={{ height: "13px", backgroundColor: "#F1F5F9", borderRadius: "4px", width: `${45 + Math.random() * 40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "60px", textAlign: "center", color: "#94A3B8", fontSize: "14px" }}>
                      <School size={34} color="#CBD5E1" style={{ display: "block", margin: "0 auto 10px" }} />
                      {search ? "No colleges match your search." : "No colleges yet. Add one to get started."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((c, i) => {
                    const rowBg = i % 2 === 0 ? "#fff" : "#FAFBFF";
                    return (
                      <tr
                        key={c.college_id}
                        style={{ borderBottom: "1px solid #F1F5F9", backgroundColor: rowBg, transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#FAF5FF"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = rowBg}
                      >
                        {/* Row number */}
                        <td style={{ ...cell, color: "#CBD5E1", fontSize: "12px", fontWeight: 600 }}>{i + 1}</td>

                        {/* Code badge */}
                        <td style={cell}>
                          <span style={{ padding: "4px 12px", borderRadius: "20px", backgroundColor: "#F3E8FF", color: "#7C3AED", fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap", letterSpacing: "0.03em" }}>
                            {c.college_code}
                          </span>
                        </td>

                        {/* College Name */}
                        <td style={{ ...cell, fontWeight: 600, color: "#0F172A" }}>{c.college_name}</td>

                        {/* Created On */}
                        <td style={{ ...cell, color: "#94A3B8", fontSize: "12.5px", whiteSpace: "nowrap" }}>
                          {c.created_at
                            ? new Date(c.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                            : "—"}
                        </td>

                        {/* Actions */}
                        <td style={cell}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={() => openEdit(c)} style={btnEdit}><Pencil size={11} /> Edit</button>
                            <button onClick={() => handleDelete(c)} style={btnDelete}><Trash2 size={11} /> Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > 0 && (
            <div style={{ padding: "13px 22px", borderTop: "1px solid #F1F5F9", backgroundColor: "#FAFBFF", fontSize: "12px", color: "#94A3B8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Showing <strong style={{ color: "#475569" }}>{filtered.length}</strong> of <strong style={{ color: "#475569" }}>{colleges.length}</strong> colleges</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div style={overlay} onClick={close}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #7C3AED, #4C1D95)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <School size={17} color="#fff" />
                </div>
                <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#0F2557" }}>
                  {modal.mode === "add" ? "Add College" : "Edit College"}
                </h2>
              </div>
              <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex" }}><X size={20} /></button>
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "8px", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: "13px", marginBottom: "16px" }}>
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <FormField
                label="College Code"
                placeholder="e.g. SIT"
                value={form.college_code}
                onChange={v => setForm(p => ({ ...p, college_code: v }))}
              />
              <FormField
                label="College Name"
                placeholder="e.g. Subharti Institute of Technology"
                value={form.college_name}
                onChange={v => setForm(p => ({ ...p, college_name: v }))}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end" }}>
              <button onClick={close} style={btnCancel}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={btnPrimary}>
                {saving ? "Saving…" : modal.mode === "add" ? "Add College" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, placeholder, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={labelStyle}>{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={e => { e.target.style.borderColor = "#7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.10)"; e.target.style.backgroundColor = "#fff"; }}
        onBlur={e  => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#F8FAFC"; }}
      />
    </div>
  );
}

const cell       = { padding: "15px 18px", verticalAlign: "middle" };
const thStyle    = { padding: "13px 18px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" };
const labelStyle = { fontSize: "11.5px", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" };
const inputStyle = { width: "100%", padding: "10px 13px", fontSize: "14px", color: "#0F172A", border: "1.5px solid #E2E8F0", borderRadius: "10px", backgroundColor: "#F8FAFC", outline: "none", boxSizing: "border-box", fontFamily: "'Inter', sans-serif", transition: "all 0.15s" };
const btnPrimary = { display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "9px", border: "none", background: "linear-gradient(135deg, #7C3AED, #4C1D95)", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer" };
const btnCancel  = { padding: "9px 16px", borderRadius: "9px", border: "1px solid #E2E8F0", backgroundColor: "#fff", color: "#64748B", fontSize: "13px", fontWeight: 600, cursor: "pointer" };
const btnEdit    = { display: "flex", alignItems: "center", gap: "4px", padding: "5px 11px", borderRadius: "6px", border: "1px solid #DDD6FE", backgroundColor: "#F3E8FF", color: "#7C3AED", fontSize: "11px", fontWeight: 600, cursor: "pointer" };
const btnDelete  = { display: "flex", alignItems: "center", gap: "4px", padding: "5px 11px", borderRadius: "6px", border: "1px solid #FECACA", backgroundColor: "#FEF2F2", color: "#DC2626", fontSize: "11px", fontWeight: 600, cursor: "pointer" };
const overlay    = { position: "fixed", inset: 0, backgroundColor: "rgba(15,37,87,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, backdropFilter: "blur(2px)" };
const modalBox   = { backgroundColor: "#fff", borderRadius: "18px", padding: "28px", width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" };