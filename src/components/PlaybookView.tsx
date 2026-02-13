import { useState } from 'react';
import { Rocket, CheckCircle2, Circle, ArrowLeft, Zap, Calendar, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Task, CourseInstance } from '../types';

const categoryLabels: Record<string, string> = {
  planning: 'תכנון', marketing: 'שיווק', logistics: 'לוגיסטיקה', content: 'תוכן', operations: 'תפעול',
};

const categoryColors: Record<string, string> = {
  planning: 'bg-blue-100 text-blue-700', marketing: 'bg-purple-100 text-purple-700',
  logistics: 'bg-orange-100 text-orange-700', content: 'bg-green-100 text-green-700',
  operations: 'bg-cyan-100 text-cyan-700',
};

export default function PlaybookView() {
  const { state, dispatch } = useApp();
  const { playbookSteps, courseTemplates, teamMembers } = state;
  const [activeStep, setActiveStep] = useState(0);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [launchForm, setLaunchForm] = useState({
    templateId: courseTemplates[0]?.id || '',
    city: 'תל אביב',
    startDate: '',
    dayOfWeek: 'ראשון',
    timeSlot: '18:00-21:00',
    location: '',
    instructorId: teamMembers.find(m => m.role === 'Instructor')?.id || '',
  });

  const sortedSteps = [...playbookSteps].sort((a, b) => a.order - b.order);

  const launchCourse = () => {
    const tpl = courseTemplates.find(t => t.id === launchForm.templateId);
    if (!tpl || !launchForm.startDate) return;

    // Create course instance
    const endDate = new Date(launchForm.startDate);
    endDate.setDate(endDate.getDate() + tpl.durationWeeks * 7);

    const newCourse: CourseInstance = {
      id: `ci-${crypto.randomUUID()}`,
      templateId: tpl.id,
      name: `${tpl.name} - ${launchForm.city}`,
      city: launchForm.city,
      location: launchForm.location || 'TBD',
      dayOfWeek: launchForm.dayOfWeek,
      timeSlot: launchForm.timeSlot,
      startDate: launchForm.startDate,
      endDate: endDate.toISOString().split('T')[0],
      instructorId: launchForm.instructorId,
      status: 'scheduled',
      registeredStudents: [],
      maxStudents: tpl.maxStudents,
      pricePerStudent: tpl.pricePerStudent,
      instructorCostPerSession: tpl.instructorCostPerSession,
      sessionsTotal: tpl.durationWeeks * tpl.sessionsPerWeek,
      notes: '',
    };
    dispatch({ type: 'ADD_COURSE_INSTANCE', payload: newCourse });

    // Auto-generate tasks from playbook
    const startMs = new Date(launchForm.startDate).getTime();
    sortedSteps.filter(s => s.isAutoGenTask).forEach(step => {
      const dueDate = new Date(startMs - step.daysBeforeLaunch * 86400000);
      const assignee = teamMembers.find(m => m.role === step.assigneeRole);
      if (!assignee) return;

      const newTask: Task = {
        id: `task-pb-${crypto.randomUUID()}`,
        title: `[${newCourse.name}] ${step.title}`,
        description: step.description,
        assigneeId: assignee.id,
        priority: step.daysBeforeLaunch <= 7 ? 'high' : 'medium',
        status: 'todo',
        dueDate: dueDate.toISOString().split('T')[0],
        createdAt: new Date(startMs).toISOString().split('T')[0],
        tags: ['playbook', step.category, newCourse.name],
        courseId: newCourse.id,
      };
      dispatch({ type: 'ADD_TASK', payload: newTask });
    });

    setShowLaunchModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-900">Playbook - פרוטוקול השקה</h2>
        <button onClick={() => setShowLaunchModal(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Rocket size={16} /> השקת קורס חדש
        </button>
      </div>

      {/* Progress Wizard */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Steps indicator */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
          {sortedSteps.map((step, i) => (
            <div key={step.id} className="flex items-center shrink-0">
              <button onClick={() => setActiveStep(i)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                  ${i === activeStep ? 'bg-brand-600 text-white' : i < activeStep ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i < activeStep ? <CheckCircle2 size={16} /> : i + 1}
              </button>
              {i < sortedSteps.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${i < activeStep ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Active Step Detail */}
        {sortedSteps[activeStep] && (
          <div className="border border-gray-100 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[sortedSteps[activeStep].category]}`}>
                  {categoryLabels[sortedSteps[activeStep].category]}
                </span>
                <h3 className="text-xl font-bold mt-2">{sortedSteps[activeStep].title}</h3>
              </div>
              <div className="text-left">
                <span className="text-xs text-gray-400">שלב {sortedSteps[activeStep].order} מתוך {sortedSteps.length}</span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{sortedSteps[activeStep].description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><User size={14} /> אחראי: {sortedSteps[activeStep].assigneeRole}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {sortedSteps[activeStep].daysBeforeLaunch} ימים לפני השקה</span>
              {sortedSteps[activeStep].isAutoGenTask && (
                <span className="flex items-center gap-1 text-brand-600"><Zap size={14} /> ייצור משימה אוטומטית</span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button disabled={activeStep === 0} onClick={() => setActiveStep(a => a - 1)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 flex items-center gap-1">
                הקודם <ArrowLeft size={14} className="rotate-180" />
              </button>
              <button disabled={activeStep === sortedSteps.length - 1} onClick={() => setActiveStep(a => a + 1)}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium flex items-center gap-1 disabled:opacity-40 transition-colors">
                <ArrowLeft size={14} /> הבא
              </button>
            </div>
          </div>
        )}

        {/* All Steps List */}
        <div className="mt-6 space-y-2">
          {sortedSteps.map((step, i) => (
            <div key={step.id} onClick={() => setActiveStep(i)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${i === activeStep ? 'bg-brand-50 border border-brand-200' : 'hover:bg-gray-50'}`}>
              {i < activeStep ? (
                <CheckCircle2 size={18} className="text-green-500 shrink-0" />
              ) : i === activeStep ? (
                <Circle size={18} className="text-brand-600 shrink-0" />
              ) : (
                <Circle size={18} className="text-gray-300 shrink-0" />
              )}
              <span className={`text-sm ${i === activeStep ? 'font-semibold text-brand-700' : 'text-gray-600'}`}>
                {step.order}. {step.title}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full mr-auto ${categoryColors[step.category]}`}>
                {categoryLabels[step.category]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Launch Modal */}
      {showLaunchModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2">
              <Rocket size={20} className="text-brand-600" />
              <h3 className="text-lg font-semibold">השקת קורס חדש</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תבנית קורס</label>
                <select value={launchForm.templateId} onChange={e => setLaunchForm(f => ({ ...f, templateId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {courseTemplates.map(t => <option key={t.id} value={t.id}>{t.name} (₪{t.pricePerStudent})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">עיר</label>
                  <input type="text" value={launchForm.city} onChange={e => setLaunchForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">מיקום</label>
                  <input type="text" value={launchForm.location} onChange={e => setLaunchForm(f => ({ ...f, location: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="WeWork / מתם..." />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">תאריך התחלה</label>
                  <input type="date" value={launchForm.startDate} onChange={e => setLaunchForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">יום</label>
                  <select value={launchForm.dayOfWeek} onChange={e => setLaunchForm(f => ({ ...f, dayOfWeek: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שעה</label>
                  <input type="text" value={launchForm.timeSlot} onChange={e => setLaunchForm(f => ({ ...f, timeSlot: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מרצה</label>
                <select value={launchForm.instructorId} onChange={e => setLaunchForm(f => ({ ...f, instructorId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {teamMembers.filter(m => m.role === 'Instructor').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                <Zap size={14} className="inline ml-1" />
                ייווצרו {playbookSteps.filter(s => s.isAutoGenTask).length} משימות אוטומטיות לצוות בהתאם ל-Playbook
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setShowLaunchModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">ביטול</button>
              <button onClick={launchCourse} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                <Rocket size={16} /> השק קורס + צור משימות
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
