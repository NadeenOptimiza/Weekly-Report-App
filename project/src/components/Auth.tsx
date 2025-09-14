import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, UserPlus, KeyRound } from 'lucide-react';

interface AuthProps {
  isDarkMode?: boolean;
}

export function Auth({ isDarkMode = false }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError(`Please enter both email and password`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        throw error;
      }

      // Success - the useAuth hook will handle the state update
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || `Failed to sign in. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

      if (error) {
        throw error;
      }

      setMessage('Password reset email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 lg:p-8 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
        : 'bg-white'
    }`}>
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Side - Welcome Section */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <img 
                src="/Screenshot 2025-07-03 160343.png" 
                alt="Optimizo" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className={`text-4xl font-bold transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>Weekly Reports</h1>
                <p className={`text-lg transition-colors duration-300 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>Executive Dashboard Platform</p>
              </div>
            </div>
            
            <p className={`text-xl leading-relaxed transition-colors duration-300 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Streamline your business operations with real-time reporting, 
              comprehensive analytics, and seamless collaboration across all departments.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-4">
            <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800' 
                : 'bg-gray-100 border-gray-200 hover:bg-gray-50'
            }`}>
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Real-time Analytics
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Track performance across all business units instantly
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800' 
                : 'bg-gray-100 border-gray-200 hover:bg-gray-50'
            }`}>
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Enterprise Security
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Role-based access between Business units and divisions
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800' 
                : 'bg-gray-100 border-gray-200 hover:bg-gray-50'
            }`}>
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Instant Collaboration
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Submit and review reports in real-time across teams
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="w-full max-w-md mx-auto lg:max-w-none">
          <div className={`rounded-3xl shadow-2xl border overflow-hidden backdrop-blur-sm transition-colors duration-300 ${
            isDarkMode ? 'bg-slate-800/95 border-slate-700/50' : 'bg-white/95 border-slate-200/50'
          }`}>
            {/* Form Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-700 to-red-800"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20"></div>
              <div className="relative px-8 py-12 text-center">
                <div className="lg:hidden mb-6">
                  <img 
                    src="/Screenshot 2025-07-03 160343.png" 
                    alt="Optimizo" 
                    className="h-10 w-auto mx-auto mb-4"
                  />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-white">
                    {isResetPassword ? 'Reset Password' : 'Welcome Back'}
                  </h2>
                  <p className="text-red-100/90 text-lg">
                    {isResetPassword ? 'Enter your email to reset password' : 'Sign in to your dashboard'}
                  </p>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8 lg:p-10">
              <form onSubmit={isResetPassword ? handleResetPassword : handleAuth} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className={`rounded-2xl p-4 flex items-center space-x-3 border ${
                    isDarkMode 
                      ? 'bg-red-900/20 border-red-800/50' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
                      isDarkMode ? 'text-red-400' : 'text-red-600'
                    }`} />
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-red-300' : 'text-red-800'
                    }`}>
                      {error}
                    </span>
                  </div>
                )}

                {/* Success Message */}
                {message && (
                  <div className={`rounded-2xl p-4 flex items-center space-x-3 border ${
                    isDarkMode 
                      ? 'bg-green-900/20 border-green-800/50' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <div className={`w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-green-400' : 'bg-green-600'
                    }`}>
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-green-300' : 'text-green-800'
                    }`}>
                      {message}
                    </span>
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className={`block text-sm font-semibold transition-colors duration-300 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className={`w-5 h-5 transition-colors duration-300 ${
                        isDarkMode ? 'text-slate-400 group-focus-within:text-red-400' : 'text-slate-500 group-focus-within:text-red-500'
                      }`} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 ${
                        isDarkMode 
                          ? 'border-slate-600 bg-slate-700/50 text-white placeholder-slate-400 hover:bg-slate-700' 
                          : 'border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-500 hover:bg-white'
                      }`}
                      placeholder="Enter your email address"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                {!isResetPassword && (
                <div className="space-y-2">
                  <label htmlFor="password" className={`block text-sm font-semibold transition-colors duration-300 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className={`w-5 h-5 transition-colors duration-300 ${
                        isDarkMode ? 'text-slate-400 group-focus-within:text-red-400' : 'text-slate-500 group-focus-within:text-red-500'
                      }`} />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pl-12 pr-14 py-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 ${
                        isDarkMode 
                          ? 'border-slate-600 bg-slate-700/50 text-white placeholder-slate-400 hover:bg-slate-700' 
                          : 'border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-500 hover:bg-white'
                      }`}
                      placeholder="Enter your password"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors duration-300 ${
                        isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-600'
                      }`}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !email || (!isResetPassword && !password)}
                  className={`w-full flex items-center justify-center px-8 py-4 text-white font-bold rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                      : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      {isResetPassword ? 'Sending...' : 'Signing In...'}
                    </>
                  ) : (
                    <>
                      {isResetPassword ? (
                        <>
                          <KeyRound className="w-5 h-5 mr-3" />
                          Send Reset Email
                        </>
                      ) : (
                        <>
                          <LogIn className="w-5 h-5 mr-3" />
                          Sign In to Dashboard
                        </>
                      )}
                    </>
                  )}
                </button>
              </form>
              
              {/* Auth Mode Toggle */}
              <div className="mt-6 text-center space-y-3">
                {!isResetPassword ? (
                  <>
                    <div>
                      <button
                        type="button"
                        onClick={() => setIsResetPassword(true)}
                        className={`text-sm font-medium transition-colors duration-300 hover:underline ${
                          isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-600'
                        }`}
                        disabled={loading}
                      >
                        Forgot your password?
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsResetPassword(false)}
                    className={`text-sm font-medium transition-colors duration-300 hover:underline ${
                      isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-600'
                    }`}
                    disabled={loading}
                  >
                    Back to Sign In
                  </button>
                )}
              </div>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  © 2025 Optimiza. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}