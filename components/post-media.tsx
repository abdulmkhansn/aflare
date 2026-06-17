import type { PostStructuredFields } from "@/lib/posts/structured-fields";
import { resolveVideoUrl } from "@/lib/posts/structured-fields";
import { focusRingClassName } from "@/lib/ui/classes";

type PostMediaProps = {
  fields: PostStructuredFields;
};

function linkHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function PostMedia({ fields }: PostMediaProps) {
  const videoUrl = resolveVideoUrl(fields);
  const hasImage = Boolean(fields.image_url);
  const hasNativeVideo = Boolean(fields.video_url);
  const hasEmbedVideo = Boolean(fields.video_embed_url && !fields.video_url);
  const hasLink = Boolean(fields.link_url);

  if (!hasImage && !videoUrl && !hasLink) {
    return null;
  }

  return (
    <div className="mt-3 space-y-3">
      {hasImage && fields.image_url ? (
        <a
          href={fields.image_url}
          target="_blank"
          rel="noopener noreferrer"
          className={`block overflow-hidden rounded-lg ${focusRingClassName}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fields.image_url}
            alt=""
            className="max-h-96 w-full object-cover"
          />
        </a>
      ) : null}

      {hasNativeVideo && fields.video_url ? (
        <div className="overflow-hidden rounded-lg border border-border-subtle bg-black/20">
          <video
            src={fields.video_url}
            controls
            playsInline
            preload="metadata"
            className="max-h-[28rem] w-full bg-black"
          >
            Your browser does not support this video format. Try opening the file directly.
          </video>
        </div>
      ) : null}

      {hasEmbedVideo && fields.video_embed_url ? (
        <LegacyVideoEmbed embedUrl={fields.video_embed_url} />
      ) : null}

      {hasLink && fields.link_url ? (
        <a
          href={fields.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-between gap-3 rounded-lg border border-border-subtle bg-[var(--hover-subtle)] px-4 py-3 transition-colors hover:border-fg/20 ${focusRingClassName}`}
        >
          <span className="min-w-0 truncate text-sm font-medium text-fg">
            {fields.link_label?.trim() || linkHostname(fields.link_url)}
          </span>
          <span className="shrink-0 text-xs text-fg-muted" aria-hidden="true">
            ↗
          </span>
        </a>
      ) : null}
    </div>
  );
}

function LegacyVideoEmbed({ embedUrl }: { embedUrl: string }) {
  if (embedUrl.includes("platform.twitter.com")) {
    return (
      <a
        href={embedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-3 rounded-lg border border-border-subtle bg-[var(--hover-subtle)] px-4 py-6 transition-colors hover:border-fg/20 ${focusRingClassName}`}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ember text-sm font-medium text-warmwhite">
          ▶
        </span>
        <span className="text-sm font-medium text-fg">Watch on X</span>
      </a>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border-subtle bg-black/20">
      <div className="relative aspect-video w-full">
        <iframe
          src={embedUrl}
          title="Embedded video"
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
