import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, LogOut, Mail, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const RestrictedAccess = () => {
  const { user, logout } = useAuth();
  const reason = user?.restrictionReason || "Violation of community guidelines";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-100"
      >
        <div className="bg-red-600 p-8 flex justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ShieldAlert size={80} className="text-white" />
          </motion.div>
        </div>
        
        <div className="p-8 text-center">
          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
            Account Restricted
          </h1>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-left rounded-r-xl">
             <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Written Reason:</p>
             <p className="text-sm text-red-800 font-medium leading-relaxed italic">
                "{reason}"
             </p>
          </div>
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            This restriction was applied by the <span className="font-bold text-gray-900">DBU Student Union Coordinator</span>. 
            Please contact the office to resolve this matter.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center gap-3 text-sm text-gray-500 bg-gray-50 p-3 rounded-xl">
              <Mail size={18} className="text-red-500" />
              <span>studentunion@dbu.edu.et</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-sm text-gray-500 bg-gray-50 p-3 rounded-xl">
              <Phone size={18} className="text-red-500" />
              <span>+251 911 223344</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            <LogOut size={20} />
            Logout from Session
          </button>
        </div>

        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
            DBU Student Union Management System
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RestrictedAccess;
