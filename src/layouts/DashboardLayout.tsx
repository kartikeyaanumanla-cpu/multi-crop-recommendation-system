import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Sprout, History, LogOut, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Farm Planner', path: '/dashboard/plan', icon: Sprout },
    { name: 'Field History', path: '/dashboard/history', icon: History }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* Topbar Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-colors">
                <Sprout className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">Agro<span className="text-emerald-600 font-medium">AI</span></span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all duration-300 ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm border border-transparent'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-[14px]">{item.name}</span>
                </NavLink>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <User className="w-4 h-4" />
                <span>{user.name || user.email || 'Farmer'}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-slate-500 hover:text-red-600 flex items-center gap-1.5 transition-colors p-2 rounded-lg hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-slate-600 focus:outline-none p-2 rounded-lg hover:bg-slate-50">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <nav className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              ))}
              <div className="pt-4 mt-2 border-t border-slate-100">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto min-h-0 flex flex-col">
        <div className="flex-1 pb-12 w-full h-full relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
