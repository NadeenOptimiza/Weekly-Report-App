import React, { useState } from 'react';
import { ReportCard } from './ReportCard';
import WeekSelector from './WeekSelector';
import { formatWeekLabel } from '../data/sampleData';
import { useWeeklyReports, useBusinessUnits, useDivisions } from '../hooks/useDatabase';
import { useAuth } from '../hooks/useAuth';
import { TrendingUp, AlertCircle, CheckCircle2, Clock, Users, Building2 } from 'lucide-react';

interface DashboardProps {
  selectedWeek: string; // e.g. "W26-2025"
  onWeekChange: (week: string) => void;
  isDarkMode: boolean;
}

export function Dashboard({ selectedWeek, onWeekChange, isDarkMode }: DashboardProps) {
  const { user, profile } = useAuth();
  const { reports: allReports, loading, error } = useWeeklyReports(selectedWeek);
  const { businessUnits, loading: buLoading } = useBusinessUnits();
  const { divisions, loading: divLoading } = useDivisions();
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<string | null>(null);

  // Filter reports based on user role
  const filteredReports =
    profile?.role === 'BU_MANAGER'
      ? allReports
      : profile?.role === 'DIVISION_MANAGER'
      ? allReports.filter(r => r.businessUnit === profile.business_unit_name)
      : [];

  // Group reports by business unit
  const reportsByBusinessUnit = filteredReports.reduce((acc, report) => {
    if (!acc[report.businessUnit]) {
      acc[report.businessUnit] = [];
    }
    acc[report.businessUnit].push(report);
    return acc;
  }, {} as Record<string, typeof filteredReports>);

  // Get available business units (only those with reports or all if BU_MANAGER)
  const availableBusinessUnits = profile?.role === 'BU_MANAGER' 
    ? businessUnits.filter(bu => reportsByBusinessUnit[bu.name] || Object.keys(reportsByBusinessUnit).length === 0)
    : businessUnits.filter(bu => bu.name === profile?.business_unit_name);

  // Set default selected business unit if none selected
  React.useEffect(() => {
    if (!selectedBusinessUnit && availableBusinessUnits.length > 0) {
      setSelectedBusinessUnit(availableBusinessUnits[0].name);
    }
  }, [selectedBusinessUnit, availableBusinessUnits]);

  if (loading || buLoading) {
    return (
      <div className="space-y-6">
        <div className={`rounded-2xl shadow-xl border p-6 lg:p-8 backdrop-blur-sm transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200/50'
        }`}>
          <div className="animate-pulse">
            <div className={`h-8 rounded mb-4 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 rounded mb-6 w-2/3 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-24 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl shadow-xl border p-12 text-center transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200/50'
      }`}>
        <div className={`${isDarkMode ? 'text-red-400' : 'text-red-500'} mb-6`}>
          <AlertCircle className="w-20 h-20 mx-auto" />
        </div>
        <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Error Loading Reports
        </h3>
        <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{error}</p>
      </div>
    );
  }

  // Get reports for selected business unit
  const selectedBUReports = selectedBusinessUnit ? (reportsByBusinessUnit[selectedBusinessUnit] || []) : [];

  // Calculate stats for selected business unit
  const urgentIssuesCount = selectedBUReports.reduce((count, r) => {
    const issues = Array.isArray(r.urgentIssues) ? r.urgentIssues : [];
    return count + issues.filter(issue => issue.requiresAction && !issue.isCompleted).length;
  }, 0);
  const divisionsReported = selectedBUReports.length;
  
  // Get total divisions for selected business unit
  const selectedBU = businessUnits.find(bu => bu.name === selectedBusinessUnit);
  const totalDivisionsForBU = selectedBU ? (divisions[selectedBU.id] || []).length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl shadow-xl border p-6 lg:p-8 transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200/50'}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {profile?.role === 'BU_MANAGER' ? 'Executive Dashboard' : 'Business Unit Dashboard'}
            </h1>
            <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {profile?.role === 'BU_MANAGER' ? 'Company-wide weekly activity reports overview' : 'Weekly reports for your authorized business units'}
            </p>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Welcome back, {profile?.full_name || user?.email || 'User'} ({profile?.role?.replace('_', ' ') || 'No role'})
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <WeekSelector selectedWeek={selectedWeek} onWeekChange={onWeekChange} isDarkMode={isDarkMode} />
          </div>
        </div>

        {/* Business Unit Selection Boxes */}
        <div>
          <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Select Business Unit
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableBusinessUnits.map((bu) => {
              const buReports = reportsByBusinessUnit[bu.name] || [];
              const buUrgentCount = buReports.reduce((count, r) => {
                const issues = Array.isArray(r.urgentIssues) ? r.urgentIssues : [];
                return count + issues.filter(issue => issue.requiresAction && !issue.isCompleted).length;
              }, 0);
              const hasUrgentIssues = buUrgentCount > 0;
              const buDivisionsReported = buReports.length;
              const buTotalDivisions = 3; // This should be calculated based on actual divisions data
              const buTotalDivisions = divisions[bu.id] ? divisions[bu.id].length : 0;
              
              return (
                <div
                  key={bu.id}
                  onClick={() => setSelectedBusinessUnit(bu.name)}
                  className={`relative p-6 rounded-2xl border cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
                    selectedBusinessUnit === bu.name
                      ? isDarkMode 
                        ? 'bg-red-900/30 border-red-800/50 shadow-xl ring-2 ring-red-500/50'
                        : 'bg-red-50 border-red-200 shadow-xl ring-2 ring-red-500/20'
                      : isDarkMode
                        ? 'bg-slate-700/50 border-slate-600/50 hover:bg-slate-700 hover:border-slate-500'
                        : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {/* Urgent issues indicator */}
                  {hasUrgentIssues && (
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      isDarkMode ? 'bg-red-500' : 'bg-red-600'
                    } animate-pulse shadow-lg`}>
                      {buUrgentCount}
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${
                      selectedBusinessUnit === bu.name
                        ? isDarkMode ? 'bg-red-800/50' : 'bg-red-100'
                        : isDarkMode ? 'bg-slate-600' : 'bg-slate-100'
                    }`}>
                      <Building2 className={`w-6 h-6 ${
                        selectedBusinessUnit === bu.name
                          ? isDarkMode ? 'text-red-300' : 'text-red-600'
                          : isDarkMode ? 'text-slate-300' : 'text-slate-600'
                      }`} />
                    </div>
                    
                  </div>
                  
                  <h3 className={`font-bold text-lg mb-2 ${
                    selectedBusinessUnit === bu.name
                      ? isDarkMode ? 'text-red-300' : 'text-red-700'
                      : isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {bu.name}
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className={`${
                        selectedBusinessUnit === bu.name
                          ? isDarkMode ? 'text-red-200' : 'text-red-600'
                          : isDarkMode ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        Reports Submitted
                      </span>
                      <span className={`font-semibold ${
                        selectedBusinessUnit === bu.name
                          ? isDarkMode ? 'text-red-300' : 'text-red-700'
                          : isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {buDivisionsReported}
                      </span>
                    </div>
                    
                    {hasUrgentIssues && (
                      <div className="flex items-center justify-between text-sm">
                        <span className={`${
                          selectedBusinessUnit === bu.name
                            ? isDarkMode ? 'text-red-200' : 'text-red-600'
                            : isDarkMode ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          Urgent Issues
                        </span>
                        <span className={`font-semibold ${
                          isDarkMode ? 'text-red-400' : 'text-red-600'
                        }`}>
                          {buUrgentCount}
                        </span>
                      </div>
                    )}
                    
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reports Section for Selected Business Unit */}
      {selectedBusinessUnit && (
        <div className={`rounded-2xl shadow-xl border transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200/50'}`}>
          {/* Header for Selected Business Unit */}
          <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-3 rounded-xl">
                  <Building2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {selectedBusinessUnit}
                  </h2>
                  <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Week of {formatWeekLabel(selectedWeek)}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedBusinessUnit(null)}
                className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                  isDarkMode 
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Back to Selection
              </button>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className={`text-center p-4 rounded-xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {divisionsReported}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Reports Submitted
                </div>
              </div>
              <div className={`text-center p-4 rounded-xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {urgentIssuesCount}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Urgent Issues
                </div>
              </div>
            </div>
          </div>
          
          {/* Reports Content */}
          <div className="p-6">
            {selectedBUReports.length === 0 ? (
              <div className="text-center py-12">
                <div className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} mb-6`}>
                  <Clock className="w-16 h-16 mx-auto" />
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  No Reports Yet
                </h3>
                <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  No reports have been submitted for {selectedBusinessUnit} for this week.
                </p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                {selectedBUReports.map(r => (
                  <ReportCard key={r.id} report={r} isDarkMode={isDarkMode} />
                ))}
              </div>
            )}

            {/* Missing Reports Alert */}
            {totalDivisionsForBU && divisionsReported < totalDivisionsForBU && (
              <div className={`mt-6 rounded-xl p-4 border ${isDarkMode ? 'bg-amber-900/20 border-amber-800/50' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-amber-900/30' : 'bg-amber-100'}`}>
                    <Users className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                      {totalDivisionsForBU - divisionsReported} division(s) haven't submitted their reports yet
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-amber-200' : 'text-amber-700'}`}>
                      Waiting for complete coverage for this week.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}