import React, { useState, useEffect } from 'react';
import { TrendingUp, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TopDealsProps {
  isDarkMode: boolean;
}

interface Deal {
  id: string;
  opportunity: string;
  account: string;
  deal_value: number;
  probability: number;
  stage: string;
  business: string;
  division: string;
}

export function TopDeals({ isDarkMode }: TopDealsProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [businessUnits, setBusinessUnits] = useState<string[]>([]);
  const [divisions, setDivisions] = useState<string[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('all');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchTopDeals();
  }, [selectedBusiness, selectedDivision]);

  const fetchFilters = async () => {
    try {
      const { data: businessData } = await supabase
        .from('deals')
        .select('business')
        .not('business', 'is', null)
        .neq('business', '');

      const { data: divisionData } = await supabase
        .from('deals')
        .select('division')
        .not('division', 'is', null)
        .neq('division', '');

      const uniqueBusinesses = [...new Set(businessData?.map(d => d.business) || [])].sort();
      const uniqueDivisions = [...new Set(divisionData?.map(d => d.division) || [])].sort();

      setBusinessUnits(uniqueBusinesses);
      setDivisions(uniqueDivisions);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const fetchTopDeals = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('deals')
        .select('*');

      if (selectedBusiness !== 'all') {
        query = query.eq('business', selectedBusiness);
      }

      if (selectedDivision !== 'all') {
        query = query.eq('division', selectedDivision);
      }

      const { data, error } = await query
        .order('deal_value', { ascending: false })
        .limit(5);

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
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

        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
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

          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
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
              {divisions.map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className={`text-center py-12 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p>Loading deals...</p>
          </div>
        ) : deals.length === 0 ? (
          <div className={`text-center py-12 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <TrendingUp className={`w-16 h-16 mx-auto mb-4 ${
              isDarkMode ? 'text-slate-600' : 'text-slate-300'
            }`} />
            <h3 className={`text-lg font-semibold mb-2 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              No Deals Found
            </h3>
            <p>Upload deals data to see the top 5 opportunities.</p>
          </div>
        ) : (
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
                        {deal.opportunity}
                      </h3>
                    </div>
                    <p className={`text-sm mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {deal.account}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        isDarkMode ? 'bg-slate-600 text-slate-200' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {deal.business}
                      </span>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        isDarkMode ? 'bg-slate-600 text-slate-200' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {deal.division}
                      </span>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {deal.stage}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                      {formatCurrency(deal.deal_value)}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {deal.probability}% probability
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
