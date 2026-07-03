const pool = require("../db");

const getStudentProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        sp.*,
        c.college_name,
        d.department_name,
        co.course_name,
        b.branch_name
      FROM student_profile sp
      LEFT JOIN colleges c
        ON sp.college_id = c.college_id
      LEFT JOIN departments d
        ON sp.department_id = d.department_id
      LEFT JOIN courses co
        ON sp.course_id = co.course_id
      LEFT JOIN branches b
        ON sp.branch_id = b.branch_id
      WHERE sp.user_id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server error"
    });
  }
};

module.exports = {
  getStudentProfile
};