const pool = require("..npm run dev/db");
exports.seedStudents = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const password =
      "$2b$10$F/HfdHMmlml2rRLbmClirOZg48eC74mrMby341DKiiT0Vizafb9oK";

    const students = [
      {
        enrollmentNo: "BT250001",
        name: "Rahul Sharma",
        fatherName: "Mahesh Sharma",
        motherName: "Sunita Sharma",
        email: "rahul@test.com",
        phone: "9876500001",
        gender: "Male",
        dob: "2006-01-15"
      },
      {
        enrollmentNo: "BT250002",
        name: "Priyanshi Singh",
        fatherName: "Rajesh Singh",
        motherName: "Poonam Singh",
        email: "priyanshi@test.com",
        phone: "9876500002",
        gender: "Female",
        dob: "2006-03-20"
      },
      {
        enrollmentNo: "BT250003",
        name: "Aditya Verma",
        fatherName: "Suresh Verma",
        motherName: "Anita Verma",
        email: "aditya@test.com",
        phone: "9876500003",
        gender: "Male",
        dob: "2006-05-11"
      },
      {
        enrollmentNo: "BT250004",
        name: "Sneha Gupta",
        fatherName: "Manoj Gupta",
        motherName: "Rekha Gupta",
        email: "sneha@test.com",
        phone: "9876500004",
        gender: "Female",
        dob: "2006-07-08"
      },
      {
        enrollmentNo: "BT250005",
        name: "Karan Mehta",
        fatherName: "Vikas Mehta",
        motherName: "Seema Mehta",
        email: "karan@test.com",
        phone: "9876500005",
        gender: "Male",
        dob: "2006-09-02"
      }
    ];

    for (const s of students) {

      const user = await client.query(
        `
        INSERT INTO users
        (username,name,password,role)
        VALUES ($1,$2,$3,'student')
        RETURNING user_id
        `,
        [
          s.enrollmentNo,
          s.name,
          password
        ]
      );

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
          user.rows[0].user_id,
          s.enrollmentNo,
          s.name,
          s.fatherName,
          s.motherName,
          s.email,
          s.phone,
          2,
          31,
          72,
          2,
          1,
          "A",
          2025,
          85,
          88,
          s.dob,
          s.gender
        ]
      );

    }

    await client.query("COMMIT");

    res.json({
      success: true
    });

  } catch (err) {

    await client.query("ROLLBACK");
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });

  } finally {
    client.release();
  }
};