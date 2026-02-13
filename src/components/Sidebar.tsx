import { LayoutDashboard, Users, BookOpen, Calendar, DollarSign, GraduationCap, Rocket, Target, Settings, Menu, X, Brain } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { ViewType } from '../types';
import { useState } from 'react';

const navItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'דשבורד', icon: <LayoutDashboard size={20} /> },
  { id: 'team', label: 'צוות', icon: <Users size={20} /> },
  { id: 'courses', label: 'קורסים', icon: <BookOpen size={20} /> },
  { id: 'calendar', label: 'לוח שנה', icon: <Calendar size={20} /> },
  { id: 'pnl', label: 'כספים', icon: <DollarSign size={20} /> },
  { id: 'students', label: 'סטודנטים', icon: <GraduationCap size={20} /> },
  { id: 'playbook', label: 'Playbook', icon: <Rocket size={20} /> },
  { id: 'strategy', label: 'אסטרטגיה', icon: <Target size={20} /> },
  { id: 'control-panel', label: 'לוח בקרה', icon: <Settings size={20} /> },
];

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (view: ViewType) => {
    dispatch({ type: 'SET_VIEW', payload: view });
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 bg-brand-800 text-white p-2 rounded-lg shadow-lg"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-brand-900 text-white z-40 transition-transform duration-300 flex flex-col
          ${mobileOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
            <Brain size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">FD AI College</h1>
            <p className="text-xs text-blue-300">Management OS</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors
                ${state.currentView === item.id
                  ? 'bg-brand-700 text-white border-l-4 border-brand-400'
                  : 'text-blue-200 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-xs text-blue-300">
          <p>FD AI Management OS v1.0</p>
        </div>
      </aside>
    </>
  );
}
