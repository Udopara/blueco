import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export function WorkerRoute() {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (profile?.role === "employer") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export function EmployerRoute() {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (profile?.role === "worker") return <Navigate to="/" replace />;
  return <Outlet />;
}

export default ProtectedRoute;
