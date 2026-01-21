import React from 'react';
import { Play, Pause, SkipBack, SkipForward, History } from 'lucide-react';

const TimeTravelControls = ({
    historyLength,
    currentIndex,
    isPlaying,
    onPlayPause,
    onScrub,
    onStep,
    onExit
}) => {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 p-4 rounded-2xl shadow-2xl shadow-indigo-500/20 z-50 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-10">

            <div className="flex items-center justify-between text-xs text-indigo-300 font-mono uppercase tracking-wider mb-1">
                <div className="flex items-center gap-2">
                    <History size={14} />
                    <span>Temporal Debugger Active</span>
                </div>
                <span>T-{currentIndex} / {historyLength - 1}</span>
            </div>

            {/* Scrubber */}
            <input
                type="range"
                min={0}
                max={historyLength - 1}
                value={currentIndex}
                onChange={(e) => onScrub(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
            />

            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onStep(-1)}
                        disabled={currentIndex === 0}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-300 disabled:opacity-30 transition-colors"
                    >
                        <SkipBack size={18} fill="currentColor" />
                    </button>

                    <button
                        onClick={onPlayPause}
                        className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                    >
                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                    </button>

                    <button
                        onClick={() => onStep(1)}
                        disabled={currentIndex === historyLength - 1}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-300 disabled:opacity-30 transition-colors"
                    >
                        <SkipForward size={18} fill="currentColor" />
                    </button>
                </div>

                <button
                    onClick={onExit}
                    className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors"
                >
                    Exit Replay Mode
                </button>
            </div>
        </div>
    );
};

export default TimeTravelControls;
