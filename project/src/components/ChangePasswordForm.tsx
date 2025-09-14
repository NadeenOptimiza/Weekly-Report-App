import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ChangePasswordFormProps {
  isDarkMode: boolean;
  onPasswordChangeSuccess?: () => void; // Optional callback for parent component
}

export function ChangePasswordForm({ isDarkMode, onPasswordChangeSuccess }: ChangePasswordFormProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      // Update the last_password_change_at timestamp in the profiles table
      if (user) {
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ last_password_change_at: new Date().toISOString() })
          .eq('user_id', user.id);

        if (profileUpdateError) {
          console.error('Error updating profile last_password_change_at:', profileUpdateError);
          // Note: We still show success for password change, but log this error
        }
      }

      setSuccessMessage('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      if (onPasswordChangeSuccess) {
        onPasswordChangeSuccess();
      }
    } catch (err: any) {
      console.error('Error updating password:', err);
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-2xl shadow-xl border p-6 lg:p-8 ${
      isDarkMode ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200/50'
    }`}>
      <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
        Change Password
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success Message */}
        {successMessage && (
          <div className={`rounded-xl p-4 flex items-center space-x-3 ${
            isDarkMode 
              ? 'bg-emerald-900/20 border border-emerald-800/50' 
              : 'bg-emerald-50 border border-emerald-200'
          }`}>
            <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span className={`font-medium ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>
              {successMessage}
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={`rounded-xl p-4 flex items-center space-x-3 ${
            isDarkMode 
              ? 'bg-red-900/20 border border-red-800/50' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <AlertCircle className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
            <span className={`font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
              {error}
            </span>
          </div>
        )}

        {/* New Password Field */}
        <div className="space-y-2">
          <label htmlFor="new-password" className={`block text-sm font-semibold ${
            isDarkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            New Password
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className={`w-5 h-5 ${
                isDarkMode ? 'text-slate-400 group-focus-within:text-red-400' : 'text-slate-500 group-focus-within:text-red-500'
              }`} />
            </div>
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full pl-12 pr-14 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 ${
                isDarkMode 
                  ? 'border-slate-600 bg-slate-700/50 text-white placeholder-slate-400 hover:bg-slate-700' 
                  : 'border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-500 hover:bg-white'
              }`}
              placeholder="Enter new password"
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

        {/* Confirm New Password Field */}
        <div className="space-y-2">
          <label htmlFor="confirm-password" className={`block text-sm font-semibold ${
            isDarkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            Confirm New Password
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className={`w-5 h-5 ${
                isDarkMode ? 'text-slate-400 group-focus-within:text-red-400' : 'text-slate-500 group-focus-within:text-red-500'
              }`} />
            </div>
            <input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full pl-12 pr-14 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 ${
                isDarkMode 
                  ? 'border-slate-600 bg-slate-700/50 text-white placeholder-slate-400 hover:bg-slate-700' 
                  : 'border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-500 hover:bg-white'
              }`}
              placeholder="Confirm new password"
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !newPassword || !confirmPassword}
          className={`w-full flex items-center justify-center px-8 py-3 text-white font-bold rounded-xl focus:outline-none focus:ring-4 focus:ring-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
              : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Updating...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5 mr-3" />
              Update Password
            </>
          )}
        </button>
      </form>
    </div>
  );
}