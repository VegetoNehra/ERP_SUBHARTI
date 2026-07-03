const express = require("express");
const router = express.Router();

const {
  getStudentProfile
} = require("../controllers/studentcontroller");

router.get("/profile/:id", getStudentProfile);
const{
  getAllNotices
} = require("../controllers/admincontroller");

router.get("/notices", getAllNotices);
module.exports = router;