import React from 'react';
import { TrendingUp } from 'lucide-react';

interface TopDealsProps {
  isDarkMode: boolean;
}

export function TopDeals({ isDarkMode }: TopDealsProps) {
  return (
    <div className={`rounded-2xl shadow-xl border transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200/50'
    }`}>
      <div className={`px-6 py-5 border-b transition-colors duration-300 ${
        isDarkMode ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isDarkMode ? 'bg-red-900/30' : 'bg-red-50'
          }`}>
            <TrendingUp className={`w-5 h-5 ${
              isDarkMode ? 'text-red-400' : 'text-red-600'
            }`} />
          </div>
          <div>
            <h2 className={`text-2xl font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Top 5 Deals
            </h2>
            <p className={`text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              View the highest value opportunities
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className={`text-center py-12 ${
          isDarkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <TrendingUp className={`w-16 h-16 mx-auto mb-4 ${
            isDarkMode ? 'text-slate-600' : 'text-slate-300'
          }`} />
          <h3 className={`text-lg font-semibold mb-2 ${
            isDarkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            Top 5 Deals View
          </h3>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            This feature is coming soon. It will display the top 5 deals for BU Managers.
          </p>
        </div>
      </div>
    </div>
  );
}
