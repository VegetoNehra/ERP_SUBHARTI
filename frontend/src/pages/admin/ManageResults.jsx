import { useState, useEffect, useMemo } from "react";
import api from "../../services/api";

const years = ["All Years", "2024-25", "2025-26", "2026-27"];

export default function ManageResults() {
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);

  // Filters store IDs (not display names) so they map directly to query params.
  const [filters, setFilters] = useState({
    collegeId: "",
    departmentId: "",
    courseId: "",
    branchId: "",
    semester: "",
    year: years[2],
  });

  // Semester options are derived from the selected course's total_semesters —
  // never a fixed 1-8 list, since courses vary (e.g. BCA = 6 semesters).
  const semesterOptions = useMemo(() => {
    if (!filters.courseId) return [];
    const course = courses.find((c) => String(c.id) === String(filters.courseId));
    const total = course?.total_semesters || 0;
    return Array.from({ length: total }, (_, i) => i + 1);
  }, [filters.courseId, courses]);

  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [modal, setModal] = useState(null);
  const [modalDetails, setModalDetails] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);
  const [search, setSearch] = useState("");
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.collegeId, filters.departmentId, filters.courseId, filters.branchId, filters.semester, filters.year]);

  const loadFilterOptions = async () => {
    try {
      const [c, d, co, b] = await Promise.all([
        api.get("/colleges"),
        api.get("/departments"),
        api.get("/courses"),
        api.get("/branches"),
      ]);
      setColleges(c.data || []);
      setDepartments(d.data || []);
      // Each course must include total_semesters so the semester dropdown
      // can be derived instead of hardcoded.
      setCourses(co.data || []);
      setBranches(b.data || []);
    } catch (err) {
      // filter dropdowns are non-critical; fail silently
    }
  };

  const loadResults = async () => {
    setLoadingResults(true);
    setError("");
    try {
      const res = await api.get("/results/admin", {
        params: {
          collegeId: filters.collegeId || undefined,
          departmentId: filters.departmentId || undefined,
          courseId: filters.courseId || undefined,
          branchId: filters.branchId || undefined,
          semester: filters.semester || undefined,
          academicYear: filters.year !== "All Years" ? filters.year : undefined,
        },
      });
      setResults(res.data?.results || []);
    } catch (err) {
      setError("Failed to load results");
    } finally {
      setLoadingResults(false);
    }
  };

  // Cascading: changing a higher-level filter clears the dependent ones below it,
  // since College → Department → Course → Branch → Semester is a strict hierarchy.
  const setFilter = (key, val) => {
    setFilters((f) => {
      const next = { ...f, [key]: val };
      if (key === "collegeId") {
        next.departmentId = "";
        next.courseId = "";
        next.branchId = "";
        next.semester = "";
      } else if (key === "departmentId") {
        next.courseId = "";
        next.branchId = "";
        next.semester = "";
      } else if (key === "courseId") {
        next.branchId = "";
        next.semester = "";
      } else if (key === "branchId") {
        next.semester = "";
      }
      return next;
    });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      await api.post("/results/generate", {
        collegeId: filters.collegeId || undefined,
        departmentId: filters.departmentId || undefined,
        courseId: filters.courseId || undefined,
        branchId: filters.branchId || undefined,
        semester: filters.semester || undefined,
        academicYear: filters.year !== "All Years" ? filters.year : undefined,
      });
      await loadResults();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to generate results");
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setError("");
    try {
      await api.post("/results/publish", {
        semester: filters.semester || undefined,
        branchId: filters.branchId || undefined,
        academicYear: filters.year !== "All Years" ? filters.year : undefined,
      });
      await loadResults();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to publish results");
    } finally {
      setPublishing(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get("/results/export", {
        params: {
          collegeId: filters.collegeId || undefined,
          departmentId: filters.departmentId || undefined,
          courseId: filters.courseId || undefined,
          branchId: filters.branchId || undefined,
          semester: filters.semester || undefined,
          academicYear: filters.year !== "All Years" ? filters.year : undefined,
        },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `results_sem${filters.semester || "all"}_${filters.year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to export results");
    }
  };

  const openModal = async (r) => {
    setModal(r);
    setLoadingModal(true);
    try {
      // Fetch detailed result info by result_id from admin endpoint
      const res = await api.get(`/results/admin/${r.result_id}`);
      setModalDetails(res.data?.subjects || []);
    } catch (err) {
      setModalDetails([]);
    } finally {
      setLoadingModal(false);
    }
  };

  const filtered = results.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.enrollment.includes(search)
  );

  const stats = {
    total: results.length,
    passed: results.filter((r) => r.status === "Pass").length,
    failed: results.filter((r) => r.status === "Fail").length,
    published: results.filter((r) => r.published).length,
  };

  return (
    <div style={{ padding: "28px 32px", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#1e293b", margin: 0 }}>Manage Results</h1>
        <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>Generate, review, and publish student results</p>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 16px", fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Students", value: stats.total, color: "#1e40af", bg: "#eff6ff" },
          { label: "Passed", value: stats.passed, color: "#16a34a", bg: "#f0fdf4" },
          { label: "Failed", value: stats.failed, color: "#dc2626", bg: "#fef2f2" },
          { label: "Published", value: stats.published, color: "#d97706", bg: "#fffbeb" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px" }}>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 6px", fontWeight: 500 }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 4 }}>College</label>
            <select
              value={filters.collegeId}
              onChange={(e) => setFilter("collegeId", e.target.value)}
              style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 7, padding: "7px 10px", fontSize: 13, color: "#1e293b", background: "#fff", outline: "none" }}
            >
              <option value="">All Colleges</option>
              {colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 4 }}>Department</label>
            <select
              value={filters.departmentId}
              onChange={(e) => setFilter("departmentId", e.target.value)}
              disabled={!filters.collegeId}
              style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 7, padding: "7px 10px", fontSize: 13, color: "#1e293b", background: filters.collegeId ? "#fff" : "#f8fafc", outline: "none" }}
            >
              <option value="">All Departments</option>
              {departments
                .filter((d) => !filters.collegeId || String(d.college_id) === String(filters.collegeId))
                .map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 4 }}>Course</label>
            <select
              value={filters.courseId}
              onChange={(e) => setFilter("courseId", e.target.value)}
              disabled={!filters.departmentId}
              style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 7, padding: "7px 10px", fontSize: 13, color: "#1e293b", background: filters.departmentId ? "#fff" : "#f8fafc", outline: "none" }}
            >
              <option value="">All Courses</option>
              {courses
                .filter((c) => !filters.departmentId || String(c.department_id) === String(filters.departmentId))
                .map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 4 }}>Branch</label>
            <select
              value={filters.branchId}
              onChange={(e) => setFilter("branchId", e.target.value)}
              disabled={!filters.courseId}
              style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 7, padding: "7px 10px", fontSize: 13, color: "#1e293b", background: filters.courseId ? "#fff" : "#f8fafc", outline: "none" }}
            >
              <option value="">All Branches</option>
              {branches
                .filter((b) => !filters.courseId || String(b.course_id) === String(filters.courseId))
                .map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 4 }}>Semester</label>
            <select
              value={filters.semester}
              onChange={(e) => setFilter("semester", e.target.value)}
              disabled={!filters.courseId}
              style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 7, padding: "7px 10px", fontSize: 13, color: "#1e293b", background: filters.courseId ? "#fff" : "#f8fafc", outline: "none" }}
            >
              <option value="">All Semesters</option>
              {/* Bounded by the selected course's total_semesters — e.g. BCA only shows 1-6 */}
              {semesterOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 4 }}>Year</label>
            <select
              value={filters.year}
              onChange={(e) => setFilter("year", e.target.value)}
              style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 7, padding: "7px 10px", fontSize: 13, color: "#1e293b", background: "#fff", outline: "none" }}
            >
              {years.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{ background: generating ? "#93c5fd" : "#1e40af", border: "none", borderRadius: 8, padding: "8px 20px", color: "#fff", fontWeight: 500, fontSize: 13, cursor: generating ? "not-allowed" : "pointer" }}
          >
            {generating ? "Generating…" : "Generate Results"}
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            style={{ background: "#fff", border: "1px solid #1e40af", borderRadius: 8, padding: "8px 20px", color: "#1e40af", fontWeight: 500, fontSize: 13, cursor: publishing ? "not-allowed" : "pointer" }}
          >
            {publishing ? "Publishing…" : "Publish All"}
          </button>
          <button
            onClick={handleExport}
            style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 20px", color: "#475569", fontWeight: 500, fontSize: 13, cursor: "pointer" }}
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: 0 }}>
            Semester {filters.semester} Results — {filters.year}
          </p>
          <input
            placeholder="Search name or enrollment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 12px", fontSize: 13, width: 240, outline: "none", color: "#1e293b" }}
          />
        </div>
        {loadingResults ? (
          <p style={{ padding: 20, color: "#94a3b8", fontSize: 14 }}>Loading results…</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Enrollment No", "Student Name", "SGPA", "CGPA", "Passed", "Failed", "Status", "Published", ""].map((h) => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.result_id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#1e40af", fontWeight: 500 }}>{r.enrollment_number}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#1e293b", fontWeight: 500 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#1e40af" }}>
                        {r.student_name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      {r.student_name}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#1e293b" }}>{Number(r.sgpa).toFixed(1)}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#1e293b" }}>{Number(r.cgpa).toFixed(1)}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#16a34a", fontWeight: 500 }}>{r.passed_subjects}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: r.failed_subjects > 0 ? "#dc2626" : "#94a3b8", fontWeight: 500 }}>{r.failed_subjects}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                      background: r.result_status === "PASS" ? "#f0fdf4" : "#fef2f2",
                      color: r.result_status === "PASS" ? "#16a34a" : "#dc2626",
                    }}>{r.result_status}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      fontSize: 11, padding: "3px 10px", borderRadius: 20,
                      background: r.published ? "#f0fdf4" : "#f8fafc",
                      color: r.published ? "#16a34a" : "#94a3b8",
                      fontWeight: 500,
                    }}>{r.published ? "Published" : "Draft"}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      onClick={() => openModal(r)}
                      style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 7, padding: "5px 14px", fontSize: 12, color: "#1e40af", cursor: "pointer", fontWeight: 500 }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ padding: "12px 20px", borderTop: "1px solid #f1f5f9", fontSize: 12, color: "#94a3b8" }}>
          Showing {filtered.length} of {results.length} students
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 14, width: 720, maxHeight: "80vh", overflowY: "auto", padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1e293b", margin: 0 }}>{modal.student_name}</h2>
                <p style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>{modal.enrollment_number} · Semester {filters.semester}</p>
              </div>
              <button onClick={() => { setModal(null); setModalDetails([]); }} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { label: "SGPA", val: Number(modal.sgpa).toFixed(2) },
                { label: "CGPA", val: Number(modal.cgpa).toFixed(2) },
                { label: "Earned / Total Credits", val: `${modal.earned_credits ?? "—"} / ${modal.total_credits ?? "—"}` },
                { label: "Percentage", val: modal.obtained_marks != null && modal.total_marks != null ? `${((modal.obtained_marks / modal.total_marks) * 100).toFixed(1)}%` : "—" },
              ].map((s) => (
                <div key={s.label} style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 16px", border: "1px solid #e2e8f0" }}>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 4px", fontWeight: 600 }}>{s.label}</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>{s.val}</p>
                </div>
              ))}
            </div>
            {loadingModal ? (
              <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading subject details…</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Code", "Subject", "Credits", "Int.", "Ext.", "Prac.", "Total", "Grade", "G.P.", "Status"].map((h) => (
                      <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontSize: 12, color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modalDetails.map((sub) => (
                    <tr key={sub.subject_code} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px 12px", fontSize: 13, color: "#1e40af", fontWeight: 500 }}>{sub.subject_code}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13, color: "#1e293b" }}>{sub.subject_name}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13 }}>{sub.credits}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13 }}>{sub.internal_marks}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13 }}>{sub.external_marks}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13 }}>{sub.practical_marks === 0 ? "—" : sub.practical_marks}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600 }}>{sub.total_marks}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#1e40af", background: "#eff6ff", padding: "2px 8px", borderRadius: 12 }}>{sub.grade}</span>
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 13 }}>{sub.grade_points}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ fontSize: 12, color: sub.pass ? "#16a34a" : "#dc2626", fontWeight: 600 }}>{sub.pass ? "Pass" : "Fail"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}