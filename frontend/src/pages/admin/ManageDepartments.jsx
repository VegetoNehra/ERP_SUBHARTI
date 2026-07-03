import { useEffect, useState } from "react";
import { Building2, Plus, Pencil, Trash2, X, Check, AlertCircle } from "lucide-react";
import api from "../../services/api";

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState(null);
  const [form, setForm]               = useState({ college_id: "", department_code: "", department_name: "" });
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");
  const [toast, setToast]             = useState("");
  const [colleges, setColleges]       = useState([]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = async () => {
    setLoading(true);
    try {
      const [deptRes, collegeRes] = await Promise.all([
        api.get("/academic/departments"),
        api.get("/academic/colleges"),
      ]);
      setDepartments(deptRes.data.departments);
      setColleges(collegeRes.data.colleges);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm({ college_id: "", department_code: "", department_name: "" }); setError(""); setModal({ mode: "add" }); };
  const openEdit = (dept) => { setForm({ college_id: dept.college_id, department_code: dept.department_code, department_name: dept.department_name }); setError(""); setModal({ mode: "edit", data: dept }); };
  const close    = () => { setModal(null); setError(""); };

  const handleSave = async () => {
    if (!form.college_id || !form.department_code.trim() || !form.department_name.trim()) {
      setError("College, code and name are all required."); return;
    }
    setSaving(true); setError("");
    try {
      if (modal.mode === "add") {
        await api.post("/academic/departments", form);
        showToast("Department added successfully.");
      } else {
        await api.put(`/academic/departments/${modal.data.department_id}`, form);
        showToast("Department updated.");
      }
      close(); load();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dept) => {
    if (!window.confirm(`Delete "${dept.department_name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/academic/departments/${dept.department_id}`);
      showToast("Department deleted.");
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete.");
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", backgroundColor: "#F1F5F9", fontFamily: "'Inter', sans-serif", padding: "32px 28px" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, #1E4DB7, #0F2557)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(30,77,183,0.25)" }}>
              <Building2 size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0F2557" }}>Departments</h1>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748B" }}>{departments.length} departments registered</p>
            </div>
          </div>
          <button onClick={openAdd} style={btnPrimary}>
            <Plus size={15} /> Add Department
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{ padding: "12px 18px", borderRadius: "10px", backgroundColor: "#ECFDF5", border: "1px solid #6EE7B7", color: "#065F46", fontSize: "13.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
            <Check size={16} color="#059669" /> {toast}
          </div>
        )}

        {/* Table */}
        <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                  {["College", "Code", "Department Name", "Created", "Actions"].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      {[1, 2, 3, 4, 5].map(j => (
                        <td key={j} style={{ padding: "14px 16px" }}>
                          <div style={{ height: "12px", backgroundColor: "#F1F5F9", borderRadius: "4px", width: "60%" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : departments.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "48px", textAlign: "center", color: "#94A3B8" }}>
                      <Building2 size={32} color="#CBD5E1" style={{ display: "block", margin: "0 auto 8px" }} />
                      No departments yet. Add one above.
                    </td>
                  </tr>
                ) : departments.map((dept, i) => (
                  <tr key={dept.department_id}
                    style={{ borderBottom: "1px solid #F1F5F9", backgroundColor: i % 2 === 0 ? "#fff" : "#FAFBFF", transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#EEF2FF"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = i % 2 === 0 ? "#fff" : "#FAFBFF"}
                  >
                    {/* ✅ College column — new */}
                    <td style={{ padding: "13px 16px", color: "#475569", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {dept.college_name || "—"}
                    </td>

                    {/* Code */}
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", backgroundColor: "#EEF2FF", color: "#1E4DB7", fontSize: "12px", fontWeight: 700 }}>
                        {dept.department_code}
                      </span>
                    </td>

                    {/* Department Name */}
                    <td style={{ padding: "13px 16px", fontWeight: 600, color: "#0F172A" }}>
                      {dept.department_name}
                    </td>

                    {/* Created */}
                    <td style={{ padding: "13px 16px", color: "#94A3B8", fontSize: "12px", whiteSpace: "nowrap" }}>
                      {new Date(dept.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => openEdit(dept)} style={btnEdit}><Pencil size={11} /> Edit</button>
                        <button onClick={() => handleDelete(dept)} style={btnDelete}><Trash2 size={11} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && departments.length > 0 && (
            <div style={{ padding: "10px 20px", borderTop: "1px solid #F1F5F9", backgroundColor: "#FAFBFF", fontSize: "12px", color: "#94A3B8" }}>
              {departments.length} department{departments.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div style={overlay} onClick={close}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#0F2557" }}>
                {modal.mode === "add" ? "Add Department" : "Edit Department"}
              </h2>
              <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex" }}><X size={20} /></button>
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "8px", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: "13px", marginBottom: "16px" }}>
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* College dropdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>College</label>
                <select
                  value={form.college_id}
                  onChange={e => setForm(p => ({ ...p, college_id: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = "#1E4DB7"; e.target.style.boxShadow = "0 0 0 3px rgba(30,77,183,0.1)"; e.target.style.backgroundColor = "#fff"; }}
                  onBlur={e  => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#F8FAFC"; }}
                >
                  <option value="">Select College</option>
                  {colleges.map(c => (
                    <option key={c.college_id} value={c.college_id}>{c.college_name}</option>
                  ))}
                </select>
              </div>

              <FormField label="Department Code" placeholder="e.g. CSE" value={form.department_code}
                onChange={v => setForm(p => ({ ...p, department_code: v }))} />
              <FormField label="Department Name" placeholder="e.g. Computer Science & Engineering" value={form.department_name}
                onChange={v => setForm(p => ({ ...p, department_name: v }))} />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "22px", justifyContent: "flex-end" }}>
              <button onClick={close} style={btnCancel}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={btnPrimary}>
                {saving ? "Saving…" : modal.mode === "add" ? "Add Department" : "Save Changes"}
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
        value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={inputStyle}
        onFocus={e => { e.target.style.borderColor = "#1E4DB7"; e.target.style.boxShadow = "0 0 0 3px rgba(30,77,183,0.1)"; e.target.style.backgroundColor = "#fff"; }}
        onBlur={e  => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#F8FAFC"; }}
      />
    </div>
  );
}

const thStyle    = { padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" };
const labelStyle = { fontSize: "11.5px", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" };
const inputStyle = { width: "100%", padding: "10px 13px", fontSize: "14px", color: "#0F172A", border: "1.5px solid #E2E8F0", borderRadius: "10px", backgroundColor: "#F8FAFC", outline: "none", boxSizing: "border-box", fontFamily: "'Inter', sans-serif", transition: "all 0.15s" };
const btnPrimary = { display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "9px", border: "none", background: "linear-gradient(135deg, #1E4DB7, #0F2557)", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer" };
const btnCancel  = { padding: "9px 16px", borderRadius: "9px", border: "1px solid #E2E8F0", backgroundColor: "#fff", color: "#64748B", fontSize: "13px", fontWeight: 600, cursor: "pointer" };
const btnEdit    = { display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "6px", border: "1px solid #BFDBFE", backgroundColor: "#EFF6FF", color: "#1D4ED8", fontSize: "11px", fontWeight: 600, cursor: "pointer" };
const btnDelete  = { display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "6px", border: "1px solid #FECACA", backgroundColor: "#FEF2F2", color: "#DC2626", fontSize: "11px", fontWeight: 600, cursor: "pointer" };
const overlay    = { position: "fixed", inset: 0, backgroundColor: "rgba(15,37,87,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, backdropFilter: "blur(2px)" };
const modalBox   = { backgroundColor: "#fff", borderRadius: "18px", padding: "28px", width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" };