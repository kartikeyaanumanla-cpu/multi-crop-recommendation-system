import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { FarmInputPage } from './pages/FarmInputPage';
import { CropSelectionPage } from './pages/CropSelectionPage';
import { StrategyComparisonPage } from './pages/StrategyComparisonPage';
import { DetailedAnalysisPage } from './pages/DetailedAnalysisPage';
import { FarmViewPage } from './pages/FarmViewPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { OverviewPage } from './pages/dashboard/OverviewPage';
import { FieldHistoryPage } from './pages/dashboard/FieldHistoryPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { Leaf, LogOut, User } from 'lucide-react';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Hide top nav if we are inside the dashboard (it has its own layout) or auth pages
  if (location.pathname.startsWith('/dashboard') || location.pathname === '/login' || location.pathname === '/signup') return null;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-colors">
              <Leaf className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">Agri<span className="text-emerald-600 font-medium">Smart</span></span>
          </Link>
          
          <div className="flex items-center gap-6 text-sm font-medium">
            {user ? (
              <>
                <Link to="/dashboard" className="text-emerald-600 hover:text-emerald-700 font-semibold">Dashboard</Link>
                <div className="hidden md:flex items-center gap-2 text-slate-500">
                  <User className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <button 
                  onClick={() => logout()}
                  className="text-slate-500 hover:text-red-600 flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-200 selection:text-emerald-900">
          <Navigation />
          
          <main className="flex-grow flex flex-col relative z-10 w-full">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Protected Routes nested in DashboardLayout */}
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<OverviewPage />} />
                  <Route path="plan" element={<FarmInputPage />} />
                  <Route path="select-crop" element={<CropSelectionPage />} />
                  <Route path="strategies" element={<StrategyComparisonPage />} />
                  <Route path="farm-view/:strategyId" element={<FarmViewPage />} />
                  <Route path="analysis/:strategyId" element={<DetailedAnalysisPage />} />
                  <Route path="history" element={<FieldHistoryPage />} />
                </Route>
              </Route>
            </Routes>
          </main>
        
          <footer className="relative z-10 py-8 mt-auto border-t border-slate-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <Leaf className="w-4 h-4 text-emerald-500" />
                <span>© 2026 AgriSmart. Empowering modern farming.</span>
              </div>
              <div className="flex gap-8 font-medium">
                <a href="#" className="hover:text-emerald-600 transition-colors">Documentation</a>
                <a href="#" className="hover:text-emerald-600 transition-colors">Support</a>
                <a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
