const bcrypt = require("bcrypt");
const pool = require("../db");
const generatePassword = require("../utils/generatepassword");
const hasPermission = require("../utils/permissionHelper");

const registerStudent = async (req, res) => {
  const client = await pool.connect();

  const allowed = await hasPermission(
        req.user.user_id,
        req.user.role,
        "Register Student"
    );

    if (!allowed) {
        return res.status(403).json({
            message: "Permission Denied"
        });
    }

  try {
    const {
      enrollmentNo,
      name,
      fatherName,
      motherName,
      email,
      phone,
      collegeId,
      departmentId,
      courseId,
      branchId,
      semester,
      section,
      admissionYear,
      class10,
      class12,
      dob,
      gender,
    } = req.body;

    const generatedPassword = generatePassword();

    const hashedPassword = await bcrypt.hash(
      generatedPassword,
      10
    );

    console.log("Generated Password:");
    console.log(generatedPassword);

    console.log("Hashed Password:");
    console.log(hashedPassword);

    // Start Transaction
    await client.query("BEGIN");

    // Insert into users table
    const userResult = await client.query(
      `
      INSERT INTO users
      (
        username,
        name,
        password,
        role
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4
      )
      RETURNING user_id
      `,
      [
        enrollmentNo,
        name,
        hashedPassword,
        "student",
      ]
    );

    const userId =
      userResult.rows[0].user_id;

    console.log("Created User ID:", userId);

    // Insert into student_profile table
    await client.query(
        `
        INSERT INTO student_profile
        (
          user_id,
          enrollment_number,
          student_name,
          father_name,
          mother_name,
          email,
          phone,
          college_id,
          department_id,
          course_id,
          branch_id,
          semester,
          section,
          admission_year,
          tenth_percentage,
          twelfth_percentage,
          dob,
          gender
        )
        VALUES
        (
          $1,$2,$3,$4,$5,
          $6,$7,$8,$9,$10,
          $11,$12,$13,$14,
          $15,$16,$17,$18
        )
        `,
        [
          userId,
          enrollmentNo,
          name,
          fatherName,
          motherName,
          email,
          phone,
          collegeId,
          departmentId,
          courseId,
          branchId,
          semester,
          section || "A",
          admissionYear,
          class10,
          class12,
          dob,
          gender,
        ]
      );
    // Save everything permanently
    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      userId,
      username: enrollmentNo,
      password: generatedPassword,
      message: "Student registered successfully",
    });

  } catch (error) {

    // Undo everything if any query fails
    await client.query("ROLLBACK");

    console.error(error);

    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message:
          "Student already exists (Enrollment No. or Email already used)",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  } finally {

    // Return connection to pool
    client.release();

  }
};

const registerFaculty = async (req, res) => {
  const client = await pool.connect();

  const allowed = await hasPermission(
        req.user.user_id,
        req.user.role,
        "Register Faculty"
    );

    if (!allowed) {
        return res.status(403).json({
            message: "Permission Denied"
        });
    }

  try {
    const {
      employeeId,
      name,
      email,
      phone,
      dob,
      gender,
      departmentId,
      courseId,
      branchId,
    } = req.body;

    const generatedPassword = generatePassword();

    const hashedPassword = await bcrypt.hash(
      generatedPassword,
      10
    );

    console.log("Generated Password:");
    console.log(generatedPassword);

    console.log("Hashed Password:");
    console.log(hashedPassword);

    // Start Transaction
    await client.query("BEGIN");

    // Insert into users table
    const userResult = await client.query(
      `
      INSERT INTO users
      (
        username,
        name,
        password,
        role
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4
      )
      RETURNING user_id
      `,
      [
        employeeId,
        name,
        hashedPassword,
        "admin",
      ]
    );

    const userId =
      userResult.rows[0].user_id;

    console.log("Created User ID:", userId);

    // Insert into faculty_profile table
    await client.query(
      `
      INSERT INTO faculty_profile
        (
          employee_id,
          user_id,
          name,
          email,
          phone,
          dob,
          gender,
          department_id,
          course_id,
          branch_id
        )
        VALUES
        (
          $1,$2,$3,$4,$5,
          $6,$7,$8,$9,$10
        )
      `,
      [
        employeeId,
        userId,
        name,
        email,
        phone,
        dob,
        gender,
        departmentId,
        courseId,
        branchId,
      ]
    );  
    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      userId,
      username: employeeId,
      password: generatedPassword,
      message: "Faculty registered successfully",
    });

  } catch (error) {

    await client.query("ROLLBACK");

    console.error(error);

    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message:
          "Faculty already exists (Employee ID or Email already used)",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  } finally {
    client.release();
  }
};

const manageStudents = async (req, res) => {
  const client = await pool.connect();

  const allowed = await hasPermission(
    req.user.user_id,
    req.user.role,
    "Manage Students"
  );

  if (!allowed) {
    return res.status(403).json({
      message: "Permission Denied",
    });
  }

  try {
    const result = await client.query(`
      SELECT
        sp.enrollment_number,
        sp.student_name,
        sp.father_name,
        sp.mother_name,
        sp.email,
        sp.phone,
        c.college_name,
        d.department_name,
        co.course_name,
        b.branch_name,
        sp.semester,
        sp.section,
        sp.dob,
        sp.gender,
        sp.current_status
      FROM student_profile sp
      LEFT JOIN colleges c
        ON sp.college_id = c.college_id
      LEFT JOIN departments d
        ON sp.department_id = d.department_id
      LEFT JOIN courses co
        ON sp.course_id = co.course_id
      LEFT JOIN branches b
        ON sp.branch_id = b.branch_id
      ORDER BY sp.student_name ASC
    `);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      students: result.rows,
    });

  } catch (error) {
    console.error("Manage Students Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  } finally {
    client.release();
  }
};

const manageFaculty = async (req, res) => {
  const client = await pool.connect();

  const allowed = await hasPermission(
        req.user.user_id,
        req.user.role,
        "Manage Faculty"
    );

    if (!allowed) {
        return res.status(403).json({
            message: "Permission Denied"
        });
    }

  try {
    const result = await client.query(`
        SELECT
        fp.employee_id,
        fp.user_id,
        fp.name,
        fp.email,
        fp.phone,
        fp.dob,
        fp.gender,

        fp.department_id,
        d.department_name,
        d.department_code,

        fp.course_id,
        c.course_name,
        c.course_code,

        fp.branch_id,
        b.branch_name,
        b.branch_code,

        fp.created_at

    FROM faculty_profile fp

    LEFT JOIN departments d
        ON fp.department_id = d.department_id

    LEFT JOIN courses c
        ON fp.course_id = c.course_id

    LEFT JOIN branches b
        ON fp.branch_id = b.branch_id

    ORDER BY fp.name ASC;
    `);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      faculty: result.rows,
    });

  } catch (error) {
    console.error("Manage Faculty Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  } finally {
    client.release();
  }
};

const getDashboardStats = async (req, res) => {
  const client = await pool.connect();


  

  try {
    const studentsResult = await client.query(
      "SELECT COUNT(*) FROM student_profile"
    );

    const facultyResult = await client.query(
      "SELECT COUNT(*) FROM faculty_profile"
    );

    const noticesResult = await client.query(
      "SELECT COUNT(*) FROM notices"
    );

    res.status(200).json({
      success: true,
      stats: {
        students: parseInt(studentsResult.rows[0].count),
        faculty: parseInt(facultyResult.rows[0].count),
        notices: parseInt(noticesResult.rows[0].count),
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  } finally {
    client.release();
  }
};

const createNotice= async (req, res) => {
  const client = await pool.connect();

  const allowed = await hasPermission(
        req.user.user_id,
        req.user.role,
        "Create Notice"
    );

    if (!allowed) {
        return res.status(403).json({
            message: "Permission Denied"
        });
    }

  try {
    const { title, content } = req.body;
    await client.query(
      `
      INSERT INTO notices
      (
        title,
        content,
        created_at
      )
      VALUES
      (
        $1,
        $2,
        NOW() 
      )
      `,
      [title, content]
    );

    res.status(201).json({
      success: true,
      message: "Notice created successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  } finally {

    // Return connection to pool
    client.release();

  }
}
const getAllNotices = async (req, res) => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      SELECT * FROM notices
      ORDER BY created_at DESC
      `
    );

    res.status(200).json({
      success: true,
      notices: result.rows,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  } finally {

    // Return connection to pool
    client.release(); 
  }
};   
const updateNotice = async (req, res) => {
  const client = await pool.connect();

  const allowed = await hasPermission(
        req.user.user_id,
        req.user.role,
        "Edit Notice"
    );

    if (!allowed) {
        return res.status(403).json({
            message: "Permission Denied"
        });
    }

  try {
    const noticeId = req.params.id;
    const { title, content } = req.body;

    const result = await client.query(
      `
      UPDATE notices
      SET title = $1,
          content = $2,
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
      `,
      [title, content, noticeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    res.status(200).json({
      success: true,
      notice: result.rows[0],
      message: "Notice updated successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  } finally { 
    client.release();
  }
};
const getNoticeById = async (req, res) => {
  const client = await pool.connect();

  try {
    const noticeId = req.params.id;

    const result = await client.query(
      `
      SELECT * FROM notices
      WHERE id = $1
      `,
      [noticeId]
    );      
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    res.status(200).json({
      success: true,
      notice: result.rows[0],
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  } finally { 
    client.release();
  }
};
const deleteNotice = async (req, res) => {
  const client = await pool.connect();

  const allowed = await hasPermission(
        req.user.user_id,
        req.user.role,
        "Edit Notice"
    );

    if (!allowed) {
        return res.status(403).json({
            message: "Permission Denied"
        });
    }

  try {
    const noticeId = req.params.id;

    const result = await client.query(
      `
      DELETE FROM notices
      WHERE id = $1
      RETURNING *
      `,
      [noticeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notice deleted successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  } finally { 
    client.release();
  }
};

const getAdminList = async (req, res) => {
  if (req.user.role !== "master") {
      return res.status(403).json({
        success: false,
        message: "Access Denied"
      });
    }
  const client = await pool.connect();

  try {

    const result = await client.query(`
      SELECT
        fp.user_id,
        fp.employee_id,
        fp.name
      FROM faculty_profile fp
      JOIN users u
      ON fp.user_id = u.user_id
      WHERE u.role = 'admin'
      ORDER BY fp.name ASC
    `);

    res.status(200).json({
      success: true,
      admins: result.rows
    });

  } catch(error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  } finally {
    client.release();
  }
};

const getAdminPermissions = async (req, res) => {
  if (req.user.role !== "master") {
      return res.status(403).json({
        success: false,
        message: "Access Denied"
      });
    } 
  const client = await pool.connect();

  try {

    const { id } = req.params;
    

    const result = await client.query(
      `
      SELECT
          mm.menu_id,
          mm.menu_name,
          CASE
              WHEN ap.menu_id IS NOT NULL THEN TRUE
              ELSE FALSE
          END AS granted
      FROM menu_master mm
      LEFT JOIN admin_permissions ap
          ON mm.menu_id = ap.menu_id
          AND ap.user_id = $1
      ORDER BY mm.menu_id
      `,
      [id]
    );

    res.status(200).json({
      success: true,
      permissions: result.rows
    });

  } catch(error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  } finally {
    client.release();
  }
};

const saveAdminPermissions = async (req, res) => {
  if (req.user.role !== "master") {
      return res.status(403).json({
        success: false,
        message: "Access Denied"
      });
    }
  const client = await pool.connect();

  try {

    const { userId, menuIds } = req.body;

    

    await client.query("BEGIN");

    // Remove old permissions
    await client.query(
      `
      DELETE FROM admin_permissions
      WHERE user_id = $1
      `,
      [userId]
    );

    // Insert new permissions
    for (const menuId of menuIds) {
      
      await client.query(
        `
        INSERT INTO admin_permissions
        (
          user_id,
          menu_id
        )
        VALUES
        (
          $1,
          $2
        )
        `,
        [userId, menuId]
      );
    }

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Permissions updated successfully"
    });

  } catch (error) {

    await client.query("ROLLBACK");

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  } finally {
    client.release();
  }
};

const getMyPermissions = async (req, res) => {
  const client = await pool.connect();

  try {

    // Master gets everything
    if (req.user.role === "master") {

      const result = await client.query(`
        SELECT menu_name
        FROM menu_master
        ORDER BY menu_id
      `);

      return res.status(200).json({
        success: true,
        permissions: result.rows.map(
          row => row.menu_name
        )
      });
    }

    const result = await client.query(
      `
      SELECT mm.menu_name
      FROM admin_permissions ap
      JOIN menu_master mm
        ON ap.menu_id = mm.menu_id
      WHERE ap.user_id = $1
      ORDER BY mm.menu_id
      `,
      [req.user.user_id]
    );

    res.status(200).json({
      success: true,
      permissions: result.rows.map(
        row => row.menu_name
      )
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  } finally {
    client.release();
  }
};
module.exports = {
  saveAdminPermissions,
  getMyPermissions,
  registerStudent,
  registerFaculty,
  createNotice,
  getAllNotices,
  updateNotice,
  deleteNotice, 
  getNoticeById,
  manageStudents,
  manageFaculty,
  getAdminList,
  getAdminPermissions,
  getDashboardStats
};