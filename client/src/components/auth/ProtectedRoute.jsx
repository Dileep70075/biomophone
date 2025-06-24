import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { LoadingSpinner } from "../common/LoadingSpinner";

export const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user && location.pathname !== "/login") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
