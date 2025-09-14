import React from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { customYearWeek, getSundayOfCustomWeek } from '../utils/week-mapping';

interface WeekSelectorProps {
  selectedWeek: string;
  onWeekChange: (week: string) => void;
  isDarkMode: boolean;
}

// Generate weeks for the current year using custom Sunday-Thursday weeks
const generateAvailableWeeks = () => {
  const weeks = [];
  const today = new Date();
  const currentWeekInfo = customYearWeek(today);
  
  // Generate weeks for 2025, starting from week 26 up to current week + 4 future weeks
  const year = 2025;
  const startWeek = 26;
  
  // Determine end week - include current week + 4 future weeks (locked) if we're in 2025
  let endWeek = 52; // Default to end of year
  if (currentWeekInfo.year === year) {
    endWeek = Math.min(currentWeekInfo.week + 1, 52); // Current week + 1 future week (next week), but not beyond week 52
  }
  
  console.log('generateAvailableWeeks - Generating weeks from', startWeek, 'to', endWeek, 'for year', year);
  
  for (let weekNum = startWeek; weekNum <= endWeek; weekNum++) {
    // Get the Sunday of this custom week
    const weekStart = getSundayOfCustomWeek(year, weekNum);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4); // 5 days: Sunday to Thursday
    
    // Verify the week calculation  
    const verifyWeek = customYearWeek(weekStart);
    console.log(`generateAvailableWeeks - Week ${weekNum}: Sunday=${weekStart.toISOString().split('T')[0]}, calculated custom week=${verifyWeek.week}`);
    
    // If there's a mismatch, log a warning
    if (verifyWeek.week !== weekNum) {
      console.warn(`Week calculation mismatch! Expected week ${weekNum}, but Sunday ${weekStart.toISOString().split('T')[0]} calculates to week ${verifyWeek.week}`);
    }
    
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const start = weekStart.toLocaleDateString('en-US', options);
    const end = weekEnd.toLocaleDateString('en-US', options);
    
    // Check if this week is in the future
    const isFuture = (year > currentWeekInfo.year) || (year === currentWeekInfo.year && weekNum > currentWeekInfo.week);
    const isCurrent = (year === currentWeekInfo.year && weekNum === currentWeekInfo.week);
    const isNextWeek = (year === currentWeekInfo.year && weekNum === currentWeekInfo.week + 1);
    const isPast = (year < currentWeekInfo.year) || (year === currentWeekInfo.year && weekNum < currentWeekInfo.week);
    const isDisabled = (isFuture && !isNextWeek) || isPast; // Future weeks (except next week) and past weeks are disabled/locked
    
    weeks.push({
      value: weekStart.toISOString().split('T')[0],
      label: `${start} - ${end}, ${year}`,
      weekNumber: weekNum,
      year: year,
      isFuture,
      isCurrent,
      isNextWeek,
      isDisabled,
      isPast
    });
  }
  
  // Sort by date descending (most recent first)
  return weeks.sort((a, b) => b.value.localeCompare(a.value));
};

export default function WeekSelector({ selectedWeek, onWeekChange, isDarkMode }: WeekSelectorProps) {
  const availableWeeks = generateAvailableWeeks();
  const currentIndex = availableWeeks.findIndex(week => week.value === selectedWeek);
  const canGoPrevious = currentIndex < availableWeeks.length - 1;
  const canGoNext = currentIndex > 0;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onWeekChange(availableWeeks[currentIndex + 1].value);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onWeekChange(availableWeeks[currentIndex - 1].value);
    }
  };

  const currentWeek = availableWeeks.find(week => week.value === selectedWeek);
  const currentWeekLabel = currentWeek?.label || '';
  const currentWeekNumber = currentWeek?.weekNumber || 1;

  // Debug logging to help troubleshoot
  React.useEffect(() => {
    console.log('WeekSelector - Selected week (Monday date):', selectedWeek);
    
    // Find the week data for the selected week
    const selectedWeekData = availableWeeks.find(w => w.value === selectedWeek);
    if (selectedWeekData) {
      console.log('WeekSelector - Selected week data:', {
        weekNumber: selectedWeekData.weekNumber,
        mondayDate: selectedWeekData.value,
        label: selectedWeekData.label
      });
      
      // Verify the ISO week calculation
      const testDate = new Date(selectedWeek + 'T00:00:00Z');
      const testWeekInfo = customYearWeek(testDate);
      console.log('WeekSelector - ISO week calculation test for selected week:', {
        selectedWeek,
        expectedWeekNumber: selectedWeekData.weekNumber,
        calculatedCustomWeek: testWeekInfo.week,
        calculatedCustomYear: testWeekInfo.year,
        match: testWeekInfo.week === selectedWeekData.weekNumber
      });
      
      if (testWeekInfo.week !== selectedWeekData.weekNumber) {
        console.error('WeekSelector - MISMATCH: Expected week', selectedWeekData.weekNumber, 'but calculated week', testWeekInfo.week, 'for date', selectedWeek);
      }
    }
  }, [selectedWeek, availableWeeks]);

  return (
    <div className={`rounded-xl shadow-lg border backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${
      isDarkMode 
        ? 'bg-slate-800 border-slate-700/50' 
        : 'bg-white border-slate-200/50'
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            className={`p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md transform hover:scale-105 ${
              isDarkMode 
                ? 'hover:bg-slate-700 bg-slate-700/50' 
                : 'hover:bg-slate-100 bg-slate-50'
            }`}
            title="Previous week"
          >
            <ChevronLeft className={`w-5 h-5 transition-colors duration-300 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`} />
          </button>

          <div className="flex items-center space-x-4 px-4">
            <div className={`p-2 rounded-xl shadow-sm ${
              isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
            }`}>
              <Clock className={`w-5 h-5 ${
                isDarkMode ? 'text-red-400' : 'text-red-600'
              }`} />
            </div>
            <div className="text-center">
              <select
                value={selectedWeek}
                onChange={(e) => {
                  const selectedWeekData = availableWeeks.find(w => w.value === e.target.value);
                  if (selectedWeekData && !selectedWeekData.isDisabled) {
                    onWeekChange(e.target.value);
                  }
                }}
                className={`text-center font-bold bg-transparent border-none focus:outline-none cursor-pointer transition-all duration-200 text-lg min-w-0 ${
                  isDarkMode 
                    ? 'text-white hover:text-red-400 focus:text-red-400' 
                    : 'text-slate-900 hover:text-red-600 focus:text-red-600'
                }`}
                style={{ appearance: 'none', WebkitAppearance: 'none' }}
              >
                {availableWeeks.map(week => (
                  <option 
                    key={week.value} 
                    value={week.value}
                    disabled={week.isDisabled}
                    className={`py-2 px-4 ${
                      week.isCurrent 
                        ? 'bg-blue-100 text-blue-800 font-bold' 
                        : week.isDisabled 
                          ? 'text-gray-400 bg-gray-100' + (week.isPast ? ' line-through' : '')
                          : 'bg-white text-slate-900'
                    }`}
                  >
                    Week {week.weekNumber} - {week.label}
                    {week.isCurrent ? ' (Current)' : ''}
                    {week.isFuture && week.isDisabled ? ' (Locked)' : ''}
                    {week.isPast ? ' (Past - Locked)' : ''}
                  </option>
                ))}
              </select>
              <div className={`text-xs mt-1 font-medium ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {currentWeekLabel}
              </div>
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={`p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md transform hover:scale-105 ${
              isDarkMode 
                ? 'hover:bg-slate-700 bg-slate-700/50' 
                : 'hover:bg-slate-100 bg-slate-50'
            }`}
            title="Next week"
          >
            <ChevronRight className={`w-5 h-5 transition-colors duration-300 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`} />
          </button>
        </div>
      
        {/* Current Week Indicator */}
        {currentWeek?.isCurrent && (
          <div className={`mt-4 text-center text-sm font-medium px-4 py-2 rounded-full transition-all duration-300 ${
            isDarkMode 
              ? 'bg-blue-900/30 text-blue-300 border border-blue-800/50' 
              : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
            📅 You are currently in this week
          </div>
        )}

        {/* Week Navigation Info */}
        <div className={`mt-3 text-center text-xs ${
          isDarkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <span>Week {currentWeekNumber} of 2025</span>
          <span className="mx-2">•</span>
          <span>{availableWeeks.length} weeks available</span>
        </div>
      </div>
    </div>
  );
}