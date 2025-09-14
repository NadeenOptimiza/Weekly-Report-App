@@ .. @@
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
                          {new Date().toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <select
                          value={statusUpdates[issue.id] || issue.status}
                          onChange={(e) => handleStatusChange(issue.id, e.target.value as 'Pending' | 'Noted' | 'Completed')}
                          className={`px-3 py-1 text-xs font-medium rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
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
                            className={`flex items-center px-3 py-1 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              isDarkMode 
                                ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50' 
                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            }`}
                          >
                            {savingIssues.has(issue.id) ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1"></div>
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