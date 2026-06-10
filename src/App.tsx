import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FarmInputPage } from './pages/FarmInputPage';
import { CropSelectionPage } from './pages/CropSelectionPage';
import { StrategyComparisonPage } from './pages/StrategyComparisonPage';
import { DetailedAnalysisPage } from './pages/DetailedAnalysisPage';
import { FarmViewPage } from './pages/FarmViewPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/auth/PrivateRoute';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-emerald-500/30">
          {/* Global Background Ambient Effects */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden flex justify-center items-center">
            <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-emerald-900/20 rounded-full blur-[150px] mix-blend-screen opacity-50" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-900/20 rounded-full blur-[150px] mix-blend-screen opacity-50" />
            <div className="absolute top-[40%] left-[60%] w-[30rem] h-[30rem] bg-teal-900/10 rounded-full blur-[120px] mix-blend-screen opacity-50" />
          </div>

          <main className="flex-grow flex flex-col relative z-10">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<FarmInputPage />} />
                <Route path="/select-crop" element={<CropSelectionPage />} />
                <Route path="/strategies" element={<StrategyComparisonPage />} />
                <Route path="/farm-view/:strategyId" element={<FarmViewPage />} />
                <Route path="/analysis/:strategyId" element={<DetailedAnalysisPage />} />
              </Route>
            </Routes>
          </main>
        
          <footer className="relative z-10 py-6 mt-auto border-t border-white/5 flex flex-col md:flex-row justify-center md:justify-between items-center px-8 md:px-16 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-semibold bg-black/40 backdrop-blur-md">
            <span className="mb-4 md:mb-0">© 2026 Nexus Systems</span>
            <div className="flex gap-8">
              <a href="#" className="hover:text-emerald-400 transition-colors duration-300">Documentation</a>
              <a href="#" className="hover:text-emerald-400 transition-colors duration-300">Security</a>
              <a href="#" className="hover:text-emerald-400 transition-colors duration-300">Privacy</a>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
