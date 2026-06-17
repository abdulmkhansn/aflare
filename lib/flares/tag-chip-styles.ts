import { focusRingClassName } from "@/lib/ui/classes";

export function tagChipClassName(isActive: boolean) {
  return [
    "inline-flex items-center rounded-full px-3 py-1 text-sm transition-colors cursor-pointer",
    focusRingClassName,
    isActive
      ? "bg-ember text-warmwhite"
      : "border border-border-subtle bg-transparent text-fg-muted hover:border-fg/20 hover:text-fg",
  ].join(" ");
}
