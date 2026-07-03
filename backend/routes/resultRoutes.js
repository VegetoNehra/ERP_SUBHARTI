    const express = require("express");
    const router = express.Router();

    const authenticate = require("../middleware/auth");

    const {
        getFacultyClasses,
        getStudentsForClass,
        saveMarks,
        lockMarks,
        generateResults,
        publishResults,
        getStudentResults,
        getSemesterResult,
        getResults,
        getResultDetails
    } = require("../controllers/resultController");


    // Faculty

    router.get(
        "/admin",
        authenticate,
        getResults
    );


    router.get(
        "/faculty/classes",
        authenticate,
        getFacultyClasses
    );

    router.get(
        "/faculty/:allocationId/students",
        authenticate,
        getStudentsForClass
    );

    router.post(
        "/faculty/save-marks",
        authenticate,
        saveMarks
    );

    router.put(
        "/faculty/lock/:allocationId",
        authenticate,
        lockMarks
    );


    // Admin
    router.post(
        "/admin/generate",
        authenticate,
        generateResults
    );

    router.put(
        "/admin/publish",
        authenticate,
        publishResults
    );

    router.get(
        "/admin/:resultId",
        authenticate,
        getResultDetails
    );


    // Student
    router.get(
        "/student",
        authenticate,
        getStudentResults
    );

    router.get(
        "/student/:semester",
        authenticate,
        getSemesterResult
    );

    module.exports = router;