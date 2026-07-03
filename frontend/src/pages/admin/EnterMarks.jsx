import { useState, useEffect } from "react";
import api from "../../services/api";

export default function EnterMarks() {
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [locked, setLocked] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  // Mark distribution is per-subject, not a fixed constant — comes from the
  // allocation/class payload (subjects.internal_max / external_max / practical_max)
  const MAX = {
    internal: selectedClass?.internal_max ?? 0,
    external: selectedClass?.external_max ?? 0,
    practical: selectedClass?.practical_max ?? 0,
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoadingClasses(true);
    try {
      const res = await api.get("/results/faculty/classes");
      setClasses(Array.isArray(res.data.classes) ? res.data.classes : []);
    } catch (err) {
      setError("Failed to load classes");
    } finally {
      setLoadingClasses(false);
    }
  };  

  const openClass = async (cls) => {
    setLoadingStudents(true);
    setSaved(false);
    setError("");
    try {
        const res = await api.get(`/results/faculty/${cls.allocation_id}/students`);
      // Backend returns { success, classInfo, students }
      const students = res.data?.students || [];
      const classInfo = res.data?.classInfo || {};
      // Merge class info and subject mark limits for MAX calculation
      const mergedClass = { ...cls, ...classInfo, internal_max: cls.internal_max, external_max: cls.external_max, practical_max: cls.practical_max };
      setSelectedClass(mergedClass);
      setStudents(students);
      const init = {};
      students.forEach((s) => {
        init[s.profile_id] = {
          internal: s.internal_marks ?? "",
          external: s.external_marks ?? "",
          practical: s.practical_marks ?? "",
          remarks: s.remarks ?? "",
        };
      });
      setMarks(init);
      setLocked(cls.locked);
    } catch (err) {
      setError("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleMark = (studentId, field, value) => {
    const max = MAX[field];
    const num = value === "" ? "" : Math.min(Number(value), max);
    setMarks((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: num },
    }));
    setSaved(false);
  };

  const getTotal = (studentId) => {
    const m = marks[studentId];
    if (!m) return 0;
    return (Number(m.internal) || 0) + (Number(m.external) || 0) + (Number(m.practical) || 0);
  };

  const filtered = students.filter(
    (s) =>
      s.student_name.toLowerCase().includes(search.toLowerCase()) ||
      s.enrollment_number.toLowerCase().includes(search.toLowerCase())
  );

  const buildPayload = () => ({
    allocationId: selectedClass.allocation_id,
    marks: students.map((s) => ({
      enrollment_number: s.enrollment_number,
      internal_marks: marks[s.profile_id]?.internal,
      external_marks: marks[s.profile_id]?.external,
      practical_marks: marks[s.profile_id]?.practical,
      remarks: marks[s.profile_id]?.remarks,
    })),
  });

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await api.post("/results/faculty/save-marks", buildPayload());
      setSaved(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const handleLock = async () => {
    setSaving(true);
    setError("");
    try {
      await api.put(`/results/faculty/lock/${selectedClass.allocation_id}`);
      setLocked(true);
      setSaved(true);
      setClasses((prev) =>
        prev.map((c) =>
          c.allocation_id === selectedClass.allocation_id ? { ...c, locked: true } : c
        )
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit final marks");
    } finally {
      setSaving(false);
    }
  };

  const groupedByTerm = classes.reduce((acc, cls) => {
    const key = `Semester ${cls.semester} — Section ${cls.section}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(cls);
    return acc;
  }, {});

  return (
    <div style={{ padding: "28px 32px", background: "#f8fafc", minHeight: "100vh" }}>
      {!selectedClass ? (
        <>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "#1e293b", margin: 0 }}>
              Enter Marks
            </h1>
            <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
              Select a subject to enter or update student marks
            </p>
          </div>

          {error && (
            <div style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 16px", fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {loadingClasses ? (
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading classes…</p>
          ) : classes.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: 14 }}>No allocated subjects found.</p>
          ) : (
            Object.entries(groupedByTerm).map(([term, list]) => (
              <div key={term} style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                  {term}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {list.map((cls) => (
                    <div
                      key={cls.allocation_id}
                      onClick={() => openClass(cls)}
                      style={{
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 10,
                        padding: "18px 20px",
                        cursor: "pointer",
                        transition: "box-shadow 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(30,64,175,0.10)")}
                      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#1e40af", background: "#eff6ff", padding: "3px 10px", borderRadius: 20 }}>
                          {cls.subject_code}
                        </span>
                        {cls.locked ? (
                          <span style={{ fontSize: 11, color: "#dc2626", background: "#fef2f2", padding: "3px 10px", borderRadius: 20, fontWeight: 500 }}>
                            Locked
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: "#16a34a", background: "#f0fdf4", padding: "3px 10px", borderRadius: 20, fontWeight: 500 }}>
                            Open
                          </span>
                        )}
                      </div>
                      <p style={{ fontWeight: 600, fontSize: 15, color: "#1e293b", margin: "0 0 4px" }}>{cls.subject_name}</p>
                      <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{cls.branch_name}</p>
                      <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{cls.course_name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button
                onClick={() => { setSelectedClass(null); setError(""); }}
                style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13, color: "#475569" }}
              >
                ← Back
              </button>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                  {selectedClass.subject_name}
                  <span style={{ fontSize: 13, fontWeight: 400, color: "#64748b", marginLeft: 10 }}>({selectedClass.subject_code})</span>
                </h1>
                <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0" }}>
                  Semester {selectedClass.semester} · Section {selectedClass.section} · {selectedClass.branch_name}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {saved && !locked && (
                <span style={{ fontSize: 12, color: "#16a34a", background: "#f0fdf4", padding: "4px 12px", borderRadius: 20 }}>
                  ✓ Draft saved
                </span>
              )}
              {!locked && (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 18px", cursor: saving ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 500, color: "#475569" }}
                  >
                    {saving ? "Saving…" : "Save Draft"}
                  </button>
                  <button
                    onClick={handleLock}
                    disabled={saving}
                    style={{ background: "#1e40af", border: "none", borderRadius: 8, padding: "8px 18px", cursor: saving ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 500, color: "#fff" }}
                  >
                    {saving ? "Submitting…" : "Submit Final"}
                  </button>
                </>
              )}
              {locked && (
                <span style={{ fontSize: 12, color: "#dc2626", background: "#fef2f2", padding: "6px 14px", borderRadius: 20, fontWeight: 500 }}>
                  🔒 Marks Locked
                </span>
              )}
            </div>
          </div>

          {error && (
            <div style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 16px", fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 20 }}>
                {[
                  { label: "Internal Max", val: MAX.internal },
                  { label: "External Max", val: MAX.external },
                  { label: "Practical Max", val: MAX.practical },
                ].map((x) => (
                  <span key={x.label} style={{ fontSize: 12, color: "#64748b" }}>
                    {x.label}: <strong style={{ color: "#1e293b" }}>{x.val || "—"}</strong>
                  </span>
                ))}
              </div>
              <input
                placeholder="Search student or enrollment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 12px", fontSize: 13, width: 240, outline: "none", color: "#1e293b" }}
              />
            </div>

            <div style={{ overflowX: "auto" }}>
              {loadingStudents ? (
                <p style={{ padding: 20, color: "#94a3b8", fontSize: 14 }}>Loading students…</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Enrollment No", "Student Name", "Internal", "External", "Practical", "Total", "Remarks"].map((h) => (
                        <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((student, i) => {
                      const m = marks[student.profile_id] || {};
                      const total = getTotal(student.profile_id);
                      const isOver = (field) => Number(m[field]) > MAX[field];
                      return (
                        <tr key={student.profile_id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                          <td style={{ padding: "10px 16px", fontSize: 13, color: "#1e40af", fontWeight: 500 }}>{student.enrollment_number}</td>
                          <td style={{ padding: "10px 16px", fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{student.student_name}</td>
                          {["internal", "external", "practical"].map((field) => (
                            <td key={field} style={{ padding: "8px 16px" }}>
                              <input
                                type="number"
                                min={0}
                                max={MAX[field]}
                                disabled={locked}
                                value={m[field] ?? ""}
                                onChange={(e) => handleMark(student.profile_id, field, e.target.value)}
                                style={{
                                  width: 72,
                                  border: `1px solid ${isOver(field) ? "#dc2626" : "#e2e8f0"}`,
                                  borderRadius: 6,
                                  padding: "5px 8px",
                                  fontSize: 13,
                                  color: "#1e293b",
                                  background: locked ? "#f8fafc" : "#fff",
                                  outline: "none",
                                }}
                              />
                            </td>
                          ))}
                          <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{total}</td>
                          <td style={{ padding: "8px 16px" }}>
                            <input
                              type="text"
                              disabled={locked}
                              placeholder="Optional"
                              value={m.remarks ?? ""}
                              onChange={(e) =>
                                setMarks((prev) => ({
                                  ...prev,
                                  [student.profile_id]: { ...prev[student.profile_id], remarks: e.target.value },
                                }))
                              }
                              style={{ width: 120, border: "1px solid #e2e8f0", borderRadius: 6, padding: "5px 8px", fontSize: 12, color: "#64748b", background: locked ? "#f8fafc" : "#fff", outline: "none" }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #f1f5f9", fontSize: 12, color: "#94a3b8" }}>
              Showing {filtered.length} of {students.length} students
            </div>
          </div>
        </>
      )}
    </div>
  );
}