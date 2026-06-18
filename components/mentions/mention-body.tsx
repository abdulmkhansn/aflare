"use client";

import Link from "next/link";
import { Fragment } from "react";

import { normalizeMentionBody, segmentMentionBody } from "@/lib/mentions/parse-mentions";
import { focusRingClassName } from "@/lib/ui/classes";

type MentionBodyProps = {
  body: unknown;
  className?: string;
  /** Use span when nesting inside another block element that must not contain a div/p. */
  inline?: boolean;
};

const mentionLinkClassName = `font-medium text-ember underline-offset-2 hover:underline ${focusRingClassName}`;

export function MentionBody({
  body,
  className = "whitespace-pre-wrap text-sm leading-relaxed text-fg",
  inline = false,
}: MentionBodyProps) {
  const text = normalizeMentionBody(body);
  const segments = segmentMentionBody(text);

  if (!text) {
    return null;
  }

  const content = segments.map((segment, index) => {
    if (segment.type === "text") {
      return <Fragment key={index}>{segment.value}</Fragment>;
    }

    return (
      <Link key={index} href={`/u/${segment.userId}`} className={mentionLinkClassName}>
        {segment.displayName}
      </Link>
    );
  });

  if (inline) {
    return <span className={className}>{content}</span>;
  }

  return <div className={className}>{content}</div>;
}
