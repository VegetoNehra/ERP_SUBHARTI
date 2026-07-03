  const pool = require("../db");

  // ================================
  // Get All Allocations (flat list)
  // Used by the admin table — one row per subject, client groups by faculty.
  // GET /academic/faculty-allocation/allocations
  // ================================
  exports.getAllAllocations = async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT
            a.allocation_id,
            a.employee_id,
            a.semester,
            a.section,
            a.academic_year,
            a.is_active,
            fp.name            AS faculty_name,
            d.department_name,
            c.course_name,
            s.subject_id,
            b.branch_name,
            s.subject_name,
            s.subject_code
        FROM faculty_subject_allocation a
        JOIN faculty_profile fp
            ON fp.employee_id = a.employee_id

        JOIN courses c
            ON c.course_id = fp.course_id

        JOIN branches b
            ON b.branch_id = fp.branch_id

        JOIN departments d
            ON d.department_id = c.department_id

      

        JOIN subjects s
            ON s.subject_id = a.subject_id
        ORDER BY fp.name, a.semester, s.subject_name`
      );

      // Group into one record per (employee_id, semester, section, academic_year)
      // so the frontend table gets a "subjects" array per allocation group.
      const map = new Map();

      for (const row of result.rows) {
        // Use a composite key so different semester/section/year combos stay separate
        const key = `${row.employee_id}__${row.semester}__${row.section}__${row.academic_year}`;

        if (!map.has(key)) {
          map.set(key, {
            // Use the first allocation_id as the group representative for delete
            allocation_id:   row.allocation_id,
            employee_id:     row.employee_id,
            faculty_name:    row.faculty_name,  
            department_name: row.department_name,
            course_name:     row.course_name,
            branch_name:     row.branch_name,
            semester:        row.semester,
            section:         row.section,
            academic_year:   row.academic_year,
            is_active:       row.is_active,
            subjects:        [],
          });
        }

        map.get(key).subjects.push({
          subject_id:   row.subject_id,
          subject_name: row.subject_name,
          subject_code: row.subject_code,
        });
      }

      res.json([...map.values()]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  };

  // ================================
  // Get Available Subjects
  // GET /academic/faculty-allocation/:facultyId/available-subjects?semester=3
  //
  // Returns facultyInfo + subjects filtered by semester when provided.
  // ================================
  exports.getAvailableSubjects = async (req, res) => {

      console.log("🔥 getAvailableSubjects called", req.params);

    try {
      
      
      const { facultyId } = req.params;
      const { semester }  = req.query;
        // optional — filter subjects by semester

      const facultyResult = await pool.query(
        `SELECT
            fp.employee_id,
            fp.name,
            d.department_name,
            c.course_id,
            c.course_name,
            b.branch_id,
            b.branch_name
        FROM faculty_profile fp
        JOIN courses c
            ON c.course_id = fp.course_id
        JOIN departments d
            ON d.department_id = c.department_id
        JOIN branches b
            ON b.branch_id = fp.branch_id
        WHERE fp.employee_id = $1;`,
        [facultyId]
      );
      console.log(facultyResult.rows);

      if (facultyResult.rows.length === 0) {
        return res.status(404).json({ message: "Faculty not found" });
      }

      const faculty  = facultyResult.rows[0];
      const {
          course_id,
          branch_id
      } = faculty;
      // Build the subjects query — filter by semester_no when provided
      let subjectQuery;
      let subjectParams;

      if (semester) {
        subjectQuery = `
          SELECT
            subject_id,
            subject_name,
            subject_code,
            semester_no
          FROM subjects
          WHERE branch_id = $1
            AND semester_no = $2
          ORDER BY subject_name
        `;

        subjectParams = [branch_id, semester];
      } else {
        subjectQuery = `
          SELECT
            subject_id,
            subject_name,
            subject_code,
            semester_no
          FROM subjects
          WHERE branch_id = $1
          ORDER BY semester_no, subject_name
        `;

        subjectParams = [branch_id];
      }

      const subjectResult = await pool.query(
        subjectQuery,
        subjectParams
      );


      res.json({
        facultyInfo: {
          employee_id:     faculty.employee_id,
          name:            faculty.name,
          department_name: faculty.department_name,
          course_name:     faculty.course_name,
          branch_name:     faculty.branch_name ?? null,
        },
        availableSubjects: subjectResult.rows,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  };

  // ================================
  // Get Allocations for One Faculty
  // GET /academic/faculty-allocation/:facultyId/allocations
  // ================================
  exports.getFacultyAllocations = async (req, res) => {
    try {
      const { facultyId } = req.params;

      const result = await pool.query(
        `SELECT
            a.allocation_id,
            a.semester,
            a.section,
            a.academic_year,
            a.is_active,
            s.subject_id,
            s.subject_name,
            s.subject_code
        FROM faculty_subject_allocation a
        JOIN subjects s ON s.subject_id = a.subject_id
        WHERE a.employee_id = $1
        ORDER BY a.semester, s.subject_name`,
        [facultyId]
      );

      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  };

  // ================================
  // Save Faculty Allocations
  // POST /academic/faculty-allocation/:facultyId/allocations
  //
  // Replaces all allocations for the same (faculty, semester, academic_year)
  // inside a transaction — safe atomic upsert.
  // ================================
  exports.saveFacultyAllocations = async (req, res) => {
    const client = await pool.connect();

    try {
      const { facultyId }                          = req.params;
      const { subject_ids, semester, section, academic_year } = req.body;

      if (!subject_ids?.length) {
        return res.status(400).json({ message: "At least one subject is required." });
      }

      await client.query("BEGIN");

      // Delete all existing rows for this faculty/semester/year combo
      await client.query(
        `DELETE FROM faculty_subject_allocation
        WHERE employee_id  = $1
          AND semester     = $2
          AND academic_year = $3`,
        [facultyId, semester, academic_year]
      );

      // Insert one row per subject
      for (const subjectId of subject_ids) {
        await client.query(
          `INSERT INTO faculty_subject_allocation
            (employee_id, semester, section, subject_id, academic_year, is_active)
          VALUES ($1, $2, $3, $4, $5, true)`,
          [facultyId, semester, section, subjectId, academic_year]
        );
      }

      await client.query("COMMIT");

      res.json({ success: true, message: "Subjects allocated successfully." });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    } finally {
      client.release();
    }
  };

  // ================================
  // Delete a Single Allocation Row
  // DELETE /academic/faculty-allocation/:allocationId
  // ================================
  exports.deleteFacultyAllocation = async (req, res) => {
    try {
      const { allocationId } = req.params;

      const result = await pool.query(
        `DELETE FROM faculty_subject_allocation
        WHERE allocation_id = $1
        RETURNING allocation_id`,
        [allocationId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Allocation not found." });
      }

      res.json({ success: true, message: "Allocation deleted." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  };