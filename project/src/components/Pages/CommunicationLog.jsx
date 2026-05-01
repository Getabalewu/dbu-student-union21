import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

export const CommunicationLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCommunicationLog();
      setLogs(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch communication logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-16">
      <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 mt-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Coordinator Communication Log</h1>
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 shadow-sm border border-red-100">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading communications...</div>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm text-center py-16 border border-gray-100">
            <p className="text-gray-500">No student messages have been submitted yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Club</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student Sender</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Question / Content</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rep Response</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((msg) => (
                    <tr key={msg._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                        {msg.club?.name || 'Unknown Club'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="font-medium">{msg.sender?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{msg.sender?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs break-words">
                        {msg.content}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs break-words italic">
                        {msg.response ? msg.response : <span className="text-gray-300">No response yet</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(msg.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          msg.status === 'Answered' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {msg.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
