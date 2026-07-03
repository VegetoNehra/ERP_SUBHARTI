  require("dotenv").config();

  const express = require("express");
  const cors = require("cors");

  const adminRoutes = require("./routes/adminroutes");
  const authRoutes = require("./routes/authroutes");
  const studentRoutes = require("./routes/studentroutes");

  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/student", studentRoutes);
  const academicRoutes = require("./routes/academicRoutes");
  app.use("/api/academic", academicRoutes);
  const facultyAllocationRoutes = require("./routes/facultyAllocationRoutes");
  app.use("/api/faculty-allocation", facultyAllocationRoutes);

  const resultRoutes = require("./routes/resultRoutes");
 
  app.use("/api/results", resultRoutes);


  const PORT = process.env.PORT || 5000;

  const pool = require("./db");

  async function startServer() {
    try {
      await pool.query("SELECT NOW()");

      console.log("Database Connected");

      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } catch (err) {
      console.error(err);
    }
  }

  startServer();