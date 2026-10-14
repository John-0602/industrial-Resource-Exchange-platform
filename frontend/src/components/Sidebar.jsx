import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Layers, 
  Send, 
  Inbox, 
  History, 
  Building2, 
  Sparkles,
  PlusCircle,
  FileSpreadsheet,
  ShieldAlert,
  Search
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { to: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { to: '/marketplace', label: 'Material Marketplace', icon: Search },
    { to: '/add-resource', label: 'Publish Surplus / By-Product', icon: PlusCircle },
    { to: '/requirements/new', label: 'Post Procurement Need', icon: FileSpreadsheet },
    { to: '/matching', label: 'Circular Matching Engine', icon: Sparkles },
    { to: '/my-listings', label: 'Enterprise Inventory', icon: Layers },
    { to: '/requests/received', label: 'Inbound Proposals', icon: Inbox },
    { to: '/requests/sent', label: 'Outbound Proposals', icon: Send },
    { to: '/history', label: 'Transfer Tracking & History', icon: History },
    { to: '/profile', label: 'Enterprise Profile', icon: Building2 },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm sticky top-20">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Enterprise Operations
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
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

          {isAdmin && (
            <div className="pt-2 mt-2 border-t border-slate-100">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                Governance
              </div>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-amber-800 hover:bg-amber-50'
                  }`
                }
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Admin Moderation</span>
              </NavLink>
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
};
