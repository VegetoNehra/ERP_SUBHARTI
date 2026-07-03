  import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

  import Navbar from "./components/Navbar";
  import ProtectedRoute from "./components/ProtectedRoute";

  import Login from "./pages/Login";

  import StudentDashboard from "./pages/Student/StudentDashboard";
  import ManageColleges from "./pages/admin/ManageColleges";
  import AdminDashboard from "./pages/admin/AdminDashboard";
  import RegisterStudent from "./pages/admin/RegisterStudent";
  import CreateNotice from "./pages/admin/CreateNotice";
  import EditNotice from "./pages/admin/EditNotice";
  import ManageFaculty from "./pages/admin/ManageFaculty";
  import ManageStudents from "./pages/admin/ManageStudents";
  import RegisterFaculty from "./pages/admin/RegisterFaculty";
  import ManagePermissions from "./pages/admin/ManagePermissions";
  import ManageDepartments from "./pages/admin/ManageDepartments";
  import ManageCourses from "./pages/admin/ManageCourses";
  import ManageSubjects from "./pages/admin/ManageSubjects";
  import AdminLayout from "./components/AdminLayout";
  import EnterMarks from "./pages/admin/EnterMarks";
  import ManageResults from "./pages/admin/ManageResults";
  import Results from "./pages/admin/Results";
  import ResultDetails from "./pages/admin/ResultDetails";
  import ManageFacultyAllocation from "./pages/admin/ManageFacultyAllocation";

  function AppContent() {
    const location = useLocation();

    const hideNavbar = location.pathname === "/";

    return (
      <div className="min-h-screen bg-gray-300">
        {!hideNavbar && <Navbar />}

        <Routes>
          <Route path="/" element={<Login />} />

          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />

          <Route path="/admin/manage-colleges" element={<ProtectedRoute role="admin"><AdminLayout><ManageColleges /></AdminLayout></ProtectedRoute>} />

          <Route path="/admin/manage-permissions" element={<ProtectedRoute role="admin"><AdminLayout><ManagePermissions /></AdminLayout></ProtectedRoute>} />

          <Route path="/admin/manage-departments" element={<ProtectedRoute role="admin"><AdminLayout><ManageDepartments /></AdminLayout></ProtectedRoute>} />

          <Route path="/admin/manage-courses" element={<ProtectedRoute role="admin"><AdminLayout><ManageCourses /></AdminLayout></ProtectedRoute>} />

          <Route path="/admin/manage-subjects" element={<ProtectedRoute role="admin"><AdminLayout><ManageSubjects /></AdminLayout></ProtectedRoute>} />

          <Route path="/admin/register-student" element={<ProtectedRoute role="admin"><AdminLayout><RegisterStudent /></AdminLayout></ProtectedRoute>} />

          <Route path="/admin/create-notice" element={<ProtectedRoute role="admin"><AdminLayout><CreateNotice /></AdminLayout></ProtectedRoute>} />

          <Route path="/admin/edit-notice/:id" element={<ProtectedRoute role="admin"><AdminLayout><EditNotice /></AdminLayout></ProtectedRoute>} />

          <Route path="/admin/manage-faculty" element={<ProtectedRoute role="admin"><AdminLayout><ManageFaculty /></AdminLayout></ProtectedRoute>} />

          <Route path="/admin/register-faculty" element={<ProtectedRoute role="admin"><AdminLayout><RegisterFaculty /></AdminLayout></ProtectedRoute>} />

          <Route path="/admin/manage-students" element={<ProtectedRoute role="admin"><AdminLayout><ManageStudents /></AdminLayout></ProtectedRoute>} />

            <Route path="/admin/manage-faculty-allocation" element={<ProtectedRoute role="admin"><AdminLayout><ManageFacultyAllocation></ManageFacultyAllocation></AdminLayout></ProtectedRoute>}/>

          {/* ================= Faculty ================= */}

          <Route
            path="/faculty/enter-marks"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <EnterMarks />
                </AdminLayout>
              </ProtectedRoute>
            }
          />


          {/* ================= Admin ================= */}

          <Route
            path="/admin/manage-results"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <ManageResults />
                </AdminLayout>
              </ProtectedRoute>
            }
          />


          {/* ================= Student ================= */}
          <Route
            path="/student/results"
            element={
              <ProtectedRoute role="student">
                <Results />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/results/:semester"
            element={
              <ProtectedRoute role="student">
                <ResultDetails />
              </ProtectedRoute>
            }
          />

      

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        
        
      </div>
    );
  }

  function App() {
    return (
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    );
  }

  export default App;