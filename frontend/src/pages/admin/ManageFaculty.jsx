import { useEffect, useState } from "react";
import { GraduationCap, Search } from "lucide-react";
import api from "../../services/api";

const COLUMNS = [
  { key: "employee_id",     label: "Employee ID"    },
  { key: "user_id",         label: "User ID"        },
  { key: "name",            label: "Name"           },
  { key: "department_name", label: "Department"     },
  { key: "course_name",     label: "Course"         },
  { key: "branch_name",     label: "Branch"         },
  { key: "gender",          label: "Gender"         },
  { key: "dob",             label: "Date of Birth"  },
  { key: "phone",           label: "Phone"          },
  { key: "email",           label: "Email"          },
  { key: "created_at",      label: "Created On"     },
];

export default function ManageFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/manage-faculty")
      .then(r => setFaculty(r.data.faculty))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const term     = search.toLowerCase();
  const filtered = faculty.filter(f =>
    f.name?.toLowerCase().includes(term) ||
    f.employee_id?.toLowerCase().includes(term) ||
    f.department_name?.toLowerCase().includes(term) ||
    f.course_name?.toLowerCase().includes(term) ||
    f.branch_name?.toLowerCase().includes(term)
  );

  // Base cell — NO whiteSpace:nowrap anywhere, let cells wrap naturally
  const cell = {
    padding: "12px 14px",
    verticalAlign: "middle",
    wordBreak: "break-word",
    maxWidth: "180px",
  };

  const thCell = {
    padding: "11px 14px",
    textAlign: "left",
    fontSize: "10.5px",
    fontWeight: 700,
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      backgroundColor: "#F1F5F9",
      fontFamily: "'Inter', sans-serif",
      padding: "28px 24px",
      boxSizing: "border-box",
      /* Never wider than the layout column it sits in */
      width: "100%",
      maxWidth: "100%",
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, #059669, #065F46)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 14px rgba(5,150,105,0.30)" }}>
              <GraduationCap size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#0F2557" }}>Manage Faculty</h1>
              <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#94A3B8" }}>{faculty.length} registered faculty members</p>
            </div>
          </div>

          {/* Search — shrinks on small viewports */}
          <div style={{ position: "relative", width: "min(280px, 100%)" }}>
            <Search size={14} color="#94A3B8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Search name, ID, department…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "9px 12px 9px 36px", fontSize: "13px", border: "1.5px solid #E2E8F0", borderRadius: "10px", backgroundColor: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "'Inter', sans-serif", color: "#0F172A" }}
              onFocus={e => { e.target.style.borderColor = "#059669"; e.target.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.10)"; }}
              onBlur={e  => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
            />
          </div>
        </div>

        {/* ── Table Card ── */}
        <div style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          /* Clip to rounded corners; scroll lives one level inside */
          overflow: "hidden",
          /* Critical: prevent flex/grid parents from stretching this wider */
          minWidth: 0,
        }}>

          {/* Scroll container — ONLY this div scrolls horizontally */}
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={{
              /* table-layout:fixed + width:100% makes columns share available space
                 instead of each demanding its natural content width */
              tableLayout: "fixed",
              width: "100%",
              /* Absolute minimum before we give up and let the user scroll */
              minWidth: "860px",
              borderCollapse: "collapse",
              fontSize: "13px",
              fontFamily: "'Inter', sans-serif",
            }}>
              {/* Fixed proportional widths — they'll scale together */}
              <colgroup>
                <col style={{ width: "10%" }} /> {/* Employee ID */}
                <col style={{ width: "6%"  }} /> {/* User ID     */}
                <col style={{ width: "12%" }} /> {/* Name        */}
                <col style={{ width: "13%" }} /> {/* Department  */}
                <col style={{ width: "11%" }} /> {/* Course      */}
                <col style={{ width: "9%"  }} /> {/* Branch      */}
                <col style={{ width: "6%"  }} /> {/* Gender      */}
                <col style={{ width: "9%"  }} /> {/* DOB         */}
                <col style={{ width: "9%"  }} /> {/* Phone       */}
                <col style={{ width: "11%" }} /> {/* Email       */}
                <col style={{ width: "8%"  }} /> {/* Created On  */}
              </colgroup>

              <thead>
                <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #EEF2F7" }}>
                  {COLUMNS.map(col => <th key={col.key} style={thCell}>{col.label}</th>)}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      {COLUMNS.map(col => (
                        <td key={col.key} style={cell}>
                          <div style={{ height: "12px", backgroundColor: "#F1F5F9", borderRadius: "6px", width: "70%" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length} style={{ padding: "56px", textAlign: "center", color: "#94A3B8", fontSize: "14px" }}>
                      <GraduationCap size={34} color="#CBD5E1" style={{ display: "block", margin: "0 auto 10px" }} />
                      No faculty members found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((f, i) => {
                    const rowBg = i % 2 === 0 ? "#fff" : "#FAFBFF";
                    return (
                      <tr
                        key={f.employee_id}
                        style={{ borderBottom: "1px solid #F1F5F9", backgroundColor: rowBg, transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F0FDF4"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = rowBg}
                      >
                        {/* Employee ID */}
                        <td style={{ ...cell, fontWeight: 700, color: "#059669", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>
                          {f.employee_id || "—"}
                        </td>

                        {/* User ID */}
                        <td style={{ ...cell, color: "#94A3B8", fontSize: "12px" }}>
                          {f.user_id || "—"}
                        </td>

                        {/* Name + avatar */}
                        <td style={{ ...cell, fontWeight: 600, color: "#0F172A" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #34D399, #059669)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: 700, flexShrink: 0 }}>
                              {f.name?.[0]?.toUpperCase()}
                            </div>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</span>
                          </div>
                        </td>

                        {/* Department */}
                        <td style={cell}>
                          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "20px", backgroundColor: "#EFF6FF", color: "#2563EB", fontSize: "11.5px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
                            {f.department_name || "—"}
                          </span>
                        </td>

                        {/* Course */}
                        <td style={cell}>
                          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "20px", backgroundColor: "#ECFDF5", color: "#059669", fontSize: "11.5px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
                            {f.course_name || "—"}
                          </span>
                        </td>

                        {/* Branch */}
                        <td style={{ ...cell, color: "#475569", fontSize: "12.5px" }}>
                          {f.branch_name || "—"}
                        </td>

                        {/* Gender */}
                        <td style={{ ...cell, color: "#475569" }}>{f.gender || "—"}</td>

                        {/* DOB */}
                        <td style={{ ...cell, color: "#64748B", fontSize: "12.5px" }}>
                          {f.dob ? new Date(f.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>

                        {/* Phone */}
                        <td style={{ ...cell, color: "#475569", fontSize: "12.5px" }}>{f.phone || "—"}</td>

                        {/* Email */}
                        <td style={{ ...cell, color: "#475569", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {f.email || "—"}
                        </td>

                        {/* Created On */}
                        <td style={{ ...cell, color: "#64748B", fontSize: "12.5px" }}>
                          {f.created_at
                            ? new Date(f.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                            : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > 0 && (
            <div style={{ padding: "12px 18px", borderTop: "1px solid #F1F5F9", backgroundColor: "#FAFBFF", fontSize: "12px", color: "#94A3B8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Showing <strong style={{ color: "#475569" }}>{filtered.length}</strong> of <strong style={{ color: "#475569" }}>{faculty.length}</strong> faculty members</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}