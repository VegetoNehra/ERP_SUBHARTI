import { useEffect, useState } from "react";
import api from "../../services/api";

const ACADEMIC_YEARS = ["2024-25", "2025-26", "2026-27", "2027-28", "2028-29"];
const SEMESTERS = ["1","2","3","4","5","6","7","8"];
const SECTIONS  = ["A","B","C","D"];

const EMPTY = {
  employee_id:"", semester:"", section:"", academic_year:"", subject_ids:[]
};

/* ─── atoms ───────────────────────────────────────────── */

const Label = ({ children }) => (
  <span style={{
    display:"block", fontSize:11, fontWeight:600, letterSpacing:"0.08em",
    textTransform:"uppercase", color:"#94a3b8", marginBottom:6
  }}>{children}</span>
);

const Sel = ({ disabled, children, ...props }) => (
  <div style={{ position:"relative" }}>
    <select {...props} disabled={disabled} style={{
      width:"100%", appearance:"none", border:"1.5px solid",
      borderColor: disabled ? "#f1f5f9" : "#e2e8f0",
      borderRadius:12, padding:"10px 36px 10px 14px",
      fontSize:13.5, color: disabled ? "#cbd5e1" : "#334155",
      background: disabled ? "#f8fafc" : "#ffffff",
      cursor: disabled ? "not-allowed" : "pointer",
      outline:"none", transition:"border-color .15s, box-shadow .15s",
      fontFamily:"inherit"
    }}
    onFocus={e=>{ if (!disabled) { e.target.style.borderColor="#10b981"; e.target.style.boxShadow="0 0 0 3px rgba(16,185,129,.12)"; }}}
    onBlur={e=>{ e.target.style.borderColor=disabled?"#f1f5f9":"#e2e8f0"; e.target.style.boxShadow="none"; }}>
      {children}
    </select>
    <svg style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
      pointerEvents:"none", color: disabled ? "#cbd5e1" : "#94a3b8" }}
      width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
    </svg>
  </div>
);

const Badge = ({ children, color }) => {
  const map = {
    blue:  { bg:"#eff6ff", text:"#1d4ed8" },
    green: { bg:"#f0fdf4", text:"#15803d" },
    gray:  { bg:"#f8fafc", text:"#475569" },
    indigo:{ bg:"#eef2ff", text:"#4338ca" },
  };
  const c = map[color] || map.gray;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center",
      padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600,
      background:c.bg, color:c.text
    }}>{children}</span>
  );
};

const Dot = ({ active }) => (
  <span style={{
    display:"inline-block", width:7, height:7, borderRadius:"50%",
    background: active ? "#10b981" : "#cbd5e1",
    boxShadow: active ? "0 0 0 2px rgba(16,185,129,.2)" : "none"
  }}/>
);

const SubjectCheck = ({ checked, label, onToggle }) => (
  <label style={{
    display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
    borderRadius:12, border:"1.5px solid", cursor:"pointer",
    borderColor: checked ? "#10b981" : "#e2e8f0",
    background: checked ? "#f0fdf4" : "#ffffff",
    transition:"border-color .15s, background .15s"
  }}>
    <input type="checkbox" checked={checked} onChange={onToggle}
      style={{ width:16, height:16, accentColor:"#10b981", cursor:"pointer" }}/>
    <span style={{ fontSize:13.5, fontWeight:500, color: checked ? "#15803d" : "#334155" }}>
      {label}
    </span>
  </label>
);

const DividerLabel = ({ children }) => (
  <div style={{
    fontSize:10.5, fontWeight:700, letterSpacing:"0.12em",
    textTransform:"uppercase", color:"#94a3b8", marginBottom:14,
    display:"flex", alignItems:"center", gap:8
  }}>
    <span style={{ flex:1, height:1, background:"#f1f5f9" }}/>
    <span>{children}</span>
    <span style={{ flex:1, height:1, background:"#f1f5f9" }}/>
  </div>
);

/* ─── main component ──────────────────────────────────── */

export default function ManageFacultyAllocation() {
  const [form,             setForm]             = useState(EMPTY);
  const [facultyList,      setFacultyList]      = useState([]);
  const [facultyInfo,      setFacultyInfo]      = useState(null);
  const [availableSubjects,setAvailableSubjects]= useState([]);
  const [rows,             setRows]             = useState([]);
  const [search,           setSearch]           = useState("");
  const [tableLoading,     setTableLoading]     = useState(false);
  const [saving,           setSaving]           = useState(false);
  const [toast,            setToast]            = useState(null);
  // Composite key "empId__sem__sec__yr" — truthy means we're in edit mode
  const [editGroupKey,     setEditGroupKey]     = useState(null);
  const [delId,            setDelId]            = useState(null);

  useEffect(() => { fetchFaculty(); fetchRows(); }, []);

  const flash = (msg, type="ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  /* ── data fetchers ─────────────────────────────────── */

  const fetchFaculty = async () => {
    try {
      // Requires: GET /  faculty-allocation/faculty
      // Returns: [{ employee_id, name }, ...]
      const r = await api.get("/faculty-allocation/faculty");
      setFacultyList(r.data.faculty || []);
    } catch {
      flash("Could not load faculty list.", "err");
    }


  };

  const fetchRows = async () => {
    setTableLoading(true);
    try {
      // GET /  faculty-allocation/allocations
      // Controller (getAllAllocations) groups rows server-side and returns:
      // [{ allocation_id, employee_id, faculty_name, department_name,
      //    course_name, branch_name, semester, section, academic_year,
      //    is_active, subjects: [{ subject_id, subject_name, subject_code }] }]
      const r = await api.get("/faculty-allocation/allocations");
      setRows(r.data);
    } catch {
      flash("Could not load allocations.", "err");
    } finally {
      setTableLoading(false);
    }
  };

  // GET /:facultyId/available-subjects?semester=N
  // Response: { facultyInfo: {...}, availableSubjects: [...] }
  const fetchAvailableSubjects = async (employeeId, semester) => {
    if (!employeeId) {
      setFacultyInfo(null);
      setAvailableSubjects([]);
      return;
    }
    try {
      const r = await api.get(
        `/faculty-allocation/${employeeId}/available-subjects`,
        { params: semester ? { semester } : {} }
      );
      setFacultyInfo(r.data.facultyInfo ?? null);
      setAvailableSubjects(r.data.availableSubjects ?? []);
    } catch {
      flash("Could not load available subjects.", "err");
      setFacultyInfo(null);
      setAvailableSubjects([]);
    }
  };

  /* ── form handlers ──────────────────────────────────── */

  const change = (e) => {
    const { name, value } = e.target;

    if (name === "employee_id") {
      // FIX #4: reset ALL dependent fields when faculty changes
      setForm({ ...EMPTY, employee_id: value });
      setFacultyInfo(null);
      setAvailableSubjects([]);
      if (value) fetchAvailableSubjects(value, "");
      return;
    }

    if (name === "semester") {
      // FIX #1: re-fetch subjects when semester changes; clear prior selections
      setForm(p => ({ ...p, semester: value, subject_ids: [] }));
      if (form.employee_id) fetchAvailableSubjects(form.employee_id, value);
      return;
    }

    setForm(p => ({ ...p, [name]: value }));
  };

  const toggleSubject = (subjectId) => {
    setForm(p => {
      const has = p.subject_ids.includes(subjectId);
      return {
        ...p,
        subject_ids: has
          ? p.subject_ids.filter(id => id !== subjectId)
          : [...p.subject_ids, subjectId],
      };
    });
  };

  const valid = () =>
    form.employee_id   !== "" &&
    form.semester      !== "" &&
    form.section       !== "" &&
    form.academic_year !== "" &&
    form.subject_ids.length > 0;

  // POST /:facultyId/allocations
  // The controller wraps DELETE + INSERT in a transaction, so this call
  // handles both create and update atomically — no separate PUT needed,
  // and no risk of losing data if the second step fails.
  const submit = async (e) => {
    e.preventDefault();
    if (!valid()) {
      flash("Complete all fields and select at least one subject.", "err");
      return;
    }
    setSaving(true);
    try {
      await api.post(
        `/faculty-allocation/${form.employee_id}/allocations`,
        {
          subject_ids:   form.subject_ids,
          semester:      form.semester,
          section:       form.section,
          academic_year: form.academic_year,
        }
      );
      flash(editGroupKey ? "Allocation updated." : "Allocation saved.");
      resetForm();
      fetchRows();
    } catch (err) {
      flash(err?.response?.data?.message || "Save failed.", "err");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm(EMPTY);
    setFacultyInfo(null);
    setAvailableSubjects([]);
    setEditGroupKey(null);
  };

  // FIX #2: row.subjects is [{ subject_id, subject_name }] — IDs map cleanly.
  // No fallback to string values needed because getAllAllocations always
  // returns structured objects from the JOIN.
  const startEdit = async (row) => {
    const key        = `${row.employee_id}__${row.semester}__${row.section}__${row.academic_year}`;
    const subjectIds = row.subjects.map(s => s.subject_id);

    setEditGroupKey(key);

    // Load available subjects first so checkboxes are visible
    await fetchAvailableSubjects(row.employee_id, row.semester);

    // Set form after fetch so subject_ids aren't cleared by fetchAvailableSubjects
    setForm({
      employee_id:   row.employee_id,
      semester:      row.semester,
      section:       row.section,
      academic_year: row.academic_year,
      subject_ids:   subjectIds,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // DELETE /:allocationId — removes the representative row for a group.
  // The table's Delete button passes the group's allocation_id (first row
  // from getAllAllocations). A future "delete whole group" button would call
  // DELETE with each subject's allocation_id, or a dedicated bulk endpoint.
  const doDelete = async (id) => {
    try {
      await api.delete(`/faculty-allocation/${id}`);
      flash("Allocation removed.");
      setDelId(null);
      fetchRows();
    } catch {
      flash("Delete failed.", "err");
    }
  };

  /* ── derived ────────────────────────────────────────── */

  const subjectEmptyMsg = () => {
    if (!form.employee_id) return "Select a faculty member to begin.";
    if (!form.semester)    return "Pick a semester to see available subjects.";
    return `No subjects found for Semester ${form.semester}.`;
  };

  const q        = search.toLowerCase();
  const filtered = rows.filter(a =>
    [
      a.faculty_name,
      a.department_name,
      a.course_name,
      a.section,
      ...(a.subjects ?? []).map(s => s.subject_name),
    ].some(v => v?.toLowerCase().includes(q))
  );

  /* ── shared style tokens ────────────────────────────── */
  const card = {
    background:"#ffffff", borderRadius:20,
    border:"1px solid #f1f5f9",
    boxShadow:"0 1px 3px rgba(0,0,0,.05), 0 4px 16px rgba(0,0,0,.04)"
  };

  /* ────────────────────────────────────────────────────── */

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", padding:"32px 40px" }}>

      {/* TOAST */}
      {toast && (
        <div style={{
          position:"fixed", top:20, right:24, zIndex:9999,
          display:"flex", alignItems:"center", gap:10,
          padding:"12px 18px", borderRadius:14, fontSize:13.5, fontWeight:500,
          boxShadow:"0 4px 24px rgba(0,0,0,.12)",
          background: toast.type==="err" ? "#fef2f2" : "#f0fdf4",
          color:       toast.type==="err" ? "#b91c1c"  : "#15803d",
          border:`1px solid ${toast.type==="err" ? "#fecaca" : "#bbf7d0"}`
        }}>
          {toast.type==="err"
            ? <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/></svg>
            : <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>}
          {toast.msg}
        </div>
      )}

      {/* DELETE MODAL */}
      {delId && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(15,23,42,.45)",
          zIndex:9998, display:"flex", alignItems:"center", justifyContent:"center", padding:24
        }}>
          <div style={{ background:"#fff", borderRadius:20, padding:28,
            width:"100%", maxWidth:360, boxShadow:"0 24px 64px rgba(0,0,0,.18)" }}>
            <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:20 }}>
              <div style={{ width:40, height:40, borderRadius:"50%", background:"#fef2f2",
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width="18" height="18" fill="none" stroke="#dc2626" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </div>
              <div>
                <p style={{ fontWeight:600, fontSize:15, color:"#0f172a", margin:"0 0 4px" }}>Remove allocation?</p>
                <p style={{ fontSize:13, color:"#64748b", margin:0 }}>This action cannot be undone.</p>
              </div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setDelId(null)} style={{
                flex:1, padding:"10px 0", borderRadius:12, border:"1.5px solid #e2e8f0",
                background:"#fff", fontSize:13.5, fontWeight:600, color:"#475569", cursor:"pointer"
              }}>Cancel</button>
              <button onClick={()=>doDelete(delId)} style={{
                flex:1, padding:"10px 0", borderRadius:12, border:"none",
                background:"#dc2626", fontSize:13.5, fontWeight:600, color:"#fff", cursor:"pointer"
              }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth:1100, margin:"0 auto" }}>

        {/* PAGE HEADER */}
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28 }}>
          <div style={{
            width:46, height:46, borderRadius:14, background:"#10b981",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0
          }}>
            <svg width="22" height="22" fill="none" stroke="#fff" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <div>
            <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:"#0f172a", letterSpacing:"-0.3px" }}>
              Faculty Subject Allocation
            </h1>
            <p style={{ margin:"3px 0 0", fontSize:13, color:"#94a3b8" }}>
              Assign subjects to faculty per semester and section
            </p>
          </div>
        </div>

        {/* FORM CARD */}
        <div style={{ ...card, marginBottom:24 }}>

          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"20px 28px",
            background: editGroupKey ? "#fffbeb" : "#f8fffe",
            borderBottom:"1px solid #f1f5f9",
            borderRadius:"20px 20px 0 0"
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{
                width:32, height:32, borderRadius:10,
                background: editGroupKey ? "#fef3c7" : "#d1fae5",
                display:"flex", alignItems:"center", justifyContent:"center"
              }}>
                {editGroupKey
                  ? <svg width="16" height="16" fill="none" stroke="#d97706" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  : <svg width="16" height="16" fill="none" stroke="#10b981" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                    </svg>}
              </div>
              <span style={{ fontWeight:600, fontSize:14, color:"#1e293b" }}>
                {editGroupKey ? "Edit Allocation" : "Assign Subjects to Faculty"}
              </span>
            </div>
            {editGroupKey && (
              <button onClick={resetForm} style={{
                display:"flex", alignItems:"center", gap:6, padding:"6px 12px",
                borderRadius:10, border:"1.5px solid #e2e8f0", background:"#fff",
                fontSize:12.5, fontWeight:600, color:"#64748b", cursor:"pointer"
              }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={submit}>
            <div style={{ padding:"28px 28px 20px" }}>

              {/* Step 1 — Faculty */}
              <DividerLabel>Step 1 — Select Faculty</DividerLabel>
              <div style={{ marginBottom:28 }}>
                <Label>Faculty</Label>
                <Sel name="employee_id" value={form.employee_id} onChange={change}>
                  <option value="">Select Faculty</option>
                  {facultyList.map(f => (
                    <option key={f.employee_id} value={f.employee_id}>{f.name}</option>
                  ))}
                </Sel>
              </div>

              {/* Faculty Info — appears after faculty is chosen */}
              {facultyInfo && (
                <>
                  <DividerLabel>Faculty Information</DividerLabel>
                  {/* FIX #3: 4 fields → repeat(4,1fr) */}
                  <div style={{
                    display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16,
                    background:"#f8fafc", border:"1px solid #f1f5f9", borderRadius:14,
                    padding:18, marginBottom:28
                  }}>
                    <div><Label>Employee ID</Label>
                      <span style={{ fontSize:13.5, fontWeight:600, color:"#1e293b" }}>{facultyInfo.employee_id}</span>
                    </div>
                    <div><Label>Department</Label>
                      <span style={{ fontSize:13.5, fontWeight:600, color:"#1e293b" }}>{facultyInfo.department_name}</span>
                    </div>
                    <div><Label>Course</Label>
                      <span style={{ fontSize:13.5, fontWeight:600, color:"#1e293b" }}>{facultyInfo.course_name}</span>
                    </div>
                    <div><Label>Branch</Label>
                      <span style={{ fontSize:13.5, fontWeight:600, color:"#1e293b" }}>{facultyInfo.branch_name ?? "—"}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Step 2 — Semester / Section / Year */}
              <DividerLabel>Step 2 — Semester, Section &amp; Year</DividerLabel>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, marginBottom:28 }}>
                <div>
                  <Label>Semester</Label>
                  <Sel name="semester" value={form.semester} onChange={change}
                    disabled={!form.employee_id}>
                    <option value="">Select Semester</option>
                    {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </Sel>
                </div>
                <div>
                  <Label>Section</Label>
                  <Sel name="section" value={form.section} onChange={change}
                    disabled={!form.employee_id}>
                    <option value="">Select Section</option>
                    {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                  </Sel>
                </div>
                <div>
                  <Label>Academic Year</Label>
                  <Sel name="academic_year" value={form.academic_year} onChange={change}
                    disabled={!form.employee_id}>
                    <option value="">Select Year</option>
                    {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </Sel>
                </div>
              </div>

              {/* Step 3 — Subjects (hidden until semester chosen) */}
              {form.semester && (
                <>
                  <DividerLabel>Step 3 — Assign Subjects</DividerLabel>
                  {availableSubjects.length > 0 ? (
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                      {availableSubjects.map(s => (
                        <SubjectCheck
                          key={s.subject_id}
                          label={s.subject_name}
                          checked={form.subject_ids.includes(s.subject_id)}
                          onToggle={() => toggleSubject(s.subject_id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding:"24px 0", textAlign:"center", fontSize:13, color:"#94a3b8" }}>
                      {subjectEmptyMsg()}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* footer */}
            <div style={{
              padding:"16px 28px", background:"#f8fafc",
              borderTop:"1px solid #f1f5f9", borderRadius:"0 0 20px 20px",
              display:"flex", alignItems:"center", justifyContent:"space-between"
            }}>
              <span style={{ fontSize:12.5, color:"#94a3b8" }}>All fields are required</span>
              <button type="submit" disabled={saving} style={{
                display:"inline-flex", alignItems:"center", gap:8,
                padding:"11px 24px", borderRadius:12, border:"none",
                background: editGroupKey ? "#f59e0b" : "#10b981",
                color:"#fff", fontSize:13.5, fontWeight:700,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? .65 : 1,
                transition:"opacity .15s"
              }}>
                {saving
                  ? <><svg style={{ animation:"spin 1s linear infinite" }} width="14" height="14"
                        fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity=".25"/>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" opacity=".75"/>
                    </svg> Saving…</>
                  : editGroupKey
                    ? <><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                        </svg> Update Allocation</>
                    : <><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
                        </svg> Save Allocation</>}
              </button>
            </div>
          </form>
        </div>

        {/* TABLE CARD */}
        <div style={card}>
          <div style={{
            padding:"20px 28px", borderBottom:"1px solid #f1f5f9",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            flexWrap:"wrap", gap:12
          }}>
            <div>
              <p style={{ margin:0, fontSize:15, fontWeight:700, color:"#1e293b" }}>Current Allocations</p>
              <p style={{ margin:"2px 0 0", fontSize:12.5, color:"#94a3b8" }}>
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                {search ? ` for "${search}"` : ""}
              </p>
            </div>
            <div style={{ position:"relative" }}>
              <svg style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
                color:"#94a3b8", pointerEvents:"none" }}
                width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}
                style={{
                  paddingLeft:36, paddingRight:14, paddingTop:9, paddingBottom:9,
                  fontSize:13.5, border:"1.5px solid #e2e8f0", borderRadius:12,
                  outline:"none", width:220, fontFamily:"inherit", color:"#334155",
                  transition:"border-color .15s"
                }}
                onFocus={e=>e.target.style.borderColor="#10b981"}
                onBlur={e=>e.target.style.borderColor="#e2e8f0"}
              />
            </div>
          </div>

          <div style={{ overflowX:"auto" }}>
            {tableLoading ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
                gap:10, padding:"72px 0", color:"#94a3b8", fontSize:13.5 }}>
                <svg style={{ animation:"spin 1s linear infinite" }} width="18" height="18"
                  fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity=".25"/>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" opacity=".75"/>
                </svg>
                Loading allocations…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
                justifyContent:"center", padding:"72px 0", gap:8 }}>
                <div style={{ width:52, height:52, borderRadius:16, background:"#f1f5f9",
                  display:"flex", alignItems:"center", justifyContent:"center", marginBottom:4 }}>
                  <svg width="24" height="24" fill="none" stroke="#cbd5e1" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <p style={{ margin:0, fontSize:14, fontWeight:600, color:"#64748b" }}>No allocations found</p>
                <p style={{ margin:0, fontSize:12.5, color:"#94a3b8" }}>
                  {search ? "Try a different search term." : "Use the form above to create the first allocation."}
                </p>
              </div>
            ) : (
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:960 }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid #f8fafc", background:"#fafafa" }}>
                    {["Faculty","Department","Course","Semester","Section","Assigned Subjects","Academic Year","Status",""].map(h => (
                      <th key={h} style={{
                        textAlign:"left", padding:"12px 20px",
                        fontSize:11, fontWeight:700, letterSpacing:"0.08em",
                        textTransform:"uppercase", color:"#94a3b8", whiteSpace:"nowrap"
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => (
                    <tr key={`${a.employee_id}__${a.semester}__${a.section}__${a.academic_year}`}
                      style={{ borderBottom: i < filtered.length-1 ? "1px solid #f8fafc" : "none",
                        transition:"background .1s" }}
                      onMouseEnter={e=>e.currentTarget.style.background="#fafffe"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>

                      <td style={{ padding:"16px 20px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                          <div style={{
                            width:34, height:34, borderRadius:"50%", background:"#d1fae5",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:13, fontWeight:700, color:"#065f46", flexShrink:0
                          }}>
                            {a.faculty_name?.[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontSize:13.5, fontWeight:600, color:"#1e293b", whiteSpace:"nowrap" }}>
                            {a.faculty_name}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding:"16px 20px" }}>
                        <Badge color="indigo">{a.department_name}</Badge>
                      </td>

                      <td style={{ padding:"16px 20px" }}>
                        <Badge color="blue">{a.course_name}</Badge>
                      </td>

                      <td style={{ padding:"16px 20px" }}>
                        <span style={{ fontSize:13, color:"#475569", fontWeight:500 }}>Sem {a.semester}</span>
                      </td>

                      <td style={{ padding:"16px 20px" }}>
                        <div style={{
                          width:30, height:30, borderRadius:8, background:"#eef2ff",
                          display:"inline-flex", alignItems:"center", justifyContent:"center",
                          fontSize:12, fontWeight:700, color:"#4338ca"
                        }}>{a.section}</div>
                      </td>

                      <td style={{ padding:"16px 20px", maxWidth:280 }}>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                          {(a.subjects ?? []).map(s => (
                            <Badge key={s.subject_id} color="green">{s.subject_name}</Badge>
                          ))}
                        </div>
                      </td>

                      <td style={{ padding:"16px 20px" }}>
                        <span style={{ fontSize:12.5, color:"#64748b", fontWeight:500, whiteSpace:"nowrap" }}>
                          {a.academic_year}
                        </span>
                      </td>

                      <td style={{ padding:"16px 20px" }}>
                        <div style={{
                          display:"inline-flex", alignItems:"center", gap:7,
                          padding:"5px 12px", borderRadius:20, fontSize:12, fontWeight:600,
                          background: a.is_active ? "#f0fdf4" : "#f8fafc",
                          color:       a.is_active ? "#15803d" : "#64748b"
                        }}>
                          <Dot active={a.is_active}/>
                          {a.is_active ? "Active" : "Inactive"}
                        </div>
                      </td>

                      <td style={{ padding:"16px 20px" }}>
                        <div style={{ display:"flex", gap:4 }}>
                          <button onClick={() => startEdit(a)} title="Edit"
                            style={{ padding:8, borderRadius:9, border:"1px solid #e2e8f0",
                              background:"#fff", color:"#64748b", cursor:"pointer",
                              display:"flex", alignItems:"center", transition:"all .15s" }}
                            onMouseEnter={e=>{e.currentTarget.style.borderColor="#10b981";e.currentTarget.style.color="#10b981";e.currentTarget.style.background="#f0fdf4"}}
                            onMouseLeave={e=>{e.currentTarget.style.borderColor="#e2e8f0";e.currentTarget.style.color="#64748b";e.currentTarget.style.background="#fff"}}>
                            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                          <button onClick={() => setDelId(a.allocation_id)} title="Delete"
                            style={{ padding:8, borderRadius:9, border:"1px solid #e2e8f0",
                              background:"#fff", color:"#64748b", cursor:"pointer",
                              display:"flex", alignItems:"center", transition:"all .15s" }}
                            onMouseEnter={e=>{e.currentTarget.style.borderColor="#fca5a5";e.currentTarget.style.color="#dc2626";e.currentTarget.style.background="#fef2f2"}}
                            onMouseLeave={e=>{e.currentTarget.style.borderColor="#e2e8f0";e.currentTarget.style.color="#64748b";e.currentTarget.style.background="#fff"}}>
                            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {filtered.length > 0 && (
            <div style={{
              padding:"12px 28px", borderTop:"1px solid #f8fafc",
              display:"flex", justifyContent:"space-between",
              fontSize:12, color:"#94a3b8"
            }}>
              <span>Showing {filtered.length} of {rows.length} allocations</span>
              {filtered.length < rows.length && <span>Scroll horizontally for more →</span>}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}