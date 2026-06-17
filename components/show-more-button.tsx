import Link from "next/link";

import { secondaryButtonClassName } from "@/lib/ui/classes";

type ShowMoreButtonProps = {
  href: string;
};

export function ShowMoreButton({ href }: ShowMoreButtonProps) {
  return (
    <div className="flex justify-center pt-2">
      <Link href={href} className={secondaryButtonClassName}>
        Show more
      </Link>
    </div>
  );
}
