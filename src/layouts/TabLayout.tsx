/**
 * Tab Layout
 *
 * Bottom tab navigation for the main app screens.
 * Replaces app/(tabs)/_layout.tsx from expo-router.
 */

import { NavLink, Outlet } from 'react-router-dom';

interface TabItemProps {
  to: string;
  label: string;
}

function TabItem({ to, label }: TabItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center py-2 px-3 text-xs font-body ${
          isActive ? 'text-coral-500 font-semibold opacity-100' : 'text-neutral-400 opacity-50'
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export function TabLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-charcoal">
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <nav className="flex items-center justify-around border-t border-neutral-700 bg-neutral-800 py-2">
        <TabItem to="/" label="Home" />
        <TabItem to="/projects" label="Projects" />
        <TabItem to="/agents" label="Agents" />
        <TabItem to="/chat" label="Chat" />
        <TabItem to="/settings" label="Settings" />
      </nav>
    </div>
  );
}
