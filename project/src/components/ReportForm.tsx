import React, { useState, useEffect } from 'react';
import { useBusinessUnits, useDivisions, useSubmitReport, useReportData } from '../hooks/useDatabase';
import { useAuth } from '../hooks/useAuth';
import { UrgentIssue } from '../types';
import { getCurrentWeek } from '../data/sampleData';
import { customYearWeek } from '../utils/week-mapping';
import CalendarWeekSelector from './CalendarWeekSelector';
import { Send, AlertCircle, Star, TrendingUp, Target, ArrowLeft, CheckCircle, Plus, X, Clock, Flag } from 'lucide-react';

interface ReportFormProps {
  onSubmit: () => Promise<void>;
  onCancel: () => void;
  isDarkMode: boolean;
}

export function ReportForm({ onSubmit, onCancel, isDarkMode }: ReportFormProps) {
  const { businessUnits, loading: buLoading } = useBusinessUnits();
  const { divisions, loading: divLoading } = useDivisions();
  const { submitReport, loading: submitting } = useSubmitReport();
  const { user, profile } = useAuth();

  const [businessUnit, setBusinessUnit] = useState('');
  const [division, setDivision] = useState('');
  const [weekDate, setWeekDate] = useState(getCurrentWeek());
  const { reportData: existingReport, loading: reportLoading } = useReportData(businessUnit, division, weekDate);
  const [urgentIssues, setUrgentIssues] = useState<UrgentIssue[]>([]);
  const [newIssueText, setNewIssueText] = useState('');
  const [newIssueRequiresAction, setNewIssueRequiresAction] = useState(false);
  const [highlightOfWeek, setHighlightOfWeek] = useState('');
  const [businessDevelopment, setBusinessDevelopment] = useState('');
  const [plannedActivities, setPlannedActivities] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Auto-populate submittedBy from user profile
  const submittedBy = profile?.full_name || user?.email || '';

  // Check if the selected week is in the past (read-only mode)
  const isWeekInPast = () => {
    if (!weekDate) return false;
    
    const selectedDate = new Date(weekDate + 'T00:00:00Z');
    const { year: selectedYear, week: selectedWeek } = customYearWeek(selectedDate);
    
    const today = new Date();
    const { year: currentYear, week: currentWeek } = customYearWeek(today);
    
    return (selectedYear < currentYear) || (selectedYear === currentYear && selectedWeek < currentWeek);
  };

  const isPastWeek = isWeekInPast();

  // Pre-populate form with existing report data
  useEffect(() => {
    if (existingReport) {
      console.log('Populating form with existing report:', existingReport);
      setUrgentIssues(existingReport.urgentIssues || []);
      setHighlightOfWeek(existingReport.highlightOfWeek || '');
      setBusinessDevelopment(existingReport.businessDevelopment || '');
      setPlannedActivities(existingReport.plannedActivities || '');
    } else {
      // Clear form when no existing report
      console.log('No existing report found, clearing form');
      setUrgentIssues([]);
      setHighlightOfWeek('');
      setBusinessDevelopment('');
      setPlannedActivities('');
    }
  }, [existingReport]);

  // Form validation
  const isValid = businessUnit && division && weekDate && submittedBy.trim();

  const availableDivisions = businessUnit ? divisions[businessUnit] || [] : [];

  const addUrgentIssue = () => {
    if (!newIssueText.trim()) return;
    
    const newIssue: UrgentIssue = {
      id: Date.now().toString(),
      description: newIssueText.trim(),
      timestamp: new Date(),
      requiresAction: newIssueRequiresAction,
      isCompleted: false,
      status: 'Pending',
      submittedBy: submittedBy
    };
    
    setUrgentIssues(prev => [...prev, newIssue]);
    setNewIssueText('');
    setNewIssueRequiresAction(false);
  };

  const removeUrgentIssue = (issueId: string) => {
    setUrgentIssues(prev => prev.filter(issue => issue.id !== issueId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Merge current form data with existing report data
    // If a field is empty in the form but has content in existing report, preserve the existing content
    const mergedData = {
      urgentIssues: urgentIssues.length > 0 ? urgentIssues : (existingReport?.urgentIssues || []),
      highlightOfWeek: highlightOfWeek.trim() || (existingReport?.highlightOfWeek || ''),
      businessDevelopment: businessDevelopment.trim() || (existingReport?.businessDevelopment || ''),
      plannedActivities: plannedActivities.trim() || (existingReport?.plannedActivities || '')
    };

    try {
      await submitReport({
        businessUnitId: businessUnit,
        divisionId: division,
        weekDate,
        urgentIssues: mergedData.urgentIssues,
        highlightOfWeek: mergedData.highlightOfWeek,
        businessDevelopment: mergedData.businessDevelopment,
        plannedActivities: mergedData.plannedActivities,
        submittedBy
      });
      
      // Show success state
      setShowSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear form
      setBusinessUnit('');
      setDivision('');
      setWeekDate('');
      setUrgentIssues([]);
      setHighlightOfWeek('');
      setBusinessDevelopment('');
      setPlannedActivities('');
      
      // Show success toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      // Call parent onSubmit
      await onSubmit();
      
    } catch (error) {
      console.error('Failed to submit report:', error);
      // Show error message to user
      alert('Failed to submit report. Please try again.');
    } finally {
      setShowSuccess(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto relative">
      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-slide-in">
          <CheckCircle className="w-5 h-5 mr-2" />
          Report submitted successfully!
        </div>
      )}
      
      <div className={`rounded-2xl shadow-2xl border overflow-hidden transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-slate-800 border-slate-700/50' 
          : 'bg-white border-slate-200/50'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-6 lg:px-8 py-8 lg:py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-3">Weekly Activity Report</h1>
              <p className="text-red-100 text-lg">Submit your department's weekly activities and key updates</p>
            </div>
            <button
              onClick={onCancel}
              className="hidden lg:flex items-center px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-8">
          {/* Loading indicator for existing report data */}
          {reportLoading && (
            <div className={`rounded-xl p-4 flex items-center space-x-3 ${
              isDarkMode 
                ? 'bg-blue-900/20 border border-blue-800/50' 
                : 'bg-blue-50 border border-blue-200'
            }`}>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-blue-300' : 'text-blue-800'
              }`}>
                Loading existing report data...
              </span>
            </div>
          )}

          {/* Past week warning */}
          {isPastWeek && (
            <div className={`rounded-xl p-4 flex items-center space-x-3 ${
              isDarkMode 
                ? 'bg-amber-900/20 border border-amber-800/50' 
                : 'bg-amber-50 border border-amber-200'
            }`}>
              <AlertCircle className={`w-5 h-5 ${
                isDarkMode ? 'text-amber-400' : 'text-amber-600'
              }`} />
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-amber-300' : 'text-amber-800'
              }`}>
                This week is in the past and cannot be edited. You can only view the existing report.
              </span>
            </div>
          )}

          {/* Existing report indicator */}
          {existingReport && !reportLoading && (
            <div className={`rounded-xl p-4 flex items-center space-x-3 ${
              isDarkMode 
                ? 'bg-emerald-900/20 border border-emerald-800/50' 
                : 'bg-emerald-50 border border-emerald-200'
            }`}>
              <CheckCircle className={`w-5 h-5 ${
                isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
              }`} />
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-emerald-300' : 'text-emerald-800'
              }`}>
                Editing existing report - form pre-populated with current data
              </span>
            </div>
          )}

          {/* Business Unit and Division */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label htmlFor="businessUnit" className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Business Unit *
              </label>
              <select
                id="businessUnit"
                value={businessUnit}
                onChange={(e) => {
                  setBusinessUnit(e.target.value);
                  setDivision(''); // Reset division when business unit changes
                }}
                disabled={buLoading || isPastWeek}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                  isDarkMode 
                    ? 'border-slate-600 bg-slate-700 hover:bg-slate-600 text-white' 
                    : 'border-slate-300 bg-slate-50 hover:bg-white text-slate-900'
                } ${isPastWeek ? 'opacity-60 cursor-not-allowed' : ''}`}
                required
              >
                <option value="">{buLoading ? 'Loading...' : 'Select business unit'}</option>
                {businessUnits.map(bu => (
                  <option key={bu.id} value={bu.id}>{bu.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="division" className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Division *
              </label>
              <select
                id="division"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                disabled={!businessUnit || divLoading || isPastWeek}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                  isDarkMode 
                    ? 'border-slate-600 bg-slate-700 hover:bg-slate-600 text-white' 
                    : 'border-slate-300 bg-slate-50 hover:bg-white text-slate-900'
                } ${isPastWeek ? 'opacity-60 cursor-not-allowed' : ''}`}
                required
              >
                <option value="">{divLoading ? 'Loading...' : 'Select your division'}</option>
                {availableDivisions.map(div => (
                  <option key={div.id} value={div.id}>{div.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submitter Name */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label htmlFor="submittedBy" className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Submitted By *
              </label>
              <input
                type="text"
                id="submittedBy"
                value={submittedBy}
                readOnly
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                  isDarkMode 
                    ? 'border-slate-600 bg-slate-600 text-slate-300 cursor-not-allowed' 
                    : 'border-slate-300 bg-slate-100 text-slate-600 cursor-not-allowed'
                }`}
                placeholder="Auto-populated from your profile"
                required
              />
            </div>
            <div></div>
          </div>

          {/* Week Selector */}
          <CalendarWeekSelector
            value={weekDate}
            onChange={setWeekDate}
            isDarkMode={isDarkMode}
            disabled={isPastWeek}
          />

          {/* Urgent Issues */}
          <div className={`rounded-xl p-6 shadow-sm border transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-red-900/20 to-red-800/30 border-red-800/50' 
              : 'bg-gradient-to-r from-red-50 to-red-100/50 border-red-200/50'
          }`}>
            <div className="flex items-center mb-4">
              <div className={`p-2 rounded-lg mr-3 ${
                isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
              }`}>
                <AlertCircle className={`w-5 h-5 ${
                  isDarkMode ? 'text-red-400' : 'text-red-600'
                }`} />
              </div>
              <label className={`block text-sm font-semibold transition-colors duration-300 ${
                isDarkMode ? 'text-red-300' : 'text-red-800'
              }`}>
                Urgent Issues ({urgentIssues.length})
              </label>
            </div>
            
            {/* Existing Issues List */}
            <div className="space-y-3 mb-4">
              {urgentIssues.map((issue) => (
                <div key={issue.id} className={`p-4 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-slate-700/50 border-slate-600' 
                    : 'bg-white border-red-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className={`w-4 h-4 ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-500'
                        }`} />
                        <span className={`text-xs ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {issue.timestamp.toLocaleString()}
                        </span>
                        {issue.requiresAction && (
                          <div className="flex items-center space-x-1">
                            <Flag className="w-4 h-4 text-orange-500" />
                            <span className="text-xs text-orange-600 font-medium">
                              Requires BU Manager Action
                            </span>
                          </div>
                        )}
                      </div>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {issue.description}
                      </p>
                      <div className={`text-xs mt-1 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        Submitted by: {issue.submittedBy}
                      </div>
                    </div>
                    {!isPastWeek && (
                      <button
                        type="button"
                        onClick={() => removeUrgentIssue(issue.id)}
                        className={`ml-3 p-1 rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'hover:bg-red-900/30 text-red-400' 
                            : 'hover:bg-red-100 text-red-600'
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Issue */}
            {!isPastWeek && (
              <div className="space-y-3">
                <textarea
                  value={newIssueText}
                  onChange={(e) => setNewIssueText(e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm resize-none transition-colors ${
                    isDarkMode 
                      ? 'border-red-700 bg-slate-700 text-white placeholder-slate-400' 
                      : 'border-red-300 bg-white text-slate-900 placeholder-slate-500'
                  }`}
                  placeholder="Describe a new urgent issue..."
                />
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newIssueRequiresAction}
                      onChange={(e) => setNewIssueRequiresAction(e.target.checked)}
                      className="rounded border-red-300 text-red-600 focus:ring-red-500"
                    />
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-red-300' : 'text-red-700'
                    }`}>
                      Requires action from BU Manager
                    </span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={addUrgentIssue}
                    disabled={!newIssueText.trim()}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDarkMode 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Issue</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Highlight of the Week */}
          <div className={`rounded-xl p-6 shadow-sm border transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-emerald-900/20 to-emerald-800/30 border-emerald-800/50' 
              : 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-200/50'
          }`}>
            <div className="flex items-center mb-4">
              <div className={`p-2 rounded-lg mr-3 ${
                isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-100'
              }`}>
                <Star className={`w-5 h-5 ${
                  isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                }`} />
              </div>
              <label htmlFor="highlightOfWeek" className={`block text-sm font-semibold transition-colors duration-300 ${
                isDarkMode ? 'text-emerald-300' : 'text-emerald-800'
              }`}>
                Highlight of the Week
              </label>
            </div>
            <textarea
              id="highlightOfWeek"
              value={highlightOfWeek}
              onChange={(e) => setHighlightOfWeek(e.target.value)}
              rows={4}
              disabled={isPastWeek}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm resize-none transition-colors ${
                isDarkMode 
                  ? 'border-emerald-700 bg-slate-700 text-white placeholder-slate-400' 
                  : 'border-emerald-300 bg-white text-slate-900 placeholder-slate-500'
              } ${isPastWeek ? 'opacity-60 cursor-not-allowed' : ''}`}
              placeholder="Share your department's biggest achievement or positive outcome this week..."
            />
          </div>

          {/* Business Development */}
          <div className={`rounded-xl p-6 shadow-sm border transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-blue-900/20 to-blue-800/30 border-blue-800/50' 
              : 'bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200/50'
          }`}>
            <div className="flex items-center mb-4">
              <div className={`p-2 rounded-lg mr-3 ${
                isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
              }`}>
                <TrendingUp className={`w-5 h-5 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <label htmlFor="businessDevelopment" className={`block text-sm font-semibold transition-colors duration-300 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-800'
              }`}>
                Business Development Activities
              </label>
            </div>
            <textarea
              id="businessDevelopment"
              value={businessDevelopment}
              onChange={(e) => setBusinessDevelopment(e.target.value)}
              rows={4}
              disabled={isPastWeek}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm resize-none transition-colors ${
                isDarkMode 
                  ? 'border-blue-700 bg-slate-700 text-white placeholder-slate-400' 
                  : 'border-blue-300 bg-white text-slate-900 placeholder-slate-500'
              } ${isPastWeek ? 'opacity-60 cursor-not-allowed' : ''}`}
              placeholder="Describe business development initiatives, partnerships, or growth activities..."
            />
          </div>

          {/* Planned Activities */}
          <div className={`rounded-xl p-6 shadow-sm border transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-purple-900/20 to-purple-800/30 border-purple-800/50' 
              : 'bg-gradient-to-r from-purple-50 to-purple-100/50 border-purple-200/50'
          }`}>
            <div className="flex items-center mb-4">
              <div className={`p-2 rounded-lg mr-3 ${
                isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
              }`}>
                <Target className={`w-5 h-5 ${
                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                }`} />
              </div>
              <label htmlFor="plannedActivities" className={`block text-sm font-semibold transition-colors duration-300 ${
                isDarkMode ? 'text-purple-300' : 'text-purple-800'
              }`}>
                Planned Activities for Next Week
              </label>
            </div>
            <textarea
              id="plannedActivities"
              value={plannedActivities}
              onChange={(e) => setPlannedActivities(e.target.value)}
              rows={4}
              disabled={isPastWeek}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm resize-none transition-colors ${
                isDarkMode 
                  ? 'border-purple-700 bg-slate-700 text-white placeholder-slate-400' 
                  : 'border-purple-300 bg-white text-slate-900 placeholder-slate-500'
              } ${isPastWeek ? 'opacity-60 cursor-not-allowed' : ''}`}
              placeholder="Outline your department's key activities and goals for the upcoming week..."
            />
          </div>

          {/* Form Actions */}
          <div className={`flex flex-col sm:flex-row gap-4 pt-8 border-t transition-colors duration-300 ${
            isDarkMode ? 'border-slate-700' : 'border-slate-200'
          }`}>
            {!isPastWeek && (
              <button
                type="submit"
                disabled={!isValid || submitting || reportLoading}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center px-8 py-4 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                }`}
              >
                {showSuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Report Submitted!
                  </>
                ) : submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    {existingReport ? 'Update Report' : 'Submit Report'}
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={onCancel}
              className={`flex-1 sm:flex-none px-8 py-4 border font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200 ${
                isDarkMode 
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isPastWeek ? 'Back to Dashboard' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}