import React from 'react';
import { WeeklyReport, UrgentIssue } from '../types';
import { businessUnits } from '../data/sampleData';
import { AlertCircle, Star, TrendingUp, Target, User, Clock, Building2, Flag, CheckCircle } from 'lucide-react';

interface ReportCardProps {
  report: WeeklyReport;
  isDarkMode: boolean;
}

export function ReportCard({ report, isDarkMode }: ReportCardProps) {
  const businessUnit = businessUnits.find(d => d.name === report.businessUnit);
  const hasUrgentIssues = Array.isArray(report.urgentIssues) ? report.urgentIssues.length > 0 : false;
  const urgentIssuesArray = Array.isArray(report.urgentIssues) ? report.urgentIssues : [];

  return (
    <div className={`rounded-2xl shadow-xl border overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
      isDarkMode 
        ? 'bg-slate-800 border-slate-700/50' 
        : 'bg-white border-slate-200/50'
    }`}>
      {/* Header */}
      <div className={`p-6 border-b transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-slate-700 to-slate-800/50 border-slate-700' 
          : 'bg-gradient-to-r from-slate-100 to-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-xl">
              <Building2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className={`text-xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>{report.businessUnit}</h2>
              {report.division && (
                <p className={`text-sm font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>{report.division}</p>
              )}
            </div>
          </div>
          {hasUrgentIssues && (
            <div className="flex items-center bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold shadow-sm animate-pulse">
              <AlertCircle className="w-4 h-4 mr-1" />
              Urgent Issues
            </div>
          )}
        </div>
        
        <div className={`flex items-center text-sm space-x-6 transition-colors duration-300 ${
          isDarkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          {report.submittedBy && (
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              {report.submittedBy}
            </div>
          )}
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            {report.submittedAt.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Urgent Issues */}
        {hasUrgentIssues && (
          <div className={`rounded-xl p-5 shadow-sm border transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-red-900/20 to-red-800/30 border-red-800/50' 
              : 'bg-gradient-to-r from-red-50 to-red-100/50 border-red-200/50'
          }`}>
            <div className="flex items-start">
              <div className={`p-2 rounded-lg mr-4 flex-shrink-0 ${
                isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
              }`}>
                <AlertCircle className={`w-5 h-5 ${
                  isDarkMode ? 'text-red-400' : 'text-red-600'
                }`} />
              </div>
              <div>
                <h3 className={`font-semibold mb-3 transition-colors duration-300 ${
                  isDarkMode ? 'text-red-300' : 'text-red-800'
                }`}>Urgent Issues ({urgentIssuesArray.length})</h3>
                
                <div className="space-y-3">
                  {urgentIssuesArray.map((issue: UrgentIssue) => (
                    <div key={issue.id} className={`p-3 rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'bg-slate-800/50 border-slate-700' 
                        : 'bg-white/70 border-red-200'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Clock className={`w-3 h-3 ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-500'
                          }`} />
                          <span className={`text-xs ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            {new Date(issue.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {issue.requiresAction && (
                            <div className="flex items-center space-x-1">
                              <Flag className="w-3 h-3 text-orange-500" />
                              <span className="text-xs text-orange-600 font-medium">
                                Action Required
                              </span>
                            </div>
                          )}
                          {issue.isCompleted && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-green-600 font-medium">
                                Completed
                              </span>
                            </div>
                          )}
                          {issue.status === 'Noted' && issue.completedBy && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3 text-blue-500" />
                              <span className="text-xs text-blue-600 font-medium">
                                Noted by {issue.completedBy}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                        isDarkMode ? 'text-red-200' : 'text-red-700'
                      }`}>
                        {issue.description}
                      </p>
                      <div className={`text-xs mt-1 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        By: {issue.submittedBy}
                        {issue.isCompleted && issue.completedBy && (
                          <span> • Completed by: {issue.completedBy}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Highlight of the Week */}
        <div className={`rounded-xl p-5 shadow-sm border transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-emerald-900/20 to-emerald-800/30 border-emerald-800/50' 
            : 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-200/50'
        }`}>
          <div className="flex items-start">
            <div className={`p-2 rounded-lg mr-4 flex-shrink-0 ${
              isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-100'
            }`}>
              <Star className={`w-5 h-5 ${
                isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
              }`} />
            </div>
            <div>
              <h3 className={`font-semibold mb-3 transition-colors duration-300 ${
                isDarkMode ? 'text-emerald-300' : 'text-emerald-800'
              }`}>Highlight of the Week</h3>
              <p className={`whitespace-pre-wrap leading-relaxed transition-colors duration-300 ${
                isDarkMode ? 'text-emerald-200' : 'text-emerald-700'
              }`}>{report.highlightOfWeek}</p>
            </div>
          </div>
        </div>

        {/* Business Development */}
        <div className={`rounded-xl p-5 shadow-sm border transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-blue-900/20 to-blue-800/30 border-blue-800/50' 
            : 'bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200/50'
        }`}>
          <div className="flex items-start">
            <div className={`p-2 rounded-lg mr-4 flex-shrink-0 ${
              isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
            }`}>
              <TrendingUp className={`w-5 h-5 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <h3 className={`font-semibold mb-3 transition-colors duration-300 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-800'
              }`}>Business Development Activities</h3>
              <p className={`whitespace-pre-wrap leading-relaxed transition-colors duration-300 ${
                isDarkMode ? 'text-blue-200' : 'text-blue-700'
              }`}>{report.businessDevelopment}</p>
            </div>
          </div>
        </div>

        {/* Planned Activities */}
        <div className={`rounded-xl p-5 shadow-sm border transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-purple-900/20 to-purple-800/30 border-purple-800/50' 
            : 'bg-gradient-to-r from-purple-50 to-purple-100/50 border-purple-200/50'
        }`}>
          <div className="flex items-start">
            <div className={`p-2 rounded-lg mr-4 flex-shrink-0 ${
              isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
            }`}>
              <Target className={`w-5 h-5 ${
                isDarkMode ? 'text-purple-400' : 'text-purple-600'
              }`} />
            </div>
            <div>
              <h3 className={`font-semibold mb-3 transition-colors duration-300 ${
                isDarkMode ? 'text-purple-300' : 'text-purple-800'
              }`}>Planned Activities for Next Week</h3>
              <p className={`whitespace-pre-wrap leading-relaxed transition-colors duration-300 ${
                isDarkMode ? 'text-purple-200' : 'text-purple-700'
              }`}>{report.plannedActivities}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}