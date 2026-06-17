import { pageSubtitleClassName, pageTitleClassName } from "@/lib/ui/classes";

type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header>
      <h1 className={pageTitleClassName}>{title}</h1>
      {description ? <p className={pageSubtitleClassName}>{description}</p> : null}
    </header>
  );
}
