export type VideoEmbed = {
  embedUrl: string;
  watchUrl: string;
  provider: string;
};

export function parseVideoEmbedUrl(raw: string): VideoEmbed | null {
  const trimmed = raw.trim();

  if (!trimmed) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  const path = url.pathname;

  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = url.searchParams.get("v");

    if (!id) {
      return null;
    }

    return {
      provider: "YouTube",
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
      embedUrl: `https://www.youtube.com/embed/${id}`,
    };
  }

  if (host === "youtu.be") {
    const id = path.split("/").filter(Boolean)[0];

    if (!id) {
      return null;
    }

    return {
      provider: "YouTube",
      watchUrl: `https://youtu.be/${id}`,
      embedUrl: `https://www.youtube.com/embed/${id}`,
    };
  }

  if (host === "vimeo.com") {
    const id = path.split("/").filter(Boolean)[0];

    if (!id || !/^\d+$/.test(id)) {
      return null;
    }

    return {
      provider: "Vimeo",
      watchUrl: `https://vimeo.com/${id}`,
      embedUrl: `https://player.vimeo.com/video/${id}`,
    };
  }

  if (host === "loom.com") {
    const shareId = path.match(/\/share\/([^/]+)/)?.[1];

    if (!shareId) {
      return null;
    }

    return {
      provider: "Loom",
      watchUrl: `https://www.loom.com/share/${shareId}`,
      embedUrl: `https://www.loom.com/embed/${shareId}`,
    };
  }

  if (host === "twitter.com" || host === "x.com") {
    const statusId = path.match(/\/status\/(\d+)/)?.[1];

    if (!statusId) {
      return null;
    }

    return {
      provider: "X",
      watchUrl: `https://${host}${path}`,
      embedUrl: `https://platform.twitter.com/embed/Tweet.html?id=${statusId}`,
    };
  }

  return null;
}
