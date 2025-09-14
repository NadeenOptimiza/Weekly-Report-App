import React, { useState, useEffect } from 'react';
import { useWeeklyReports } from '../hooks/useDatabase';
import { supabase } from '../lib/supabase';
import { UrgentIssue } from '../types';
import { AlertCircle, Clock, Calendar, Building2, User, Save } from 'lucide-react';

interface PriorityIssuesProps {
  isDarkMode: boolean;
}

interface PriorityIssueWithContext extends UrgentIssue {
  issueNumber: string;
  businessUnit: string;
  division: string;
  reportDate: string;
  agingDays: number;
  category: string;
  status: 'Pending' | 'Noted' | 'Completed';
}

// AI-generated categories based on issue description keywords
const categorizeIssue = (description: string): string => {
  const desc = description.toLowerCase();
  
  if (desc.includes('security') || desc.includes('vulnerability') || desc.includes('breach') || desc.includes('hack')) {
    return 'Security';
  } else if (desc.includes('server') || desc.includes('downtime') || desc.includes('infrastructure') || desc.includes('network')) {
    return 'Infrastructure';
  } else if (desc.includes('staff') || desc.includes('employee') || desc.includes('resignation') || desc.includes('hiring') || desc.includes('hr')) {
    return 'Human Resources';
  } else if (desc.includes('client') || desc.includes('customer') || desc.includes('contract') || desc.includes('delivery')) {
    return 'Client Relations';
  } else if (desc.includes('financial') || desc.includes('budget') || desc.includes('cost') || desc.includes('expense')) {
    return 'Financial';
  } else if (desc.includes('system') || desc.includes('software') || desc.includes('bug') || desc.includes('error')) {
    return 'Technical';
  } else if (desc.includes('compliance') || desc.includes('audit') || desc.includes('regulation') || desc.includes('legal')) {
    return 'Compliance';
  } else if (desc.includes('performance') || desc.includes('slow') || desc.includes('optimization')) {
    return 'Performance';
  } else {
    return 'General';
  }
};

export function PriorityIssues({ isDarkMode }: PriorityIssuesProps) {
  const { reports, loading, error } = useWeeklyReports();
  const [businessUnitFilter, setBusinessUnitFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'aging' | 'created' | 'businessUnit'>('aging');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusUpdates, setStatusUpdates] = useState<Record<string, 'Pending' | 'Noted' | 'Completed'>>({});
  const [savingIssues, setSavingIssues] = useState<Set<string>>(new Set());

  // Extract all priority issues from reports
  const priorityIssues: PriorityIssueWithContext[] = React.useMemo(() => {
    if (!reports) return [];

    const issues: PriorityIssueWithContext[] = [];
    let issueCounter = 1;

    reports.forEach(report => {
      if (Array.isArray(report.urgentIssues)) {
        report.urgentIssues
          .filter(issue => issue.requiresAction && !issue.isCompleted) // Only non-completed issues requiring BU Manager action
          .forEach(issue => {
            const agingDays = Math.floor((Date.now() - new Date(issue.timestamp).getTime()) / (1000 * 60 * 60 * 24));
            
            let status: 'Pending' | 'Noted' | 'Completed' = 'Pending';
            if (issue.isCompleted) {
              status = 'Completed';
            } else if (issue.completedBy) {
              status = 'Noted';
            }

            issues.push({
              ...issue,
              issueNumber: `PI-${String(issueCounter).padStart(4, '0')}`,
              businessUnit: report.businessUnit,
              division: report.division || 'N/A',
              reportDate: report.week,
              agingDays,
              status
            });
            issueCounter++;
          });
      }
    });

    return issues;
  }, [reports]);

  // Get unique business units for filter
  const businessUnits = React.useMemo(() => {
    const units = [...new Set(priorityIssues.map(issue => issue.businessUnit))];
    return units.sort();
  }, [priorityIssues]);

  // Filter and sort issues
  const filteredIssues = React.useMemo(() => {
    let filtered = priorityIssues.filter(issue => {
      const matchesBusinessUnit = businessUnitFilter === 'All' || issue.businessUnit === businessUnitFilter;
      
      return matchesBusinessUnit;
    });

    // Sort issues
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'aging':
          comparison = a.agingDays - b.agingDays;
          break;
        case 'created':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'businessUnit':
          comparison = a.businessUnit.localeCompare(b.businessUnit);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [priorityIssues, businessUnitFilter, sortBy, sortOrder]);

  const handleSort = (field: 'aging' | 'created' | 'businessUnit') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleStatusChange = (issueId: string, newStatus: 'Pending' | 'Noted' | 'Completed') => {
    setStatusUpdates(prev => ({
      ...prev,
      [issueId]: newStatus
    }));
  };

  const handleSaveStatus = async (issueId: string) => {
    const newStatus = statusUpdates[issueId];
    if (!newStatus) return;

    setSavingIssues(prev => new Set(prev).add(issueId));
    
    try {
      // Find the report containing this issue
      const reportWithIssue = reports.find(report => 
        Array.isArray(report.urgentIssues) && 
        report.urgentIssues.some(issue => issue.id === issueId)
      );
      
      if (reportWithIssue) {
        // Update the issue in the report's urgent issues
        const updatedUrgentIssues = reportWithIssue.urgentIssues.map(issue => {
          if (issue.id === issueId) {
            return {
              ...issue,
              isCompleted: newStatus === 'Completed',
              completedAt: newStatus === 'Completed' ? new Date() : undefined,
              completedBy: newStatus === 'Completed' ? 'BU Manager' : undefined,
              status: newStatus
            };
          }
          return issue;
        });

        // Update the database with the modified urgent issues JSON
        const { error } = await supabase
          .from('weekly_reports')
          .update({ 
            urgent: JSON.stringify(updatedUrgentIssues)
          })
          .eq('id', parseInt(reportWithIssue.id));

        if (error) {
          throw error;
        }

        console.log(`Successfully updated issue ${issueId} to status: ${newStatus}`);
      }
      
      // Remove from pending updates after successful save
      setStatusUpdates(prev => {
        const updated = { ...prev };
        delete updated[issueId];
        return updated;
      });
      
    } catch (error) {
      console.error('Failed to update issue status:', error);
      // Show error message to user
      alert(`Failed to update issue status: ${error.message || 'Unknown error'}`);
    } finally {
      setSavingIssues(prev => {
        const updated = new Set(prev);
        updated.delete(issueId);
        return updated;
      });
    }
  };

  const getStatusColor = (status: string, hasUpdate: boolean = false) => {
    switch (status) {
      case 'Completed':
        return isDarkMode ? 'text-emerald-400 bg-emerald-900/30' : 'text-emerald-700 bg-emerald-100';
      case 'Noted':
        return isDarkMode ? 'text-blue-400 bg-blue-900/30' : 'text-blue-700 bg-blue-100';
      default:
        const baseColor = isDarkMode ? 'text-red-400 bg-red-900/30' : 'text-red-700 bg-red-100';
        return hasUpdate ? (isDarkMode ? 'text-orange-400 bg-orange-900/30' : 'text-orange-700 bg-orange-100') : baseColor;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className={`rounded-2xl shadow-xl border p-6 lg:p-8 ${isDarkMode ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200/50'}`}>
          <div className="animate-pulse">
            <div className={`h-8 rounded mb-4 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 rounded mb-6 w-2/3 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-16 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl shadow-xl border p-12 text-center ${isDarkMode ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200/50'}`}>
        <div className={`${isDarkMode ? 'text-red-400' : 'text-red-500'} mb-6`}>
          <AlertCircle className="w-20 h-20 mx-auto" />
        </div>
        <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Error Loading Priority Issues
        </h3>
        <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl shadow-xl border p-6 lg:p-8 ${isDarkMode ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200/50'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-3 rounded-xl">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Priority Issues Dashboard
              </h1>
              <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                All urgent issues requiring BU Manager action across all business units
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Total Issues: 
              </span>
              <span className={`text-lg font-bold ml-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                {priorityIssues.length}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Business Unit Filter */}
          <select
            value={businessUnitFilter}
            onChange={(e) => setBusinessUnitFilter(e.target.value)}
            className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
              isDarkMode 
                ? 'border-slate-600 bg-slate-700 text-white' 
                : 'border-slate-300 bg-slate-50 text-slate-900'
            }`}
          >
            <option value="All">All Business Units</option>
            {businessUnits.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}
            className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
              isDarkMode 
                ? 'border-slate-600 bg-slate-700 text-white' 
                : 'border-slate-300 bg-slate-50 text-slate-900'
            }`}
          >
            <option value="aging-desc">Oldest First</option>
            <option value="aging-asc">Newest First</option>
            <option value="created-desc">Recently Created</option>
            <option value="created-asc">Oldest Created</option>
            <option value="businessUnit-asc">Business Unit A-Z</option>
            <option value="businessUnit-desc">Business Unit Z-A</option>
          </select>
        </div>
      </div>

      {/* Issues Table */}
      <div className={`rounded-2xl shadow-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200/50'}`}>
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              No Priority Issues Found
            </h3>
            <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {businessUnitFilter !== 'All'
                ? 'Try adjusting your search criteria.' 
                : 'No urgent issues requiring BU Manager action at this time.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Issue #
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Description
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    <button
                      onClick={() => handleSort('businessUnit')}
                      className="flex items-center space-x-1 hover:text-red-500"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Business Unit</span>
                    </button>
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    <button
                      onClick={() => handleSort('aging')}
                      className="flex items-center space-x-1 hover:text-red-500"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Aging (Days)</span>
                    </button>
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Status
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-200'}`}>
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className={`hover:${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'} transition-colors`}>
                    <td className="px-6 py-4">
                      <span className={`font-mono text-sm font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {issue.issueNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {issue.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <User className={`w-3 h-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                          <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {issue.submittedBy}
                          </span>
                          <Calendar className={`w-3 h-3 ml-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                          <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {new Date(issue.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {issue.businessUnit}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {issue.division}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-bold ${
                          issue.agingDays > 7 
                            ? isDarkMode ? 'text-red-400' : 'text-red-600'
                            : issue.agingDays > 3
                              ? isDarkMode ? 'text-orange-400' : 'text-orange-600'
                              : isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                        }`}>
                          {issue.agingDays}
                        </span>
                        <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          days
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          (statusUpdates[issue.id] || issue.status) === 'Completed'
                            ? isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                            : (statusUpdates[issue.id] || issue.status) === 'Noted'
                              ? isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                              : isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                        }`}>
                          {statusUpdates[issue.id] || issue.status}
                        </span>
                      </div>
                      {/* Show completion details if completed */}
                      {((statusUpdates[issue.id] || issue.status) === 'Completed') && (
                        <div className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          Completed by BU Manager<br/>
                          {issue.completedAt?.toLocaleDateString() || ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <select
                          value={statusUpdates[issue.id] || issue.status}
                          onChange={(e) => handleStatusChange(issue.id, e.target.value as 'Pending' | 'Noted' | 'Completed')}
                          className={`px-3 py-1 text-xs font-medium rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                            isDarkMode 
                              ? 'border-slate-600 bg-slate-700 text-white' 
                              : 'border-slate-300 bg-white text-slate-900'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Noted">Noted</option>
                          <option value="Completed">Complete</option>
                        </select>
                        
                        {statusUpdates[issue.id] && (
                          <button
                            onClick={() => handleSaveStatus(issue.id)}
                            disabled={savingIssues.has(issue.id)}
                            className={`flex items-center px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                              isDarkMode 
                                ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50' 
                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            }`}
                          >
                            {savingIssues.has(issue.id) ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                            ) : (
                              <Save className="w-3 h-3 mr-1" />
                            )}
                            Save
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}