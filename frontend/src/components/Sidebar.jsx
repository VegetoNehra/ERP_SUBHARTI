import {
  Users,
  GraduationCap,
  Bell,
  UserPlus,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Settings,
  Plus,
  ChevronDown,
  ShieldCheck,
  UserCog,
  BookOpen,
  Building2,
  FlaskConical,
  UserCheck,
  Award,
  FileSpreadsheet,  
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";

// ─── Sidebar group definitions ────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
    permission: "Dashboard",
  },
  {
    label: "Students",
    icon: Users,
    children: [
      { label: "Register Student", permission: "Register Student",  icon: UserPlus,      path: "/admin/register-student" },
      { label: "Manage Students",  permission: "Manage Students",   icon: Users,         path: "/admin/manage-students" },
      { label: "Attendance",       permission: "Manage Attendance", icon: FileText,      path: "/admin/attendance" },
    ],
  },
  {
    label: "Faculty",
    icon: GraduationCap,
    children: [
      { label: "Register Faculty",   permission: "Register Faculty",  icon: UserPlus,      path: "/admin/register-faculty" },
      { label: "Manage Faculty",     permission: "Manage Faculty",    icon: GraduationCap, path: "/admin/manage-faculty" },
      { label: "Faculty Attendance", permission: "Manage Attendance", icon: FileText,      path: "/admin/faculty-attendance" },
    ],
  },
  {
    label: "Notices",
    icon: Bell,
    children: [
      { label: "Create Notice",  permission: "Create Notice",  icon: Plus, path: "/admin/create-notice" },
      { label: "Manage Notices", permission: "Manage Notices", icon: Bell, path: "/admin/manage-notices" },
    ],
  },
  {
    label: "Results",
    icon: ClipboardList,
    children: [
      { label: "Manage Results", permission: "Manage Results", icon: ClipboardList, path: "/admin/manage-results" },
      {
        icon: FileSpreadsheet,
        label: "Enter Marks",
        permission: "Enter Marks",
        path: "/faculty/enter-marks",
      },
    ],
  },
  {
    label: "Administration",
    icon: ShieldCheck,
    children: [
      { label: "Admin Accounts",  permission: "Manage Admins",       icon: UserCog,      path: "/admin/admin-accounts" },
      { label: "Permissions",     permission: "Manage Permissions",  icon: ShieldCheck,  path: "/admin/manage-permissions" },
      { label: "Departments",     permission: "Manage Departments",  icon: Building2,    path: "/admin/manage-departments" },
      { label: "Courses",         permission: "Manage Courses",      icon: BookOpen,     path: "/admin/manage-courses" },
      { label: "Subjects",        permission: "Manage Subjects",     icon: FlaskConical, path: "/admin/manage-subjects" },
      { label: "Manage Colleges", permission: "Manage Colleges",     icon: Building2,    path: "/admin/manage-colleges" },
      { label: "Settings",        permission: "Dashboard",           icon: Settings,     path: "/admin/settings" },
      { label: "Manage Faculty Allocation", permission:"Faculty Allocation", icon:UserCheck, path:"/admin/manage-faculty-allocation"},
    ],
  },
];

// ─── NavButton (standalone links) ────────────────────────────────────────────
function NavButton({ label, Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "9px 10px",
        borderRadius: "10px",
        border: "none",
        cursor: "pointer",
        backgroundColor: active ? "rgba(255,255,255,0.12)" : "transparent",
        color: active ? "#fff" : "rgba(255,255,255,0.55)",
        fontSize: "13px",
        fontWeight: active ? 600 : 400,
        textAlign: "left",
        width: "100%",
        transition: "all 0.15s",
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.07)";
          e.currentTarget.style.color = "#fff";
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "rgba(255,255,255,0.55)";
        }
      }}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
// Props:
//   permissions  – string[] fetched from /admin/my-permissions
//                  If omitted, the component fetches them itself.
export default function Sidebar({ permissions: permissionsProp }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [permissions, setPermissions] = useState(permissionsProp ?? []);

  // Fetch permissions only when no prop was supplied
  useEffect(() => {
    if (permissionsProp !== undefined) return;
    api.get("/admin/my-permissions")
      .then(r => setPermissions(Array.isArray(r.data.permissions) ? r.data.permissions : []))
      .catch(console.error);
  }, [permissionsProp]);

  // Keep prop in sync if parent re-renders with a new value
  useEffect(() => {
    if (permissionsProp !== undefined) setPermissions(permissionsProp);
  }, [permissionsProp]);

  // Auto-expand the group that contains the current path
  const initialOpen = NAV_GROUPS.reduce((acc, group) => {
    if (group.children) {
      const active = group.children.some(c => location.pathname === c.path);
      if (active) acc[group.label] = true;
    }
    return acc;
  }, {});

  const [openGroups, setOpenGroups] = useState(initialOpen);

  const toggle = (label) =>
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside style={{
      width: "240px",
      minHeight: "100vh",
      backgroundColor: "#0F2557",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      position: "sticky",
      top: 0,
      height: "100vh",
      overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{
        padding: "20px 16px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        flexShrink: 0,
      }}>
        
        <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>
          Admin Portal
        </p>
      </div>

      {/* Nav */}
      <nav style={{
        flex: 1,
        padding: "10px 8px",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        overflowY: "auto",
      }}>
        {NAV_GROUPS.map((group) => {
          // Standalone link
          if (!group.children) {
            if (!permissions.includes(group.permission)) return null;
            const active = location.pathname === group.path;
            return (
              <NavButton
                key={group.label}
                label={group.label}
                Icon={group.icon}
                active={active}
                onClick={() => navigate(group.path)}
              />
            );
          }

          // Filter by permission
          const visibleChildren = group.children.filter(c => permissions.includes(c.permission));
          if (visibleChildren.length === 0) return null;

          const isOpen    = !!openGroups[group.label];
          const anyActive = visibleChildren.some(c => location.pathname === c.path);

          return (
            <div key={group.label}>
              {/* Group header */}
              <button
                onClick={() => toggle(group.label)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  padding: "9px 10px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: anyActive ? "rgba(255,255,255,0.10)" : "transparent",
                  color: anyActive ? "#fff" : "rgba(255,255,255,0.6)",
                  fontSize: "13px",
                  fontWeight: anyActive ? 600 : 500,
                  textAlign: "left",
                  transition: "all 0.15s",
                  gap: "9px",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = anyActive ? "rgba(255,255,255,0.10)" : "transparent";
                  e.currentTarget.style.color = anyActive ? "#fff" : "rgba(255,255,255,0.6)";
                }}
              >
                <group.icon size={16} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{group.label}</span>
                <span style={{
                  transition: "transform 0.2s",
                  transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                  display: "flex",
                }}>
                  <ChevronDown size={14} />
                </span>
              </button>

              {/* Children */}
              <div style={{
                overflow: "hidden",
                maxHeight: isOpen ? `${visibleChildren.length * 40}px` : "0px",
                transition: "max-height 0.25s ease",
              }}>
                <div style={{ paddingLeft: "12px", paddingBottom: "2px" }}>
                  {visibleChildren.map(child => {
                    const active = location.pathname === child.path;
                    return (
                      <button
                        key={child.label}
                        onClick={() => navigate(child.path)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          width: "100%",
                          padding: "7px 10px",
                          borderRadius: "8px",
                          border: "none",
                          cursor: "pointer",
                          backgroundColor: active ? "rgba(79,142,247,0.18)" : "transparent",
                          color: active ? "#7EB3FF" : "rgba(255,255,255,0.5)",
                          fontSize: "12.5px",
                          fontWeight: active ? 600 : 400,
                          textAlign: "left",
                          transition: "all 0.12s",
                          position: "relative",
                        }}
                        onMouseEnter={e => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
                            e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                          }
                        }}
                        onMouseLeave={e => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                          }
                        }}
                      >
                        {/* Active indicator pill */}
                        {active && (
                          <span style={{
                            position: "absolute",
                            left: 0,
                            width: "3px",
                            height: "16px",
                            backgroundColor: "#4F8EF7",
                            borderRadius: "2px",
                          }} />
                        )}
                        <child.icon size={14} style={{ flexShrink: 0 }} />
                        {child.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.05)", margin: "4px 4px" }} />
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
