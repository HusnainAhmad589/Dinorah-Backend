import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getCurrentUser, getAdminStats } from "../services/auth.service";
import {
  ShieldOutlined,
  PersonOutlined,
  StorageOutlined,
  RefreshOutlined,
  SendOutlined,
  CheckCircleOutlined,
  ErrorOutlined,
} from "@mui/icons-material";
import {
  Card,
  Chip,
  Button,
  Avatar,
} from "@mui/material";

export const DashboardPage: React.FC = () => {
  const { user, token, refetchUser } = useAuth();
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!user) {
    return null;
  }

  const handleTestGetMe = async () => {
    setApiStatus("loading");
    setApiResponse("Fetching GET /api/auth/me with Bearer token...");
    try {
      const data = await getCurrentUser();
      setApiStatus("success");
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      setApiStatus("error");
      setApiResponse(err instanceof Error ? err.message : String(err));
    }
  };

  const handleTestAdminOnly = async () => {
    setApiStatus("loading");
    setApiResponse("Sending GET /api/auth/admin-only with Bearer token...");
    try {
      const data = await getAdminStats();
      setApiStatus("success");
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      setApiStatus("error");
      setApiResponse(
        err instanceof Error
          ? `[HTTP Error] ${err.message}`
          : "Forbidden or unauthorized request"
      );
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetchUser();
    setIsRefreshing(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto py-8 sm:py-12 px-4 sm:px-6 md:px-8">
      {/* Header Banner */}
      <div className="mb-8 sm:mb-10 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[rgba(184,147,92,0.12)] border border-[rgba(184,147,92,0.3)] rounded-full text-[0.65rem] sm:text-xs font-semibold text-[#96733E] tracking-wider uppercase mb-3">
          <StorageOutlined sx={{ fontSize: 14 }} />
          <span>MySQL & Express Authenticated Session</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#2E2420]">
          Welcome back, <span className="font-normal italic text-[#B8935C]">{user.name}</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#8B7F76] font-light mt-2 max-w-[650px]">
          Your private client session is secured using JSON Web Tokens. Access your high jewelry vault details or test protected backend endpoints.
        </p>
      </div>

      {/* Grid Layout - 1 Col on Mobile/Tablet, 2 Col on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: User Profile Details */}
        <div className="lg:col-span-5">
          <Card
            elevation={0}
            className="p-6 sm:p-8 rounded-2xl bg-white border border-[rgba(46,36,32,0.08)] shadow-[0_10px_35px_rgba(46,36,32,0.03)] flex flex-col items-center text-center"
          >
            <Avatar
              sx={{
                width: { xs: 64, sm: 80 },
                height: { xs: 64, sm: 80 },
                bgcolor: "#B8935C",
                fontSize: { xs: "1.5rem", sm: "2rem" },
                fontWeight: 600,
                mb: 2,
                boxShadow: "0 8px 24px rgba(184, 147, 92, 0.3)",
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>

            <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#2E2420] mb-1">
              {user.name}
            </h2>
            <p className="text-xs text-[#8B7F76] mb-3 break-all">{user.email}</p>

            <Chip
              icon={user.role === "admin" ? <ShieldOutlined sx={{ fontSize: 16 }} /> : <PersonOutlined sx={{ fontSize: 16 }} />}
              label={`Role: ${user.role.toUpperCase()}`}
              sx={{
                bgcolor: user.role === "admin" ? "rgba(184,147,92,0.15)" : "rgba(46,36,32,0.06)",
                color: user.role === "admin" ? "#96733E" : "#2E2420",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                px: 1,
              }}
            />

            <div className="w-full mt-5 pt-5 border-t border-[rgba(46,36,32,0.08)] text-left flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-[#8B7F76]">User ID:</span>
                <span className="font-mono font-medium text-[#2E2420]">#{user.id}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-[#8B7F76]">Database Table:</span>
                <span className="font-mono font-medium text-[#2E2420]">users (MySQL)</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-[#8B7F76]">Account Created:</span>
                <span className="font-medium text-[#2E2420]">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Just now"}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-[#8B7F76]">Token Format:</span>
                <span className="font-mono font-medium text-[#2E2420]">Bearer JWT (HS256)</span>
              </div>
            </div>

            {/* Truncated JWT Display */}
            <div className="w-full mt-4 text-left">
              <span className="text-[0.65rem] tracking-wider uppercase text-[#8B7F76] font-semibold block mb-1">
                Active JWT Token (Truncated)
              </span>
              <div className="bg-[#FAF8F4] p-2 sm:p-2.5 rounded border border-[rgba(46,36,32,0.08)] font-mono text-[0.65rem] sm:text-[0.7rem] text-[#96733E] break-all">
                {token ? `${token.substring(0, 24)}...${token.substring(token.length - 10)}` : "None"}
              </div>
            </div>

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="btn-luxury-outline w-full mt-5 flex items-center justify-center gap-2"
            >
              <RefreshOutlined className={isRefreshing ? "animate-spin" : ""} sx={{ fontSize: 16 }} />
              <span>{isRefreshing ? "Refreshing..." : "Re-sync Session"}</span>
            </button>
          </Card>
        </div>

        {/* Right Column: Protected API Interactive Tester */}
        <div className="lg:col-span-7">
          <Card
            elevation={0}
            className="p-6 sm:p-8 rounded-2xl bg-white border border-[rgba(46,36,32,0.08)] shadow-[0_10px_35px_rgba(46,36,32,0.03)]"
          >
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#2E2420] mb-2">
              Protected API Interactive Tester
            </h3>
            <p className="text-xs text-[#8B7F76] mb-6 leading-relaxed">
              Trigger authenticated HTTP requests to the Express backend to verify TypeScript request typing,
              JWT authentication middleware, and Role-Based Access Control (RBAC).
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                fullWidth
                startIcon={<SendOutlined />}
                onClick={handleTestGetMe}
                id="btn-test-me"
                sx={{ letterSpacing: "0.08em", fontSize: "0.7rem" }}
              >
                Test GET /api/auth/me
              </Button>

              <Button
                variant="contained"
                color="primary"
                size="small"
                fullWidth
                startIcon={<ShieldOutlined />}
                onClick={handleTestAdminOnly}
                id="btn-test-admin"
                sx={{
                  bgcolor: "#2E2420",
                  "&:hover": { bgcolor: "#B8935C" },
                  letterSpacing: "0.08em",
                  fontSize: "0.7rem",
                }}
              >
                Test GET /api/auth/admin-only
              </Button>
            </div>

            <div className="flex justify-between items-center mb-2">
              <span className="text-[0.65rem] sm:text-[0.7rem] tracking-wider uppercase font-semibold text-[#8B7F76]">
                Response Console
              </span>
              {apiStatus === "success" && (
                <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                  <CheckCircleOutlined sx={{ fontSize: 14 }} /> 200 OK
                </span>
              )}
              {apiStatus === "error" && (
                <span className="text-xs text-rose-700 flex items-center gap-1 font-medium">
                  <ErrorOutlined sx={{ fontSize: 14 }} /> Request Rejected
                </span>
              )}
            </div>

            <pre className="bg-[#2E2420] text-[#D4AF7A] p-3.5 sm:p-4 rounded-xl font-mono text-[0.7rem] sm:text-xs overflow-x-auto max-h-[260px] border border-[rgba(46,36,32,0.15)] leading-relaxed">
              {apiResponse || "// Click any of the test buttons above to view live API response from the Express server."}
            </pre>

            <div className="mt-5 p-3.5 sm:p-4 bg-[#FAF8F4] rounded-xl border border-[rgba(46,36,32,0.08)] text-xs text-[#8B7F76] space-y-1">
              <strong className="text-[#2E2420] block mb-1">
                💡 Role Verification Notice:
              </strong>
              <p>
                • If logged in as <code className="font-mono text-[#B8935C]">customer</code>, clicking <code>Test GET /api/auth/admin-only</code> returns HTTP 403 Forbidden.
              </p>
              <p>
                • If logged in as <code className="font-mono text-[#B8935C]">admin</code>, the request returns HTTP 200 OK.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
