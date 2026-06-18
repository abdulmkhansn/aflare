type ProjectDeleteConfirmBodyProps = {
  buildLogPostCount: number;
};

function buildLogUpdatesLine(count: number): string {
  if (count === 1) {
    return "1 build-log update";
  }

  return `${count} build-log updates`;
}

export function ProjectDeleteConfirmBody({ buildLogPostCount }: ProjectDeleteConfirmBodyProps) {
  return (
    <div className="space-y-3">
      <p>This will permanently delete:</p>
      <ul className="list-inside list-disc space-y-1 pl-1">
        <li>the project and its page</li>
        <li>its build log timeline</li>
        {buildLogPostCount > 0 ? <li>{buildLogUpdatesLine(buildLogPostCount)}</li> : null}
      </ul>
      <p>This will keep:</p>
      <ul className="list-inside list-disc space-y-1 pl-1">
        <li>any flares linked to this project (they&apos;ll become standalone)</li>
      </ul>
      <p>This can&apos;t be undone.</p>
    </div>
  );
}
