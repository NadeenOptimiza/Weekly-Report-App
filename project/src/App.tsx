import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { ReportForm } from './components/ReportForm';
import { AdminUsers } from './components/AdminUsers';
import { PriorityIssues } from './components/PriorityIssues';
import { TopDeals } from './components/TopDeals';
import { DataAdmin } from './components/DataAdmin';
import { Auth } from './components/Auth';
import { ChangePasswordForm } from './components/ChangePasswordForm';
import WeekSelector from './components/WeekSelector';
import { getCurrentWeek, currentUser } from './data/sampleData';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import { isoYearWeek } from './utils/week-mapping';
import { BarChart3, FileText, Plus, Menu, X, User, LogOut, Settings, Sun, Moon, Clock, Users, Shield, AlertCircle, TrendingUp, Database } from 'lucide-react';

type View = 'dashboard' | 'form' | 'admin' | 'settings' | 'priority-issues' | 'top-deals' | 'data-admin';

function App() {
  const { user, profile, loading: authLoading, isBUManager, isDivisionManager } = useAuth();
  const isNadeenHabboub = user?.email === 'nhabboub@optimizasolutions.com';
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  // Initialize selectedWeek with current week - reset on user change
  const [selectedWeek, setSelectedWeek] = useState(() => getCurrentWeek());
  
  // Reset to current week when user changes (sign in/out)
  useEffect(() => {
    const currentWeek = getCurrentWeek();
    console.log('App - User changed, resetting to current week:', currentWeek);
    setSelectedWeek(currentWeek);
  }, [user?.id]); // Reset when user ID changes (sign in/out)
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = async () => {
    // If user is already null, no need to attempt logout
    if (!user) {
      return;
    }
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        // If session is already missing/invalid, don't log as error since it's expected
        if (error.message !== 'Session from session_id claim in JWT does not exist' && 
            error.message !== 'Auth session missing!') {
          console.error('Logout error:', error.message);
        }
      }
    } catch (err) {
      console.error('Unexpected logout error:', err);
    }
    // The useAuth hook will handle redirecting to login when user becomes null
  };

  const handleSubmitReport = async () => {
    // In the sample data version, we just switch back to dashboard
    setCurrentView('dashboard');
  };

  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
          : 'bg-gradient-to-br from-slate-50 to-slate-100'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign-in page if user is not authenticated
  if (!user) {
    return <Auth isDarkMode={isDarkMode} />;
  }

  // Handle unauthorized access to admin
  if (currentView === 'admin' && !isBUManager) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
          : 'bg-gradient-to-br from-slate-50 to-slate-100'
      }`}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-2xl shadow-xl border p-8 text-center ${
            isDarkMode ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200/50'
          }`}>
            <div className={`${isDarkMode ? 'text-red-400' : 'text-red-500'} mb-6`}>
              <Shield className="w-20 h-20 mx-auto" />
            </div>
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Access Denied
            </h2>
            <p className={`mb-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              You don't have permission to access the admin panel. Only BU Managers can manage users.
            </p>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
        : 'bg-gradient-to-br from-slate-50 to-slate-100'
    }`}>
      {/* Navigation Header */}
      <header className={`shadow-lg border-b backdrop-blur-sm relative z-[9999] transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-slate-800/95 border-slate-700/50' 
          : 'bg-white border-slate-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <img 
                  src="/Screenshot 2025-07-03 160343.png" 
                  alt="Optimizo" 
                  className="h-8 w-auto"
                />
                <div className="hidden sm:block">
                  <h1 className={`text-xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>Weekly Reports</h1>
                  <p className={`text-xs -mt-1 transition-colors duration-300 ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>Executive Dashboard</p>
                </div>
              </div>
              
              <nav className="hidden md:flex space-x-2">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    currentView === 'dashboard'
                      ? isDarkMode 
                        ? 'bg-red-900/30 text-red-300 shadow-sm border border-red-800/50'
                        : 'bg-red-50 text-red-700 shadow-sm border border-red-100'
                      : isDarkMode
                        ? 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  BU Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('form')}
                  className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    currentView === 'form'
                      ? isDarkMode 
                        ? 'bg-red-900/30 text-red-300 shadow-sm border border-red-800/50'
                        : 'bg-red-50 text-red-700 shadow-sm border border-red-100'
                      : isDarkMode
                        ? 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Submit Report
                </button>
                {(isBUManager || isDivisionManager) && (
                  <>
                  <button
                    onClick={() => setCurrentView('top-deals')}
                    className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      currentView === 'top-deals'
                        ? isDarkMode
                          ? 'bg-red-900/30 text-red-300 shadow-sm border border-red-800/50'
                          : 'bg-red-50 text-red-700 shadow-sm border border-red-100'
                        : isDarkMode
                          ? 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Top 5 Deals
                  </button>
                  <button
                    onClick={() => setCurrentView('priority-issues')}
                    className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      currentView === 'priority-issues'
                        ? isDarkMode
                          ? 'bg-red-900/30 text-red-300 shadow-sm border border-red-800/50'
                          : 'bg-red-50 text-red-700 shadow-sm border border-red-100'
                        : isDarkMode
                          ? 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Priority Issues
                  </button>
                  </>
                )}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* Data Admin Button (for Nadeen Habboub only) */}
              {isNadeenHabboub && (
                <button
                  onClick={() => setCurrentView('data-admin')}
                  className={`flex items-center p-2.5 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                    currentView === 'data-admin'
                      ? isDarkMode
                        ? 'bg-red-900/30 text-red-300'
                        : 'bg-red-50 text-red-700'
                      : isDarkMode
                        ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Database className="w-5 h-5" />
                </button>
              )}

              {/* Admin Button (for BU Managers only) */}
              {isBUManager && (
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`flex items-center p-2.5 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                    currentView === 'admin'
                      ? isDarkMode
                        ? 'bg-red-900/30 text-red-300'
                        : 'bg-red-50 text-red-700'
                      : isDarkMode
                        ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Users className="w-5 h-5" />
                </button>
              )}

              {/* Settings Button */}
              <button
                onClick={() => setCurrentView('settings')}
                className={`flex items-center p-2.5 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                  currentView === 'settings'
                    ? isDarkMode
                      ? 'bg-red-900/30 text-red-300'
                      : 'bg-red-50 text-red-700'
                    : isDarkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className={`flex items-center p-2.5 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                    isDarkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <User className="w-5 h-5" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-xl border z-[9999] overflow-hidden transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700/50' 
                      : 'bg-white border-slate-200/50'
                  }`}>
                    {/* User Info Header */}
                    <div className={`px-4 py-3 border-b transition-colors duration-300 ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-slate-700 to-slate-800 border-slate-700' 
                        : 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
                        }`}>
                          <User className={`w-4 h-4 ${
                            isDarkMode ? 'text-red-400' : 'text-red-600'
                          }`} />
                        </div>
                        <div>
                          <p className={`font-semibold transition-colors duration-300 ${
                            isDarkMode ? 'text-white' : 'text-slate-900'
                          }`}>{profile?.full_name || user?.email || 'Unknown User'}</p>
                          <p className={`text-sm transition-colors duration-300 ${
                            isDarkMode ? 'text-slate-300' : 'text-slate-600'
                          }`}>{user?.email || 'No email'}</p>
                          <p className={`text-xs font-medium transition-colors duration-300 ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}>{profile?.role || 'No role'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setIsDarkMode(prev => !prev);
                          setIsProfileMenuOpen(false);
                        }}
                        className={`w-full flex items-center px-4 py-2.5 text-sm transition-colors ${
                          isDarkMode 
                            ? 'text-slate-300 hover:bg-slate-700/50' 
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {isDarkMode ? (
                          <Sun className={`w-4 h-4 mr-3 ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-500'
                          }`} />
                        ) : (
                          <Moon className={`w-4 h-4 mr-3 ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-500'
                          }`} />
                        )}
                        Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
                      </button>
                      
                      <div className={`border-t mt-2 pt-2 ${
                        isDarkMode ? 'border-slate-700' : 'border-slate-200'
                      }`}>
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            handleLogout();
                          }}
                          className={`w-full flex items-center px-4 py-2.5 text-sm transition-colors ${
                            isDarkMode 
                              ? 'text-red-400 hover:bg-red-900/20' 
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 py-4">
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    setCurrentView('dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    currentView === 'dashboard'
                      ? isDarkMode 
                        ? 'bg-red-900/30 text-red-300'
                        : 'bg-red-50 text-red-700'
                      : isDarkMode
                        ? 'text-slate-300 hover:bg-slate-700/50'
                        : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  BU Dashboard
                </button>
                <button
                  onClick={() => {
                    setCurrentView('form');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    currentView === 'form'
                      ? isDarkMode 
                        ? 'bg-red-900/30 text-red-300'
                        : 'bg-red-50 text-red-700'
                      : isDarkMode
                        ? 'text-slate-300 hover:bg-slate-700/50'
                        : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Submit Report
                </button>
                {(isBUManager || isDivisionManager) && (
                  <>
                  <button
                    onClick={() => {
                      setCurrentView('top-deals');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      currentView === 'top-deals'
                        ? isDarkMode
                          ? 'bg-red-900/30 text-red-300'
                          : 'bg-red-50 text-red-700'
                        : isDarkMode
                          ? 'text-slate-300 hover:bg-slate-700/50'
                          : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 mr-3" />
                    Top 5 Deals
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('priority-issues');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      currentView === 'priority-issues'
                        ? isDarkMode
                          ? 'bg-red-900/30 text-red-300'
                          : 'bg-red-50 text-red-700'
                        : isDarkMode
                          ? 'text-slate-300 hover:bg-slate-700/50'
                          : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 mr-3" />
                    Priority Issues
                  </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Overlay for profile menu */}
        {isProfileMenuOpen && (
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setIsProfileMenuOpen(false)}
          />
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {currentView === 'dashboard' ? (
          <Dashboard
            selectedWeek={selectedWeek}
            onWeekChange={setSelectedWeek}
            isDarkMode={isDarkMode}
          />
        ) : currentView === 'admin' ? (
          <AdminUsers isDarkMode={isDarkMode} />
        ) : currentView === 'data-admin' ? (
          <DataAdmin isDarkMode={isDarkMode} />
        ) : currentView === 'top-deals' ? (
          <TopDeals isDarkMode={isDarkMode} />
        ) : currentView === 'priority-issues' ? (
          <PriorityIssues isDarkMode={isDarkMode} isReadOnly={!isBUManager} />
        ) : currentView === 'settings' ? (
          <ChangePasswordForm
            isDarkMode={isDarkMode}
            onPasswordChangeSuccess={() => {
              setTimeout(() => setCurrentView('dashboard'), 2000);
            }}
          />
        ) : (
          <ReportForm
            onSubmit={handleSubmitReport}
            onCancel={() => setCurrentView('dashboard')}
            isDarkMode={isDarkMode}
          />
        )}
      </main>
    </div>
  );
}

export default App;