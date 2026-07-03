const express = require("express");
const router  = express.Router();

const authenticate = require("../middleware/auth");
const { manageFaculty } = require("../controllers/admincontroller");

const {
  getAllAllocations,
  getAvailableSubjects,
  getFacultyAllocations,
  saveFacultyAllocations,
  deleteFacultyAllocation,
} = require("../controllers/facultyAllocationController");

// ── flat list used by the table (all faculty, client groups by faculty) ──
// GET /academic/faculty-allocation/allocations
router.get("/faculty", authenticate, manageFaculty);

router.get("/allocations", authenticate, getAllAllocations);

router.get("/:facultyId/available-subjects", authenticate, getAvailableSubjects);

router.get("/:facultyId/allocations", authenticate, getFacultyAllocations);

router.post("/:facultyId/allocations", authenticate, saveFacultyAllocations);

router.delete("/:allocationId", authenticate, deleteFacultyAllocation);

module.exports = router;