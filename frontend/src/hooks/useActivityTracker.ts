import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import { sendHeartbeat, sendPageView, sendProductView } from "../services/activity.service";

function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem("dinorah_session_id");
  if (!sessionId) {
    sessionId = "sess_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
    sessionStorage.setItem("dinorah_session_id", sessionId);
  }
  return sessionId;
}

export function useActivityTracker() {
  const location = useLocation();
  const { user } = useAuth();
  const activeProductIdRef = useRef<number | null>(null);

  const sessionId = getOrCreateSessionId();
  const userId = user?.id || null;

  // Track page changes
  useEffect(() => {
    sendPageView({
      sessionId,
      currentPage: location.pathname,
      userId,
    });
  }, [location.pathname, sessionId, userId]);

  // Periodic heartbeat every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      sendHeartbeat({
        sessionId,
        currentPage: location.pathname,
        productId: activeProductIdRef.current,
        userId,
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [location.pathname, sessionId, userId]);

  const trackProductView = (productId: number | null) => {
    activeProductIdRef.current = productId;
    if (productId) {
      sendProductView({
        sessionId,
        currentPage: location.pathname,
        productId,
        userId,
      });
    }
  };

  return { trackProductView };
}
