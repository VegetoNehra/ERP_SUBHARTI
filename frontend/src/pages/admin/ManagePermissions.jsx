import React, { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Users,
  Search,
  CheckCircle2,
  Save,
  ArrowRight,
} from "lucide-react";
import api from "../../services/api";

function ManagePermissions() {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await api.get("/admin/admin-list");

      setAdmins(response.data.admins);

      if (response.data.admins.length > 0) {
        loadPermissions(response.data.admins[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadPermissions = async (admin) => {
    try {
      setLoading(true);

      const response = await api.get(`/admin/permissions/${admin.user_id}`);

      setSelectedAdmin(admin);
      setPermissions(response.data.permissions);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (menuId) => {
    setPermissions((prev) =>
      prev.map((item) =>
        item.menu_id === menuId ? { ...item, granted: !item.granted } : item
      )
    );
  };

  const savePermissions = async () => {
    try {
      setSaving(true);

      const selectedMenus = permissions
        .filter((p) => p.granted)
        .map((p) => p.menu_id);

      await api.post("/admin/permissions", {
        userId: selectedAdmin.user_id,
        menuIds: selectedMenus,
      });

      alert("Permissions updated successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  const filteredAdmins = useMemo(() => {
    if (!query.trim()) return admins;
    const q = query.toLowerCase();
    return admins.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.employee_id?.toLowerCase().includes(q)
    );
  }, [admins, query]);

  const grantedCount = permissions.filter((p) => p.granted).length;

  const initials = (name) =>
    (name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: 32, boxSizing: "border-box" }}>
      {/* Page header — icon square + title + subtitle, matches Register Faculty / Manage Faculty */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div
          className="bg-blue-600 rounded-2xl"
          style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
        >
          <ShieldCheck className="text-white" style={{ width: 28, height: 28 }} />
        </div>
        <div>
          <h1 className="font-bold text-blue-900" style={{ fontSize: 26, margin: 0, lineHeight: 1.2 }}>
            Manage Permissions
          </h1>
          <p className="text-slate-500" style={{ fontSize: 14, margin: "4px 0 0 0" }}>
            Control which dashboard features each admin can access
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Left card — Admin Accounts */}
        <div
          className="bg-white border border-slate-200 rounded-2xl"
          style={{ flex: "1 1 340px", maxWidth: 400, padding: 24, boxSizing: "border-box" }}
        >
          <div
            className="border-slate-100"
            style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 16, marginBottom: 16, borderBottom: "1px solid" }}
          >
            <Users className="text-blue-600" style={{ width: 20, height: 20 }} />
            <h2 className="font-bold text-blue-900" style={{ fontSize: 16, margin: 0 }}>
              Admin Accounts
            </h2>
          </div>

          <div style={{ position: "relative", marginBottom: 16 }}>
            <Search
              className="text-slate-400"
              style={{ width: 16, height: 16, position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or employee ID..."
              className="border-slate-200 text-slate-700"
              style={{
                width: "100%",
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 36,
                paddingRight: 12,
                fontSize: 14,
                borderRadius: 8,
                border: "1px solid",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 384, overflowY: "auto" }}>
            {filteredAdmins.length === 0 ? (
              <p className="text-slate-400" style={{ fontSize: 14, textAlign: "center", padding: "32px 0" }}>
                No admins found
              </p>
            ) : (
              filteredAdmins.map((admin) => {
                const isActive = selectedAdmin?.user_id === admin.user_id;
                return (
                  <button
                    key={admin.user_id}
                    onClick={() => loadPermissions(admin)}
                    className={isActive ? "bg-blue-50 border-blue-200" : "border-transparent hover:bg-slate-50"}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      textAlign: "left",
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid",
                      boxSizing: "border-box",
                      cursor: "pointer",
                      background: isActive ? undefined : "transparent",
                    }}
                  >
                    <div
                      className="bg-blue-600 text-white"
                      style={{
                        width: 36,
                        height: 36,
                        flexShrink: 0,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {initials(admin.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p className="font-semibold text-slate-800" style={{ fontSize: 14, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {admin.name}
                      </p>
                      <p className="font-medium text-blue-600" style={{ fontSize: 12, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {admin.employee_id}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <p
            className="text-slate-400 border-slate-100"
            style={{ fontSize: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid" }}
          >
            Showing {filteredAdmins.length} of {admins.length} admins
          </p>
        </div>

        {/* Right card — Permissions */}
        <div
          className="bg-white border border-slate-200 rounded-2xl"
          style={{ flex: "2 1 480px", padding: 24, boxSizing: "border-box" }}
        >
          {selectedAdmin ? (
            <>
              <div
                className="border-slate-100"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                  paddingBottom: 16,
                  marginBottom: 20,
                  borderBottom: "1px solid",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ShieldCheck className="text-blue-600" style={{ width: 20, height: 20 }} />
                  <h2 className="font-bold text-blue-900" style={{ fontSize: 16, margin: 0 }}>
                    Permissions for {selectedAdmin.name}
                  </h2>
                </div>

                {!loading && permissions.length > 0 && (
                  <div
                    className="text-blue-700 bg-blue-50"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "6px 12px",
                      borderRadius: 999,
                    }}
                  >
                    <CheckCircle2 style={{ width: 14, height: 14 }} />
                    {grantedCount} of {permissions.length} granted
                  </div>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 14 }}>
                <span className="text-slate-500" style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Employee ID
                </span>
                <span className="text-slate-700" style={{ fontWeight: 500 }}>
                  {selectedAdmin.employee_id}
                </span>
              </div>

              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 0" }}>
                  <p className="text-slate-400" style={{ fontSize: 14 }}>
                    Loading permissions...
                  </p>
                </div>
              ) : (
                <>
                  <p
                    className="text-slate-500"
                    style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}
                  >
                    Accessible Menus
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 12,
                      marginBottom: 24,
                    }}
                  >
                    {permissions.map((permission) => (
                      <label
                        key={permission.menu_id}
                        className={permission.granted ? "border-blue-200 bg-blue-50" : "border-slate-200 hover:bg-slate-50"}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 16px",
                          borderRadius: 8,
                          border: "1px solid",
                          cursor: "pointer",
                          boxSizing: "border-box",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={permission.granted}
                          onChange={() => handleCheckboxChange(permission.menu_id)}
                          className="text-blue-600 border-slate-300"
                          style={{ width: 16, height: 16, flexShrink: 0 }}
                        />
                        <span className="font-medium text-slate-700" style={{ fontSize: 14 }}>
                          {permission.menu_name}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={savePermissions}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        padding: "12px 24px",
                        borderRadius: 8,
                        border: "none",
                        cursor: saving ? "default" : "pointer",
                        opacity: saving ? 0.6 : 1,
                      }}
                    >
                      <Save style={{ width: 16, height: 16 }} />
                      {saving ? "Saving..." : "Save Permissions"}
                      <ArrowRight style={{ width: 16, height: 16 }} />
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "96px 0", textAlign: "center" }}>
              <div
                className="bg-slate-100"
                style={{ width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}
              >
                <ShieldCheck className="text-slate-400" style={{ width: 24, height: 24 }} />
              </div>
              <p className="text-slate-500" style={{ fontSize: 14 }}>
                Select an admin to manage their permissions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManagePermissions;