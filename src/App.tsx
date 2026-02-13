import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TeamView from './components/TeamView';
import CourseManagement from './components/CourseManagement';
import CalendarView from './components/CalendarView';
import PnLView from './components/PnLView';
import StudentsView from './components/StudentsView';
import PlaybookView from './components/PlaybookView';
import StrategyRoom from './components/StrategyRoom';
import ControlPanel from './components/ControlPanel';

function AppContent() {
  const { state } = useApp();

  const renderView = () => {
    switch (state.currentView) {
      case 'dashboard': return <Dashboard />;
      case 'team': return <TeamView />;
      case 'courses': return <CourseManagement />;
      case 'calendar': return <CalendarView />;
      case 'pnl': return <PnLView />;
      case 'students': return <StudentsView />;
      case 'playbook': return <PlaybookView />;
      case 'strategy': return <StrategyRoom />;
      case 'control-panel': return <ControlPanel />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:mr-0 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-full">
        {renderView()}
      </main>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
