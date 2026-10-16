type ContentAdminPlaceholderProps = {
  title: string;
  description: string;
  emptyLabel: string;
  emptyHint: string;
};

export function ContentAdminPlaceholder({
  title,
  description,
  emptyLabel,
  emptyHint,
}: ContentAdminPlaceholderProps) {
  return (
    <div className="flex-1 pl-6 pr-6 pt-6 sm:pl-8 lg:pl-10">
      <div className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
          {title}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>

      <div className="border-t border-dashed border-zinc-300 py-12 text-center">
        <p className="text-sm font-medium text-zinc-900">{emptyLabel}</p>
        <p className="mt-1 text-sm text-zinc-500">{emptyHint}</p>
      </div>
    </div>
  );
}
