"use client";

import { useEffect, useRef, useState } from "react";

import { blockUser, reportUser, unblockUser } from "@/app/(app)/actions/safety";
import { focusRingClassName } from "@/lib/ui/classes";

type SafetyMenuProps = {
  otherUserId: string;
  isBlocked: boolean;
  redirectTo: string;
};

export function SafetyMenu({ otherUserId, isBlocked, redirectTo }: SafetyMenuProps) {
  const [open, setOpen] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
        setShowReportForm(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          setShowReportForm(false);
        }}
        className={`rounded-md px-2 py-1.5 text-sm text-fg-muted hover:bg-[var(--hover-subtle)] hover:text-fg ${focusRingClassName}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        More
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute top-full right-0 z-20 mt-1 w-56 rounded-lg border border-border-subtle bg-surface-card p-2 shadow-lg"
        >
          {showReportForm ? (
            <form action={reportUser} className="space-y-2 p-1">
              <input type="hidden" name="user_id" value={otherUserId} />
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <label htmlFor={`report-reason-${otherUserId}`} className="sr-only">
                Reason for report
              </label>
              <textarea
                id={`report-reason-${otherUserId}`}
                name="reason"
                rows={3}
                placeholder="Optional reason"
                className="w-full rounded-md border border-border-subtle bg-surface-input px-2.5 py-2 text-sm text-fg outline-none placeholder:text-fg-muted focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card"
              />
              <button
                type="submit"
                className={`w-full rounded-md px-3 py-2 text-left text-sm text-fg hover:bg-[var(--hover-subtle)] ${focusRingClassName}`}
              >
                Submit report
              </button>
            </form>
          ) : (
            <div className="space-y-1">
              {isBlocked ? (
                <form action={unblockUser}>
                  <input type="hidden" name="user_id" value={otherUserId} />
                  <input type="hidden" name="redirect_to" value={redirectTo} />
                  <button
                    type="submit"
                    role="menuitem"
                    className={`w-full rounded-md px-3 py-2 text-left text-sm text-fg hover:bg-[var(--hover-subtle)] ${focusRingClassName}`}
                  >
                    Unblock
                  </button>
                </form>
              ) : (
                <form action={blockUser}>
                  <input type="hidden" name="user_id" value={otherUserId} />
                  <input type="hidden" name="redirect_to" value={redirectTo} />
                  <button
                    type="submit"
                    role="menuitem"
                    className={`w-full rounded-md px-3 py-2 text-left text-sm text-fg hover:bg-[var(--hover-subtle)] ${focusRingClassName}`}
                  >
                    Block
                  </button>
                </form>
              )}

              <button
                type="button"
                role="menuitem"
                onClick={() => setShowReportForm(true)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm text-fg hover:bg-[var(--hover-subtle)] ${focusRingClassName}`}
              >
                Report
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
