import React from "react";
import { useAuth } from "../hooks/useAuth";
import { UserRole } from "../types/user.types";
import {
  LockOutlined,
  ShieldOutlined,
} from "@mui/icons-material";
import { CircularProgress, Paper, Chip } from "@mui/material";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  onNavigateToLogin?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  onNavigateToLogin,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <CircularProgress sx={{ color: "#B8935C" }} size={44} />
        <p className="font-serif italic text-xl text-[#B8935C]">
          Authenticating luxury session...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-[500px] mx-auto my-16 p-8">
        <Paper
          elevation={0}
          className="p-8 sm:p-10 rounded-2xl bg-white border border-[rgba(46,36,32,0.08)] shadow-[0_15px_45px_rgba(46,36,32,0.05)] text-center flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#FAF8F4] flex items-center justify-center text-[#B8935C] mb-6">
            <LockOutlined sx={{ fontSize: 32 }} />
          </div>
          <h2 className="font-serif text-3xl font-normal text-[#2E2420] mb-3">
            Exclusive Access Required
          </h2>
          <p className="text-sm text-[#8B7F76] font-light leading-relaxed mb-8">
            Please sign in to your Dinorah Haute Joaillerie account to access this private client vault.
          </p>
          <button
            className="btn-luxury-gold w-full"
            onClick={() => {
              if (onNavigateToLogin) onNavigateToLogin();
            }}
          >
            Sign In Now
          </button>
        </Paper>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-[500px] mx-auto my-16 p-8">
        <Paper
          elevation={0}
          className="p-8 sm:p-10 rounded-2xl bg-white border border-rose-200 shadow-[0_15px_45px_rgba(46,36,32,0.05)] text-center flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-6">
            <ShieldOutlined sx={{ fontSize: 32 }} />
          </div>
          <h2 className="font-serif text-3xl font-normal text-[#2E2420] mb-3">
            Restricted Area
          </h2>
          <p className="text-sm text-[#8B7F76] font-light leading-relaxed mb-4">
            This section is restricted to <strong>{allowedRoles.join(", ")}</strong> privileges.
            Your current role is:
          </p>
          <Chip
            label={user.role.toUpperCase()}
            size="small"
            sx={{ bgcolor: "rgba(46,36,32,0.08)", color: "#2E2420", fontWeight: 600 }}
          />
        </Paper>
      </div>
    );
  }

  return <>{children}</>;
};
