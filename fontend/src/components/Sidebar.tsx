import React from 'react';
import { NavLink as RouterNavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, CreditCard, ArrowLeftRight, FileText, History, LogOut, X, Landmark
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/create-account', label: 'Create Account', icon: CreditCard },
  { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { path: '/loans', label: 'Loan Application', icon: FileText },
  { path: '/history', label: 'Transaction History', icon: History },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { logout, customerName } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 bg-foreground/30 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-sidebar-bg text-sidebar-fg flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-sidebar-hover">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Landmark className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-display font-bold text-primary-foreground">NeoBank</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-sidebar-fg hover:text-primary-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User */}
        <div className="px-6 py-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Welcome</p>
          <p className="text-sm font-semibold text-primary-foreground truncate">{customerName || 'User'}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <RouterNavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </RouterNavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-6">
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
