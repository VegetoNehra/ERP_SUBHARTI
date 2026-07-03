const express = require("express");

const router = express.Router();
const authenticate = require("../middleware/auth");


const { registerStudent } = require("../controllers/admincontroller");
const { registerFaculty } = require("../controllers/admincontroller");
const { getDashboardStats } = require("../controllers/admincontroller");
const {getAdminList}= require("../controllers/admincontroller")
const {getAdminPermissions}= require("../controllers/admincontroller")
const { saveAdminPermissions } = require("../controllers/admincontroller");
const { getMyPermissions } = require("../controllers/admincontroller");



router.get("/admin-list",authenticate,getAdminList);
router.get("/my-permissions",authenticate,getMyPermissions);
router.get("/permissions/:id",authenticate,getAdminPermissions);
router.post("/permissions",authenticate,saveAdminPermissions);
router.get("/permissions",authenticate,getAdminPermissions);
router.post("/register-student", authenticate , registerStudent);
router.post("/register-faculty", authenticate , registerFaculty);
router.get("/dashboard-stats", authenticate , getDashboardStats);

const {
  createNotice,
  getAllNotices,
  updateNotice,
  deleteNotice,
  getNoticeById,
  manageStudents,
  manageFaculty,
} = require("../controllers/admincontroller");

router.post("/create-notice", authenticate ,createNotice);
router.get("/notices", authenticate ,getAllNotices);
router.put("/notices/:id", authenticate,updateNotice);
router.delete("/notices/:id", authenticate,deleteNotice);
router.get("/notices/:id", authenticate,getNoticeById);
router.get("/manage-students",authenticate, manageStudents);
router.get("/manage-faculty", authenticate ,manageFaculty);

module.exports = router;