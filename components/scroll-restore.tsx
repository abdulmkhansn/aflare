"use client";

import { useLayoutEffect } from "react";

import { readAndClearScrollRestoreTarget } from "@/lib/ui/refresh-in-place";

export function ScrollRestore() {
  useLayoutEffect(() => {
    const target = readAndClearScrollRestoreTarget();

    if (target === null) {
      return;
    }

    window.scrollTo({ top: target, left: 0, behavior: "instant" });
  });

  return null;
}
