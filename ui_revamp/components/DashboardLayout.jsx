import React from 'react';
import { LayoutDashboard, Settings, GitGraph, Box } from 'lucide-react';

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex h-screen bg-[#0B0D14] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-20 flex-shrink-0 border-r border-slate-800 bg-[#0F111A] flex-col items-center py-6 gap-8 z-20">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 p-2 transform hover:scale-105 transition-transform duration-200 cursor-pointer">
                    <Box className="text-white" strokeWidth={3} />
                </div>

                <nav className="flex-1 flex flex-col gap-6 w-full px-2">
                    <NavItem icon={LayoutDashboard} active label="Dashboard" />
                    <NavItem icon={GitGraph} label="Workflows" />
                    <NavItem icon={Settings} label="Settings" />
                </nav>

                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer" />
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0F111A]/90 backdrop-blur-lg border-t border-slate-800 flex items-center justify-around px-4 z-50 pb-[env(safe-area-inset-bottom)]">
                <MobileNavItem icon={LayoutDashboard} active />
                <MobileNavItem icon={GitGraph} />
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 -mt-8 border-4 border-[#0B0D14] ring-1 ring-white/10">
                    <Box className="text-white" strokeWidth={3} size={20} />
                </div>
                <MobileNavItem icon={Settings} />
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700" />
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                {/* Top Bar */}
                <header className="h-14 md:h-16 border-b border-slate-800/50 bg-[#0B0D14]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
                    <h1 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 truncate">
                        Synoptic AI
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] md:text-xs font-medium text-emerald-400 uppercase tracking-wide">Online</span>
                        </div>
                    </div>
                </header>

                {/* Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-24 md:pb-8 relative z-0 scroll-smooth">
                    {children}
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ icon: Icon, active, label }) => (
    <button className={`group relative w-full aspect-square flex items-center justify-center rounded-xl transition-all duration-200 ${active ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
        <Icon size={22} />
        {/* Tooltip */}
        <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none z-50 shadow-xl hidden md:block">
            {label}
        </span>
    </button>
);

const MobileNavItem = ({ icon: Icon, active }) => (
    <button className={`p-2 rounded-lg transition-colors ${active ? 'text-indigo-400' : 'text-slate-500'}`}>
        <Icon size={24} />
    </button>
);

export default DashboardLayout;
