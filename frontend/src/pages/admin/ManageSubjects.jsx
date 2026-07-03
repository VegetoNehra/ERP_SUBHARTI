import { useEffect, useState } from "react";
import { FlaskConical, Plus, Pencil, Trash2, X, Check, AlertCircle } from "lucide-react";
import api from "../../services/api";

const EMPTY_FORM = { course_id: "", semester_no: "", subject_code: "", subject_name: "", credits: "" };

export default function ManageSubjects() {
  const [subjects,    setSubjects]    = useState([]);
  const [courses,     setCourses]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [toast,       setToast]       = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterSem,    setFilterSem]    = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get("/academic/subjects"),
      api.get("/academic/courses"),
    ])
      .then(([sr, cr]) => {
        setSubjects(sr.data.subjects);
        setCourses(cr.data.courses);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Semester options for the currently selected course in the form
  const selectedCourse = courses.find(c => String(c.course_id) === String(form.course_id));
  const semesterOptions = selectedCourse
    ? Array.from({ length: selectedCourse.total_semesters }, (_, i) => i + 1)
    : [];

  const openAdd  = () => { setForm(EMPTY_FORM); setError(""); setModal({ mode: "add" }); };
  const openEdit = (s) => {
    setForm({ course_id: s.course_id, semester_no: s.semester_no, subject_code: s.subject_code, subject_name: s.subject_name, credits: s.credits });
    setError(""); setModal({ mode: "edit", data: s });
  };
  const close = () => { setModal(null); setError(""); };

  const handleSave = async () => {
    if (!form.course_id || !form.semester_no || !form.subject_code.trim() || !form.subject_name.trim() || !form.credits) {
      setError("All fields are required."); return;
    }
    if (parseInt(form.credits) <= 0) { setError("Credits must be > 0."); return; }
    setSaving(true); setError("");
    try {
      if (modal.mode === "add") {
        await api.post("/academic/subjects", form);
        showToast("Subject added successfully.");
      } else {
        await api.put(`/academic/subjects/${modal.data.subject_id}`, form);
        showToast("Subject updated.");
      }
      close(); load();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (subject) => {
    if (!window.confirm(`Delete "${subject.subject_name}"?`)) return;
    try {
      await api.delete(`/academic/subjects/${subject.subject_id}`);
      showToast("Subject deleted."); load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete.");
    }
  };

  // Unique semesters in current filtered set for the sem filter dropdown
  const uniqueSems = [...new Set(
    (filterCourse ? subjects.filter(s => String(s.course_id) === filterCourse) : subjects)
      .map(s => s.semester_no)
  )].sort((a, b) => a - b);

  const displayed = subjects.filter(s => {
    if (filterCourse && String(s.course_id) !== filterCourse) return false;
    if (filterSem    && String(s.semester_no) !== filterSem)  return false;
    return true;
  });

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", backgroundColor: "#F1F5F9", fontFamily: "'Inter', sans-serif", padding: "32px 28px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, #0891B2, #0E7490)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(8,145,178,0.25)" }}>
              <FlaskConical size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0F2557" }}>Subjects</h1>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748B" }}>{subjects.length} subjects across all courses</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <select value={filterCourse} onChange={e => { setFilterCourse(e.target.value); setFilterSem(""); }}
              style={filterSelect}
            >
              <option value="">All Courses</option>
              {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
            </select>
            <select value={filterSem} onChange={e => setFilterSem(e.target.value)} style={filterSelect}>
              <option value="">All Semesters</option>
              {uniqueSems.map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
            <button onClick={openAdd} style={btnPrimary}><Plus size={15} /> Add Subject</button>
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
                  {["Code", "Subject Name", "Course", "Department", "Semester", "Credits", "Actions"].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      {[1,2,3,4,5,6,7].map(j => (
                        <td key={j} style={{ padding: "14px 16px" }}>
                          <div style={{ height: "12px", backgroundColor: "#F1F5F9", borderRadius: "4px", width: "65%" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : displayed.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "48px", textAlign: "center", color: "#94A3B8" }}>
                      <FlaskConical size={32} color="#CBD5E1" style={{ display: "block", margin: "0 auto 8px" }} />
                      No subjects found.
                    </td>
                  </tr>
                ) : displayed.map((s, i) => (
                  <tr key={s.subject_id}
                    style={{ borderBottom: "1px solid #F1F5F9", backgroundColor: i % 2 === 0 ? "#fff" : "#FAFBFF", transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#ECFEFF"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = i % 2 === 0 ? "#fff" : "#FAFBFF"}
                  >
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", backgroundColor: "#ECFEFF", color: "#0891B2", fontSize: "12px", fontWeight: 700 }}>
                        {s.subject_code}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px", fontWeight: 600, color: "#0F172A" }}>{s.subject_name}</td>
                    <td style={{ padding: "13px 16px", color: "#475569" }}>{s.course_name}</td>
                    <td style={{ padding: "13px 16px", color: "#64748B", fontSize: "12.5px" }}>{s.department_name}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", backgroundColor: "#F0FDF4", color: "#16A34A", fontSize: "12px", fontWeight: 700 }}>
                        Sem {s.semester_no}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", backgroundColor: "#FFFBEB", color: "#D97706", fontSize: "12px", fontWeight: 700 }}>
                        {s.credits} cr
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => openEdit(s)} style={btnEdit}><Pencil size={11} /> Edit</button>
                        <button onClick={() => handleDelete(s)} style={btnDelete}><Trash2 size={11} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && displayed.length > 0 && (
            <div style={{ padding: "10px 20px", borderTop: "1px solid #F1F5F9", backgroundColor: "#FAFBFF", fontSize: "12px", color: "#94A3B8" }}>
              Showing {displayed.length} of {subjects.length} subjects
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
                {modal.mode === "add" ? "Add Subject" : "Edit Subject"}
              </h2>
              <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex" }}><X size={20} /></button>
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "8px", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: "13px", marginBottom: "16px" }}>
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Course dropdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Course</label>
                <select
                  value={form.course_id}
                  onChange={e => setForm(p => ({ ...p, course_id: e.target.value, semester_no: "" }))}
                  style={{ ...inputStyle, cursor: "pointer" }}
                  onFocus={e => { e.target.style.borderColor = "#0891B2"; e.target.style.boxShadow = "0 0 0 3px rgba(8,145,178,0.1)"; }}
                  onBlur={e =>  { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                >
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name} ({c.department_name})</option>)}
                </select>
              </div>

              {/* Semester dropdown — only shows when course is selected */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Semester</label>
                <select
                  value={form.semester_no}
                  onChange={e => setForm(p => ({ ...p, semester_no: e.target.value }))}
                  disabled={!form.course_id}
                  style={{ ...inputStyle, cursor: form.course_id ? "pointer" : "not-allowed", opacity: form.course_id ? 1 : 0.5 }}
                  onFocus={e => { e.target.style.borderColor = "#0891B2"; e.target.style.boxShadow = "0 0 0 3px rgba(8,145,178,0.1)"; }}
                  onBlur={e =>  { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                >
                  <option value="">Select Semester</option>
                  {semesterOptions.map(n => <option key={n} value={n}>Semester {n}</option>)}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <FormField label="Subject Code" placeholder="e.g. MATH101" value={form.subject_code}
                  onChange={v => setForm(p => ({ ...p, subject_code: v }))} />
                <FormField label="Credits" placeholder="e.g. 4" value={form.credits} type="number"
                  onChange={v => setForm(p => ({ ...p, credits: v }))} />
              </div>

              <FormField label="Subject Name" placeholder="e.g. Mathematics-I" value={form.subject_name}
                onChange={v => setForm(p => ({ ...p, subject_name: v }))} />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "22px", justifyContent: "flex-end" }}>
              <button onClick={close} style={btnCancel}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, background: "linear-gradient(135deg, #0891B2, #0E7490)" }}>
                {saving ? "Saving…" : modal.mode === "add" ? "Add Subject" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, placeholder, value, onChange, type = "text" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={inputStyle}
        onFocus={e => { e.target.style.borderColor = "#0891B2"; e.target.style.boxShadow = "0 0 0 3px rgba(8,145,178,0.1)"; e.target.style.backgroundColor = "#fff"; }}
        onBlur={e =>  { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#F8FAFC"; }}
      />
    </div>
  );
}

const thStyle     = { padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" };
const labelStyle  = { fontSize: "11.5px", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" };
const inputStyle  = { width: "100%", padding: "10px 13px", fontSize: "14px", color: "#0F172A", border: "1.5px solid #E2E8F0", borderRadius: "10px", backgroundColor: "#F8FAFC", outline: "none", boxSizing: "border-box", fontFamily: "'Inter', sans-serif", transition: "all 0.15s" };
const filterSelect = { padding: "8px 12px", borderRadius: "9px", border: "1.5px solid #E2E8F0", backgroundColor: "#fff", fontSize: "13px", color: "#374151", outline: "none", cursor: "pointer" };
const btnPrimary  = { display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "9px", border: "none", background: "linear-gradient(135deg, #0891B2, #0E7490)", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer" };
const btnCancel   = { padding: "9px 16px", borderRadius: "9px", border: "1px solid #E2E8F0", backgroundColor: "#fff", color: "#64748B", fontSize: "13px", fontWeight: 600, cursor: "pointer" };
const btnEdit     = { display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "6px", border: "1px solid #A5F3FC", backgroundColor: "#ECFEFF", color: "#0891B2", fontSize: "11px", fontWeight: 600, cursor: "pointer" };
const btnDelete   = { display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "6px", border: "1px solid #FECACA", backgroundColor: "#FEF2F2", color: "#DC2626", fontSize: "11px", fontWeight: 600, cursor: "pointer" };
const overlay     = { position: "fixed", inset: 0, backgroundColor: "rgba(15,37,87,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, backdropFilter: "blur(2px)" };
const modalBox    = { backgroundColor: "#fff", borderRadius: "18px", padding: "28px", width: "100%", maxWidth: "500px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" };
