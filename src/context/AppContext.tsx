/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { AppState, ViewType, Task, CourseInstance, TeamMember, MonthlyFinancials, PlaybookStep, StrategyPillar, CourseTemplate } from '../types';
import { initialTeamMembers, initialTasks, initialCourseTemplates, initialCourseInstances, initialMonthlyFinancials, initialPlaybookSteps, initialStrategyPillars } from '../data';

const STORAGE_KEY = 'fd-ai-management-os';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as AppState;
    }
  } catch {
    // ignore parse errors
  }
  return {
    currentView: 'dashboard',
    teamMembers: initialTeamMembers,
    tasks: initialTasks,
    courseTemplates: initialCourseTemplates,
    courseInstances: initialCourseInstances,
    monthlyFinancials: initialMonthlyFinancials,
    playbookSteps: initialPlaybookSteps,
    strategyPillars: initialStrategyPillars,
    geminiApiKey: '',
    cloudSyncUrl: '',
  };
}

type Action =
  | { type: 'SET_VIEW'; payload: ViewType }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_COURSE_INSTANCE'; payload: CourseInstance }
  | { type: 'UPDATE_COURSE_INSTANCE'; payload: CourseInstance }
  | { type: 'DELETE_COURSE_INSTANCE'; payload: string }
  | { type: 'ADD_TEAM_MEMBER'; payload: TeamMember }
  | { type: 'UPDATE_TEAM_MEMBER'; payload: TeamMember }
  | { type: 'UPDATE_FINANCIALS'; payload: MonthlyFinancials[] }
  | { type: 'UPDATE_PLAYBOOK'; payload: PlaybookStep[] }
  | { type: 'UPDATE_STRATEGY'; payload: StrategyPillar[] }
  | { type: 'UPDATE_COURSE_TEMPLATES'; payload: CourseTemplate[] }
  | { type: 'SET_GEMINI_KEY'; payload: string }
  | { type: 'SET_CLOUD_SYNC_URL'; payload: string }
  | { type: 'IMPORT_STATE'; payload: AppState }
  | { type: 'RESET_STATE' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'ADD_COURSE_INSTANCE':
      return { ...state, courseInstances: [...state.courseInstances, action.payload] };
    case 'UPDATE_COURSE_INSTANCE':
      return { ...state, courseInstances: state.courseInstances.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_COURSE_INSTANCE':
      return { ...state, courseInstances: state.courseInstances.filter(c => c.id !== action.payload) };
    case 'ADD_TEAM_MEMBER':
      return { ...state, teamMembers: [...state.teamMembers, action.payload] };
    case 'UPDATE_TEAM_MEMBER':
      return { ...state, teamMembers: state.teamMembers.map(m => m.id === action.payload.id ? action.payload : m) };
    case 'UPDATE_FINANCIALS':
      return { ...state, monthlyFinancials: action.payload };
    case 'UPDATE_PLAYBOOK':
      return { ...state, playbookSteps: action.payload };
    case 'UPDATE_STRATEGY':
      return { ...state, strategyPillars: action.payload };
    case 'UPDATE_COURSE_TEMPLATES':
      return { ...state, courseTemplates: action.payload };
    case 'SET_GEMINI_KEY':
      return { ...state, geminiApiKey: action.payload };
    case 'SET_CLOUD_SYNC_URL':
      return { ...state, cloudSyncUrl: action.payload };
    case 'IMPORT_STATE':
      return { ...action.payload };
    case 'RESET_STATE':
      return {
        currentView: 'dashboard',
        teamMembers: initialTeamMembers,
        tasks: initialTasks,
        courseTemplates: initialCourseTemplates,
        courseInstances: initialCourseInstances,
        monthlyFinancials: initialMonthlyFinancials,
        playbookSteps: initialPlaybookSteps,
        strategyPillars: initialStrategyPillars,
        geminiApiKey: '',
        cloudSyncUrl: '',
      };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
