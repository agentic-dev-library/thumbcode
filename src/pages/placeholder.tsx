/**
 * Placeholder Page Component
 *
 * Generic placeholder rendered for routes whose screens haven't been
 * migrated from React Native yet. Will be replaced screen-by-screen
 * in the screen-migration workstream.
 */

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-charcoal min-h-[50vh]">
      <div className="text-center">
        <h1 className="text-2xl font-display text-neutral-50 mb-2">{title}</h1>
        <p className="text-neutral-400 font-body">This screen is pending migration.</p>
      </div>
    </div>
  );
}
