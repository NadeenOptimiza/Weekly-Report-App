import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getCurrentWeek } from '../data/sampleData';
import { isoYearWeek, getMondayOfISOWeek } from '../utils/week-mapping';

interface CalendarWeekSelectorProps {
  value: string;
  onChange: (weekStart: string) => void;
  isDarkMode: boolean;
}

const CalendarWeekSelector: React.FC<CalendarWeekSelectorProps> = ({ value, onChange, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Get current week info for restrictions - use Monday as reference but allow Sunday unlock
  const currentWeekMonday = getCurrentWeek(); // This returns Monday of current business week
  console.log('CalendarWeekSelector - Current week Monday:', currentWeekMonday);
  
  // Calculate the Monday of next week (for unlock logic)
  const getNextWeekMonday = () => {
    const monday = new Date(currentWeekMonday + 'T00:00:00Z');
    const nextMonday = new Date(monday);
    nextMonday.setUTCDate(monday.getUTCDate() + 7); // Next Monday is 7 days after current Monday
    return nextMonday.toISOString().split('T')[0];
  };
  
  const nextWeekMonday = getNextWeekMonday();
  console.log('CalendarWeekSelector - Next week Monday (for unlock):', nextWeekMonday);

  // Format week period display (Sunday to Thursday - 5 day business week)
  const formatWeekPeriod = (weekStart: Date) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4); // 5 days: Monday to Friday
    
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const start = weekStart.toLocaleDateString('en-US', options);
    const end = weekEnd.toLocaleDateString('en-US', options);
    
    return `${start} - ${end}`;
  };

  // Get current week info from the value prop
  const getCurrentWeekInfo = () => {
    if (!value) {
      // Default to current week if no value
      const currentDate = new Date(currentWeekMonday + 'T00:00:00Z');
      const { year, week } = isoYearWeek(currentDate);
      return { weekNumber: week, year };
    }
    
    const currentWeekStart = new Date(value + 'T00:00:00Z');
    if (isNaN(currentWeekStart.getTime())) {
      const currentDate = new Date(currentWeekMonday + 'T00:00:00Z');
      const { year, week } = isoYearWeek(currentDate);
      return { weekNumber: week, year };
    }
    
    const { year, week } = isoYearWeek(currentWeekStart);
    return { weekNumber: week, year };
  };

  const currentWeekInfoFromValue = getCurrentWeekInfo();
  const currentWeekStart = value ? new Date(value + 'T00:00:00Z') : new Date(currentWeekMonday + 'T00:00:00Z');
  const weekPeriod = !value || isNaN(currentWeekStart.getTime()) 
    ? formatWeekPeriod(new Date(currentWeekMonday + 'T00:00:00Z'))
    : formatWeekPeriod(currentWeekStart);

  // Generate weeks with rolling 52-week history + current week + next week
  const generateWeeksForYear = (year: number) => {
    const weeks = [];

    const today = new Date();
    const currentWeekInfo = isoYearWeek(today);

    console.log('CalendarWeekSelector - Current week info:', currentWeekInfo);

    // Calculate start point: 52 weeks ago from current week
    const weeksToGenerate = [];

    // Start from 52 weeks ago and go to next week
    for (let offset = -52; offset <= 1; offset++) {
      // Calculate the target week
      let targetYear = currentWeekInfo.year;
      let targetWeek = currentWeekInfo.week + offset;

      // Handle year boundaries
      while (targetWeek < 1) {
        targetYear--;
        targetWeek += 52; // Add 52 weeks from previous year
      }
      while (targetWeek > 52) {
        targetYear++;
        targetWeek -= 52; // Subtract 52 weeks for next year
      }

      weeksToGenerate.push({ year: targetYear, week: targetWeek, offset });
    }

    console.log('CalendarWeekSelector - Generating weeks from', weeksToGenerate[0], 'to', weeksToGenerate[weeksToGenerate.length - 1]);

    for (const { year: weekYear, week: weekNum, offset } of weeksToGenerate) {
      // Get the Monday of this ISO week
      const weekStart = getMondayOfISOWeek(weekYear, weekNum);

      const weekStartStr = weekStart.toISOString().split('T')[0];

      // Determine week status based on offset from current week
      const isCurrent = offset === 0;
      const isNextWeek = offset === 1;
      const isPast = offset < 0;
      const isFuture = offset > 1;

      // Past weeks are view-only (disabled), current and next week are enabled
      const isDisabled = isPast || isFuture;

      weeks.push({
        number: weekNum,
        year: weekYear,
        startDate: weekStart,
        period: formatWeekPeriod(weekStart),
        isoString: weekStartStr,
        isFuture,
        isCurrent,
        isDisabled,
        isPast
      });
    }

    return weeks;
  };

  const weeks = generateWeeksForYear(currentYear);
  const currentWeek = weeks.find(w => w.isoString === value);

  const handleWeekSelect = (week: typeof weeks[0]) => {
    if (!week.isDisabled) {
      onChange(week.isoString);
      setIsOpen(false);
    }
  };

  const handlePreviousWeek = () => {
    if (!value) return;
    
    const currentDate = new Date(value + 'T00:00:00Z');
    const previousWeek = new Date(currentDate);
    previousWeek.setUTCDate(currentDate.getUTCDate() - 7);
    
    const previousWeekStr = previousWeek.toISOString().split('T')[0];
    
    // Allow if not future (using Sunday as the cutoff for unlock)
    if (previousWeekStr < nextWeekMonday) {
      const availableWeek = weeks.find(w => w.isoString === previousWeekStr);
      if (availableWeek && !availableWeek.isDisabled) {
        onChange(previousWeekStr);
      }
    }
  };

  const handleNextWeek = () => {
    if (!value) return;
    
    const currentDate = new Date(value + 'T00:00:00Z');
    const nextWeek = new Date(currentDate);
    nextWeek.setUTCDate(currentDate.getUTCDate() + 7);
    
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    
    // Allow if not future (using Sunday as the cutoff for unlock)
    if (nextWeekStr < nextWeekMonday) {
      const availableWeek = weeks.find(w => w.isoString === nextWeekStr);
      if (availableWeek && !availableWeek.isDisabled) {
        onChange(nextWeekStr);
      }
    }
  };

  const canGoPrevious = () => {
    if (!value) return false;
    const currentDate = new Date(value + 'T00:00:00Z');
    const previousWeek = new Date(currentDate);
    previousWeek.setUTCDate(currentDate.getUTCDate() - 7);
    const previousWeekStr = previousWeek.toISOString().split('T')[0];
    const availableWeek = weeks.find(w => w.isoString === previousWeekStr);
    return availableWeek && !availableWeek.isDisabled;
  };

  const canGoNext = () => {
    if (!value) return false;
    const currentDate = new Date(value + 'T00:00:00Z');
    const nextWeek = new Date(currentDate);
    nextWeek.setUTCDate(currentDate.getUTCDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    const availableWeek = weeks.find(w => w.isoString === nextWeekStr);
    return availableWeek && !availableWeek.isDisabled;
  };

  useEffect(() => {
    setCurrentYear(currentWeekInfoFromValue.year);
  }, [value]);

  return (
    <div className="relative">
      <label className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
        isDarkMode ? 'text-slate-300' : 'text-slate-700'
      }`}>
        Week Starting (Monday) *
      </label>
      
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={handlePreviousWeek}
          disabled={!canGoPrevious()}
          className={`p-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isDarkMode 
              ? 'border-slate-600 hover:bg-slate-700' 
              : 'border-slate-300 hover:bg-slate-100'
          }`}
        >
          <ChevronLeft className={`w-4 h-4 transition-colors duration-300 ${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`} />
        </button>

        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors flex items-center justify-between ${
              isDarkMode 
                ? 'border-slate-600 bg-slate-700 hover:bg-slate-600 text-white' 
                : 'border-slate-300 bg-slate-50 hover:bg-white text-slate-900'
            } ${currentWeek?.isCurrent ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
          >
            <div className="flex items-center space-x-3">
              <Calendar className={`w-4 h-4 transition-colors duration-300 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`} />
              <div className="text-left">
                <div className={`font-semibold ${currentWeek?.isCurrent ? 'text-blue-600' : ''}`}>
                  Week {currentWeekInfoFromValue.weekNumber}, {currentWeekInfoFromValue.year}
                  {currentWeek?.isCurrent && ' (Current)'}
                </div>
                <div className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>{weekPeriod}</div>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 transition-all duration-300 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            } ${isOpen ? 'rotate-90' : ''}`} />
          </button>

          {isOpen && (
            <div className={`absolute top-full left-0 right-0 mt-1 border rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-600' 
                : 'bg-white border-slate-300'
            }`}>
              <div className="p-2">
                <div className={`text-center p-2 border-b mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'border-slate-700' : 'border-slate-200'
                }`}>
                  <span className={`font-semibold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>Custom Weeks (Sun-Thu)</span>
                </div>
                
                <div className="grid grid-cols-1 gap-1">
                  {weeks.map((week) => (
                    <button
                      key={`${week.year}-${week.number}`}
                      type="button"
                      onClick={() => handleWeekSelect(week)}
                      disabled={week.isDisabled}
                      className={`p-2 text-left rounded-lg transition-colors ${
                        week.isoString === value 
                          ? isDarkMode 
                            ? 'bg-red-900/30 text-red-400 font-medium' 
                            : 'bg-red-100 text-red-700 font-medium'
                          : week.isCurrent
                            ? isDarkMode
                              ? 'bg-blue-900/30 text-blue-400 font-medium border border-blue-800/50'
                              : 'bg-blue-100 text-blue-700 font-medium border border-blue-200'
                            : week.isDisabled
                              ? isDarkMode
                                ? 'text-slate-500 cursor-not-allowed opacity-50' + (week.isPast ? ' line-through' : '')
                                : 'text-slate-400 cursor-not-allowed opacity-50'
                              : isDarkMode
                                ? 'text-slate-300 hover:bg-slate-700'
                                : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          Week {week.number}, {week.year}
                          {week.isCurrent && ' (Current)'}
                          {week.isFuture && ' (Locked)'}
                          {week.isPast && ' (Past - Locked)'}
                        </span>
                        <span className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}>{week.period}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleNextWeek}
          disabled={!canGoNext()}
          className={`p-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isDarkMode 
              ? 'border-slate-600 hover:bg-slate-700' 
              : 'border-slate-300 hover:bg-slate-100'
          }`}
        >
          <ChevronRight className={`w-4 h-4 transition-colors duration-300 ${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`} />
        </button>
      </div>

      {/* Current Week Indicator */}
      {currentWeek?.isCurrent && (
        <div className={`mt-3 text-center text-xs font-medium px-3 py-1 rounded-full ${
          isDarkMode 
            ? 'bg-blue-900/30 text-blue-300 border border-blue-800/50' 
            : 'bg-blue-100 text-blue-700 border border-blue-200'
        }`}>
          📅 You are currently in this week
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default CalendarWeekSelector;