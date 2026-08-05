import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarPlus,
  Calendar,
  FileText,
  User,
  Users,
  Settings,
  FolderHeart,
  Stethoscope,
  TestTube,
  Pill,
  Warehouse,
  Shield,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <>{children}</>;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getSidebarLinks = (role) => {
    switch (role) {
      case 'patient':
        return [
          { name: 'Dashboard', path: '/patient', icon: LayoutDashboard },
          { name: 'Book Appointment', path: '/patient/book', icon: CalendarPlus },
          { name: 'My Appointments', path: '/patient/appointments', icon: Calendar },
          { name: 'Medical Timeline', path: '/patient/timeline', icon: FolderHeart },
          { name: 'My Profile', path: '/patient/profile', icon: User }
        ];
      case 'assistant':
        return [
          { name: 'Appointments Manager', path: '/assistant', icon: Calendar },
          { name: 'Patient Directory', path: '/assistant/patients', icon: Users },
          { name: 'Doctor Roster', path: '/assistant/doctors', icon: Stethoscope }
        ];
      case 'doctor':
        return [
          { name: 'Consultation Queue', path: '/doctor', icon: Calendar },
          { name: 'Past Consultations', path: '/doctor/history', icon: FileText },
          { name: 'My Availability', path: '/doctor/availability', icon: Settings }
        ];
      case 'lab':
        return [
          { name: 'Lab Queue', path: '/lab', icon: TestTube }
        ];
      case 'pharmacy':
        return [
          { name: 'Prescription Queue', path: '/pharmacy', icon: Pill },
          { name: 'Medicines Inventory', path: '/pharmacy/inventory', icon: Warehouse }
        ];
      case 'admin':
        return [
          { name: 'System Statistics', path: '/admin', icon: LayoutDashboard },
          { name: 'Staff Management', path: '/admin/staff', icon: Shield },
          { name: 'Patient Database', path: '/admin/patients', icon: Users },
          { name: 'Medicines Stock', path: '/admin/inventory', icon: Warehouse }
        ];
      default:
        return [];
    }
  };

  const links = getSidebarLinks(user.role);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden w-full">
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-slate-200 flex-shrink-0">
        <div className="flex items-center justify-center h-16 border-b border-slate-100 px-6">
          <span className="text-teal-700 font-semibold tracking-wider uppercase text-sm">ST. JUDE HOSPITAL</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="mr-3 h-5 w-5 shrink-0" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="mr-3 h-5 w-5 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex flex-col w-64 max-w-xs bg-white border-r border-slate-200 z-10">
            <div className="flex items-center justify-between h-16 border-b border-slate-100 px-6">
              <span className="text-teal-700 font-semibold uppercase text-xs">ST. JUDE HOSPITAL</span>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-teal-50 text-teal-800'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5 shrink-0" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  handleLogout();
                }}
                className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="mr-3 h-5 w-5 shrink-0" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-500 hover:text-slate-700 md:hidden focus:outline-none cursor-pointer"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="hidden md:flex items-center">
            <span className="text-slate-500 text-sm font-medium">Saint Jude Memorial Hospital Management System</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-800">{user.name}</p>
              <p className="text-[10px] uppercase font-bold tracking-wider text-teal-700">{user.role}</p>
            </div>
            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-teal-50 text-teal-800 border border-teal-100 font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
