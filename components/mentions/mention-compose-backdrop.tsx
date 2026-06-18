import { segmentComposeDisplay, mentionDisplayLabel } from "@/lib/mentions/compose-mentions";
import type { MentionSpan } from "@/lib/mentions/compose-mentions";

type MentionComposeBackdropProps = {
  text: string;
  spans: MentionSpan[];
  className?: string;
};

export function MentionComposeBackdrop({ text, spans, className }: MentionComposeBackdropProps) {
  const segments = segmentComposeDisplay(text, spans);

  if (!text) {
    return <div aria-hidden="true" className={className}>&nbsp;</div>;
  }

  return (
    <div aria-hidden="true" className={className}>
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return <span key={index}>{segment.value}</span>;
        }

        return (
          <span key={index} className="font-medium text-ember">
            {mentionDisplayLabel(segment.displayName)}
          </span>
        );
      })}
    </div>
  );
}
