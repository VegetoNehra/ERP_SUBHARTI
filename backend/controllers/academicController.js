const pool = require("../db");
const hasPermission = require("../utils/permissionHelper");

// ═══════════════════════════════════════════════════════════
// COLLEGES
// ═══════════════════════════════════════════════════════════

const getAllColleges = async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM colleges ORDER BY college_name`);
    res.status(200).json({ success: true, colleges: result.rows });
  } catch (error) {
    console.error("getAllColleges:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    client.release();
  }
};

const createCollege = async (req, res) => {
  const client = await pool.connect();
  try {
    const { college_code, college_name } = req.body;
    const result = await client.query(
      `INSERT INTO colleges (college_code, college_name) VALUES ($1,$2) RETURNING *`,
      [college_code.trim().toUpperCase(), college_name.trim()]
    );
    res.status(201).json({ success: true, college: result.rows[0] });
  } catch (error) {
    console.error("createCollege:", error);
    if (error.code === "23505")
      return res.status(400).json({ success: false, message: "College code already exists" });
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    client.release();
  }
};

const updateCollege = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { college_code, college_name } = req.body;
    const result = await client.query(
      `UPDATE colleges SET college_code=$1, college_name=$2 WHERE college_id=$3 RETURNING *`,
      [college_code.trim().toUpperCase(), college_name.trim(), id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "College not found" });
    res.status(200).json({ success: true, college: result.rows[0] });
  } catch (error) {
    console.error("updateCollege:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    client.release();
  }
};

const deleteCollege = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const deptCheck = await client.query(
      `SELECT COUNT(*) FROM departments WHERE college_id=$1`, [id]
    );
    if (parseInt(deptCheck.rows[0].count) > 0)
      return res.status(400).json({ success: false, message: "Cannot delete college: departments exist under it." });
    const result = await client.query(`DELETE FROM colleges WHERE college_id=$1 RETURNING *`, [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "College not found" });
    res.status(200).json({ success: true, message: "College deleted successfully" });
  } catch (error) {
    console.error("deleteCollege:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    client.release();
  }
};

// ═══════════════════════════════════════════════════════════
// DEPARTMENTS
// ═══════════════════════════════════════════════════════════

const createDepartment = async (req, res) => {
  const allowed = await hasPermission(req.user.user_id, req.user.role, "Manage Departments");
  if (!allowed) return res.status(403).json({ message: "Permission Denied" });

  const client = await pool.connect();
  try {
    const { college_id, department_code, department_name } = req.body;
    if (!department_code?.trim() || !department_name?.trim())
      return res.status(400).json({ success: false, message: "Code and name are required" });

    const result = await client.query(
      `INSERT INTO departments (college_id, department_code, department_name) VALUES ($1,$2,$3) RETURNING *`,
      [college_id, department_code.trim().toUpperCase(), department_name.trim()]
    );
    res.status(201).json({ success: true, department: result.rows[0] });
  } catch (error) {
    console.error("createDepartment:", error);
    if (error.code === "23505")
      return res.status(400).json({ success: false, message: "Department code or name already exists" });
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    client.release();
  }
};

const getAllDepartments = async (req, res) => {
  const client = await pool.connect();
  try {
    // Support ?collegeId= for cascade filtering
    const { collegeId } = req.query;
    let query = `
      SELECT d.*, c.college_name, c.college_code
      FROM departments d
      LEFT JOIN colleges c ON d.college_id = c.college_id
    `;
    const params = [];
    if (collegeId) {
      query += ` WHERE d.college_id = $1`;
      params.push(collegeId);
    }
    query += ` ORDER BY d.department_name`;
    const result = await client.query(query, params);
    res.status(200).json({ success: true, departments: result.rows });
  } catch (error) {
    console.error("getAllDepartments:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    client.release();
  }
};

const updateDepartment = async (req, res) => {
  const allowed = await hasPermission(req.user.user_id, req.user.role, "Manage Departments");
  if (!allowed) return res.status(403).json({ message: "Permission Denied" });

  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { department_code, department_name } = req.body;
    const result = await client.query(
      `UPDATE departments SET department_code=$1, department_name=$2 WHERE department_id=$3 RETURNING *`,
      [department_code.trim().toUpperCase(), department_name.trim(), id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Department not found" });
    res.status(200).json({ success: true, department: result.rows[0] });
  } catch (error) {
    console.error("updateDepartment:", error);
    if (error.code === "23505")
      return res.status(400).json({ success: false, message: "Department code or name already exists" });
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    client.release();
  }
};

const deleteDepartment = async (req, res) => {
  const allowed = await hasPermission(req.user.user_id, req.user.role, "Manage Departments");
  if (!allowed) return res.status(403).json({ message: "Permission Denied" });

  const client = await pool.connect();
  try {
    const { id } = req.params;
    const courseCheck = await client.query(`SELECT COUNT(*) FROM courses WHERE department_id=$1`, [id]);
    if (parseInt(courseCheck.rows[0].count) > 0)
      return res.status(400).json({ success: false, message: "Cannot delete: courses exist under this department." });
    const result = await client.query(`DELETE FROM departments WHERE department_id=$1 RETURNING *`, [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Department not found" });
    res.status(200).json({ success: true, message: "Department deleted successfully" });
  } catch (error) {
    console.error("deleteDepartment:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    client.release();
  }
};

// ═══════════════════════════════════════════════════════════
// COURSES
// ═══════════════════════════════════════════════════════════

const createCourse = async (req, res) => {
  const allowed = await hasPermission(req.user.user_id, req.user.role, "Manage Courses");
  if (!allowed) return res.status(403).json({ message: "Permission Denied" });

  const client = await pool.connect();
  try {
    const { department_id, course_code, course_name, total_semesters } = req.body;
    if (!department_id || !course_code?.trim() || !course_name?.trim() || !total_semesters)
      return res.status(400).json({ success: false, message: "All fields are required" });
    if (parseInt(total_semesters) <= 0)
      return res.status(400).json({ success: false, message: "Total semesters must be greater than 0" });

    const result = await client.query(
      `INSERT INTO courses (department_id, course_code, course_name, total_semesters) VALUES ($1,$2,$3,$4) RETURNING *`,
      [department_id, course_code.trim().toUpperCase(), course_name.trim(), parseInt(total_semesters)]
    );
    res.status(201).json({ success: true, course: result.rows[0] });
  } catch (error) {
    console.error("createCourse:", error);
    if (error.code === "23505")
      return res.status(400).json({ success: false, message: "Course code already exists" });
    if (error.code === "23503")
      return res.status(400).json({ success: false, message: "Department not found" });
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    client.release();
  }
};

const getAllCourses = async (req, res) => {
  const client = await pool.connect();
  try {
    // Support ?departmentId= for cascade filtering
    const { departmentId } = req.query;
    let query = `
      SELECT c.*, d.department_name, col.college_name
      FROM courses c
      JOIN departments d ON c.department_id = d.department_id
      JOIN colleges col ON d.college_id = col.college_id
    `;
    const params = [];
    if (departmentId) {
      query += ` WHERE c.department_id = $1`;
      params.push(departmentId);
    }
    query += ` ORDER BY c.course_name`;
    const result = await client.query(query, params);
    res.status(200).json({ success: true, courses: result.rows });
  } catch (error) {
    console.error("getAllCourses:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    client.release();
  }
};

const updateCourse = async (req, res) => {
  const allowed = await hasPermission(req.user.user_id, req.user.role, "Manage Courses");
  if (!allowed) return res.status(403).json({ message: "Permission Denied" });

  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { department_id, course_code, course_name, total_semesters } = req.body;
    const result = await client.query(
      `UPDATE courses SET department_id=$1, course_code=$2, course_name=$3, total_semesters=$4 WHERE course_id=$5 RETURNING *`,
      [department_id, course_code.trim().toUpperCase(), course_name.trim(), parseInt(total_semesters), id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Course not found" });
    res.status(200).json({ success: true, course: result.rows[0] });
  } catch (error) {
    console.error("updateCourse:", error);
    if (error.code === "23505")
      return res.status(400).json({ success: false, message: "Course code already exists" });
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    client.release();
  }
};

const deleteCourse = async (req, res) => {
  const allowed = await hasPermission(req.user.user_id, req.user.role, "Manage Courses");
  if (!allowed) return res.status(403).json({ message: "Permission Denied" });

  const client = await pool.connect();
  try {
    const { id } = req.params;
    const branchCheck = await client.query(
      `SELECT COUNT(*) FROM branches WHERE course_id=$1`,
      [id]
    );

    if (parseInt(branchCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete: branches exist under this course."
      });
    }
    const result = await client.query(`DELETE FROM courses WHERE course_id=$1 RETURNING *`, [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Course not found" });
    res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error("deleteCourse:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    client.release();
  }
};

// ═══════════════════════════════════════════════════════════
// BRANCHES
// ═══════════════════════════════════════════════════════════

const createBranch = async (req, res) => {
  const allowed = await hasPermission(req.user.user_id, req.user.role, "Manage Courses");
  if (!allowed) return res.status(403).json({ message: "Permission Denied" });

  const client = await pool.connect();
  try {
    const { course_id, branch_code, branch_name } = req.body;
    if (!course_id || !branch_code?.trim() || !branch_name?.trim())
      return res.status(400).json({ success: false, message: "All fields are required" });

    const result = await client.query(
      `INSERT INTO branches (course_id, branch_code, branch_name) VALUES ($1,$2,$3) RETURNING *`,
      [course_id, branch_code.trim().toUpperCase(), branch_name.trim()]
    );
    res.status(201).json({ success: true, branch: result.rows[0] });
  } catch (error) {
    console.error("createBranch:", error);
    if (error.code === "23505")
      return res.status(400).json({ success: false, message: "Branch code already exists in this course" });
    if (error.code === "23503")
      return res.status(400).json({ success: false, message: "Course not found" });
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    client.release();
  }
};

const getAllBranches = async (req, res) => {
  const client = await pool.connect();
  try {
    // Support ?courseId= for cascade filtering
    const { courseId } = req.query;
    let query = `
      SELECT b.*, c.course_name, c.course_code, d.department_name, col.college_name
      FROM branches b
      JOIN courses c ON b.course_id = c.course_id
      JOIN departments d ON c.department_id = d.department_id
      JOIN colleges col ON d.college_id = col.college_id
    `;
    const params = [];
    if (courseId) {
      query += ` WHERE b.course_id = $1`;
      params.push(courseId);
    }
    query += ` ORDER BY b.branch_name`;
    const result = await client.query(query, params);
    res.status(200).json({ success: true, branches: result.rows });
  } catch (error) {
    console.error("getAllBranches:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    client.release();
  }
};

const updateBranch = async (req, res) => {
  const allowed = await hasPermission(req.user.user_id, req.user.role, "Manage Courses");
  if (!allowed) return res.status(403).json({ message: "Permission Denied" });

  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { course_id, branch_code, branch_name } = req.body;
    const result = await client.query(
      `UPDATE branches SET course_id=$1, branch_code=$2, branch_name=$3 WHERE branch_id=$4 RETURNING *`,
      [course_id, branch_code.trim().toUpperCase(), branch_name.trim(), id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Branch not found" });
    res.status(200).json({ success: true, branch: result.rows[0] });
  } catch (error) {
    console.error("updateBranch:", error);
    if (error.code === "23505")
      return res.status(400).json({ success: false, message: "Branch code already exists in this course" });
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    client.release();
  }
};

const deleteBranch = async (req, res) => {
  const allowed = await hasPermission(req.user.user_id, req.user.role, "Manage Courses");
  if (!allowed) return res.status(403).json({ message: "Permission Denied" });

  const client = await pool.connect();
  try {
    const { id } = req.params;
    const subjectCheck = await client.query(`SELECT COUNT(*) FROM subjects WHERE branch_id=$1`, [id]);
    if (parseInt(subjectCheck.rows[0].count) > 0)
      return res.status(400).json({ success: false, message: "Cannot delete: subjects exist under this branch." });
    const result = await client.query(`DELETE FROM branches WHERE branch_id=$1 RETURNING *`, [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Branch not found" });
    res.status(200).json({ success: true, message: "Branch deleted successfully" });
  } catch (error) {
    console.error("deleteBranch:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    client.release();
  }
};

// ═══════════════════════════════════════════════════════════
// SUBJECTS
// ═══════════════════════════════════════════════════════════

const createSubject = async (req, res) => {
  const allowed = await hasPermission(req.user.user_id, req.user.role, "Manage Subjects");
  if (!allowed) return res.status(403).json({ message: "Permission Denied" });

  const client = await pool.connect();
  try {
    const { course_id, branch_id, semester_no, subject_code, subject_name, credits } = req.body;

    if (!course_id || !branch_id || !semester_no || !subject_code?.trim() || !subject_name?.trim() || !credits)
      return res.status(400).json({ success: false, message: "All fields are required" });
    if (parseInt(credits) <= 0)
      return res.status(400).json({ success: false, message: "Credits must be greater than 0" });

    // Validate semester_no doesn't exceed course's total_semesters
    const courseCheck = await client.query(`SELECT total_semesters FROM courses WHERE course_id=$1`, [course_id]);
    const branchCheck = await client.query(
          `SELECT course_id
          FROM branches
          WHERE branch_id=$1`,
          [branch_id]
      );

      if (branchCheck.rows.length === 0) {
          return res.status(400).json({
              success:false,
              message:"Branch not found"
          });
      }

      if (branchCheck.rows[0].course_id !== Number(course_id)) {
          return res.status(400).json({
              success:false,
              message:"Branch does not belong to selected course."
          });
      }
    if (courseCheck.rows.length === 0)
      return res.status(400).json({ success: false, message: "Course not found" });
    if (parseInt(semester_no) > courseCheck.rows[0].total_semesters)
      return res.status(400).json({
        success: false,
        message: `Semester ${semester_no} exceeds this course's total semesters (${courseCheck.rows[0].total_semesters})`,
      });

    const result = await client.query(
      `INSERT INTO subjects (course_id, branch_id, semester_no, subject_code, subject_name, credits)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [course_id, branch_id, parseInt(semester_no), subject_code.trim().toUpperCase(), subject_name.trim(), parseInt(credits)]
    );
    res.status(201).json({ success: true, subject: result.rows[0] });
  } catch (error) {
    console.error("createSubject:", error);
    if (error.code === "23505")
      return res.status(400).json({ success: false, message: "Subject code already exists in this branch" });
    if (error.code === "23503")
      return res.status(400).json({ success: false, message: "Course or branch not found" });
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    client.release();
  }
};

const getAllSubjects = async (req, res) => {
  const client = await pool.connect();
  try {
    // Support ?branchId=&semester= for cascade filtering
    const {
        courseId,
        branchId,
        semester
    } = req.query;
    let query = `
      SELECT
        s.subject_id, s.subject_code, s.subject_name, s.semester_no, s.credits, s.created_at,
        b.branch_id, b.branch_name, b.branch_code,
        c.course_id, c.course_name, c.course_code,
        d.department_id, d.department_name,
        col.college_id, col.college_name, col.college_code
      FROM subjects s
      JOIN branches b ON s.branch_id = b.branch_id
      JOIN courses c ON s.course_id = c.course_id
      JOIN departments d ON c.department_id = d.department_id
      JOIN colleges col ON d.college_id = col.college_id
    `;
    
    const conditions = [];
    const params = [];
    if (courseId) {
        conditions.push(
            `s.course_id = $${params.length + 1}`
        );
        params.push(courseId);
    }
    if (branchId) {
      conditions.push(`s.branch_id = $${params.length + 1}`);
      params.push(branchId);
    }
    if (semester) {
      conditions.push(`s.semester_no = $${params.length + 1}`);
      params.push(parseInt(semester));
    }
    if (conditions.length) query += ` WHERE ` + conditions.join(" AND ");
    query += ` ORDER BY col.college_name, d.department_name, c.course_name, b.branch_name, s.semester_no, s.subject_name`;
    const result = await client.query(query, params);
    res.status(200).json({ success: true, subjects: result.rows });
  } catch (error) {
    console.error("getAllSubjects:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    client.release();
  }
};

const updateSubject = async (req, res) => {
  const allowed = await hasPermission(req.user.user_id, req.user.role, "Manage Subjects");
  if (!allowed) return res.status(403).json({ message: "Permission Denied" });

  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { course_id, branch_id, semester_no, subject_code, subject_name, credits } = req.body;

    const courseCheck = await client.query(`SELECT total_semesters FROM courses WHERE course_id=$1`, [course_id]);
    const branchCheck = await client.query(
          `SELECT course_id
          FROM branches
          WHERE branch_id=$1`,
          [branch_id]
      );

      if (branchCheck.rows.length === 0) {
          return res.status(400).json({
              success:false,
              message:"Branch not found"
          });
      }

      if (branchCheck.rows[0].course_id !== Number(course_id)) {
          return res.status(400).json({
              success:false,
              message:"Branch does not belong to selected course."
          });
      }
    if (courseCheck.rows.length === 0)
      return res.status(400).json({ success: false, message: "Course not found" });
    if (parseInt(semester_no) > courseCheck.rows[0].total_semesters)
      return res.status(400).json({
        success: false,
        message: `Semester exceeds this course's total semesters (${courseCheck.rows[0].total_semesters})`,
      });

    const result = await client.query(
      `UPDATE subjects SET course_id=$1, branch_id=$2, semester_no=$3, subject_code=$4, subject_name=$5, credits=$6
       WHERE subject_id=$7 RETURNING *`,
      [course_id, branch_id, parseInt(semester_no), subject_code.trim().toUpperCase(), subject_name.trim(), parseInt(credits), id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Subject not found" });
    res.status(200).json({ success: true, subject: result.rows[0] });
  } catch (error) {
    console.error("updateSubject:", error);
    if (error.code === "23505")
      return res.status(400).json({ success: false, message: "Subject code already exists in this branch" });
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    client.release();
  }
};

const deleteSubject = async (req, res) => {
  const allowed = await hasPermission(req.user.user_id, req.user.role, "Manage Subjects");
  if (!allowed) return res.status(403).json({ message: "Permission Denied" });

  const client = await pool.connect();
  try {
    const { id } = req.params;
    const allocCheck = await client.query(
      `SELECT COUNT(*) FROM faculty_subject_allocation WHERE subject_id=$1`, [id]
    ).catch(() => ({ rows: [{ count: "0" }] }));

    if (parseInt(allocCheck.rows[0].count) > 0)
      return res.status(400).json({ success: false, message: "Cannot delete: faculty allocations exist for this subject." });

    const result = await client.query(`DELETE FROM subjects WHERE subject_id=$1 RETURNING *`, [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Subject not found" });
    res.status(200).json({ success: true, message: "Subject deleted successfully" });
  } catch (error) {
    console.error("deleteSubject:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    client.release();
  }
};

// ═══════════════════════════════════════════════════════════
// FACULTY ALLOCATION
// ═══════════════════════════════════════════════════════════

const createFacultyAllocation = async (req, res) => {
  try {
    const { employee_id, college_id, department_id, course_id, branch_id, semester, section, subject_id, academic_year } = req.body;
    if (!employee_id || !college_id || !department_id || !course_id || !branch_id || !semester || !section || !subject_id || !academic_year)
      return res.status(400).json({ message: "All fields are required." });

    const result = await pool.query(
      `INSERT INTO faculty_subject_allocation
        (employee_id, college_id, department_id, course_id, branch_id, semester, section, subject_id, academic_year)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [employee_id, college_id, department_id, course_id, branch_id, semester, section, subject_id, academic_year]
    );
    res.status(201).json({ message: "Faculty allocation created successfully.", allocation: result.rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === "23505")
      return res.status(409).json({ message: "This faculty is already assigned to this subject." });
    res.status(500).json({ message: "Server Error" });
  }
};

const getFacultyAllocations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        fsa.allocation_id, fsa.employee_id,
        fp.name AS faculty_name,
        c.college_name,
        d.department_name,
        co.course_name,
        b.branch_name,
        s.subject_name,
        fsa.semester, fsa.section, fsa.academic_year, fsa.is_active
      FROM faculty_subject_allocation fsa
      JOIN faculty_profile fp ON fp.employee_id = fsa.employee_id
      JOIN colleges c ON c.college_id = fsa.college_id
      JOIN departments d ON d.department_id = fsa.department_id
      JOIN courses co ON co.course_id = fsa.course_id
      JOIN branches b ON b.branch_id = fsa.branch_id
      JOIN subjects s ON s.subject_id = fsa.subject_id
      ORDER BY faculty_name, co.course_name, b.branch_name, fsa.semester, fsa.section
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const updateFacultyAllocation = async (req, res) => {
  try {
    const { allocation_id } = req.params;
    const { employee_id, college_id, department_id, course_id, branch_id, semester, section, subject_id, academic_year, is_active } = req.body;
    const result = await pool.query(
      `UPDATE faculty_subject_allocation
       SET employee_id=$1, college_id=$2, department_id=$3, course_id=$4, branch_id=$5,
           semester=$6, section=$7, subject_id=$8, academic_year=$9, is_active=$10, updated_at=CURRENT_TIMESTAMP
       WHERE allocation_id=$11 RETURNING *`,
      [employee_id, college_id, department_id, course_id, branch_id, semester, section, subject_id, academic_year, is_active, allocation_id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Allocation not found." });
    res.json({ message: "Allocation updated successfully.", allocation: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteFacultyAllocation = async (req, res) => {
  try {
    const { allocation_id } = req.params;
    const result = await pool.query(
      `DELETE FROM faculty_subject_allocation WHERE allocation_id=$1 RETURNING *`, [allocation_id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Allocation not found." });
    res.json({ message: "Allocation deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const getFacultyAllocationFormData = async (req, res) => {
  try {
    const [faculty, colleges, departments, courses, branches, subjects] = await Promise.all([
      pool.query(`SELECT employee_id, name FROM faculty_profile ORDER BY name`),
      pool.query(`SELECT * FROM colleges ORDER BY college_name`),
      pool.query(`SELECT * FROM departments ORDER BY department_name`),
      pool.query(`SELECT * FROM courses ORDER BY course_name`),
      pool.query(`SELECT * FROM branches ORDER BY branch_name`),
      pool.query(`SELECT * FROM subjects ORDER BY semester_no, subject_name`),
    ]);
    res.json({
      faculty: faculty.rows,
      colleges: colleges.rows,
      departments: departments.rows,
      courses: courses.rows,
      branches: branches.rows,
      subjects: subjects.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  // Colleges
  getAllColleges, createCollege, updateCollege, deleteCollege,
  // Departments
  createDepartment, getAllDepartments, updateDepartment, deleteDepartment,
  // Courses
  createCourse, getAllCourses, updateCourse, deleteCourse,
  // Branches
  createBranch, getAllBranches, updateBranch, deleteBranch,
  // Subjects
  createSubject, getAllSubjects, updateSubject, deleteSubject,
  // Faculty Allocation
  createFacultyAllocation, getFacultyAllocations, updateFacultyAllocation, deleteFacultyAllocation,
  getFacultyAllocationFormData,
};
