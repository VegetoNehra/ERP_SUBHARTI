import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

const gradeColor = (grade) => {
  if (["A+", "O"].includes(grade)) return { bg: "#f0fdf4", color: "#16a34a" };
  if (["A"].includes(grade)) return { bg: "#eff6ff", color: "#1e40af" };
  if (["B+", "B"].includes(grade)) return { bg: "#f5f3ff", color: "#7c3aed" };
  return { bg: "#fffbeb", color: "#d97706" };
};

export default function ResultDetails() {
  const params = useParams ? useParams() : { semester: "3" };
  const navigate = useNavigate ? useNavigate() : null;
  const sem = parseInt(params.semester || "3");

  const [student, setStudent] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMarksheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sem]);

  const loadMarksheet = async () => {
    setLoading(true);
    setError("");
    try {
      // Returns the logged-in student's profile + full marksheet for the given semester
      const res = await api.get(`/results/student/${sem}`);
      setStudent(res.data?.student || null);
      setData(res.data?.result || null);
    } catch (err) {
      setError("Failed to load marksheet");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "28px 32px", background: "#f8fafc", minHeight: "100vh" }}>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading marksheet…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: "28px 32px", background: "#f8fafc", minHeight: "100vh" }}>
        <button
          onClick={() => navigate && navigate("/results")}
          style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13, color: "#475569", marginBottom: 16 }}
        >
          ← Back
        </button>
        <div style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 16px", fontSize: 13 }}>
          {error || "Marksheet not available for this semester."}
        </div>
      </div>
    );
  }

  const totalMarks = data.subjects.reduce((a, s) => a + s.maxTotal, 0);
  const obtainedMarks = data.subjects.reduce((a, s) => a + s.total, 0);
  const totalPassed = data.subjects.filter((s) => s.status === "Pass").length;
  const totalFailed = data.subjects.filter((s) => s.status === "Fail").length;
  const percentage = ((obtainedMarks / totalMarks) * 100).toFixed(1);

  return (
    <div style={{ padding: "28px 32px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => navigate && navigate("/results")}
            style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13, color: "#475569" }}
          >
            ← Back
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: "#1e293b", margin: 0 }}>
              Semester {data.semester} Marksheet
            </h1>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{data.academicYear}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => window.print()}
            style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 18px", fontSize: 13, color: "#475569", cursor: "pointer", fontWeight: 500 }}
          >
            🖨 Print
          </button>
          <button
            onClick={async () => {
              try {
                const res = await api.get(`/results/student/${student.enrollment}/download`, { params: { semester: sem }, responseType: "blob" });
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", `marksheet_sem${sem}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
              } catch (err) {
                setError("Failed to download marksheet");
              }
            }}
            style={{ background: "#1e40af", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, color: "#fff", cursor: "pointer", fontWeight: 500 }}
          >
            ↓ Download PDF
          </button>
        </div>
      </div>

      {/* Student info card */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#1e40af" }}>
              {student?.name?.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 16, color: "#1e293b", margin: 0 }}>{student?.name}</p>
              <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0" }}>Enrollment: {student?.enrollment}</p>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{student?.college}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Course", value: student?.course },
              { label: "Branch", value: student?.branch },
              { label: "Semester", value: data.semester },
              { label: "Academic Year", value: data.academicYear },
            ].map((f) => (
              <div key={f.label} style={{ textAlign: "right" }}>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 2px", fontWeight: 500 }}>{f.label}</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#1e293b", margin: 0 }}>{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SGPA / CGPA / Credits / Status row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "SGPA", value: data.sgpa.toFixed(2), color: "#1e40af", bg: "#eff6ff" },
          { label: "CGPA", value: data.cgpa.toFixed(2), color: "#7c3aed", bg: "#f5f3ff" },
          { label: "Total Credits", value: data.totalCredits, color: "#d97706", bg: "#fffbeb" },
          { label: "Earned Credits", value: data.earnedCredits, color: "#16a34a", bg: "#f0fdf4" },
          { label: "Result", value: data.status, color: data.status === "Pass" ? "#16a34a" : "#dc2626", bg: data.status === "Pass" ? "#f0fdf4" : "#fef2f2" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px" }}>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 6px", fontWeight: 500 }}>{s.label}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Subject table */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: 0 }}>Subject-wise Marks</p>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Subject Code", "Subject Name", "Internal", "External", "Practical", "Total", "Credits", "Grade", "Grade Point", "Status"].map((h) => (
                <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.subjects.map((sub, i) => {
              const gc = gradeColor(sub.grade);
              return (
                <tr key={sub.code} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: "#1e40af", fontWeight: 500 }}>{sub.code}</td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{sub.name}</td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: "#475569" }}>{sub.internal}</td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: "#475569" }}>{sub.external}</td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: sub.practical === 0 ? "#d1d5db" : "#475569" }}>
                    {sub.practical === 0 ? "—" : sub.practical}
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                    {sub.total}
                    <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>/{sub.maxTotal}</span>
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: "#475569" }}>{sub.credits}</td>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: gc.bg, color: gc.color }}>
                      {sub.grade}
                    </span>
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: "#475569" }}>{sub.gradePoint}</td>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: sub.status === "Pass" ? "#16a34a" : "#dc2626" }}>
                      {sub.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer summary */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "18px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 0 }}>
          {[
            { label: "Total Subjects", value: data.subjects.length },
            { label: "Passed", value: totalPassed, color: "#16a34a" },
            { label: "Failed", value: totalFailed, color: totalFailed > 0 ? "#dc2626" : undefined },
            { label: "Max Marks", value: totalMarks },
            { label: "Obtained Marks", value: obtainedMarks },
            { label: "Percentage", value: `${percentage}%`, color: "#1e40af" },
          ].map((f, i) => (
            <div key={f.label} style={{ padding: "0 20px", borderRight: i < 5 ? "1px solid #f1f5f9" : "none" }}>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 4px", fontWeight: 500 }}>{f.label}</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: f.color || "#1e293b", margin: 0 }}>{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Result badge */}
      <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
        <div style={{
          background: data.status === "Pass" ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${data.status === "Pass" ? "#bbf7d0" : "#fecaca"}`,
          borderRadius: 10,
          padding: "14px 48px",
          textAlign: "center",
        }}>
          <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 4px", fontWeight: 500 }}>Final Result</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: data.status === "Pass" ? "#16a34a" : "#dc2626", margin: 0, letterSpacing: "0.06em" }}>
            {data.status.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
}