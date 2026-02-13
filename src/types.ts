export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'blocked';
export type CourseStatus = 'scheduled' | 'open-for-registration' | 'in-progress' | 'completed' | 'cancelled' | 'at-risk';
export type CourseCategory = 'core' | 'advanced' | 'workshop' | 'bootcamp' | 'seminar';
export type TeamRole = 'CEO' | 'COO' | 'CMO' | 'CPO' | 'CTO' | 'Instructor' | 'Admin';
export type ViewType = 'dashboard' | 'team' | 'courses' | 'calendar' | 'pnl' | 'students' | 'playbook' | 'strategy' | 'control-panel';

export interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
  email: string;
  phone: string;
  avatar?: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  tags: string[];
  courseId?: string;
}

export interface CourseTemplate {
  id: string;
  name: string;
  category: CourseCategory;
  description: string;
  durationWeeks: number;
  sessionsPerWeek: number;
  maxStudents: number;
  pricePerStudent: number;
  instructorCostPerSession: number;
  topics: string[];
}

export interface CourseInstance {
  id: string;
  templateId: string;
  name: string;
  city: string;
  location: string;
  dayOfWeek: string;
  timeSlot: string;
  startDate: string;
  endDate: string;
  instructorId: string;
  status: CourseStatus;
  registeredStudents: Student[];
  maxStudents: number;
  pricePerStudent: number;
  instructorCostPerSession: number;
  sessionsTotal: number;
  notes: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  courseId: string;
  registrationDate: string;
  paymentStatus: 'paid' | 'partial' | 'pending' | 'refunded';
  amountPaid: number;
  notes: string;
}

export interface MonthlyFinancials {
  month: string;
  year: number;
  revenue: number;
  instructorCosts: number;
  marketingCosts: number;
  operationalCosts: number;
  platformCosts: number;
  otherCosts: number;
}

export interface FinancialKPIs {
  cac: number;
  ltv: number;
  occupancyRate: number;
  profitMargin: number;
  revenuePerStudent: number;
  avgCourseRevenue: number;
}

export interface PlaybookStep {
  id: string;
  order: number;
  title: string;
  description: string;
  assigneeRole: TeamRole;
  daysBeforeLaunch: number;
  category: 'planning' | 'marketing' | 'logistics' | 'content' | 'operations';
  isAutoGenTask: boolean;
}

export interface StrategyPillar {
  id: string;
  title: string;
  description: string;
  icon: string;
  objectives: string[];
  kpis: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'course-session' | 'task-deadline' | 'meeting' | 'milestone';
  color: string;
  courseId?: string;
  taskId?: string;
}

export interface AppState {
  currentView: ViewType;
  teamMembers: TeamMember[];
  tasks: Task[];
  courseTemplates: CourseTemplate[];
  courseInstances: CourseInstance[];
  monthlyFinancials: MonthlyFinancials[];
  playbookSteps: PlaybookStep[];
  strategyPillars: StrategyPillar[];
  geminiApiKey: string;
  cloudSyncUrl: string;
}
