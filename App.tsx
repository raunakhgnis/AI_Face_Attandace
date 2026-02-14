import React, { useState } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ScanFace, UserPlus, Menu, X, ShieldCheck } from 'lucide-react';
import { SystemProvider } from './context/SystemContext';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Registration from './pages/Registration';

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-30 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <ShieldCheck className="w-8 h-8 text-primary-500 mr-3" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              FaceGuard AI
            </span>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-4 py-6 space-y-8">
            
            {/* Station Section */}
            <div>
              <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Station
              </div>
              <NavLink
                to="/"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <ScanFace className="w-5 h-5 mr-3" />
                <span className="font-medium">Attendance</span>
              </NavLink>
            </div>

            {/* Admin Section */}
            <div>
              <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Administration
              </div>
              <div className="space-y-1">
                <NavLink
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    flex items-center px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <LayoutDashboard className="w-5 h-5 mr-3" />
                  <span className="font-medium">Dashboard</span>
                </NavLink>

                <NavLink
                  to="/registration"
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    flex items-center px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <UserPlus className="w-5 h-5 mr-3" />
                  <span className="font-medium">Registration</span>
                </NavLink>
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-slate-400">System Status</p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-400">Operational</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-primary-500/30">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen transition-all duration-300">
        {/* Mobile Header */}
        <div className="lg:hidden h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center">
            <ShieldCheck className="w-6 h-6 text-primary-500 mr-2" />
            <span className="font-bold text-white">FaceGuard</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      <style>{`
        @keyframes scan-down {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-down {
          animation: scan-down 2s linear infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SystemProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Attendance />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/registration" element={<Registration />} />
          </Routes>
        </Layout>
      </HashRouter>
    </SystemProvider>
  );
};

export default App;