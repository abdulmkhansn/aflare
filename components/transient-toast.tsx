"use client";

import { useEffect, useState } from "react";

type TransientToastProps = {
  message: string;
  variant?: "default" | "flare";
  durationMs?: number;
  onDismiss?: () => void;
};

export function TransientToast({
  message,
  variant = "default",
  durationMs = 3000,
  onDismiss,
}: TransientToastProps) {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setLeaving(true), durationMs - 300);
    const hideTimer = window.setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, durationMs);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [durationMs, message, onDismiss]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[4.25rem] z-50 flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div
        className={[
          "pointer-events-auto max-w-md rounded-lg border px-4 py-2.5 text-sm shadow-lg",
          variant === "flare"
            ? "toast-flare border-ember/35 bg-surface-card text-fg"
            : "border-border-subtle bg-surface-card text-fg",
          leaving ? "toast-fade-out" : "toast-fade-in",
        ].join(" ")}
      >
        {message}
      </div>
    </div>
  );
}
