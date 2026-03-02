import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const ALLOWED_EMAILS = ["ed@dobbles.ai"];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, user, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.email || !ALLOWED_EMAILS.includes(user.email.toLowerCase())) {
    signOut();
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
