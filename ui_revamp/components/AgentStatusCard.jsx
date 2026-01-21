import React from 'react';
import { Activity, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const AgentStatusCard = ({ agent }) => {
  const { name, status, icon: Icon, latency, task } = agent;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
      case 'idle': return 'text-slate-400 border-slate-700 bg-slate-800/50';
      case 'error': return 'text-rose-400 border-rose-500/50 bg-rose-500/10';
      default: return 'text-slate-400 border-slate-700 bg-slate-800/50';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-5 rounded-xl border backdrop-blur-sm transition-all duration-300 ${getStatusColor(status)}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-black/20 ${status === 'active' ? 'animate-pulse' : ''}`}>
            <Icon size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg tracking-tight">{name}</h3>
            <span className="text-xs uppercase tracking-wider font-semibold opacity-70">{status}</span>
          </div>
        </div>
        {status === 'active' && (
          <Activity className="animate-spin-slow text-emerald-400" size={20} />
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/40">Current Task</span>
          <span className="font-mono text-xs max-w-[120px] truncate text-right">{task || 'Awaiting instructions...'}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/40">Latency</span>
          <div className="flex items-center gap-1 font-mono text-xs">
            <Clock size={12} />
            {latency}ms
          </div>
        </div>

        {/* Mini visualization bar */}
        <div className="h-1 w-full bg-black/20 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${status === 'error' ? 'bg-rose-500' : 'bg-current'}`}
            initial={{ width: "0%" }}
            animate={{ width: status === 'active' ? "100%" : "5%" }}
            transition={{ duration: 2, repeat: status === 'active' ? Infinity : 0 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default AgentStatusCard;
