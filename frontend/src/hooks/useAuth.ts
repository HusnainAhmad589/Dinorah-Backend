import { useContext } from "react";
import { AuthContext, AuthContextType } from "../context/AuthContext";

/**
 * Custom React hook to access authentication state and dispatch auth actions.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
