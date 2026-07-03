  import { useState, useEffect } from "react";
  import { UserPlus, ArrowRight, User, Mail, Phone, Calendar, Hash, GraduationCap, Info, ShieldCheck, Building2 } from "lucide-react";
  import api from "../../services/api";

  // Branch options keyed by course name (kept as fallback / static reference)


  export default function RegisterFaculty() {
    const [formData, setFormData] = useState({
      employeeId: "",
      name: "",
      email: "",
      phone: "",
      dob: "",
      gender: "",
      college_id: "",
      department_id: "",
      course_id: "",
      branch_id: "",
    });

    // Master lists fetched from backend
    const [colleges,    setColleges]    = useState([]);
    const [departments, setDepartments] = useState([]);
    const [courses,     setCourses]     = useState([]);
    const [branches, setBranches] = useState([]);

    // Filtered lists (dependent on parent selection)
    const [filteredDepts,   setFilteredDepts]   = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [branchOptions,   setBranchOptions]   = useState([]);

    const [metaLoading, setMetaLoading] = useState(true);
    const [loading,     setLoading]     = useState(false);
    const [success,     setSuccess]     = useState(false);

    // ── Fetch form metadata on mount ────────────────────────────────────────────
    useEffect(() => {
      (async () => {
        try {
          const { data } = await api.get("/academic/faculty-allocation/form-data");
          setColleges(data.colleges    ?? []);
          setDepartments(data.departments ?? []);
          setCourses(data.courses ?? []);
          setBranches(data.branches ?? []);      } catch (err) {
          console.error("Failed to load form metadata:", err);
        } finally {
          setMetaLoading(false);
        }
      })();
    }, []);

    // ── Cascade: college → departments ──────────────────────────────────────────
    useEffect(() => {
      if (!formData.college_id) {
        setFilteredDepts([]);
        setFilteredCourses([]);
        setBranchOptions([]);
        return;
      }
      // Filter departments that belong to this college
      const depts = departments.filter(
        d => String(d.college_id) === String(formData.college_id)
      );
      setFilteredDepts(depts);
      setFilteredCourses([]);
      setBranchOptions([]);
    }, [formData.college_id, departments]);

    // ── Cascade: department → courses ───────────────────────────────────────────
    useEffect(() => {
      if (!formData.department_id) {
        setFilteredCourses([]);
        setBranchOptions([]);
        return;
      }
      const crss = courses.filter(
        c => String(c.department_id) === String(formData.department_id)
      );
      setFilteredCourses(crss);
      setBranchOptions([]);
    }, [formData.department_id, courses]);

    // ── Cascade: course → branches ──────────────────────────────────────────────
    useEffect(() => {
        if (!formData.course_id) {
            setBranchOptions([]);
            return;
        }

        const filtered = branches.filter(
            b =>
                String(b.course_id) ===
                String(formData.course_id)
        );

        setBranchOptions(filtered);

    }, [formData.course_id, branches]);

    // ── Field change handler (reset cascade children) ───────────────────────────
    function handleChange(e) {
      const { name, value } = e.target;
      setFormData(prev => {
        const next = { ...prev, [name]: value };
        if (name === "college_id")    { next.department_id = ""; next.course_id = ""; next.branch_id = ""; }
        if (name === "department_id") { next.course_id = ""; next.branch_id = ""; }
        if (name === "course_id")     { next.branch_id = ""; }
        return next;
      });
    }

    // ── Submit ───────────────────────────────────────────────────────────────────
    async function handleSubmit(e) {
      e.preventDefault();
      console.log("Form Data:");
      console.log(formData);
      setLoading(true);
      try {
        await api.post("/admin/register-faculty", {
          employeeId: formData.employeeId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          dob: formData.dob,
          gender: formData.gender,
          departmentId: formData.department_id,
          courseId: formData.course_id,
          branchId: formData.branch_id,
        });

        setSuccess(true);

        setFormData({
          employeeId: "",
          name: "",
          email: "",
          phone: "",
          dob: "",
          gender: "",
          college_id: "",
          department_id: "",
          course_id: "",
          branch_id: "",
        });

        setFilteredDepts([]);
        setFilteredCourses([]);
        setBranchOptions([]);

        setTimeout(() => setSuccess(false), 4000);

      } catch (err) {
        console.error(err);
        alert("Error registering faculty. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (metaLoading) {
      return (
        <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F1F5F9", fontFamily: "'Inter', sans-serif" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#64748B", fontSize: "14px" }}>
            <div style={{ width: "18px", height: "18px", border: "2px solid #CBD5E1", borderTopColor: "#059669", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            Loading form data…
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      );
    }

    return (
      <div style={{ minHeight: "calc(100vh - 64px)", backgroundColor: "#F1F5F9", fontFamily: "'Inter', sans-serif", padding: "32px 28px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Page Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, #059669, #065F46)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(5,150,105,0.25)" }}>
              <UserPlus size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0F2557" }}>Register Faculty</h1>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748B" }}>Add a new faculty member to the Subharti ERP system</p>
            </div>
          </div>

          {/* Success banner */}
          {success && (
            <div style={{ padding: "14px 18px", borderRadius: "12px", backgroundColor: "#ECFDF5", border: "1px solid #6EE7B7", color: "#065F46", fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={18} color="#059669" /> Faculty registered successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* ── Personal Information ── */}
            <FormSection title="Personal Information" icon={<User size={15} color="#059669" />}>
              <div style={grid2}>
                <Field label="Full Name"     icon={<User size={13} />}     name="name"  type="text"  placeholder="Dr. John Doe"           value={formData.name}  onChange={handleChange} />
                <Field label="Email Address" icon={<Mail size={13} />}     name="email" type="email" placeholder="faculty@subharti.ac.in" value={formData.email} onChange={handleChange} />
                <Field label="Phone Number"  icon={<Phone size={13} />}    name="phone" type="tel"   placeholder="9876543210"             value={formData.phone} onChange={handleChange} />
                <Field label="Date of Birth" icon={<Calendar size={13} />} name="dob"   type="date"                                       value={formData.dob}   onChange={handleChange} />
                <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </SelectField>
                <div />
              </div>
            </FormSection>

            {/* ── Academic Information ── */}
            <FormSection title="Academic Information" icon={<GraduationCap size={15} color="#059669" />}>
              <div style={grid2}>
                {/* Row 1: Employee ID */}
                <Field label="Employee ID" icon={<Hash size={13} />} name="employeeId" type="text" placeholder="FAC-2024-001" value={formData.employeeId} onChange={handleChange} />
                <div />

                {/* Row 2: College */}
                <SelectField
                  label="College"
                  name="college_id"
                  value={formData.college_id}
                  onChange={handleChange}
                  icon={<Building2 size={13} />}
                >
                  <option value="">Select college</option>
                  {colleges.map(c => (
                    <option key={c.college_id} value={c.college_id}>{c.college_name}</option>
                  ))}
                </SelectField>
                <div />

                {/* Row 3: Department & Course — cascade from college */}
                <SelectField
                  label="Department"
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  disabled={!formData.college_id}
                  hint={!formData.college_id ? "Select a college first" : ""}
                >
                  <option value="">Select department</option>
                  {filteredDepts.map(d => (
                    <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                  ))}
                </SelectField>

                <SelectField
                  label="Course"
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleChange}
                  disabled={!formData.department_id}
                  hint={!formData.department_id ? "Select a department first" : ""}
                >
                  <option value="">Select course</option>
                  {filteredCourses.map(c => (
                    <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
                  ))}
                </SelectField>

                {/* Row 4: Branch — cascade from course */}
                <SelectField
                  label="Branch / Specialisation"
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={handleChange}
                  disabled={!formData.course_id || branchOptions.length === 0}
                  hint={!formData.course_id ? "Select a course first" : ""}
                >
                  <option value="">Select branch</option>
                  {branchOptions.map(branch => (
                    <option
                        key={branch.branch_id}
                        value={branch.branch_id}
                    >
                        {branch.branch_name}
                    </option>
                ))}
                </SelectField>
                <div />
              </div>
            </FormSection>

            {/* ── Account Information ── */}
            <FormSection title="Account Information" icon={<Info size={15} color="#059669" />}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <InfoBox title="Username" desc="Employee ID will be used as the username." />
                <InfoBox title="Password" desc="Password will be auto-generated by the system." />
              </div>
            </FormSection>

            {/* Submit */}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "4px" }}>
              <SubmitButton loading={loading} label="Register Faculty" />
            </div>
          </form>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Shared sub-components ─────────────────────────────────────────────────────

  function FormSection({ title, icon, children }) {
    return (
      <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 22px", borderBottom: "1px solid #F1F5F9", backgroundColor: "#FAFBFF" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "8px", backgroundColor: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
          <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0F2557" }}>{title}</h2>
        </div>
        <div style={{ padding: "22px" }}>{children}</div>
      </div>
    );
  }

  function Field({ label, name, type, placeholder, value, onChange, icon }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={labelStyle}>{label}</label>
        <div style={{ position: "relative" }}>
          {icon && <span style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", display: "flex" }}>{icon}</span>}
          <input
            type={type} name={name} value={value} onChange={onChange}
            placeholder={placeholder} required
            style={{ ...inputStyle, paddingLeft: icon ? "34px" : "13px" }}
            onFocus={e => { e.target.style.borderColor = "#059669"; e.target.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.1)"; e.target.style.backgroundColor = "#fff"; }}
            onBlur={e =>  { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#F8FAFC"; }}
          />
        </div>
      </div>
    );
  }

  function SelectField({ label, name, value, onChange, disabled, children, hint, icon }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={labelStyle}>{label}</label>
        <div style={{ position: "relative" }}>
          {icon && (
            <span style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", display: "flex", pointerEvents: "none", zIndex: 1 }}>{icon}</span>
          )}
          <select
            name={name} value={value} onChange={onChange} disabled={disabled} required
            style={{ ...inputStyle, paddingLeft: icon ? "34px" : "13px", opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
            onFocus={e => { if (!disabled) { e.target.style.borderColor = "#059669"; e.target.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.1)"; e.target.style.backgroundColor = "#fff"; } }}
            onBlur={e =>  { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#F8FAFC"; }}
          >{children}</select>
        </div>
        {hint && <p style={{ margin: 0, fontSize: "11px", color: "#94A3B8", fontStyle: "italic" }}>{hint}</p>}
      </div>
    );
  }

  function InfoBox({ title, desc }) {
    return (
      <div style={{ padding: "14px 16px", borderRadius: "10px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
        <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "#0F2557", textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</p>
        <p style={{ margin: "5px 0 0", fontSize: "13px", color: "#64748B", lineHeight: 1.5 }}>{desc}</p>
      </div>
    );
  }

  function SubmitButton({ loading, label }) {
    return (
      <button type="submit" disabled={loading}
        style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "12px 28px", borderRadius: "10px", border: "none",
          background: loading ? "#6EE7B7" : "linear-gradient(135deg, #059669, #065F46)",
          color: "#fff", fontSize: "14px", fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: loading ? "none" : "0 4px 14px rgba(5,150,105,0.3)",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
      >
        {loading ? (
          <><div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Saving…</>
        ) : (
          <><UserPlus size={15} />{label}<ArrowRight size={14} /></>
        )}
      </button>
    );
  }

  const labelStyle = { fontSize: "11.5px", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" };
  const inputStyle = { width: "100%", padding: "10px 13px", fontSize: "14px", color: "#0F172A", border: "1.5px solid #E2E8F0", borderRadius: "10px", backgroundColor: "#F8FAFC", outline: "none", boxSizing: "border-box", transition: "all 0.15s", fontFamily: "'Inter', sans-serif" };
  const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" };