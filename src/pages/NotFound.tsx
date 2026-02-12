/**
 * 404 Not Found Page
 *
 * Displayed when no route matches.
 * Replaces app/+not-found.tsx from expo-router.
 */

import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-charcoal min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-display text-coral-500 mb-4">404</h1>
        <p className="text-neutral-400 font-body mb-6">This page does not exist.</p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-coral-500 text-white font-body font-semibold rounded-[50px_45px_50px_48px/26px_28px_26px_24px] hover:bg-coral-600 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
