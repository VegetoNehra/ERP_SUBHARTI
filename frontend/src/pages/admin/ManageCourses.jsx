import { useEffect, useState } from "react";
import { BookOpen, Plus, Pencil, Trash2, X, Check, AlertCircle } from "lucide-react";
import api from "../../services/api";

const EMPTY_FORM = { department_id: "", course_code: "", course_name: "", total_semesters: "" };

export default function ManageCourses() {
  const [courses,     setCourses]     = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [toast,       setToast]       = useState("");
  const [filterDept,  setFilterDept]  = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get("/academic/courses"),
      api.get("/academic/departments"),
    ])
      .then(([cr, dr]) => {
        setCourses(cr.data.courses);
        setDepartments(dr.data.departments);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm(EMPTY_FORM); setError(""); setModal({ mode: "add" }); };
  const openEdit = (c) => {
    setForm({ department_id: c.department_id, course_code: c.course_code, course_name: c.course_name, total_semesters: c.total_semesters });
    setError(""); setModal({ mode: "edit", data: c });
  };
  const close = () => { setModal(null); setError(""); };

  const handleSave = async () => {
    if (!form.department_id || !form.course_code.trim() || !form.course_name.trim() || !form.total_semesters) {
      setError("All fields are required."); return;
    }
    if (parseInt(form.total_semesters) <= 0) { setError("Semesters must be > 0."); return; }
    setSaving(true); setError("");
    try {
      if (modal.mode === "add") {
        await api.post("/academic/courses", form);
        showToast("Course added successfully.");
      } else {
        await api.put(`/academic/courses/${modal.data.course_id}`, form);
        showToast("Course updated.");
      }
      close(); load();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete "${course.course_name}"?`)) return;
    try {
      await api.delete(`/academic/courses/${course.course_id}`);
      showToast("Course deleted."); load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete.");
    }
  };

  const displayed = filterDept
    ? courses.filter(c => String(c.department_id) === filterDept)
    : courses;

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", backgroundColor: "#F1F5F9", fontFamily: "'Inter', sans-serif", padding: "32px 28px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, #7C3AED, #4C1D95)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(124,58,237,0.25)" }}>
              <BookOpen size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0F2557" }}>Courses</h1>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748B" }}>{courses.length} courses across all departments</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Department filter */}
            <select
              value={filterDept} onChange={e => setFilterDept(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "9px", border: "1.5px solid #E2E8F0", backgroundColor: "#fff", fontSize: "13px", color: "#374151", outline: "none", cursor: "pointer" }}
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
            </select>
            <button onClick={openAdd} style={btnPrimary}><Plus size={15} /> Add Course</button>
          </div>
        </div>

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
                  {["College","Code", "Course Name", "Department", "Semesters", "Actions"].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      {[1,2,3,4,5,6].map(j => (
                        <td key={j} style={{ padding: "14px 16px" }}>
                          <div style={{ height: "12px", backgroundColor: "#F1F5F9", borderRadius: "4px", width: "65%" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : displayed.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "48px", textAlign: "center", color: "#94A3B8" }}>
                      <BookOpen size={32} color="#CBD5E1" style={{ display: "block", margin: "0 auto 8px" }} />
                      No courses found.
                    </td>
                  </tr>
                ) : displayed.map((c, i) => (
                  <tr key={c.course_id}
                    style={{ borderBottom: "1px solid #F1F5F9", backgroundColor: i % 2 === 0 ? "#fff" : "#FAFBFF", transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F5F3FF"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = i % 2 === 0 ? "#fff" : "#FAFBFF"}
                  >

                    <td
                      style={{
                        padding: "13px 16px",
                        color: "#475569",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.college_name}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", backgroundColor: "#F5F3FF", color: "#7C3AED", fontSize: "12px", fontWeight: 700 }}>
                        {c.course_code}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px", fontWeight: 600, color: "#0F172A" }}>{c.course_name}</td>
                    <td style={{ padding: "13px 16px", color: "#475569" }}>{c.department_name}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", backgroundColor: "#FFFBEB", color: "#D97706", fontSize: "12px", fontWeight: 700 }}>
                        {c.total_semesters} sem
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => openEdit(c)} style={btnEdit}><Pencil size={11} /> Edit</button>
                        <button onClick={() => handleDelete(c)} style={btnDelete}><Trash2 size={11} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && displayed.length > 0 && (
            <div style={{ padding: "10px 20px", borderTop: "1px solid #F1F5F9", backgroundColor: "#FAFBFF", fontSize: "12px", color: "#94A3B8" }}>
              Showing {displayed.length} of {courses.length} courses
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
                {modal.mode === "add" ? "Add Course" : "Edit Course"}
              </h2>
              <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex" }}><X size={20} /></button>
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "8px", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: "13px", marginBottom: "16px" }}>
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Department dropdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Department</label>
                <select value={form.department_id} onChange={e => setForm(p => ({ ...p, department_id: e.target.value }))}
                  style={{ ...inputStyle, cursor: "pointer" }}
                  onFocus={e => { e.target.style.borderColor = "#7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)"; }}
                  onBlur={e =>  { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                >
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <FormField label="Course Code" placeholder="e.g. BTECH_CSE" value={form.course_code}
                  onChange={v => setForm(p => ({ ...p, course_code: v }))} accent="#7C3AED" accentRgb="124,58,237" />
                <FormField label="Total Semesters" placeholder="e.g. 8" value={form.total_semesters} type="number"
                  onChange={v => setForm(p => ({ ...p, total_semesters: v }))} accent="#7C3AED" accentRgb="124,58,237" />
              </div>

              <FormField label="Course Name" placeholder="e.g. BTech Computer Science & Engineering" value={form.course_name}
                onChange={v => setForm(p => ({ ...p, course_name: v }))} accent="#7C3AED" accentRgb="124,58,237" />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "22px", justifyContent: "flex-end" }}>
              <button onClick={close} style={btnCancel}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, background: "linear-gradient(135deg, #7C3AED, #4C1D95)" }}>
                {saving ? "Saving…" : modal.mode === "add" ? "Add Course" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, placeholder, value, onChange, type = "text", accent = "#1E4DB7", accentRgb = "30,77,183" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={inputStyle}
        onFocus={e => { e.target.style.borderColor = accent; e.target.style.boxShadow = `0 0 0 3px rgba(${accentRgb},0.1)`; e.target.style.backgroundColor = "#fff"; }}
        onBlur={e =>  { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#F8FAFC"; }}
      />
    </div>
  );
}

const thStyle    = { padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" };
const labelStyle = { fontSize: "11.5px", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" };
const inputStyle = { width: "100%", padding: "10px 13px", fontSize: "14px", color: "#0F172A", border: "1.5px solid #E2E8F0", borderRadius: "10px", backgroundColor: "#F8FAFC", outline: "none", boxSizing: "border-box", fontFamily: "'Inter', sans-serif", transition: "all 0.15s" };
const btnPrimary = { display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "9px", border: "none", background: "linear-gradient(135deg, #1E4DB7, #0F2557)", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer" };
const btnCancel  = { padding: "9px 16px", borderRadius: "9px", border: "1px solid #E2E8F0", backgroundColor: "#fff", color: "#64748B", fontSize: "13px", fontWeight: 600, cursor: "pointer" };
const btnEdit    = { display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "6px", border: "1px solid #DDD6FE", backgroundColor: "#F5F3FF", color: "#7C3AED", fontSize: "11px", fontWeight: 600, cursor: "pointer" };
const btnDelete  = { display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "6px", border: "1px solid #FECACA", backgroundColor: "#FEF2F2", color: "#DC2626", fontSize: "11px", fontWeight: 600, cursor: "pointer" };
const overlay    = { position: "fixed", inset: 0, backgroundColor: "rgba(15,37,87,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, backdropFilter: "blur(2px)" };
const modalBox   = { backgroundColor: "#fff", borderRadius: "18px", padding: "28px", width: "100%", maxWidth: "500px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" };
