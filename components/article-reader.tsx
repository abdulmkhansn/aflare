import Image from "next/image";
import Link from "next/link";

import { ArticleHelpfulButton } from "@/components/article-helpful-button";
import { AuthorLink } from "@/components/avatar";
import {
  parseArticleBody,
  resolveArticleAuthor,
  type ArticleWithAuthor,
} from "@/lib/articles/types";
import { formatRelativeTime } from "@/lib/time/relative-time";
import {
  errorTextClassName,
  inlineLinkClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/lib/ui/classes";

type ArticleReaderProps = {
  article: ArticleWithAuthor;
  currentUserId: string;
  isMarkedHelpful: boolean;
  helpfulError?: string;
};

export function ArticleReader({
  article,
  currentUserId,
  isMarkedHelpful,
  helpfulError,
}: ArticleReaderProps) {
  const author = resolveArticleAuthor(article);
  const parsed = parseArticleBody(article.body);
  const isOwnArticle = article.author_id === currentUserId;

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-4">
        <h1 className="text-[2rem] font-medium leading-tight tracking-[-0.02em] text-fg sm:text-[2.25rem]">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <AuthorLink
            userId={article.author_id}
            displayName={author?.display_name ?? null}
            avatarUrl={author?.avatar_url ?? null}
          />
          <time className="text-sm text-fg-muted" dateTime={article.created_at}>
            {formatRelativeTime(article.created_at)}
          </time>
        </div>

        {article.cover_image_url && parsed.kind === "html" ? (
          <div className="relative aspect-[2/1] overflow-hidden rounded-lg border border-border-subtle">
            <Image
              src={article.cover_image_url}
              alt=""
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        ) : null}
      </header>

      {parsed.kind === "html" ? (
        <div
          className="article-prose"
          dangerouslySetInnerHTML={{ __html: parsed.html }}
        />
      ) : parsed.doc_type === "pdf" ? (
        <div className="space-y-4">
          {parsed.description ? (
            <p className="text-sm leading-relaxed text-fg-muted">{parsed.description}</p>
          ) : null}
          <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-card">
            <embed
              src={parsed.doc_url}
              type="application/pdf"
              className="h-[min(80vh,900px)] w-full"
            />
          </div>
          <a href={parsed.doc_url} download className={secondaryButtonClassName}>
            Download PDF
          </a>
        </div>
      ) : (
        <div className="space-y-4 rounded-lg border border-border-subtle bg-surface-card p-6">
          <p className="text-sm leading-relaxed text-fg">
            This article is a Word document. Download it to read offline. Browsers cannot preview
            .docx files inline.
          </p>
          {parsed.description ? (
            <p className="text-sm leading-relaxed text-fg-muted">{parsed.description}</p>
          ) : null}
          <a href={parsed.doc_url} download className={primaryButtonClassName}>
            Download document
          </a>
        </div>
      )}

      <footer className="space-y-3 border-t border-border-subtle pt-6">
        {helpfulError ? (
          <p className={errorTextClassName} role="alert">
            {helpfulError}
          </p>
        ) : null}

        {!isOwnArticle ? (
          <ArticleHelpfulButton
            articleId={article.id}
            helpfulCount={article.helpful_count ?? 0}
            isMarked={isMarkedHelpful}
            redirectTo={`/articles/${article.id}`}
          />
        ) : null}

        <Link href="/" className={inlineLinkClassName}>
          Back to feed
        </Link>
      </footer>
    </article>
  );
}
