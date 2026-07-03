import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/subharti_logo.webp"
import collegeImg from "../assets/SubhartiBG.png"
// College image URL — replace with your actual college image
const COLLEGE_IMAGE_URL = collegeImg;
function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    const redirectPath = user.role === "student" ? "/student/dashboard" : "/admin/dashboard";
    return <Navigate to={redirectPath} />;
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please enter both ID and password.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
        role,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      const targetPath = role === "student" ? "/student/dashboard" : "/admin/dashboard";
      navigate(targetPath);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      backgroundColor: "#f0f4ff",
    }}>

      {/* ── LEFT PANEL: College Image ── */}
      <div style={{
        flex: "1 1 55%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
        className="login-left-panel"
      >
        {/* College photo */}
        <img
          src={COLLEGE_IMAGE_URL}
          alt="Subharti University Campus"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />

        {/* Dark overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(15,30,80,0.55) 0%, rgba(10,20,60,0.78) 100%)",
        }} />

        {/* Logo & Brand */}
        <div style={{
          position: "relative",
          zIndex: 2,
          padding: "2rem 2.5rem",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}>
          {/* Logo Icon */}
          <div style={{
            display: "flex",
            alignItems: "center",
          }}>
            <img
              src={logo}
              alt="Subharti Logo"
              style={{ height: "60px", width: "auto", objectFit: "contain" }}
            />
          </div>
          
        </div>

        {/* Bottom caption */}
        <div style={{
          position: "relative",
          zIndex: 2,
          marginTop: "auto",
          padding: "2.5rem",
        }}>
          <div style={{
            display: "inline-block",
            backgroundColor: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "12px",
            padding: "1.25rem 1.5rem",
            maxWidth: "420px",
          }}>
            <p style={{
              color: "white",
              fontSize: "22px",
              fontWeight: 700,
              lineHeight: 1.35,
              margin: "0 0 6px",
            }}>
              Swami Vivekanand Subharti University
            </p>
            <p style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: "13px",
              margin: 0,
              lineHeight: 1.5,
            }}>
              Meerut, Uttar Pradesh · Est. 2008
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Login Form ── */}
      <div style={{
        flex: "0 0 420px",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "3rem 2.75rem",
        boxShadow: "-4px 0 32px rgba(0,0,0,0.08)",
        position: "relative",
        overflowY: "auto",
      }}
        className="login-right-panel"
      >

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ color: "#6366f1", fontSize: "13px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
            Welcome back 👋
          </p>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px", lineHeight: 1.2 }}>
            Sign in to your account
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
            Access the Subharti ERP portal
          </p>
        </div>

        {/* Role Toggle Slider */}
        <div style={{ marginBottom: "1.75rem" }}>
          <div style={{
            display: "flex",
            backgroundColor: "#f1f5f9",
            borderRadius: "12px",
            padding: "4px",
            position: "relative",
          }}>
            {/* Sliding pill */}
            <div style={{
              position: "absolute",
              top: "4px",
              bottom: "4px",
              width: "calc(50% - 4px)",
              backgroundColor: "#ffffff",
              borderRadius: "9px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.10)",
              border: "1px solid #e2e8f0",
              transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: role === "admin" ? "translateX(calc(100% + 4px))" : "translateX(0)",
              pointerEvents: "none",
            }} />
            <button
              type="button"
              onClick={() => { setRole("student"); setError(""); setUsername(""); setPassword(""); }}
              style={{
                flex: 1,
                padding: "10px 16px",
                border: "none",
                background: "transparent",
                borderRadius: "9px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
                color: role === "student" ? "#4f46e5" : "#94a3b8",
                transition: "color 0.2s",
                position: "relative",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Student
            </button>
            <button
              type="button"
              onClick={() => { setRole("admin"); setError(""); setUsername(""); setPassword(""); }}
              style={{
                flex: 1,
                padding: "10px 16px",
                border: "none",
                background: "transparent",
                borderRadius: "9px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
                color: role === "admin" ? "#4f46e5" : "#94a3b8",
                transition: "color 0.2s",
                position: "relative",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

          {/* ID Field */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              {role === "student" ? "Student ID" : "Admin ID"}
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                type="text"
                placeholder={role === "student" ? "e.g., SU2024001" : "e.g., ADM001"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 14px 11px 38px",
                  fontSize: "14px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "10px",
                  outline: "none",
                  color: "#0f172a",
                  backgroundColor: "#fafafa",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; e.target.style.backgroundColor = "#fff"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#fafafa"; }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>Password</label>
              <button type="button" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: "#6366f1", padding: 0 }}>
                Forgot password?
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 42px 11px 38px",
                  fontSize: "14px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "10px",
                  outline: "none",
                  color: "#0f172a",
                  backgroundColor: "#fafafa",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; e.target.style.backgroundColor = "#fff"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#fafafa"; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0,
                  display: "flex", alignItems: "center",
                }}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              padding: "10px 14px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "10px",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style={{ fontSize: "13px", color: "#dc2626", margin: 0, fontWeight: 500 }}>{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "13px",
              background: isLoading ? "#a5b4fc" : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "4px",
              boxShadow: isLoading ? "none" : "0 4px 14px rgba(99,102,241,0.35)",
              transition: "all 0.2s",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {isLoading ? (
              <>
                <svg style={{ animation: "spin 1s linear infinite" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                </svg>
                Signing in…
              </>
            ) : (
              <>
                Sign In
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: "1.75rem", paddingTop: "1.5rem", borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
          <p style={{ fontSize: "12.5px", color: "#94a3b8", margin: 0 }}>
            Having trouble?{" "}
            <span style={{ color: "#6366f1", fontWeight: 600, cursor: "pointer" }}>
              Contact ERP Support
            </span>
          </p>
          <p style={{ fontSize: "11.5px", color: "#cbd5e1", margin: "8px 0 0" }}>
            © {new Date().getFullYear()} Subharti University. All rights reserved.
          </p>
        </div>

        {/* Spin animation */}
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @media (max-width: 768px) {
            .login-left-panel { display: none !important; }
            .login-right-panel { flex: 1 !important; padding: 2rem 1.5rem !important; }
          }
        `}</style>
      </div>
    </div>
  );
}

export default Login;