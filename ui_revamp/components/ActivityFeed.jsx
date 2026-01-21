import React, { useRef, useEffect } from 'react';
import { Terminal, Command, Cpu } from 'lucide-react';

const ActivityFeed = ({ logs }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="flex flex-col h-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden font-mono text-sm relative group">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-2 text-slate-300">
                    <Terminal size={16} />
                    <span className="font-semibold tracking-wider text-xs uppercase">System Neural Stream</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                </div>
            </div>

            {/* Logs Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
            >
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-3 hover:bg-white/5 p-1 rounded transition-colors text-xs md:text-sm">
                        <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                        <span className={`font-bold shrink-0 w-24 ${log.source === 'ORCHESTRATOR' ? 'text-indigo-400' :
                                log.source === 'WEATHER' ? 'text-cyan-400' :
                                    log.source === 'NEWS' ? 'text-orange-400' : 'text-slate-300'
                            }`}>
                            {log.source}
                        </span>
                        <span className={`break-words ${log.type === 'ERROR' ? 'text-rose-400' :
                                log.type === 'SUCCESS' ? 'text-emerald-400' : 'text-slate-300'
                            }`}>
                            {log.message}
                        </span>
                    </div>
                ))}
                {logs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                        <Cpu size={32} className="opacity-50" />
                        <p>Awaiting system initialization...</p>
                    </div>
                )}
            </div>

            {/* Input area (Visual only for now) */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/30 flex items-center gap-2">
                <Command size={14} className="text-slate-500 animate-pulse" />
                <span className="text-slate-500">_</span>
            </div>
        </div>
    );
};

export default ActivityFeed;
