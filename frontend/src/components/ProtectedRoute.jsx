import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/" />;
  }

  // Master can access all admin routes
  if (
    role === "admin" &&
    (user.role === "admin" || user.role === "master")
  ) {
    return children;
  }

  if (user.role !== role) {
    return (
      <Navigate
        to={
          user.role === "student"
            ? "/student/dashboard"
            : "/admin/dashboard"
        }
      />
    );
  }

  return children;
}

export default ProtectedRoute;