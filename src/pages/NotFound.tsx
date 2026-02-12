/**
 * 404 Not Found Page
 *
 * Displayed when no route matches.
 * Migrated from app/+not-found.tsx (React Native) to web React.
 */

import { Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-charcoal min-h-screen">
      <div className="max-w-sm w-full">
        <div className="flex flex-col items-center space-y-6">
          {/* Icon */}
          <div className="w-24 h-24 bg-surface flex items-center justify-center rounded-[28px_24px_32px_20px/20px_28px_24px_32px]">
            <Search size={48} className="text-neutral-500" />
          </div>

          {/* Message */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white font-display">Page Not Found</h1>
            <p className="text-neutral-400 font-body">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Actions */}
          <div className="w-full space-y-3">
            <Link
              to="/"
              className="block w-full py-4 px-8 bg-coral-500 text-center text-white font-semibold font-body rounded-[14px_16px_12px_18px/12px_14px_16px_10px] hover:bg-coral-600 transition-colors"
            >
              Go Home
            </Link>

            <button
              onClick={() => navigate(-1)}
              className="block w-full py-4 px-8 bg-surface text-center text-white font-body rounded-[14px_16px_12px_18px/12px_14px_16px_10px] hover:bg-neutral-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
