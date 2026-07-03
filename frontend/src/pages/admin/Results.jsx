import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function CGPABar({ cgpa }) {
  const pct = ((cgpa / 10) * 100).toFixed(0);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 99 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "#1e40af", borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 12, color: "#64748b", minWidth: 28 }}>{cgpa}</span>
    </div>
  );
}

export default function Results() {
  const navigate = useNavigate ? useNavigate() : null;
  const [student, setStudent] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setLoading(true);
    setError("");
    try {
      // Returns the logged-in student's profile + semester-wise result summaries
      const res = await api.get("/results/my-results");
      setStudent(res.data?.student || null);
      setSemesters(res.data?.semesters || []);
    } catch (err) {
      setError("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  const latest = semesters.filter((s) => s.published && s.cgpa).at(-1);
  const published = semesters.filter((s) => s.published);

  const handleView = (sem) => {
    if (navigate) navigate(`/results/${sem}`);
  };

  if (loading) {
    return (
      <div style={{ padding: "28px 32px", background: "#f8fafc", minHeight: "100vh" }}>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading results…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 32px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#1e293b", margin: 0 }}>My Results</h1>
        <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
          {student?.course} · {student?.branch}
        </p>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 16px", fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Current CGPA", value: latest?.cgpa?.toFixed(2) ?? "—", color: "#1e40af", bg: "#eff6ff" },
          { label: "Latest SGPA", value: latest?.sgpa?.toFixed(2) ?? "—", color: "#7c3aed", bg: "#f5f3ff" },
          { label: "Semesters Cleared", value: `${published.length} / ${semesters.length}`, color: "#16a34a", bg: "#f0fdf4" },
          { label: "Backlogs", value: semesters.filter((s) => s.failed > 0).length, color: "#dc2626", bg: "#fef2f2" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px" }}>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 6px", fontWeight: 500 }}>{s.label}</p>
            <p style={{ fontSize: 26, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* CGPA Progress */}
      {semesters.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px 24px", marginBottom: 24 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: "0 0 16px" }}>CGPA Trend</p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 80 }}>
            {semesters.map((s) => {
              const h = s.cgpa ? (s.cgpa / 10) * 72 : 10;
              return (
                <div key={s.semester} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 11, color: "#64748b" }}>{s.cgpa?.toFixed(1) ?? "—"}</span>
                  <div style={{ width: "100%", height: h, background: s.published && s.cgpa ? "#1e40af" : "#e2e8f0", borderRadius: "4px 4px 0 0", minHeight: 6 }} />
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>S{s.semester}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Semester cards */}
      <p style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
        Semester-wise Results
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {semesters.map((s) => (
          <div
            key={s.semester}
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              padding: "18px 20px",
              opacity: s.published ? 1 : 0.6,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>Semester {s.semester}</p>
                <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{s.academicYear}</p>
              </div>
              {s.published && s.status ? (
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                  background: s.status === "Pass" ? "#f0fdf4" : "#fef2f2",
                  color: s.status === "Pass" ? "#16a34a" : "#dc2626",
                }}>
                  {s.status}
                </span>
              ) : (
                <span style={{ fontSize: 11, color: "#94a3b8", background: "#f8fafc", padding: "3px 10px", borderRadius: 20 }}>
                  Awaited
                </span>
              )}
            </div>

            {s.published && s.sgpa ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div>
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 2px" }}>SGPA</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: "#1e40af", margin: 0 }}>{s.sgpa.toFixed(1)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 2px" }}>CGPA</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: "#7c3aed", margin: 0 }}>{s.cgpa.toFixed(1)}</p>
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <CGPABar cgpa={s.cgpa} />
                </div>
                <div style={{ display: "flex", gap: 10, fontSize: 12, color: "#64748b", marginBottom: 14 }}>
                  <span>✅ {s.passed} passed</span>
                  {s.failed > 0 && <span>❌ {s.failed} failed</span>}
                </div>
                <button
                  onClick={() => handleView(s.semester)}
                  style={{ width: "100%", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "8px", fontSize: 13, fontWeight: 500, color: "#1e40af", cursor: "pointer" }}
                >
                  View Marksheet →
                </button>
              </>
            ) : (
              <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 8 }}>
                Results not published yet
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}