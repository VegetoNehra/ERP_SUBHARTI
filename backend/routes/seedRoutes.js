const express = require("express");
const router = express.Router();

const { seedStudents } = require("../controllers/seedStudents");

router.post("/students", seedStudents);

module.exports = router;