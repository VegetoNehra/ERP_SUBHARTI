import { useEffect, useState } from "react";
import { Users, Search, Hash, GraduationCap, Phone, Mail } from "lucide-react";
import api from "../../services/api";

const COLUMNS = [
  { key: "enrollment_number", label: "Enrollment No." },
  { key: "student_name",      label: "Name" },
  { key: "father_name",       label: "Father's Name" },
  { key: "mother_name",       label: "Mother's Name" },
  { key: "college_name",      label: "College" },
  { key: "department_name",   label: "Department" },
  { key: "course_name",       label: "Course" },
  { key: "branch_name",       label: "Branch" },
  { key: "semester",          label: "Sem" },
  { key: "gender",            label: "Gender" },
  { key: "dob",               label: "DOB" },
  { key: "phone",             label: "Phone" },
  { key: "email",             label: "Email" },
];

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get("/admin/manage-students")
      .then(r => setStudents(r.data.students))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s =>
    s.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.enrollment_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", backgroundColor: "#F1F5F9", fontFamily: "'Inter', sans-serif", padding: "32px 28px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, #1E4DB7, #0F2557)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(30,77,183,0.25)" }}>
              <Users size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0F2557" }}>Manage Students</h1>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748B" }}>{students.length} registered students</p>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: "relative", width: "320px" }}>
            <Search size={15} color="#94A3B8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text" placeholder="Search by name or enrollment no…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 14px 10px 36px", fontSize: "13.5px", border: "1.5px solid #E2E8F0", borderRadius: "10px", backgroundColor: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "'Inter', sans-serif", color: "#0F172A" }}
              onFocus={e => { e.target.style.borderColor = "#1E4DB7"; e.target.style.boxShadow = "0 0 0 3px rgba(30,77,183,0.1)"; }}
              onBlur={e =>  { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
            />
          </div>
        </div>

        {/* Table Card */}
        <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px", fontFamily: "'Inter', sans-serif" }}>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                  {COLUMNS.map(col => (
                    <th key={col.key} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      {COLUMNS.map(col => (
                        <td key={col.key} style={{ padding: "14px 16px" }}>
                          <div style={{ height: "12px", backgroundColor: "#F1F5F9", borderRadius: "4px", width: `${50 + Math.random() * 40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length} style={{ padding: "48px", textAlign: "center", color: "#94A3B8", fontSize: "14px" }}>
                      <Users size={32} color="#CBD5E1" style={{ marginBottom: "8px", display: "block", margin: "0 auto 8px" }} />
                      No students found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s, i) => (
                    <tr key={s.enrollment_number}
                      style={{ borderBottom: "1px solid #F1F5F9", backgroundColor: i % 2 === 0 ? "#fff" : "#FAFBFF", transition: "background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#EEF2FF"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = i % 2 === 0 ? "#fff" : "#FAFBFF"}
                    >
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "#1E4DB7", whiteSpace: "nowrap" }}>{s.enrollment_number}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0F172A", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #4F8EF7, #1E4DB7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: 700, flexShrink: 0 }}>
                            {s.student_name?.[0]?.toUpperCase()}
                          </div>
                          {s.student_name}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#475569" }}>{s.father_name}</td>
                      <td style={{ padding: "12px 16px", color: "#475569" }}>{s.mother_name}</td>
                      <td style={{ padding: "12px 16px", color: "#475569" }}>
                        {s.college_name}
                      </td>

                      <td style={{ padding: "12px 16px", color: "#475569" }}>
                        {s.department_name}
                      </td>

                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: "20px",
                            backgroundColor: "#EEF2FF",
                            color: "#1E4DB7",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {s.course_name}
                        </span>
                      </td>

                      <td style={{ padding: "12px 16px", color: "#475569" }}>
                        {s.branch_name}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span style={{ padding: "3px 10px", borderRadius: "20px", backgroundColor: "#F0FDF4", color: "#059669", fontSize: "12px", fontWeight: 600 }}>{s.semester}</span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#475569" }}>{s.gender}</td>
                      <td style={{ padding: "12px 16px", color: "#64748B", whiteSpace: "nowrap" }}>{s.dob ? new Date(s.dob).toLocaleDateString("en-IN") : "—"}</td>
                      <td style={{ padding: "12px 16px", color: "#475569", whiteSpace: "nowrap" }}>{s.phone}</td>
                      <td style={{ padding: "12px 16px", color: "#475569", whiteSpace: "nowrap" }}>{s.email}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && filtered.length > 0 && (
            <div style={{ padding: "12px 20px", borderTop: "1px solid #F1F5F9", backgroundColor: "#FAFBFF", fontSize: "12px", color: "#94A3B8" }}>
              Showing {filtered.length} of {students.length} students
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
