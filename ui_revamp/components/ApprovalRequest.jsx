import React from 'react';
import { ShieldAlert, Check, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ApprovalRequest = ({ request, onApprove, onReject }) => {
    if (!request) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-md relative overflow-hidden"
            >
                <div className="flex items-start gap-4 z-10 relative">
                    <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0">
                        <ShieldAlert size={24} />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                            Wait! Human Approval Required
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500 text-black uppercase tracking-bold">
                                High Confidence
                            </span>
                        </h3>

                        <p className="text-slate-400 text-sm mt-1 mb-4">
                            The Orchestrator has prepared a final briefing but flagged a potential sensitivity or requires confirmation before final synthesis/dispatch.
                        </p>

                        <div className="bg-black/40 rounded-lg p-3 border border-amber-500/10 mb-4 font-mono text-xs text-amber-200/80">
                            <div className="flex gap-4 mb-2">
                                <span className="text-slate-500 uppercase tracking-wider w-16">Action:</span>
                                <span className="font-bold">PUBLISH_DAILY_BRIEFING</span>
                            </div>
                            <div className="flex gap-4 mb-2">
                                <span className="text-slate-500 uppercase tracking-wider w-16">Target:</span>
                                <span>Executive Dashboard, Slack #general</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="text-slate-500 uppercase tracking-wider w-16">Reason:</span>
                                <span>Contains sensitive market data keywords</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onApprove}
                                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-900/20"
                            >
                                <Check size={16} />
                                Approve & Execute
                            </button>

                            <button
                                onClick={onReject}
                                className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm flex items-center justify-center gap-2 transition-colors border border-slate-700"
                            >
                                <X size={16} />
                                Reject
                            </button>
                        </div>
                    </div>
                </div>

                {/* Ambient Glow */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            </motion.div>
        </AnimatePresence>
    );
};

export default ApprovalRequest;
