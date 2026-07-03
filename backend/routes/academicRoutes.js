const express = require("express");
const router  = express.Router();
const authenticate = require("../middleware/auth");

const {
  // Colleges
  getAllColleges, createCollege, updateCollege, deleteCollege,
  // Departments
  createDepartment, getAllDepartments, updateDepartment, deleteDepartment,
  // Courses
  createCourse, getAllCourses, updateCourse, deleteCourse,
  // Branches
  createBranch, getAllBranches, updateBranch, deleteBranch,
  // Subjects
  createSubject, getAllSubjects, updateSubject, deleteSubject,
  // Faculty Allocation
  createFacultyAllocation, getFacultyAllocations, updateFacultyAllocation,
  deleteFacultyAllocation, getFacultyAllocationFormData,
} = require("../controllers/academicController");

// ── Colleges ─────────────────────────────────────────────
router.get(   "/colleges",     authenticate, getAllColleges);
router.post(  "/colleges",     authenticate, createCollege);
router.put(   "/colleges/:id", authenticate, updateCollege);
router.delete("/colleges/:id", authenticate, deleteCollege);

// ── Departments ───────────────────────────────────────────
// GET /academic/departments?collegeId=  ← cascade filter
router.get(   "/departments",     authenticate, getAllDepartments);
router.post(  "/departments",     authenticate, createDepartment);
router.put(   "/departments/:id", authenticate, updateDepartment);
router.delete("/departments/:id", authenticate, deleteDepartment);

// ── Courses ───────────────────────────────────────────────
// GET /academic/courses?departmentId=  ← cascade filter
router.get(   "/courses",     authenticate, getAllCourses);
router.post(  "/courses",     authenticate, createCourse);
router.put(   "/courses/:id", authenticate, updateCourse);
router.delete("/courses/:id", authenticate, deleteCourse);

// ── Branches ──────────────────────────────────────────────
// GET /academic/branches?courseId=  ← cascade filter
router.get(   "/branches",     authenticate, getAllBranches);
router.post(  "/branches",     authenticate, createBranch);
router.put(   "/branches/:id", authenticate, updateBranch);
router.delete("/branches/:id", authenticate, deleteBranch);

// ── Subjects ──────────────────────────────────────────────
// GET /academic/subjects?branchId=&semester=  ← cascade filter
router.get(   "/subjects",     authenticate, getAllSubjects);
router.post(  "/subjects",     authenticate, createSubject);
router.put(   "/subjects/:id", authenticate, updateSubject);
router.delete("/subjects/:id", authenticate, deleteSubject);

// ── Faculty Allocation ────────────────────────────────────
// NOTE: /form-data must be registered BEFORE /:allocation_id to avoid route shadowing
router.get("/faculty-allocation/form-data", authenticate, getFacultyAllocationFormData);
router.get(   "/faculty-allocation",                   authenticate, getFacultyAllocations);
router.post(  "/faculty-allocation",                   authenticate, createFacultyAllocation);
router.put(   "/faculty-allocation/:allocation_id",    authenticate, updateFacultyAllocation);
router.delete("/faculty-allocation/:allocation_id",    authenticate, deleteFacultyAllocation);

module.exports = router;
