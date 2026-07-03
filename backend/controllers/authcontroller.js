const bcrypt = require("bcrypt");
const pool = require("../db");

const login = async (req, res) => {
const { username, password , role } = req.body;
const jwt = require("jsonwebtoken"); // ← inside the login function body
try {
    const result = await pool.query(
    `
    SELECT * FROM users
    WHERE username = $1
    `,
    [username]
    );

    if (result.rows.length === 0) {
    return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Here you would typically compare the provided password with the hashed password in the database
    // For simplicity, we are just checking if they match directly (not recommended for production)

    const isMatch = await bcrypt.compare(
    password,
    user.password
    );

    if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
    }
    if (
        role === "student" &&
        user.role !== "student"
    ) {
        return res.status(403).json({
            message: "This account is not registered as student"
        });
    }

    if (
        role === "admin" &&
        user.role !== "admin" &&
        user.role !== "master"
    ) {
        return res.status(403).json({
            message: "This account is not registered as admin"
        });
    }

    let tokenPayload = {
            user_id: user.user_id,
            role: user.role,
        };

        // Admin / Master
        if (user.role === "admin" || user.role === "master") {
            const facultyResult = await pool.query(
                `
                SELECT employee_id
                FROM faculty_profile
                WHERE user_id = $1
                `,
                [user.user_id]
            );

            if (facultyResult.rows.length > 0) {
                tokenPayload.employee_id =
                    facultyResult.rows[0].employee_id;
            }
        }

        // Student
        if (user.role === "student") {
            const studentResult = await pool.query(
                `
                SELECT enrollment_number
                FROM student_profile
                WHERE user_id = $1
                `,
                [user.user_id]
            );

            if (studentResult.rows.length > 0) {
                tokenPayload.enrollment_number =
                    studentResult.rows[0].enrollment_number;
            }
        }

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

    res.json({
    message: "Login successful",
    token,
    user: {
        id: user.user_id,
        username: user.username,
        name: user.name,
        role: user.role,
        employee_id: tokenPayload.employee_id || null,
        enrollment_number: tokenPayload.enrollment_number || null,
    }
    });

} catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
}
};



module.exports = {
login,
};
