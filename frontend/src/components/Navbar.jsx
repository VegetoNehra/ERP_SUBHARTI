import { Link, useNavigate } from "react-router-dom";
import { LogOut, Bell } from "lucide-react";
import logo from "../assets/subharti_logo.webp";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "A";

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      height: "64px",
      backgroundColor: "#0F2557",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 28px",
      boxShadow: "0 2px 12px rgba(15,37,87,0.18)",
    }}>

      {/* Left — Logo + Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Link to={user?.role === "admin" ? "/admin/dashboard" : "/student/dashboard"}>
          <img
          src={logo}
          alt="Subharti"
          style={{ height: "42px", width: "auto", objectFit: "contain" }}
        />
        </Link>
        <div style={{ borderLeft: "1px solid rgba(255,255,255,0.15)", paddingLeft: "14px" }}>
          <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#ffffff", lineHeight: 1.2 }}>
            Subharti ERP
          </p>
          <p style={{ margin: 0, fontSize: "10px", fontWeight: 500, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Student Management System
          </p>
        </div>
      </div>

      {/* Right — Bell + User chip + Logout */}
      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

          {/* Bell */}
          <button style={{
            width: "36px", height: "36px", borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.12)",
            backgroundColor: "rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "rgba(255,255,255,0.7)",
            transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
          >
            <Bell size={16} />
          </button>

          {/* Divider */}
          <div style={{ width: "1px", height: "24px", backgroundColor: "rgba(255,255,255,0.12)" }} />

          {/* Avatar + name */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "50%",
              background: "linear-gradient(135deg, #4F8EF7, #1E4DB7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: "12px", fontWeight: 700,
              border: "2px solid rgba(255,255,255,0.2)",
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#ffffff", lineHeight: 1.2 }}>
                {user.name}
              </p>
              <p style={{ margin: 0, fontSize: "10.5px", color: "rgba(255,255,255,0.45)", textTransform: "capitalize" }}>
                {user.role}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: "1px", height: "24px", backgroundColor: "rgba(255,255,255,0.12)" }} />

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "7px 14px", borderRadius: "8px",
              border: "1px solid rgba(248,113,113,0.3)",
              backgroundColor: "rgba(239,68,68,0.12)",
              color: "#FCA5A5", fontSize: "13px", fontWeight: 600,
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.25)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.12)"; e.currentTarget.style.color = "#FCA5A5"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.3)"; }}
          >
            <LogOut size={14} />
            Logout
          </button>

        </div>
      )}
    </nav>
  );
}

export default Navbar;