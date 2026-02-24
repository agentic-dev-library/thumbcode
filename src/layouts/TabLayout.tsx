/**
 * Tab Layout
 *
 * Bottom tab navigation for the main app screens.
 * Replaces app/(tabs)/_layout.tsx from expo-router.
 *
 * Uses lucide-react icons and the P3 "Warm Technical" brand palette.
 */

import { FolderGit2, Home, MessageSquare, Settings, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

interface TabItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

function TabItem({ to, label, icon, activeIcon }: TabItemProps) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center py-2 px-3 min-w-[64px] min-h-[48px] text-xs font-body transition-colors tap-feedback ${
          isActive
            ? 'text-coral-500 font-semibold opacity-100'
            : 'text-neutral-400 opacity-60 hover:opacity-80'
        }`
      }
      aria-label={label}
    >
      {({ isActive }) => (
        <>
          <span
            className={`w-1 h-1 rounded-full mb-0.5 ${isActive ? 'bg-coral-500' : 'bg-transparent'}`}
          />
          <span className="mb-1">{isActive ? activeIcon : icon}</span>
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

export function TabLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-charcoal">
      <main
        className="flex-1 overflow-auto hide-scrollbar animate-page-enter"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <Outlet />
      </main>
      <nav
        className="flex items-center justify-around border-t border-white/5 glass py-2"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        aria-label="Main navigation"
      >
        <TabItem
          to="/"
          label="Home"
          icon={<Home size={24} strokeWidth={1.5} />}
          activeIcon={<Home size={24} strokeWidth={2.5} />}
        />
        <TabItem
          to="/agents"
          label="Agents"
          icon={<Users size={24} strokeWidth={1.5} />}
          activeIcon={<Users size={24} strokeWidth={2.5} />}
        />
        <TabItem
          to="/projects"
          label="Projects"
          icon={<FolderGit2 size={24} strokeWidth={1.5} />}
          activeIcon={<FolderGit2 size={24} strokeWidth={2.5} />}
        />
        <TabItem
          to="/chat"
          label="Chat"
          icon={<MessageSquare size={24} strokeWidth={1.5} />}
          activeIcon={<MessageSquare size={24} strokeWidth={2.5} />}
        />
        <TabItem
          to="/settings"
          label="Settings"
          icon={<Settings size={24} strokeWidth={1.5} />}
          activeIcon={<Settings size={24} strokeWidth={2.5} />}
        />
      </nav>
    </div>
  );
}
