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
        <div className="flex flex-col min-h-screen">
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
        
        <footer className="mt-auto py-8 border-t border-gray-100 flex justify-center md:justify-between items-center px-6 md:px-12 text-[10px] uppercase tracking-widest text-gray-400 font-bold bg-[#F9FAFB]">
          <span>© 2026 AgriIntelligence Systems</span>
          <div className="hidden md:flex gap-6">
            <a href="#" className="hover:text-emerald-600 transition-colors">Documentation</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a>
          </div>
        </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
