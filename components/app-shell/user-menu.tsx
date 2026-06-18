"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { signOut } from "@/app/(app)/actions/auth";
import { Avatar } from "@/components/avatar";
import { IconSignOut } from "@/components/app-shell/icons";
import { focusRingClassName } from "@/lib/ui/classes";

type UserMenuProps = {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
};

function menuLinkClassName() {
  return `block px-4 py-2 text-sm text-fg hover:bg-[var(--hover-subtle)] ${focusRingClassName}`;
}

export function UserMenu({ userId, displayName, avatarUrl }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const name = displayName?.trim() || "Your profile";

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-header ${focusRingClassName}`}
        aria-label={`Account menu for ${name}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Avatar displayName={displayName} avatarUrl={avatarUrl} size="sm" />
      </button>

      {open ? (
        <div className="absolute top-full right-0 z-50 mt-2 w-52 rounded-lg border border-border-subtle bg-surface-card py-1 shadow-lg">
          <div className="border-b border-border-subtle px-4 py-3">
            <p className="truncate text-sm font-medium text-fg">{name}</p>
          </div>

          <Link href={`/u/${userId}`} onClick={closeMenu} className={menuLinkClassName()}>
            Profile
          </Link>
          <Link href={`/u/${userId}/edit`} onClick={closeMenu} className={menuLinkClassName()}>
            Edit profile
          </Link>
          <Link href="/settings" onClick={closeMenu} className={menuLinkClassName()}>
            Settings
          </Link>

          <form action={signOut} className="mt-1 border-t border-border-subtle pt-1">
            <button
              type="submit"
              className={`flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-sm text-fg-muted hover:bg-[var(--hover-subtle)] hover:text-fg ${focusRingClassName}`}
            >
              <IconSignOut />
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
