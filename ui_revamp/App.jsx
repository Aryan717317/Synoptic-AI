import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from './components/DashboardLayout';
import AgentStatusCard from './components/AgentStatusCard';
import ActivityFeed from './components/ActivityFeed';
import ApprovalRequest from './components/ApprovalRequest';
import TimeTravelControls from './components/TimeTravelControls';
import BriefingResult from './components/BriefingResult';
import { CloudRain, Newspaper, BrainCircuit, Play, Pause, Zap, RotateCcw, FileText } from 'lucide-react';

const generateTimestamp = () => new Date().toLocaleTimeString('en-US', { hour12: false });

export default function App() {
    const [agents, setAgents] = useState([
        { id: 1, name: 'Orchestrator Node', status: 'active', icon: BrainCircuit, latency: 45, task: 'Analyzing Request' },
        { id: 2, name: 'Weather Agent', status: 'idle', icon: CloudRain, latency: 120, task: null },
        { id: 3, name: 'News Agent', status: 'idle', icon: Newspaper, latency: 210, task: null },
    ]);

    const [logs, setLogs] = useState([
        { timestamp: generateTimestamp(), source: 'SYSTEM', type: 'INFO', message: 'Synoptic OS v2.0 Initialized' },
        { timestamp: generateTimestamp(), source: 'ORCHESTRATOR', type: 'INFO', message: 'Waiting for incoming briefing requests...' },
    ]);

    // Replay State
    const [history, setHistory] = useState([]);
    const [isReplayMode, setIsReplayMode] = useState(false);
    const [replayIndex, setReplayIndex] = useState(0);
    const [isPlayingReplay, setIsPlayingReplay] = useState(false);
    const replayIntervalRef = useRef(null);

    const [prompt, setPrompt] = useState("Morning briefing for Mumbai with tech news");
    const [isProcessing, setIsProcessing] = useState(false);
    const [approvalRequest, setApprovalRequest] = useState(null);

    // Persistent Briefing State
    const [lastBriefing, setLastBriefing] = useState(null);
    const [showBriefingModal, setShowBriefingModal] = useState(false);
    const [detectedLocation, setDetectedLocation] = useState('Mumbai');
    const [detectedCategory, setDetectedCategory] = useState('General');

    // Helper to snapshot state
    const recordState = (currentAgents, currentLogs) => {
        setHistory(prev => [...prev, {
            agents: JSON.parse(JSON.stringify(currentAgents)),
            logs: [...currentLogs]
        }]);
    };

    // Simulation Logic
    const handleSimulateRequest = async () => {
        if (isProcessing) return;

        setIsProcessing(true);
        setApprovalRequest(null);
        setLastBriefing(null);
        setShowBriefingModal(false);
        setHistory([]); // Reset history for new run

        // Initial Snapshot
        const startAgents = agents;
        const startLogs = [...logs, { timestamp: generateTimestamp(), source: 'USER', type: 'INPUT', message: `Request received: "${prompt}"` }];
        setLogs(startLogs);
        recordState(startAgents, startLogs);

        // Step 1: Orchestrator Analysis
        let currentAgents = updateAgentsHelper(startAgents, 1, 'active', 'Parsing Intent...');
        setAgents(currentAgents);
        await delay(500);

        // Dynamic Location & Category Extraction
        const locationMatch = prompt.match(/(?:in|for)\s+([a-zA-Z\s]+?)(?:\s+with|\s+news|$)/i);
        const location = locationMatch ? locationMatch[1].trim() : 'Mumbai';
        setDetectedLocation(location);

        let category = 'General';
        const lowerPrompt = prompt.toLowerCase();
        if (lowerPrompt.includes('tech')) category = 'Technology';
        else if (lowerPrompt.includes('business') || lowerPrompt.includes('finance')) category = 'Business';
        else if (lowerPrompt.includes('sport')) category = 'Sports';
        else if (lowerPrompt.includes('health')) category = 'Health';
        setDetectedCategory(category);

        let currentLogs = [...startLogs,
        { timestamp: generateTimestamp(), source: 'ORCHESTRATOR', type: 'INFO', message: `Detected Location: ${location}, India` },
        { timestamp: generateTimestamp(), source: 'ORCHESTRATOR', type: 'INFO', message: `Focus Category: ${category}` },
        { timestamp: generateTimestamp(), source: 'ORCHESTRATOR', type: 'INFO', message: 'Delegating tasks to Weather & News agents' }
        ];
        setLogs(currentLogs);
        recordState(currentAgents, currentLogs);

        // Step 2: Parallel Delegation
        currentAgents = updateAgentsHelper(currentAgents, 1, 'active', 'Delegating...');
        currentAgents = updateAgentsHelper(currentAgents, 2, 'active', 'Fetching Weather data');
        currentAgents = updateAgentsHelper(currentAgents, 3, 'active', 'Scraping Tech headlines');
        setAgents(currentAgents);
        recordState(currentAgents, currentLogs);

        await delay(1000);

        // Step 3: Responses
        currentLogs = [...currentLogs, { timestamp: generateTimestamp(), source: 'WEATHER', type: 'SUCCESS', message: 'Retrieved: 28°C, Haze, Humidity 72%' }];
        setLogs(currentLogs);
        currentAgents = updateAgentsHelper(currentAgents, 2, 'idle', null);
        setAgents(currentAgents);
        recordState(currentAgents, currentLogs);

        await delay(200);
        currentLogs = [...currentLogs, { timestamp: generateTimestamp(), source: 'NEWS', type: 'SUCCESS', message: 'Retrieved 5 top tech stories' }];
        setLogs(currentLogs);
        currentAgents = updateAgentsHelper(currentAgents, 3, 'idle', null);
        setAgents(currentAgents);
        recordState(currentAgents, currentLogs);

        // HITL Pause
        currentAgents = updateAgentsHelper(currentAgents, 1, 'active', 'Pending Approval...');
        setAgents(currentAgents);
        currentLogs = [...currentLogs, { timestamp: generateTimestamp(), source: 'ORCHESTRATOR', type: 'WARN', message: 'Sensitive content detected. Requesting human review.' }];
        setLogs(currentLogs);
        recordState(currentAgents, currentLogs);

        setApprovalRequest(true);
    };

    const handleApprove = async () => {
        setApprovalRequest(null);
        let currentLogs = [...logs, { timestamp: generateTimestamp(), source: 'USER', type: 'ACTION', message: 'Human Operator APPROVED workflow.' }];
        setLogs(currentLogs);
        let currentAgents = agents;
        recordState(currentAgents, currentLogs); // Capture approval

        // Step 4: Synthesis
        currentAgents = updateAgentsHelper(currentAgents, 1, 'active', 'Synthesizing Final Briefing...');
        setAgents(currentAgents);
        currentLogs = [...currentLogs, { timestamp: generateTimestamp(), source: 'ORCHESTRATOR', type: 'INFO', message: 'Compiling executive summary...' }];
        setLogs(currentLogs);
        recordState(currentAgents, currentLogs);

        await delay(800);

        currentLogs = [...currentLogs, { timestamp: generateTimestamp(), source: 'ORCHESTRATOR', type: 'SUCCESS', message: 'Briefing generated successfully' }];
        setLogs(currentLogs);
        currentAgents = updateAgentsHelper(currentAgents, 1, 'idle', null);
        setAgents(currentAgents);
        recordState(currentAgents, currentLogs);

        // Set Mock Result
        // Set Mock Result
        const conditions = ['Clear Sky', 'Haze', 'Light Rain', 'Partly Cloudy'];
        const temp = Math.floor(Math.random() * (34 - 24) + 24);
        const condition = conditions[Math.floor(Math.random() * conditions.length)];

        const mockBriefingContent = `## Weather & Environment
    Current conditions in ${detectedLocation} indicate a temperature of ${temp}°C with ${condition}. High humidity at 72% will make real-feel temperatures closer to ${temp + 4}°C. Visibility is moderate at 4km.
    
    • Business Implication: Outdoor meetings should be scheduled for early morning or late evening.
    • Travel Advisory: Minor delays expected on coastal routes due to visibility.

    ## News & Updates: ${detectedCategory} Sector
    Key developments from the ${detectedLocation} ${detectedCategory.toLowerCase()} corridor and global markets:

    • ${detectedCategory} Daily: Major announcement expected from top local players.
    • Market Analysis: ${detectedCategory} sector sees 15% Q-o-Q rise despite global headwinds.
    • Regulatory Update: New compliance guidelines for ${detectedCategory} companies.
    • Innovation: Local startups driving next-gen solutions in ${detectedCategory}.
    • 5G rollout completes Phase 2 in ${detectedLocation}, boosting ${detectedCategory} infrastructure.

    ## Insights & Analysis
    1. **Strategic Pivot**: With the new TCS and Reliance moves, consider accelerating any AI-partnership discussions locally.
    2. **Operational**: Ensure all data handling protocols are updated for the new Data Protection Bill compliance check.
    3. **Logistics**: Leverage the improved 5G connectivity for deploying edge-iot devices in the ${detectedLocation} offices.`;

        setLastBriefing(mockBriefingContent);
        setShowBriefingModal(true);
        setIsProcessing(false);
    };

    const handleReject = async () => {
        setApprovalRequest(null);
        let currentLogs = [...logs, { timestamp: generateTimestamp(), source: 'USER', type: 'ACTION', message: 'Human Operator REJECTED workflow.' }];
        setLogs(currentLogs);

        let currentAgents = updateAgentsHelper(agents, 1, 'error', 'Workflow Terminated by User');
        setAgents(currentAgents);
        currentLogs = [...currentLogs, { timestamp: generateTimestamp(), source: 'ORCHESTRATOR', type: 'ERROR', message: 'Process aborted.' }];
        setLogs(currentLogs);
        recordState(currentAgents, currentLogs);

        await delay(1000);
        currentAgents = updateAgentsHelper(currentAgents, 1, 'idle', null);
        setAgents(currentAgents);
        recordState(currentAgents, currentLogs); // Final quiet state

        setIsProcessing(false);
    };

    // State Helpers
    const updateAgentsHelper = (currentList, id, status, task) => {
        return currentList.map(a => a.id === id ? { ...a, status, task } : a);
    };

    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    // Time Travel Functions
    const startReplay = () => {
        if (history.length === 0) return;
        setIsReplayMode(true);
        setReplayIndex(0);
        setIsPlayingReplay(false);
    };

    const exitReplay = () => {
        setIsPlayingReplay(false);
        setIsReplayMode(false);
        // Restore latest state? Actually local state still holds latest from simulation end
    };

    useEffect(() => {
        if (isPlayingReplay) {
            replayIntervalRef.current = setInterval(() => {
                setReplayIndex(prev => {
                    if (prev >= history.length - 1) {
                        setIsPlayingReplay(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else {
            clearInterval(replayIntervalRef.current);
        }
        return () => clearInterval(replayIntervalRef.current);
    }, [isPlayingReplay, history.length]);

    // Determine what to display
    const displayedAgents = isReplayMode && history[replayIndex] ? history[replayIndex].agents : agents;
    const displayedLogs = isReplayMode && history[replayIndex] ? history[replayIndex].logs : logs;

    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full pb-20 md:pb-0">

                {/* Left Column */}
                <div className="lg:col-span-2 flex flex-col gap-6 order-2 lg:order-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayedAgents.map(agent => (
                            <AgentStatusCard key={agent.id} agent={agent} />
                        ))}
                    </div>

                    <div className="flex-1 min-h-[250px] bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                        {isReplayMode && <div className="absolute top-4 right-4 px-2 py-1 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono uppercase animate-pulse">Replay Mode</div>}
                        <div className="absolute inset-0 bg-grid-indigo-500/[0.05] bg-[size:20px_20px]" />
                        <div className="relative z-10 flex flex-col items-center">
                            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-4 flex items-center justify-center transition-all ${isProcessing || (isReplayMode && isPlayingReplay) ? 'border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.5)]' : 'border-slate-700'}`}>
                                <BrainCircuit size={32} className={isProcessing || (isReplayMode && isPlayingReplay) ? 'text-indigo-400 animate-pulse' : 'text-slate-600'} />
                            </div>
                        </div>
                        <p className="mt-8 text-slate-500 font-mono text-xs tracking-widest uppercase text-center">
                            {isReplayMode
                                ? `Replaying State ${replayIndex} / ${history.length - 1}`
                                : isProcessing ? (approvalRequest ? 'Awaiting Human Input...' : 'Orchestration in progress...') : 'System Idle'
                            }
                        </p>
                    </div>

                    {approvalRequest && !isReplayMode && (
                        <ApprovalRequest request={approvalRequest} onApprove={handleApprove} onReject={handleReject} />
                    )}

                    {/* Briefing Result Modal - Conditional Rendering */}
                    {showBriefingModal && (
                        <BriefingResult content={lastBriefing} onClose={() => setShowBriefingModal(false)} />
                    )}

                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex flex-col md:flex-row gap-4 items-center">
                        <div className="w-full flex-1 bg-black/40 rounded-lg p-1 border border-slate-700/50">
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={isReplayMode || isProcessing}
                                className="w-full bg-transparent border-none outline-none text-slate-200 px-4 py-2 font-mono text-sm placeholder:text-slate-600 disabled:opacity-50"
                                placeholder="Enter briefing topic..."
                            />
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            <button
                                onClick={handleSimulateRequest}
                                disabled={isProcessing || isReplayMode}
                                className={`flex-1 md:flex-none px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${isProcessing || isReplayMode
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                    }`}
                            >
                                {isProcessing ? <Zap size={18} className="animate-spin" /> : <Play size={18} />}
                                {isProcessing ? 'Processing' : 'Execute'}
                            </button>

                            <button
                                onClick={() => setShowBriefingModal(true)}
                                disabled={!lastBriefing || isProcessing || isReplayMode}
                                className="px-4 py-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors border border-emerald-500/20"
                                title="View Last Report"
                            >
                                <FileText size={18} />
                            </button>

                            <button
                                onClick={startReplay}
                                disabled={isProcessing || isReplayMode || history.length === 0}
                                className="px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors border border-slate-700"
                                title="Replay Last Session"
                            >
                                <RotateCcw size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-1 h-[300px] lg:h-auto order-1 lg:order-2 mb-4 lg:mb-0">
                    <ActivityFeed logs={displayedLogs} />
                </div>

                {/* Time Travel Overlay */}
                {isReplayMode && (
                    <TimeTravelControls
                        historyLength={history.length}
                        currentIndex={replayIndex}
                        isPlaying={isPlayingReplay}
                        onPlayPause={() => setIsPlayingReplay(!isPlayingReplay)}
                        onScrub={setReplayIndex}
                        onStep={(step) => setReplayIndex(prev => Math.min(Math.max(0, prev + step), history.length - 1))}
                        onExit={exitReplay}
                    />
                )}

            </div>
        </DashboardLayout>
    );
}
