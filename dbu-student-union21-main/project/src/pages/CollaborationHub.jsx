import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Share2, 
  Upload, 
  MessageSquare, 
  FileText, 
  Search, 
  Plus, 
  Download, 
  Calendar,
  Users,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';

export const CollaborationHub = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data for initial state
  const [documents, setDocuments] = useState([
    { id: 1, title: 'Annual Gala Guidelines', author: 'Sports Club', date: '2024-04-10', type: 'PDF' },
    { id: 2, title: 'Volunteer Coordination Sheet', author: 'Rotaract', date: '2024-04-12', type: 'XLSX' },
    { id: 3, title: 'Inter-Club Debate Rules', author: 'Literary Society', date: '2024-04-15', type: 'DOCX' },
  ]);

  const [requests, setRequests] = useState([
    { id: 1, title: 'Need Sound System for Friday', club: 'Drama Club', status: 'Open' },
    { id: 2, title: 'Collaboration for Tech Fest', club: 'Google Developers Group', status: 'Urgent' },
  ]);

  const isRep = user?.role === 'club_rep' || user?.role === 'representative' || user?.isAdmin;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Share2 className="text-blue-600 w-8 h-8" />
              Collaboration Hub (Restored)
            </h1>
            <p className="text-gray-600 mt-1">Connect, share resources, and coordinate with other clubs.</p>
          </div>

          <div className="flex items-center gap-3">
            {isRep && (
              <>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md">
                  <Upload className="w-4 h-4" /> Upload Document
                </button>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md">
                  <Plus className="w-4 h-4" /> Post Request
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Document Library */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="text-blue-500" />
                  Shared Document Library
                </h2>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search documents..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                      <th className="px-6 py-4">Document Title</th>
                      <th className="px-6 py-4">Uploaded By</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-[10px]">
                              {doc.type}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{doc.title}</p>
                              <p className="text-xs text-gray-500">{doc.date}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-600">{doc.author}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all">
                            <Download className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Discussion Post (Mock) */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="text-xl font-bold mb-2">Inter-Club Collaboration</h3>
              <p className="text-blue-100 mb-4 text-sm">Working on a combined event? Create a private workspace or share assets here to speed up coordination between committees.</p>
              <button className="bg-white text-blue-600 px-6 py-2 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-md">
                Learn More
              </button>
            </div>
          </div>

          {/* Sidebar: Open Requests */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                <MessageSquare className="text-indigo-500" />
                Active Requests
              </h2>
              
              <div className="space-y-4">
                {requests.map((req) => (
                  <div key={req.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-indigo-200 transition-all">
                    <div className="flex justify-between items-start mb-2">
                       <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                         req.status === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                       }`}>
                         {req.status}
                       </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">{req.title}</h4>
                    <p className="text-[10px] text-gray-500 uppercase font-black">{req.club}</p>
                    <button className="mt-3 w-full py-2 bg-white text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100 hover:bg-indigo-50 transition-all">
                      Respond
                    </button>
                  </div>
                ))}
              </div>
              
              <button className="mt-6 w-full py-3 text-gray-400 text-xs font-bold hover:text-gray-600 transition-all uppercase tracking-widest">
                View All Requests
              </button>
            </div>

            {/* Hub Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 text-sm mb-4 uppercase tracking-wider">Platform Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl text-center">
                  <p className="text-2xl font-black text-blue-600">12</p>
                  <p className="text-[10px] text-blue-800 font-bold uppercase">Clubs Active</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl text-center">
                  <p className="text-2xl font-black text-indigo-600">45</p>
                  <p className="text-[10px] text-indigo-800 font-bold uppercase">Shared Assets</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
