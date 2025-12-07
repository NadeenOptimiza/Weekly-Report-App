import React, { useState, useEffect } from 'react';
import { TrendingUp, Filter, DollarSign, Target, BarChart3, PieChart, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TopDealsProps {
  isDarkMode: boolean;
}

interface Deal {
  id: string;
  'Opportunity Name': string;
  'Account Name': string;
  'Deal Value': number;
  'Probability (%)': number;
  'Stage': string;
  'Business Unit': string;
  'Division': string;
  'Gross Margin Value'?: number;
  'Gross Margin %'?: number;
  'Forecast Level'?: string;
}

interface DashboardMetrics {
  totalPipelineValue: number;
  weightedPipelineValue: number;
  committedCount: number;
  committedValue: number;
  forecastedCount: number;
  forecastedValue: number;
  totalDeals: number;
  avgProbability: number;
  topStages: { stage: string; count: number; value: number }[];
}

export function TopDeals({ isDarkMode }: TopDealsProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [allDeals, setAllDeals] = useState<Deal[]>([]);
  const [businessUnits, setBusinessUnits] = useState<string[]>([]);
  const [allDivisions, setAllDivisions] = useState<string[]>([]);
  const [filteredDivisions, setFilteredDivisions] = useState<string[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('all');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    filterDivisionsByBusiness();
  }, [selectedBusiness, allDivisions]);

  useEffect(() => {
    fetchTopDeals();
  }, [selectedBusiness, selectedDivision]);

  const fetchFilters = async () => {
    try {
      const { data: businessData, error: businessError } = await supabase
        .from('deals')
        .select('"Business Unit", "Deal Value"')
        .not('"Business Unit"', 'is', null)
        .neq('"Business Unit"', '');

      if (businessError) {
        console.error('Error fetching business units:', businessError);
        throw businessError;
      }

      const { data: divisionData, error: divisionError } = await supabase
        .from('deals')
        .select('"Division", "Deal Value"')
        .not('"Division"', 'is', null)
        .neq('"Division"', '');

      if (divisionError) {
        console.error('Error fetching divisions:', divisionError);
        throw divisionError;
      }

      // Extract unique values from data
      const uniqueBusinesses = [...new Set((businessData || []).map(d => d['Business Unit']))].sort();
      const uniqueDivisions = [...new Set((divisionData || []).map(d => d['Division']))].sort();

      setBusinessUnits(uniqueBusinesses);
      setAllDivisions(uniqueDivisions);
      setFilteredDivisions(uniqueDivisions);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const filterDivisionsByBusiness = async () => {
    if (selectedBusiness === 'all') {
      setFilteredDivisions(allDivisions);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('deals')
        .select('"Division", "Deal Value"')
        .eq('"Business Unit"', selectedBusiness)
        .not('"Division"', 'is', null)
        .neq('"Division"', '');

      if (error) {
        console.error('Error filtering divisions:', error);
        setFilteredDivisions([]);
        return;
      }

      // Extract unique divisions
      const uniqueDivisions = [...new Set((data || []).map(d => d['Division']))].sort();
      setFilteredDivisions(uniqueDivisions);

      if (selectedDivision !== 'all' && !uniqueDivisions.includes(selectedDivision)) {
        setSelectedDivision('all');
      }
    } catch (error) {
      console.error('Error filtering divisions:', error);
      setFilteredDivisions([]);
    }
  };

  const fetchTopDeals = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('deals')
        .select('*');

      if (selectedBusiness !== 'all') {
        query = query.eq('"Business Unit"', selectedBusiness);
      }

      if (selectedDivision !== 'all') {
        query = query.eq('"Division"', selectedDivision);
      }

      const { data: allData, error: allError } = await query;

      if (allError) {
        console.error('Error fetching deals:', allError);
        throw allError;
      }

      // Helper function to parse Deal Value (handles both "JOD 10,000.00" and plain numbers)
      const parseDealValue = (value: any): number => {
        if (value === null || value === undefined) return 0;
        const strValue = String(value).trim();

        // If it starts with currency code, extract the number
        if (strValue.startsWith('JOD')) {
          // Remove "JOD" prefix and any commas, then parse
          const numericPart = strValue.replace(/^JOD\s*/i, '').replace(/,/g, '');
          return Number(numericPart) || 0;
        }

        // Otherwise, just parse as number
        return Number(value) || 0;
      };

      // Use all data (Deal Value is stored as numeric in database)
      const filteredData = allData || [];

      // Convert numeric string fields to actual numbers
      const normalizedData = filteredData.map(deal => ({
        ...deal,
        'Deal Value': parseDealValue(deal['Deal Value']),
        'Probability (%)': Number(deal['Probability (%)']) || 0,
        'Gross Margin Value': deal['Gross Margin Value'] ? Number(deal['Gross Margin Value']) : undefined,
        'Gross Margin %': deal['Gross Margin %'] ? Number(deal['Gross Margin %']) : undefined,
      }));

      setAllDeals(normalizedData);

      const top5 = normalizedData
        .sort((a, b) => b['Deal Value'] - a['Deal Value'])
        .slice(0, 5);

      setDeals(top5);

      calculateMetrics(normalizedData);
    } catch (error: any) {
      console.error('Error fetching deals:', error);
      setMetrics(null);
      setDeals([]);
      setAllDeals([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (dealsData: Deal[]) => {
    if (dealsData.length === 0) {
      setMetrics(null);
      return;
    }

    const uniqueForecastLevels = [...new Set(dealsData.map(d => d['Forecast Level']))];
    console.log('Unique Forecast Level values in data:', uniqueForecastLevels);

    const totalPipelineValue = dealsData.reduce((sum, deal) => sum + deal['Deal Value'], 0);
    const weightedPipelineValue = dealsData.reduce((sum, deal) =>
      sum + (deal['Deal Value'] * (deal['Probability (%)'] / 100)), 0
    );

    const committedDeals = dealsData.filter(deal => {
      const level = (deal['Forecast Level'] || '').toLowerCase().trim();
      return level === 'committed' || level === 'commit';
    });
    const committedCount = committedDeals.length;
    const committedValue = committedDeals.reduce((sum, deal) => sum + deal['Deal Value'], 0);

    const forecastedDeals = dealsData.filter(deal => {
      const level = (deal['Forecast Level'] || '').toLowerCase().trim();
      return level === 'forecasted' || level === 'forecast' || level === 'most likely';
    });
    const forecastedCount = forecastedDeals.length;
    const forecastedValue = forecastedDeals.reduce((sum, deal) => sum + deal['Deal Value'], 0);

    console.log(`Committed: ${committedCount} deals, Forecasted: ${forecastedCount} deals`);

    const avgProbability = dealsData.reduce((sum, deal) => sum + deal['Probability (%)'], 0) / dealsData.length;

    const stageMap = new Map<string, { count: number; value: number }>();
    dealsData.forEach(deal => {
      const stage = deal['Stage'] || 'Unknown';
      const existing = stageMap.get(stage) || { count: 0, value: 0 };
      stageMap.set(stage, {
        count: existing.count + 1,
        value: existing.value + deal['Deal Value']
      });
    });

    const topStages = Array.from(stageMap.entries())
      .map(([stage, data]) => ({ stage, ...data }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    setMetrics({
      totalPipelineValue,
      weightedPipelineValue,
      committedCount,
      committedValue,
      forecastedCount,
      forecastedValue,
      totalDeals: dealsData.length,
      avgProbability,
      topStages
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-JO', {
      style: 'currency',
      currency: 'JOD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl shadow-xl border transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200/50'
      }`}>
        <div className={`px-6 py-5 border-b transition-colors duration-300 ${
          isDarkMode ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
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
                  Deals Dashboard
                </h2>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Pipeline metrics and top opportunities
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
              <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Business Unit
              </label>
              <div className="flex items-center gap-2">
                <Filter className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                <select
                  value={selectedBusiness}
                  onChange={(e) => setSelectedBusiness(e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border transition-colors duration-200 ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  } focus:outline-none focus:ring-2 focus:ring-red-500`}
                >
                  <option value="all">All Business Units</option>
                  {businessUnits.map(bu => (
                    <option key={bu} value={bu}>{bu}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
              <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Division
              </label>
              <div className="flex items-center gap-2">
                <Filter className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border transition-colors duration-200 ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  } focus:outline-none focus:ring-2 focus:ring-red-500`}
                >
                  <option value="all">All Divisions</option>
                  {filteredDivisions.map(div => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className={`text-center py-16 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium">Loading dashboard...</p>
          </div>
        ) : !metrics ? (
          <div className={`text-center py-16 px-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <div className={`inline-flex p-4 rounded-full mb-6 ${
              isDarkMode ? 'bg-slate-700' : 'bg-slate-100'
            }`}>
              <TrendingUp className={`w-16 h-16 ${
                isDarkMode ? 'text-slate-500' : 'text-slate-400'
              }`} />
            </div>
            <h3 className={`text-2xl font-bold mb-3 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              No Deals Found
            </h3>
            <p className={`text-lg mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Upload deals data through the Data Admin page to view pipeline metrics and top opportunities.
            </p>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
              isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'
            }`}>
              <span className="text-sm">💡 Tip: You need to be logged in as an admin to upload data</span>
            </div>
          </div>
        ) : (
          <>
            {/* Metrics Cards */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 rounded-xl border transition-all duration-200 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/30 border-blue-800/50'
                  : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <Briefcase className={`w-5 h-5 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <span className={`text-xs font-medium ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    Total Pipeline
                  </span>
                </div>
                <p className={`text-2xl font-bold ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  {formatCurrency(metrics.totalPipelineValue)}
                </p>
                <p className={`text-xs mt-1 ${
                  isDarkMode ? 'text-blue-200' : 'text-blue-600'
                }`}>
                  {metrics.totalDeals} deals
                </p>
              </div>

              <div className={`p-4 rounded-xl border transition-all duration-200 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-emerald-900/20 to-emerald-800/30 border-emerald-800/50'
                  : 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <Target className={`w-5 h-5 ${
                    isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                  }`} />
                  <span className={`text-xs font-medium ${
                    isDarkMode ? 'text-emerald-300' : 'text-emerald-700'
                  }`}>
                    Weighted Pipeline
                  </span>
                </div>
                <p className={`text-2xl font-bold ${
                  isDarkMode ? 'text-emerald-300' : 'text-emerald-700'
                }`}>
                  {formatCurrency(metrics.weightedPipelineValue)}
                </p>
                <p className={`text-xs mt-1 ${
                  isDarkMode ? 'text-emerald-200' : 'text-emerald-600'
                }`}>
                  {metrics.avgProbability.toFixed(1)}% avg probability
                </p>
              </div>

              <div className={`p-4 rounded-xl border transition-all duration-200 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-amber-900/20 to-amber-800/30 border-amber-800/50'
                  : 'bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className={`w-5 h-5 ${
                    isDarkMode ? 'text-amber-400' : 'text-amber-600'
                  }`} />
                  <span className={`text-xs font-medium ${
                    isDarkMode ? 'text-amber-300' : 'text-amber-700'
                  }`}>
                    Committed
                  </span>
                </div>
                <p className={`text-2xl font-bold ${
                  isDarkMode ? 'text-amber-300' : 'text-amber-700'
                }`}>
                  {formatCurrency(metrics.committedValue)}
                </p>
                <p className={`text-base font-semibold mt-1 ${
                  isDarkMode ? 'text-amber-200' : 'text-amber-600'
                }`}>
                  {metrics.committedCount} {metrics.committedCount === 1 ? 'deal' : 'deals'}
                </p>
              </div>

              <div className={`p-4 rounded-xl border transition-all duration-200 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-purple-900/20 to-purple-800/30 border-purple-800/50'
                  : 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <PieChart className={`w-5 h-5 ${
                    isDarkMode ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                  <span className={`text-xs font-medium ${
                    isDarkMode ? 'text-purple-300' : 'text-purple-700'
                  }`}>
                    Forecasted
                  </span>
                </div>
                <p className={`text-2xl font-bold ${
                  isDarkMode ? 'text-purple-300' : 'text-purple-700'
                }`}>
                  {formatCurrency(metrics.forecastedValue)}
                </p>
                <p className={`text-base font-semibold mt-1 ${
                  isDarkMode ? 'text-purple-200' : 'text-purple-600'
                }`}>
                  {metrics.forecastedCount} {metrics.forecastedCount === 1 ? 'deal' : 'deals'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Top 5 Deals Section */}
      {metrics && deals.length > 0 && (
        <div className={`rounded-2xl shadow-xl border transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200/50'
        }`}>
          <div className={`px-6 py-5 border-b transition-colors duration-300 ${
            isDarkMode ? 'border-slate-700' : 'border-slate-200'
          }`}>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Top 5 Opportunities by Deal Value
            </h3>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {deals.map((deal, index) => (
                <div
                  key={deal.id}
                  className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                    isDarkMode
                      ? 'bg-slate-700/50 border-slate-600 hover:border-red-500/50'
                      : 'bg-slate-50 border-slate-200 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'
                        }`}>
                          {index + 1}
                        </span>
                        <h3 className={`font-semibold text-lg ${
                          isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          {deal['Opportunity Name']}
                        </h3>
                      </div>
                      <p className={`text-sm mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {deal['Account Name']}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          isDarkMode ? 'bg-slate-600 text-slate-200' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {deal['Business Unit']}
                        </span>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          isDarkMode ? 'bg-slate-600 text-slate-200' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {deal['Division']}
                        </span>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {deal['Stage']}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                        {formatCurrency(deal['Deal Value'])}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {deal['Probability (%)']}% probability
                      </p>
                      {deal['Gross Margin %'] !== undefined && deal['Gross Margin %'] !== null && typeof deal['Gross Margin %'] === 'number' && !isNaN(deal['Gross Margin %']) && (
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                          {deal['Gross Margin %'].toFixed(1)}% margin
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stage Breakdown Section */}
      {metrics && metrics.topStages.length > 0 && (
        <div className={`rounded-2xl shadow-xl border transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200/50'
        }`}>
          <div className={`px-6 py-5 border-b transition-colors duration-300 ${
            isDarkMode ? 'border-slate-700' : 'border-slate-200'
          }`}>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Pipeline by Stage
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {metrics.topStages.map((stage, index) => {
                const percentage = (stage.value / metrics.totalPipelineValue) * 100;
                return (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {stage.stage}
                        </span>
                        <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          ({stage.count} {stage.count === 1 ? 'deal' : 'deals'})
                        </span>
                      </div>
                      <span className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {formatCurrency(stage.value)}
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${
                      isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
                    }`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          index === 0
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                            : index === 1
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                            : index === 2
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                            : index === 3
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                            : 'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className={`text-xs text-right ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {percentage.toFixed(1)}% of total pipeline
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
