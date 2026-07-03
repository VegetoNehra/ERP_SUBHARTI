  import { useState, useEffect } from "react";
  import api from "../../services/api";
  import {
    CalendarCheck,
    GraduationCap,
    BookOpen,
    Wallet,
    Bell,
    User,
    Phone,
    Mail,
    Hash,
  } from "lucide-react";
  // BUG 1 FIXED: Removed `Award` — it was listed in ACADEMIC_INFO but never imported,
  // causing a ReferenceError crash at runtime.

  export default function StudentDashboard() {
    const [student, setStudent] = useState(null);
    const [notices, setNotices] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
      const fetchStudent = async () => {
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          const response = await api.get(`/student/profile/${user.id}`);
          setStudent(response.data);
        } catch (err) {
          setError("Failed to fetch student data");
          console.error(err);
        }
      };
      fetchStudent();
    }, []);

    useEffect(() => {
      const fetchNotices = async () => {
        try {
          const response = await api.get("/student/notices");
          setNotices(response.data.notices);
        } catch (err) {
          console.error(err);
        }
      };
      fetchNotices();
    }, []);

    // ── Loading / Error states ──────────────────────────────────────────────────
    if (error) return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "70vh" }}>
        <p style={{ color: "#DC2626", fontSize: "15px" }}>{error}</p>
      </div>
    );

    if (!student) return (
      <>
        {/* BUG 3 FIXED: Moved the single @keyframes spin definition here so it's
            available for the spinner and not duplicated at the bottom of the page. */}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "70vh" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "40px", height: "40px", border: "3px solid #E2E8F0",
              borderTopColor: "#1E4DB7", borderRadius: "50%",
              animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
            }} />
            <p style={{ color: "#94A3B8", fontSize: "14px" }}>Loading your profile…</p>
          </div>
        </div>
      </>
    );

    // ── Derived data ────────────────────────────────────────────────────────────
    const initials = student.student_name
      ? student.student_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
      : "ST";

    const METRICS = [
      { label: "Attendance",  value: "87%",                          sub: "Above minimum",    icon: CalendarCheck, accent: "#1E4DB7", bg: "#EEF2FF" },
      { label: "CGPA",        value: "8.4",                          sub: "Good standing",    icon: GraduationCap, accent: "#059669", bg: "#ECFDF5" },
      { label: "Semester",    value: `${student.semester || "-"}`,   sub: "Current semester", icon: BookOpen,      accent: "#7C3AED", bg: "#F5F3FF" },
      { label: "Fee Status",  value: "Paid",                         sub: "No dues",          icon: Wallet,        accent: "#D97706", bg: "#FFFBEB" },
    ];

    // BUG 2 FIXED: Removed the stray nav-link object that had `path`, `permission`,
    // and `icon: Award` instead of a `value` field. It was accidentally mixed into
    // the profile fields array, causing `Award` ReferenceError + a broken grid cell
    // that rendered "—" with no label and broke the 2-column layout.
    const ACADEMIC_INFO = [
      { label: "Enrollment No.", value: student.enrollment_number, icon: Hash         },
      { label: "College",        value: student.college_name,      icon: GraduationCap },
      { label: "Department",     value: student.department_name,   icon: GraduationCap },
      { label: "Course",         value: student.course_name,       icon: BookOpen      },
      { label: "Branch",         value: student.branch_name,       icon: GraduationCap },
      { label: "Semester",       value: student.semester,          icon: CalendarCheck },
      { label: "Section",        value: student.section,           icon: Hash          },
      { label: "Admission Year", value: student.admission_year,    icon: CalendarCheck },
      { label: "10th %",         value: student.tenth_percentage                       },
      { label: "12th %",         value: student.twelfth_percentage                     },
      { label: "Father's Name",  value: student.father_name,       icon: User          },
      { label: "Mother's Name",  value: student.mother_name,       icon: User          },
      { label: "Email",          value: student.email,             icon: Mail          },
      { label: "Phone",          value: student.phone,             icon: Phone         },
    ];

    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#F1F5F9",
        fontFamily: "'Inter', sans-serif",
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}>

        {/* ── Welcome Banner ── */}
        <div style={{
          backgroundColor: "#0F2557",
          borderRadius: "16px",
          padding: "24px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 20px rgba(15,37,87,0.15)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Avatar */}
            <div style={{
              width: "52px", height: "52px", borderRadius: "50%",
              background: "linear-gradient(135deg, #4F8EF7, #1E4DB7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: "18px", fontWeight: 700,
              border: "2px solid rgba(255,255,255,0.2)", flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 500 }}>
                Welcome back
              </p>
              <h1 style={{ margin: "3px 0 4px", fontSize: "22px", fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
                {student.student_name}
              </h1>
              <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>
                {student.course_name} &nbsp;·&nbsp;
                {student.branch_name} &nbsp;·&nbsp;
                Semester {student.semester}
              </p>
            </div>
          </div>

          {/* Enrollment badge */}
          <div style={{
            backgroundColor: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "10px", padding: "10px 18px", textAlign: "right",
          }}>
            <p style={{ margin: 0, fontSize: "10px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Enrollment No.</p>
            <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 700, color: "#fff" }}>{student.enrollment_number}</p>
          </div>
        </div>

        {/* ── Metric Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          {METRICS.map(({ label, value, sub, icon: Icon, accent, bg }) => (
            <div key={label} style={{
              backgroundColor: "#fff", borderRadius: "16px",
              border: "1px solid #E2E8F0", padding: "22px 24px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              transition: "box-shadow 0.2s, transform 0.2s", cursor: "default",
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "none"; }}
            >
              <div>
                <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
                <p style={{ margin: "8px 0 2px", fontSize: "32px", fontWeight: 800, color: "#0F2557", lineHeight: 1 }}>{value}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#94A3B8" }}>{sub}</p>
              </div>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={20} color={accent} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Bottom Grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "20px", alignItems: "start" }}>

          {/* Academic Details */}
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #E2E8F0", padding: "24px 28px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0F2557" }}>Academic Details</h2>
              <button style={{
                padding: "6px 14px", borderRadius: "8px",
                border: "1px solid #BFDBFE", backgroundColor: "#EFF6FF",
                color: "#1D4ED8", fontSize: "12px", fontWeight: 600, cursor: "pointer",
              }}>
                Edit Profile
              </button>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              columnGap: "28px",
              rowGap: "0",
            }}>
              {/* BUG 4 FIXED: Removed unused `i` from destructure to avoid lint warning */}
              {ACADEMIC_INFO.map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    padding: "16px 0",
                    borderBottom: "1px solid #F1F5F9",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "10.5px", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
                  <p style={{ margin: "5px 0 0", fontSize: "14px", fontWeight: 600, color: "#0F172A" }}>{value || "—"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notices */}
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #E2E8F0", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bell size={16} color="#1E4DB7" />
              </div>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0F2557" }}>University Notices</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0", maxHeight: "420px", overflowY: "auto" }}>
              {notices.length === 0 ? (
                <div style={{ padding: "32px 0", textAlign: "center" }}>
                  <Bell size={28} color="#CBD5E1" style={{ marginBottom: "8px" }} />
                  <p style={{ color: "#94A3B8", fontSize: "13px", margin: 0 }}>No notices yet</p>
                </div>
              ) : notices.map(notice => (
                <div key={notice.id} style={{
                  padding: "14px 0",
                  borderBottom: "1px solid #F1F5F9",
                  display: "flex", gap: "12px",
                }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#1E4DB7", marginTop: "6px", flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 700, color: "#0F2557" }}>{notice.title}</p>
                    <p style={{ margin: "4px 0 6px", fontSize: "12px", color: "#64748B", lineHeight: 1.5 }}>{notice.content}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#94A3B8" }}>
                      {new Date(notice.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* BUG 3 FIXED: Removed duplicate @keyframes spin — it now only lives once,
            in the loading state branch above. */}
      </div>
    );
  }