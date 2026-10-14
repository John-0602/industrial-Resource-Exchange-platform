import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  Send, 
  Inbox, 
  History, 
  User, 
  ShoppingBag,
  PlusCircle
} from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { to: '/add-resource', label: 'Add New Resource', icon: PlusCircle },
    { to: '/my-listings', label: 'My Listings', icon: Layers },
    { to: '/requests/sent', label: 'Sent Requests', icon: Send },
    { to: '/requests/received', label: 'Received Requests', icon: Inbox },
    { to: '/history', label: 'Exchange History', icon: History },
    { to: '/profile', label: 'Student Profile', icon: User },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm sticky top-20">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
