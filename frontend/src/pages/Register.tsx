import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { UserRole } from "../types/user.types";
import { Eye, EyeOff } from "lucide-react";
import { CircularProgress } from "@mui/material";

interface RegisterProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: () => void;
}

export const Register: React.FC<RegisterProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
}) => {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const nextErrors: typeof errors = {};

    if (!name.trim()) {
      nextErrors.name = "Full name is required.";
    }

    if (!email.trim()) {
      nextErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Please enter your password.";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirm password is required.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (!agreedToTerms) {
      nextErrors.terms = "You must accept the terms & conditions.";
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
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      onRegisterSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Registration failed. Please try again.");
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
          maxWidth: "480px",
          backgroundColor: "#FCFAF8",
          border: "1px solid #E8E1D8",
          borderRadius: "20px",
          padding: "40px 36px",
          boxShadow: "0 16px 48px rgba(43, 33, 29, 0.05), 0 2px 8px rgba(43, 33, 29, 0.02)",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top Gold 4-Point Star Ornament */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#B4935A">
            <path d="M12 0C12 7.18 16.82 12 24 12C16.82 12 12 16.82 12 24C12 16.82 7.18 12 0 12C7.18 12 12 7.18 12 0Z" />
          </svg>
        </div>

        {/* Header Typography */}
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
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
            JOIN DINORAH
          </p>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "36px",
              fontWeight: 400,
              color: "#2B211D",
              margin: "0 0 6px 0",
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
            }}
          >
            Create Account
          </h1>

          {/* Ornamental Thin Divider with 4-Point Star */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              margin: "8px 0",
            }}
          >
            <div style={{ width: "30px", height: "1px", backgroundColor: "rgba(180, 147, 90, 0.35)" }}></div>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="#B4935A">
              <path d="M12 0C12 7.18 16.82 12 24 12C16.82 12 12 16.82 12 24C12 16.82 7.18 12 0 12C7.18 12 12 7.18 12 0Z" />
            </svg>
            <div style={{ width: "30px", height: "1px", backgroundColor: "rgba(180, 147, 90, 0.35)" }}></div>
          </div>

          <p
            style={{
              fontSize: "13px",
              color: "#81766E",
              fontWeight: 300,
              lineHeight: 1.5,
              margin: "4px 0 0 0",
            }}
          >
            Begin your journey and explore our handcrafted collections.
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
              fontSize: "12px",
              marginBottom: "16px",
              textAlign: "left",
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Account Role Selector (Client vs Admin) */}
          <div style={{ display: "flex", flexDirection: "column", textAlign: "left", width: "100%" }}>
            <label
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#81766E",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              Account Type
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                backgroundColor: "#F2EDE5",
                padding: "3px",
                borderRadius: "8px",
                border: "1px solid #E2DAD0",
                gap: "4px",
              }}
            >
              <button
                type="button"
                onClick={() => setRole("customer")}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: role === "customer" ? 600 : 500,
                  backgroundColor: role === "customer" ? "#2B211D" : "transparent",
                  color: role === "customer" ? "#F8F5F0" : "#81766E",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "inherit",
                }}
              >
                Client Account
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: role === "admin" ? 600 : 500,
                  backgroundColor: role === "admin" ? "#2B211D" : "transparent",
                  color: role === "admin" ? "#F8F5F0" : "#81766E",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  fontFamily: "inherit",
                }}
              >
                <span style={{ color: role === "admin" ? "#B4935A" : "#81766E" }}>✦</span>
                <span>Admin Portal</span>
              </button>
            </div>
            {role === "admin" && (
              <span
                style={{
                  fontSize: "11px",
                  color: "#96733E",
                  backgroundColor: "rgba(180, 147, 90, 0.12)",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  marginTop: "6px",
                  display: "inline-block",
                  fontWeight: 500,
                }}
              >
                ✦ Registering with Atelier Administrator permissions
              </span>
            )}
          </div>

          {/* Full Name */}
          <div style={{ display: "flex", flexDirection: "column", textAlign: "left", width: "100%" }}>
            <label
              htmlFor="register-name"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#2B211D",
                marginBottom: "5px",
              }}
            >
              Full Name
            </label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Enter your full name"
              required
              autoComplete="name"
              style={{
                width: "100%",
                backgroundColor: "#FCFAF8",
                border: errors.name ? "1px solid #D9534F" : "1px solid #E2DAD0",
                borderRadius: "6px",
                padding: "12px 14px",
                fontSize: "13.5px",
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
                e.target.style.borderColor = errors.name ? "#D9534F" : "#E2DAD0";
                e.target.style.boxShadow = "none";
              }}
            />
            {errors.name && (
              <span style={{ fontSize: "11px", color: "#C93B2B", marginTop: "3px" }}>
                {errors.name}
              </span>
            )}
          </div>

          {/* Email Address */}
          <div style={{ display: "flex", flexDirection: "column", textAlign: "left", width: "100%" }}>
            <label
              htmlFor="register-email"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#2B211D",
                marginBottom: "5px",
              }}
            >
              Email Address
            </label>
            <input
              id="register-email"
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
                padding: "12px 14px",
                fontSize: "13.5px",
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
            {errors.email && (
              <span style={{ fontSize: "11px", color: "#C93B2B", marginTop: "3px" }}>
                {errors.email}
              </span>
            )}
          </div>

          {/* Password & Confirm Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", width: "100%" }}>
            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <label
                htmlFor="register-password"
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#2B211D",
                  marginBottom: "5px",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Password"
                  required
                  autoComplete="new-password"
                  style={{
                    width: "100%",
                    backgroundColor: "#FCFAF8",
                    border: errors.password ? "1px solid #D9534F" : "1px solid #E2DAD0",
                    borderRadius: "6px",
                    padding: "12px 38px 12px 14px",
                    fontSize: "13.5px",
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
                    right: "10px",
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
                  {showPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
                </button>
              </div>
              {errors.password && (
                <span style={{ fontSize: "11px", color: "#C93B2B", marginTop: "3px" }}>
                  {errors.password}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <label
                htmlFor="register-confirm-password"
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#2B211D",
                  marginBottom: "5px",
                }}
              >
                Confirm
              </label>
              <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  placeholder="Confirm"
                  required
                  autoComplete="new-password"
                  style={{
                    width: "100%",
                    backgroundColor: "#FCFAF8",
                    border: errors.confirmPassword ? "1px solid #D9534F" : "1px solid #E2DAD0",
                    borderRadius: "6px",
                    padding: "12px 38px 12px 14px",
                    fontSize: "13.5px",
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
                    e.target.style.borderColor = errors.confirmPassword ? "#D9534F" : "#E2DAD0";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#81766E",
                    display: "flex",
                    alignItems: "center",
                    padding: "4px",
                  }}
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span style={{ fontSize: "11px", color: "#C93B2B", marginTop: "3px" }}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>
          </div>

          {/* Terms Checkbox */}
          <div style={{ display: "flex", flexDirection: "column", textAlign: "left", marginTop: "2px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                id="terms-checkbox"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }));
                }}
                style={{
                  width: "15px",
                  height: "15px",
                  accentColor: "#B4935A",
                  cursor: "pointer",
                  borderRadius: "4px",
                }}
              />
              <label
                htmlFor="terms-checkbox"
                style={{
                  fontSize: "12px",
                  color: "#81766E",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                I agree to the{" "}
                <span style={{ color: "#B4935A", fontWeight: 500 }}>Terms & Conditions</span> and{" "}
                <span style={{ color: "#B4935A", fontWeight: 500 }}>Privacy Policy</span>
              </label>
            </div>
            {errors.terms && (
              <span style={{ fontSize: "11px", color: "#C93B2B", marginTop: "3px" }}>
                {errors.terms}
              </span>
            )}
          </div>

          {/* Primary CREATE ACCOUNT Button */}
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
              <span>{role === "admin" ? "CREATE ADMIN ACCOUNT" : "CREATE ACCOUNT"}</span>
            )}
          </button>
        </form>

        {/* Footer: Sign in Switch Link */}
        <div
          style={{
            marginTop: "22px",
            textAlign: "center",
            fontSize: "12.5px",
            color: "#81766E",
          }}
        >
          Already have an account?{" "}
          <button
            type="button"
            onClick={onNavigateToLogin}
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
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
export default Register;
