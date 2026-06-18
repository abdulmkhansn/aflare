import { ArticleEditorForm } from "@/components/article-editor-form";
import { PageHeader } from "@/components/page-header";
import { pageContainerArticleClassName, pageStackClassName } from "@/lib/ui/classes";

type NewArticlePageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewArticlePage({ searchParams }: NewArticlePageProps) {
  const params = await searchParams;
  const error = params.error ? decodeURIComponent(params.error) : undefined;

  return (
    <div className={`${pageContainerArticleClassName} ${pageStackClassName}`}>
      <PageHeader
        title="Write an article"
        description="Share a long-form write-up or attach a PDF or Word document."
      />
      <ArticleEditorForm error={error} />
    </div>
  );
}
