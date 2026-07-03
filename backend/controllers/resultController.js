const pool = require("../db");


// ============================
// Faculty
// ============================

exports.getFacultyClasses = async (req, res) => {
    try {

        const employeeId = req.user.employee_id;

        const result = await pool.query(
            `
            SELECT
                fsa.allocation_id,
                fsa.semester,
                fsa.section,
                fsa.academic_year,

                c.course_name,
                b.branch_name,

                s.subject_id,
                s.subject_name,
                s.subject_code,
                s.internal_max,
                s.external_max,
                s.practical_max

            FROM faculty_subject_allocation fsa

            JOIN faculty_profile fp
                ON fp.employee_id = fsa.employee_id

            JOIN courses c
                ON c.course_id = fp.course_id

            JOIN branches b
                ON b.branch_id = fp.branch_id

            JOIN subjects s
                ON s.subject_id = fsa.subject_id

            WHERE
                fsa.employee_id = $1
                AND fsa.is_active = TRUE

            ORDER BY
                fsa.semester,
                fsa.section,
                s.subject_name;
            `,
            [employeeId]
        );

        res.status(200).json({
            success: true,
            classes: result.rows
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};
// ======================================
// Faculty
// GET /api/results/faculty/class/:allocationId/students
// ======================================
exports.getStudentsForClass = async (req, res) => {
    try {

        const { allocationId } = req.params;
        

        // Get allocation details
        const allocationResult = await pool.query(
            
            `
            SELECT
                fsa.allocation_id,
                fsa.subject_id,
                fsa.semester,
                fsa.section,
                fsa.academic_year,
                fp.course_id,
                fp.branch_id,
                s.subject_name,
                s.subject_code
            FROM faculty_subject_allocation fsa

            JOIN faculty_profile fp
                ON fp.employee_id = fsa.employee_id

            JOIN subjects s
                ON s.subject_id = fsa.subject_id

            WHERE
                fsa.allocation_id = $1
                AND fsa.is_active = TRUE
            `,
            [allocationId]
        );

        if (allocationResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Allocation not found"
            });
        }

        const allocation = allocationResult.rows[0];

        // 👇 ADD THESE LOGS HERE
        console.log("========== ALLOCATION ==========");
        console.log(allocation);
        console.log("Course:", allocation.course_id);
        console.log("Branch:", allocation.branch_id);
        console.log("Semester:", allocation.semester);
        console.log("Section:", allocation.section);

                // Get students + existing marks
        const studentResult = await pool.query(
        `
        SELECT
            sp.profile_id,
            sp.enrollment_number,
            sp.student_name,

            NULL AS mark_id,
            NULL AS internal_marks,
            NULL AS external_marks,
            NULL AS practical_marks,
            NULL AS total_marks,
            '' AS remarks,
            FALSE AS is_locked

        FROM student_profile sp

        WHERE
            sp.course_id = $1
            AND sp.branch_id = $2
            AND sp.semester = $3
            AND sp.section = $4
            AND sp.current_status = 'Active'

        ORDER BY
            sp.student_name;
        `,
        [
            allocation.course_id,
            allocation.branch_id,
            allocation.semester,
            allocation.section
        ]
        );

        console.log("Students Found:", studentResult.rows.length);
        console.log(studentResult.rows);
        res.status(200).json({
            success: true,

            classInfo: {
                allocation_id: allocation.allocation_id,
                subject_id: allocation.subject_id,
                subject_name: allocation.subject_name,
                subject_code: allocation.subject_code,
                semester: allocation.semester,
                section: allocation.section,
                academic_year: allocation.academic_year
            },

            students: studentResult.rows
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// ======================================
// Faculty
// POST /api/results/faculty/save-marks
// ======================================
exports.saveMarks = async (req, res) => {

    const client = await pool.connect();

    try {

        const { allocationId, marks } = req.body;

        if (!allocationId || !Array.isArray(marks)) {
            return res.status(400).json({
                success: false,
                message: "Invalid request."
            });
        }

        const lockResult = await client.query(
            `
            SELECT marks_locked
            FROM faculty_subject_allocation
            WHERE allocation_id = $1
            `,
            [allocationId]
        );

        if (
            lockResult.rows.length &&
            lockResult.rows[0].marks_locked
        ) {
            return res.status(403).json({
                success: false,
                message: "Marks have been locked."
            });
        }

        await client.query("BEGIN");

        for (const student of marks) {

            const total =
                Number(student.internal_marks || 0) +
                Number(student.external_marks || 0) +
                Number(student.practical_marks || 0);

            await client.query(
                `
                INSERT INTO marks
                (
                    enrollment_number,
                    faculty_allocation_id,
                    subject_id,
                    internal_marks,
                    external_marks,
                    practical_marks,
                    total_marks,
                    remarks
                )

                VALUES
                (
                    $1,
                    $2,
                    (
                        SELECT subject_id
                        FROM faculty_subject_allocation
                        WHERE allocation_id = $2
                    ),
                    $3,
                    $4,
                    $5,
                    $6,
                    $7
                )

                ON CONFLICT
                (
                    enrollment_number,
                    faculty_allocation_id
                )

                DO UPDATE SET

                    internal_marks = EXCLUDED.internal_marks,
                    external_marks = EXCLUDED.external_marks,
                    practical_marks = EXCLUDED.practical_marks,
                    total_marks = EXCLUDED.total_marks,
                    remarks = EXCLUDED.remarks,
                    updated_at = CURRENT_TIMESTAMP;
                `,
                [
                    student.enrollment_number,
                    allocationId,
                    student.internal_marks,
                    student.external_marks,
                    student.practical_marks,
                    total,
                    student.remarks
                ]
            );

        }

        await client.query("COMMIT");

        res.json({
            success: true,
            message: "Marks saved successfully."
        });

    } catch (err) {

        await client.query("ROLLBACK");

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    } finally {

        client.release();

    }

};  

exports.lockMarks = async (req, res) => {
    try {

        const { allocationId } = req.params;

        const result = await pool.query(
            `
            UPDATE faculty_subject_allocation
            SET marks_locked = TRUE
            WHERE allocation_id = $1
            RETURNING allocation_id
            `,
            [allocationId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Allocation not found"
            });
        }

        res.json({
            success: true,
            message: "Marks locked successfully."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};


// ============================
// Admin
// ============================

exports.generateResults = async (req, res) => {

    const client = await pool.connect();

    try {

        const {
            courseId,
            branchId,
            semester,
            academicYear
        } = req.body;

        if (
            !courseId ||
            !branchId ||
            !semester ||
            !academicYear
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields."
            });
        }

        await client.query("BEGIN");

        // ============================
        // Fetch all active students
        // ============================

        const studentsResult = await client.query(
            `
            SELECT
                enrollment_number,
                student_name,
                college_id,
                department_id,
                course_id,
                branch_id
            FROM student_profile
            WHERE
                course_id = $1
                AND branch_id = $2
                AND semester = $3
                AND current_status = 'Active'
            ORDER BY student_name
            `,
            [
                courseId,
                branchId,
                semester
            ]
        );

        if (studentsResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "No students found."
            });

        }

        // ============================
        // Clean up old draft results before generating new ones
        // ============================
        await client.query(
            `
            DELETE FROM result_details
            WHERE result_id IN
            (
                SELECT result_id
                FROM student_results
                WHERE
                    course_id = $1
                    AND branch_id = $2
                    AND semester = $3
                    AND academic_year = $4
                    AND published = FALSE
            )
            `,
            [
                courseId,
                branchId,
                semester,
                academicYear
            ]
        );

        await client.query(
            `
            DELETE FROM student_results
            WHERE
                course_id = $1
                AND branch_id = $2
                AND semester = $3
                AND academic_year = $4
                AND published = FALSE
            `,
            [
                courseId,
                branchId,
                semester,
                academicYear
            ]
        );

        // ============================
        // Fetch subjects
        // ============================

        const subjectsResult = await client.query(
            `
            SELECT
                subject_id,
                subject_name,
                credits,
                passing_marks,
                internal_max_marks,
                external_max_marks,
                practical_max_marks
            FROM subjects
            WHERE
                branch_id = $1
                AND semester_no = $2
            ORDER BY subject_name
            `,
            [
                branchId,
                semester
            ]
        );

        if (subjectsResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "No subjects found."
            });

        }

        // ============================
        // Fetch marks
        // ============================

        const marksResult = await client.query(
            `
            SELECT *
            FROM marks
            WHERE
                enrollment_number IN
                (
                    SELECT enrollment_number
                    FROM student_profile
                    WHERE
                        course_id = $1
                        AND branch_id = $2
                        AND semester = $3
                )
            `,
            [
                courseId,
                branchId,
                semester
            ]
        );

        // ============================
        // Grade Helper
        // ============================

        function getGrade(total) {

            if (total >= 90)
                return { grade: "O", point: 10 };

            if (total >= 80)
                return { grade: "A+", point: 9 };

            if (total >= 70)
                return { grade: "A", point: 8 };

            if (total >= 60)
                return { grade: "B+", point: 7 };

            if (total >= 50)
                return { grade: "B", point: 6 };

            if (total >= 45)
                return { grade: "C", point: 5 };

            if (total >= 40)
                return { grade: "P", point: 4 };

            return {
                grade: "F",
                point: 0
            };

        }

        // ============================
        // Part 2 starts here
        // ============================
        // =====================================
        // Process Every Student
        // =====================================

        for (const student of studentsResult.rows) {

            let totalMarks = 0;
            let obtainedMarks = 0;

            let totalCredits = 0;
            let earnedCredits = 0;

            let totalGradePoints = 0;

            let totalSubjects = 0;
            let passedSubjects = 0;
            let failedSubjects = 0;

            // ---------------------------------
            // Create Student Result
            // ---------------------------------

            const studentResult = await client.query(
                `
                INSERT INTO student_results
                (
                    enrollment_number,
                    college_id,
                    department_id,
                    course_id,
                    branch_id,
                    semester,
                    academic_year,
                    total_subjects,
                    passed_subjects,
                    failed_subjects,
                    total_marks,
                    obtained_marks,
                    total_credits,
                    earned_credits,
                    sgpa,
                    cgpa,
                    result_status,
                    published
                )
                VALUES
                (
                    $1,$2,$3,$4,$5,
                    $6,$7,
                    0,0,0,
                    0,0,
                    0,0,
                    0,0,
                    'Draft',
                    FALSE
                )
                RETURNING result_id
                `,
                [
                    student.enrollment_number,
                    student.college_id,
                    student.department_id,
                    student.course_id,
                    student.branch_id,
                    semester,
                    academicYear
                ]
            );

            const resultId = studentResult.rows[0].result_id;

            // ---------------------------------
            // Subject Loop
            // ---------------------------------

            for (const subject of subjectsResult.rows) {

                totalSubjects++;

                const mark = marksResult.rows.find(m =>

                    m.enrollment_number === student.enrollment_number &&
                    Number(m.subject_id) === Number(subject.subject_id)

                );

                const internal = Number(mark?.internal_marks || 0);
                const external = Number(mark?.external_marks || 0);
                const practical = Number(mark?.practical_marks || 0);

                const total =
                    internal +
                    external +
                    practical;

                const passed =
                    total >= subject.passing_marks;

                const gradeData =
                    getGrade(total);

                totalMarks +=
                    subject.passing_marks +
                    (
                        subject.internal_max_marks ?? 30
                    ) +
                    (
                        subject.external_max_marks ?? 70
                    );

                obtainedMarks += total;

                totalCredits += Number(subject.credits);

                if (passed) {

                    passedSubjects++;

                    earnedCredits += Number(subject.credits);

                    totalGradePoints +=
                        gradeData.point *
                        Number(subject.credits);

                } else {

                    failedSubjects++;

                }

                await client.query(
                    `
                    INSERT INTO result_details
                    (
                        result_id,
                        subject_id,
                        internal_marks,
                        external_marks,
                        practical_marks,
                        total_marks,
                        credits,
                        grade,
                        grade_points,
                        pass
                    )
                    VALUES
                    (
                        $1,$2,$3,$4,$5,
                        $6,$7,$8,$9,$10
                    )
                    `,
                    [
                        resultId,
                        subject.subject_id,
                        internal,
                        external,
                        practical,
                        total,
                        subject.credits,
                        gradeData.grade,
                        gradeData.point,
                        passed
                    ]
                );

            }

            // =====================================
            // Part 3 starts here
            // =====================================
            // =====================================
            // Calculate SGPA & Update Result
            // =====================================

            const sgpa =
                totalCredits > 0
                    ? Number(
                        (totalGradePoints / totalCredits).toFixed(2)
                    )
                    : 0;

            const resultStatus =
                failedSubjects === 0
                    ? "PASS"
                    : "FAIL";

            await client.query(
                `
                UPDATE student_results
                SET
                    total_subjects = $1,
                    passed_subjects = $2,
                    failed_subjects = $3,

                    total_marks = $4,
                    obtained_marks = $5,

                    total_credits = $6,
                    earned_credits = $7,

                    sgpa = $8,

                    result_status = $9

                WHERE result_id = $10
                `,
                [
                    totalSubjects,
                    passedSubjects,
                    failedSubjects,

                    totalMarks,
                    obtainedMarks,

                    totalCredits,
                    earnedCredits,

                    sgpa,

                    resultStatus,

                    resultId
                ]
            );

            } // ← End Student Loop


            // =====================================
            // Commit Transaction
            // =====================================

            await client.query("COMMIT");

            res.status(200).json({
                success: true,
                message: `${studentsResult.rows.length} results generated successfully.`
            });
    } catch (err) {

        await client.query("ROLLBACK");

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    } finally {

        client.release();

    }

};


// ======================================
// Admin
// GET /api/results/admin
// ======================================
exports.getResults = async (req, res) => {
    try {

        const {
            courseId,
            branchId,
            semester,
            academicYear,
            published
        } = req.query;

        let query = `
            SELECT

                sr.result_id,
                sr.enrollment_number,

                sp.student_name,

                c.course_name,
                b.branch_name,

                sr.semester,
                sr.academic_year,

                sr.total_subjects,
                sr.passed_subjects,
                sr.failed_subjects,

                sr.obtained_marks,
                sr.total_marks,

                sr.sgpa,
                sr.cgpa,

                sr.result_status,
                sr.published,
                sr.published_at

            FROM student_results sr

            JOIN student_profile sp
                ON sp.enrollment_number = sr.enrollment_number

            JOIN courses c
                ON c.course_id = sr.course_id

            JOIN branches b
                ON b.branch_id = sr.branch_id

            WHERE 1 = 1
        `;

        const params = [];
        let index = 1;

        if (courseId) {
            query += ` AND sr.course_id = $${index++}`;
            params.push(courseId);
        }

        if (branchId) {
            query += ` AND sr.branch_id = $${index++}`;
            params.push(branchId);
        }

        if (semester) {
            query += ` AND sr.semester = $${index++}`;
            params.push(semester);
        }

        if (academicYear) {
            query += ` AND sr.academic_year = $${index++}`;
            params.push(academicYear);
        }

        if (published !== undefined) {
            query += ` AND sr.published = $${index++}`;
            params.push(published === "true");
        }

        query += `
            ORDER BY
                sr.semester,
                sp.student_name;
        `;

        const result = await pool.query(query, params);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            results: result.rows
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

exports.publishResults = async (req, res) => {
    try {

        const {
            courseId,
            branchId,
            semester,
            academicYear
        } = req.body;

        const result = await pool.query(
            `
            UPDATE student_results
            SET
                published = TRUE,
                published_at = CURRENT_TIMESTAMP,
                result_status = 'Published'
            WHERE
                course_id = $1
                AND branch_id = $2
                AND semester = $3
                AND academic_year = $4
                AND published = FALSE
            `,
            [
                courseId,
                branchId,
                semester,
                academicYear
            ]
        );

        res.json({
            success: true,
            message: `${result.rowCount} results published successfully.`
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};


// ============================
// Student
// ============================

exports.getStudentResults = async (req, res) => {

    try {

        const enrollmentNumber =
            req.user.enrollment_number;

        const result = await pool.query(
            `
            SELECT
                result_id,
                semester,
                academic_year,
                sgpa,
                cgpa,
                result_status,
                published
            FROM student_results
            WHERE
                enrollment_number = $1
                AND published = TRUE
            ORDER BY semester
            `,
            [enrollmentNumber]
        );

        res.json({
            success: true,
            results: result.rows
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

exports.getSemesterResult = async (req, res) => {

    try {

        const enrollmentNumber = req.user.enrollment_number;
        const { semester } = req.params;

        const summary = await pool.query(
            `
            SELECT *
            FROM student_results
            WHERE
                enrollment_number = $1
                AND semester = $2
                AND published = TRUE
            `,
            [enrollmentNumber, semester]
        );

        if (summary.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Result not found."
            });
        }

        const details = await pool.query(
            `
            SELECT
                rd.*,
                s.subject_name,
                s.subject_code
            FROM result_details rd
            JOIN subjects s
                ON s.subject_id = rd.subject_id
            WHERE rd.result_id = $1
            ORDER BY s.subject_name
            `,
            [summary.rows[0].result_id]
        );

        res.json({
            success: true,
            summary: summary.rows[0],
            subjects: details.rows
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};
// ======================================
// Admin
// GET /api/results/admin/:resultId
// ======================================
exports.getResultDetails = async (req, res) => {
    try {
        const { resultId } = req.params;

        const summary = await pool.query(
            `
            SELECT *
            FROM student_results
            WHERE result_id = $1
            `,
            [resultId]
        );

        if (summary.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Result not found."
            });
        }

        const details = await pool.query(
            `
            SELECT
                rd.*,
                s.subject_name,
                s.subject_code
            FROM result_details rd
            JOIN subjects s
                ON s.subject_id = rd.subject_id
            WHERE rd.result_id = $1
            ORDER BY s.subject_name
            `,
            [resultId]
        );

        res.json({
            success: true,
            summary: summary.rows[0],
            subjects: details.rows
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};
