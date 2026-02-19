"use client";

import { useEffect, useRef } from "react";

/**
 * Automatically calls the /api/notify endpoint once per session
 * to check if there are events today that need email notifications.
 * This ensures the email gets sent when the app is opened on the day of an event.
 */
export function useAutoNotify() {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    // Small delay so it doesn't block initial render
    const timeout = setTimeout(() => {
      fetch("/api/notify")
        .then((res) => res.json())
        .then((data) => {
          if (data.notified && data.notified > 0) {
            console.log(
              `[Scheduler] Auto-notified ${data.notified} event(s) via email`
            );
          }
        })
        .catch(() => {
          // Silently fail - notification is best-effort
        });
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);
}
