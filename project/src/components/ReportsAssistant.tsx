import React, { useState } from 'react';
import { askReportsAssistant, type AssistantResponse } from '../services/assistant';
import { MessageCircle, Send, Search, AlertCircle, Building2, Calendar, FileText } from 'lucide-react';

interface ReportsAssistantProps {
  isDarkMode: boolean;
}

export function ReportsAssistant({ isDarkMode }: ReportsAssistantProps) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await askReportsAssistant(trimmedQuery);
      setResponse(result);
    } catch (err: any) {
      console.error('Reports Assistant error:', err);
      setError(err.message || 'Failed to get response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const cleanSnippet = (snippet: string) => {
    return snippet.replace(/<\/?mark>/g, '');
  };

  return (
    <div className={`rounded-2xl shadow-xl border p-6 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200/50'
    }`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-red-100 p-3 rounded-xl">
          <MessageCircle className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 className={`text-xl font-bold transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>Reports Assistant</h3>
          <p className={`text-sm transition-colors duration-300 ${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>Ask questions about weekly reports and get AI-powered insights</p>
        </div>
      </div>

      {/* Query Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about urgent issues, highlights, business development, or planned activities..."
            disabled={loading}
            className={`flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
              isDarkMode 
                ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400' 
                : 'border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-500'
            }`}
          />
          <button 
            type="submit"
            disabled={loading || !query.trim()} 
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isDarkMode 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Ask</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className={`rounded-xl p-4 mb-6 flex items-center space-x-3 ${
          isDarkMode 
            ? 'bg-red-900/20 border border-red-800/50' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
            isDarkMode ? 'text-red-400' : 'text-red-600'
          }`} />
          <span className={`text-sm font-medium ${
            isDarkMode ? 'text-red-300' : 'text-red-800'
          }`}>
            {error}
          </span>
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="space-y-6">
          {/* AI Answer */}
          <div className={`rounded-xl p-6 shadow-sm border transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-blue-900/20 to-blue-800/30 border-blue-800/50' 
              : 'bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200/50'
          }`}>
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg flex-shrink-0 ${
                isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
              }`}>
                <MessageCircle className={`w-5 h-5 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold mb-3 transition-colors duration-300 ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-800'
                }`}>AI Assistant Response</h4>
                <div className={`whitespace-pre-wrap leading-relaxed transition-colors duration-300 ${
                  isDarkMode ? 'text-blue-200' : 'text-blue-700'
                }`}>
                  {response.answer}
                </div>
              </div>
            </div>
          </div>

          {/* Sources */}
          {response.hits && response.hits.length > 0 && (
            <div className={`rounded-xl p-6 shadow-sm border transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-slate-700/30 to-slate-800/30 border-slate-700/50' 
                : 'bg-gradient-to-r from-slate-50 to-slate-100/50 border-slate-200/50'
            }`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 rounded-lg ${
                  isDarkMode ? 'bg-slate-600/50' : 'bg-slate-200'
                }`}>
                  <FileText className={`w-5 h-5 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`} />
                </div>
                <h4 className={`font-semibold transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Sources ({response.hits.length} report{response.hits.length !== 1 ? 's' : ''})
                </h4>
              </div>
              
              <div className="space-y-4">
                {response.hits.map((hit, index) => (
                  <div key={`${hit.id}-${index}`} className={`p-4 rounded-lg border transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-slate-700/50 border-slate-600/50' 
                      : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <Building2 className={`w-4 h-4 ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-500'
                        }`} />
                        <span className={`font-medium text-sm ${
                          isDarkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          {hit.business_unit}
                        </span>
                      </div>
                      {hit.division && (
                        <>
                          <span className={`text-sm ${
                            isDarkMode ? 'text-slate-500' : 'text-slate-400'
                          }`}>•</span>
                          <span className={`text-sm ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            {hit.division}
                          </span>
                        </>
                      )}
                      <div className="flex items-center space-x-2">
                        <Calendar className={`w-4 h-4 ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-500'
                        }`} />
                        <span className={`text-sm ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {formatDate(hit.report_date)}
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm leading-relaxed ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {cleanSnippet(hit.snippet)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!response && !loading && !error && (
        <div className={`text-center py-8 transition-colors duration-300 ${
          isDarkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">
            Ask me about urgent issues, highlights, business development, or planned activities from the weekly reports.
          </p>
          <p className="text-xs mt-2 opacity-75">
            Examples: "What are the urgent issues this week?" or "Show me highlights from the Sales division"
          </p>
        </div>
      )}
    </div>
  );
}