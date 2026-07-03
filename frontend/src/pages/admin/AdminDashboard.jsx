import {
  Users,
  GraduationCap,
  Bell,
  UserPlus,
  ClipboardList,
  FileText,
  Plus,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  Building2,
  FlaskConical,
  Award,
  FileSpreadsheet,
  UserCheck,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
// ─── Quick-action cards ───────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    icon: UserPlus,
    label: "Register Student",
    permission: "Register Student",
    path: "/admin/register-student",
  },
  {
    icon: UserPlus,
    label: "Register Faculty",
    permission: "Register Faculty",
    path: "/admin/register-faculty",
  },
  {
    icon: Bell,
    label: "Create Notice",
    permission: "Create Notice",
    path: "/admin/create-notice",
  },
  {
    icon: Users,
    label: "Manage Students",
    permission: "Manage Students",
    path: "/admin/manage-students",
  },
  {
    icon: GraduationCap,
    label: "Manage Faculty",
    permission: "Manage Faculty",
    path: "/admin/manage-faculty",
  },
  {
    icon: ClipboardList,
    label: "Manage Results",
    permission: "Manage Results",
    path: "/admin/manage-results",
  },
  {
    icon: FileSpreadsheet,
    label: "Enter Marks",
    permission: "Enter Marks",
    path: "/faculty/enter-marks",
  },
  {
    icon: ShieldCheck,
    label: "Manage Permissions",
    permission: "Manage Permissions",
    path: "/admin/manage-permissions",
  },
  {
    icon: Building2,
    label: "Manage Colleges",
    permission: "Manage Colleges",
    path: "/admin/manage-colleges",
  },
  {
    icon: Building2,
    label: "Manage Departments",
    permission: "Manage Departments",
    path: "/admin/manage-departments",
  },
  {
    icon: BookOpen,
    label: "Manage Courses",
    permission: "Manage Courses",
    path: "/admin/manage-courses",
  },
  {
    icon: FlaskConical,
    label: "Manage Subjects",
    permission: "Manage Subjects",
    path: "/admin/manage-subjects",
  },
  {
    icon: UserCheck,
    label: "Manage Faculty Allocation",
    permission: "Faculty Allocation",
    path: "/admin/manage-faculty-allocation",
  },
];

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();

  const [notices,      setNotices]      = useState([]);
  const [stats,        setStats]        = useState({ students: 0, faculty: 0, notices: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [permissions,  setPermissions]  = useState([]);

  const filteredActions = QUICK_ACTIONS.filter(a => permissions.includes(a.permission));

  useEffect(() => {
    api.get("/admin/dashboard-stats")
      .then(r => setStats(r.data.stats))
      .catch(console.error)
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    api.get("/admin/notices")
      .then(r => setNotices(r.data.notices))
      .catch(console.error);
  }, []);

  useEffect(() => {
    api.get("/admin/my-permissions")
      .then(r => setPermissions(Array.isArray(r.data.permissions) ? r.data.permissions : []))
      .catch(console.error);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await api.delete(`/admin/notices/${id}`);
      setNotices(prev => prev.filter(n => n.id !== id));
    } catch {
      alert("Failed to delete notice.");
    }
  };

  const STAT_CARDS = [
    { label: "Total Students", value: stats.students, icon: Users,         accent: "#1E4DB7", bg: "#EEF2FF" },
    { label: "Active Faculty", value: stats.faculty,  icon: GraduationCap, accent: "#059669", bg: "#ECFDF5" },
    { label: "Active Notices", value: stats.notices,  icon: Bell,          accent: "#D97706", bg: "#FFFBEB" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif", backgroundColor: "#F1F5F9" }}>

      {/* ── Shared Sidebar (pass permissions so it doesn't double-fetch) ── */}

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Top bar */}
        <header style={{
          height: "64px",
          backgroundColor: "#fff",
          borderBottom: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0F2557" }}>Dashboard</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#94A3B8" }}>Student Management System</p>
          </div>
        </header>

        {/* Page body */}
        <main style={{ flex: 1, padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>

          <div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#0F2557" }}>Welcome, Administrator 👋</h1>
            <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#64748B" }}>Here's what's happening in your ERP today.</p>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            {statsLoading
              ? [1, 2, 3].map(i => (
                  <div key={i} style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #E2E8F0", padding: "24px", height: "110px" }}>
                    <div style={{ height: "12px", backgroundColor: "#F1F5F9", borderRadius: "6px", width: "60%", marginBottom: "16px" }} />
                    <div style={{ height: "32px", backgroundColor: "#F1F5F9", borderRadius: "6px", width: "40%" }} />
                  </div>
                ))
              : STAT_CARDS.map(({ label, value, icon: Icon, accent, bg }) => (
                  <div key={label} style={{
                    backgroundColor: "#fff", borderRadius: "16px",
                    border: "1px solid #E2E8F0", padding: "22px 24px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    transition: "box-shadow 0.2s, transform 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "none"; }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
                      <p style={{ margin: "8px 0 0", fontSize: "36px", fontWeight: 800, color: "#0F2557", lineHeight: 1 }}>{value}</p>
                    </div>
                    <div style={{ width: "48px", height: "48px", borderRadius: "14px", backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={22} color={accent} />
                    </div>
                  </div>
                ))
            }
          </div>

          {/* Bottom 2-col grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "20px", alignItems: "start" }}>

            {/* Quick Actions */}
            <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #E2E8F0", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <h2 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700, color: "#0F2557" }}>Quick Actions</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {filteredActions.map(({ icon: Icon, label, path }) => (
                  <button
                    key={label}
                    onClick={() => path && navigate(path)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "14px 16px", borderRadius: "12px",
                      border: "1px solid #E2E8F0", backgroundColor: "#FAFAFA",
                      cursor: "pointer", textAlign: "left",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#EEF2FF"; e.currentTarget.style.borderColor = "#1E4DB7"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(30,77,183,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#FAFAFA"; e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={17} color="#1E4DB7" />
                      </div>
                      <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#1E293B" }}>{label}</span>
                    </div>
                    <ChevronRight size={15} color="#CBD5E1" />
                  </button>
                ))}
              </div>
            </div>

            {/* Notices */}
            <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #E2E8F0", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0F2557" }}>Notices</h2>
                <button
                  onClick={() => navigate("/admin/create-notice")}
                  style={{
                    display: "flex", alignItems: "center", gap: "5px",
                    padding: "6px 12px", borderRadius: "8px",
                    border: "none", backgroundColor: "#1E4DB7",
                    color: "#fff", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                  }}
                >
                  <Plus size={13} /> New
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "420px", overflowY: "auto", paddingRight: "2px" }}>
                {notices.length === 0 ? (
                  <div style={{ padding: "32px 0", textAlign: "center" }}>
                    <Bell size={28} color="#CBD5E1" style={{ marginBottom: "8px" }} />
                    <p style={{ color: "#94A3B8", fontSize: "13px", margin: 0 }}>No notices yet</p>
                  </div>
                ) : notices.map(notice => (
                  <div key={notice.id} style={{
                    padding: "14px", borderRadius: "12px",
                    border: "1px solid #F1F5F9", backgroundColor: "#FAFAFA",
                    transition: "border-color 0.15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#CBD5E1"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#F1F5F9"}
                  >
                    <p style={{ margin: "0 0 4px", fontSize: "13.5px", fontWeight: 700, color: "#0F2557" }}>{notice.title}</p>
                    <p style={{
                      margin: "0 0 6px", fontSize: "12px", color: "#64748B", lineHeight: 1.5,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>{notice.content}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                        {new Date(notice.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => navigate(`/admin/edit-notice/${notice.id}`)}
                          style={{
                            display: "flex", alignItems: "center", gap: "4px",
                            padding: "4px 10px", borderRadius: "6px",
                            border: "1px solid #BFDBFE", backgroundColor: "#EFF6FF",
                            color: "#1D4ED8", fontSize: "11px", fontWeight: 600, cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(notice.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: "4px",
                            padding: "4px 10px", borderRadius: "6px",
                            border: "1px solid #FECACA", backgroundColor: "#FEF2F2",
                            color: "#DC2626", fontSize: "11px", fontWeight: 600, cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}