import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";
import { CircularProgress } from "@mui/material";

interface LoginProps {
  onNavigateToRegister: () => void;
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onNavigateToRegister,
  onLoginSuccess,
}) => {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const nextErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      nextErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Please enter your password.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      onLoginSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Invalid email or password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        boxSizing: "border-box",
        backgroundColor: "#F8F5F0",
        fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Floating Dinorah Luxury Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "#FCFAF8",
          border: "1px solid #E8E1D8",
          borderRadius: "20px",
          padding: "44px 38px",
          boxShadow: "0 16px 48px rgba(43, 33, 29, 0.05), 0 2px 8px rgba(43, 33, 29, 0.02)",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top Gold 4-Point Star Ornament */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#B4935A">
            <path d="M12 0C12 7.18 16.82 12 24 12C16.82 12 12 16.82 12 24C12 16.82 7.18 12 0 12C7.18 12 12 7.18 12 0Z" />
          </svg>
        </div>

        {/* Header Typography */}
        <div style={{ textAlign: "center", marginBottom: "26px" }}>
          <p
            style={{
              fontSize: "10.5px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#B4935A",
              fontWeight: 600,
              margin: "0 0 6px 0",
            }}
          >
            WELCOME BACK
          </p>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "38px",
              fontWeight: 400,
              color: "#2B211D",
              margin: "0 0 8px 0",
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
            }}
          >
            Sign In
          </h1>

          {/* Ornamental Thin Divider with 4-Point Star */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              margin: "10px 0",
            }}
          >
            <div style={{ width: "32px", height: "1px", backgroundColor: "rgba(180, 147, 90, 0.35)" }}></div>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="#B4935A">
              <path d="M12 0C12 7.18 16.82 12 24 12C16.82 12 12 16.82 12 24C12 16.82 7.18 12 0 12C7.18 12 12 7.18 12 0Z" />
            </svg>
            <div style={{ width: "32px", height: "1px", backgroundColor: "rgba(180, 147, 90, 0.35)" }}></div>
          </div>

          <p
            style={{
              fontSize: "13px",
              color: "#81766E",
              fontWeight: 300,
              lineHeight: 1.5,
              margin: "6px 0 0 0",
            }}
          >
            Sign in to continue your journey with Dinorah.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              backgroundColor: "rgba(217, 83, 79, 0.08)",
              border: "1px solid rgba(217, 83, 79, 0.2)",
              color: "#A84236",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "12.5px",
              marginBottom: "18px",
              textAlign: "left",
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Email Address */}
          <div style={{ display: "flex", flexDirection: "column", textAlign: "left", width: "100%" }}>
            <label
              htmlFor="login-email"
              style={{
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#2B211D",
                marginBottom: "6px",
              }}
            >
              Email Address
            </label>
            <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="Enter your email"
                required
                autoComplete="email"
                style={{
                  width: "100%",
                  backgroundColor: "#FCFAF8",
                  border: errors.email ? "1px solid #D9534F" : "1px solid #E2DAD0",
                  borderRadius: "6px",
                  padding: "13px 44px 13px 14px",
                  fontSize: "14px",
                  color: "#2B211D",
                  boxSizing: "border-box",
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s, background-color 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = "#FFFFFF";
                  e.target.style.borderColor = "#B4935A";
                  e.target.style.boxShadow = "0 0 0 3px rgba(180, 147, 90, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = "#FCFAF8";
                  e.target.style.borderColor = errors.email ? "#D9534F" : "#E2DAD0";
                  e.target.style.boxShadow = "none";
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: "14px",
                  color: "#81766E",
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
            </div>
            {errors.email && (
              <span style={{ fontSize: "11.5px", color: "#C93B2B", marginTop: "4px" }}>
                {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", textAlign: "left", width: "100%" }}>
            <label
              htmlFor="login-password"
              style={{
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#2B211D",
                marginBottom: "6px",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                style={{
                  width: "100%",
                  backgroundColor: "#FCFAF8",
                  border: errors.password ? "1px solid #D9534F" : "1px solid #E2DAD0",
                  borderRadius: "6px",
                  padding: "13px 44px 13px 14px",
                  fontSize: "14px",
                  color: "#2B211D",
                  boxSizing: "border-box",
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s, background-color 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = "#FFFFFF";
                  e.target.style.borderColor = "#B4935A";
                  e.target.style.boxShadow = "0 0 0 3px rgba(180, 147, 90, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = "#FCFAF8";
                  e.target.style.borderColor = errors.password ? "#D9534F" : "#E2DAD0";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#81766E",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px",
                }}
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
              </button>
            </div>
            {errors.password && (
              <span style={{ fontSize: "11.5px", color: "#C93B2B", marginTop: "4px" }}>
                {errors.password}
              </span>
            )}
            <div style={{ textAlign: "right", marginTop: "8px" }}>
              <button
                type="button"
                onClick={(e) => e.preventDefault()}
                style={{
                  fontSize: "12px",
                  color: "#B4935A",
                  fontWeight: 500,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: "inherit",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#91723D")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#B4935A")}
              >
                Forgot password?
              </button>
            </div>
          </div>

          {/* Primary SIGN IN Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              backgroundColor: "#2B211D",
              color: "#F7F3ED",
              padding: "13.5px 24px",
              borderRadius: "6px",
              fontSize: "11.5px",
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(43, 33, 29, 0.12)",
              marginTop: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxSizing: "border-box",
              fontFamily: "inherit",
              transition: "background-color 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) (e.target as HTMLElement).style.backgroundColor = "#1A1412";
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) (e.target as HTMLElement).style.backgroundColor = "#2B211D";
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={18} sx={{ color: "#F7F3ED" }} />
            ) : (
              <span>SIGN IN</span>
            )}
          </button>

          {/* Minimal OR Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "4px 0",
              width: "100%",
            }}
          >
            <div style={{ flex: 1, height: "1px", backgroundColor: "#E2DAD0" }}></div>
            <span
              style={{
                padding: "0 14px",
                fontSize: "10.5px",
                letterSpacing: "0.2em",
                fontWeight: 500,
                textTransform: "uppercase",
                color: "#81766E",
              }}
            >
              OR
            </span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#E2DAD0" }}></div>
          </div>

          {/* Continue with Google Button */}
          <button
            type="button"
            onClick={() => {
              setEmail("maria@example.com");
              setPassword("Password123");
            }}
            style={{
              width: "100%",
              backgroundColor: "#FCFAF8",
              color: "#2B211D",
              border: "1px solid #E2DAD0",
              borderRadius: "6px",
              padding: "12px 24px",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxSizing: "border-box",
              fontFamily: "inherit",
              transition: "background-color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = "#F4EEE5";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = "#FCFAF8";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>CONTINUE WITH GOOGLE</span>
          </button>
        </form>

        {/* Footer: Create One Switch Link */}
        <div
          style={{
            marginTop: "26px",
            textAlign: "center",
            fontSize: "12.5px",
            color: "#81766E",
          }}
        >
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onNavigateToRegister}
            style={{
              color: "#B4935A",
              fontWeight: 500,
              textDecoration: "underline",
              textUnderlineOffset: "2px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              marginLeft: "4px",
              padding: 0,
              fontFamily: "inherit",
              fontSize: "12.5px",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#91723D")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#B4935A")}
          >
            Create one
          </button>
        </div>
      </div>
    </div>
  );
};
export default Login;
