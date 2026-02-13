import { useState } from 'react';
import { Plus, Edit2, Trash2, MessageCircle, CalendarPlus, CheckCircle2, Clock, AlertCircle, Ban } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Task, Priority, TaskStatus } from '../types';

const priorityColors: Record<Priority, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  low: 'bg-gray-100 text-gray-600 border-gray-200',
};

const priorityLabels: Record<Priority, string> = {
  critical: 'קריטי',
  high: 'גבוה',
  medium: 'בינוני',
  low: 'נמוך',
};

const statusIcons: Record<TaskStatus, React.ReactNode> = {
  'todo': <Clock size={14} className="text-gray-400" />,
  'in-progress': <AlertCircle size={14} className="text-blue-500" />,
  'done': <CheckCircle2 size={14} className="text-green-500" />,
  'blocked': <Ban size={14} className="text-red-500" />,
};

export default function TeamView() {
  const { state, dispatch } = useApp();
  const { teamMembers, tasks } = state;
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState<Partial<Task>>({
    title: '', description: '', assigneeId: '', priority: 'medium', status: 'todo', dueDate: '', tags: [],
  });

  const handleSaveTask = () => {
    if (!taskForm.title || !taskForm.assigneeId) return;
    if (editingTask) {
      dispatch({ type: 'UPDATE_TASK', payload: { ...editingTask, ...taskForm } as Task });
    } else {
      const newTask: Task = {
        id: `task-${crypto.randomUUID()}`,
        title: taskForm.title || '',
        description: taskForm.description || '',
        assigneeId: taskForm.assigneeId || '',
        priority: taskForm.priority as Priority || 'medium',
        status: taskForm.status as TaskStatus || 'todo',
        dueDate: taskForm.dueDate || '',
        createdAt: new Date().toISOString().split('T')[0],
        tags: taskForm.tags || [],
      };
      dispatch({ type: 'ADD_TASK', payload: newTask });
    }
    setShowTaskModal(false);
    setEditingTask(null);
    setTaskForm({ title: '', description: '', assigneeId: '', priority: 'medium', status: 'todo', dueDate: '', tags: [] });
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setTaskForm(task);
    setShowTaskModal(true);
  };

  const openNew = (assigneeId?: string) => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', assigneeId: assigneeId || '', priority: 'medium', status: 'todo', dueDate: '', tags: [] });
    setShowTaskModal(true);
  };

  const generateWhatsAppLink = (phone: string, message: string) => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    const intl = cleaned.startsWith('0') ? '972' + cleaned.slice(1) : cleaned;
    return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
  };

  const generateCalendarLink = (task: Task) => {
    const date = task.dueDate.replace(/-/g, '');
    return `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(task.title)}&dates=${date}/${date}&details=${encodeURIComponent(task.description)}`;
  };

  const managementMembers = teamMembers.filter(m => ['CEO', 'COO', 'CMO', 'CPO'].includes(m.role));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-900">ניהול צוות</h2>
        <button onClick={() => openNew()} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus size={16} /> משימה חדשה
        </button>
      </div>

      {/* Team Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {managementMembers.map(member => {
          const memberTasks = tasks.filter(t => t.assigneeId === member.id);
          const done = memberTasks.filter(t => t.status === 'done').length;
          const progress = memberTasks.length > 0 ? Math.round((done / memberTasks.length) * 100) : 0;

          return (
            <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between" style={{ borderRightColor: member.color, borderRightWidth: '4px' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: member.color }}>
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={generateWhatsAppLink(member.phone, `שלום ${member.name}, `)} target="_blank" rel="noopener noreferrer"
                    className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600" title="WhatsApp">
                    <MessageCircle size={18} />
                  </a>
                  <button onClick={() => openNew(member.id)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600" title="הוסף משימה">
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="px-4 pt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">התקדמות: {done}/{memberTasks.length}</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: member.color }} />
                </div>
              </div>

              {/* Tasks */}
              <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                {memberTasks.length === 0 && <p className="text-sm text-gray-400 text-center py-4">אין משימות</p>}
                {memberTasks.map(task => (
                  <div key={task.id} className="border border-gray-100 rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {statusIcons[task.status]}
                          <span className="text-sm font-medium truncate">{task.title}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
                            {priorityLabels[task.priority]}
                          </span>
                          <span className="text-xs text-gray-400">{task.dueDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <a href={generateCalendarLink(task)} target="_blank" rel="noopener noreferrer"
                          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-500" title="הוסף ליומן">
                          <CalendarPlus size={14} />
                        </a>
                        <button onClick={() => openEdit(task)} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-500" title="ערוך">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => dispatch({ type: 'DELETE_TASK', payload: task.id })} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500" title="מחק">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold">{editingTask ? 'עריכת משימה' : 'משימה חדשה'}</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">כותרת</label>
                <input type="text" value={taskForm.title || ''} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
                <textarea value={taskForm.description || ''} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">אחראי</label>
                  <select value={taskForm.assigneeId || ''} onChange={e => setTaskForm(f => ({ ...f, assigneeId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="">בחר...</option>
                    {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">עדיפות</label>
                  <select value={taskForm.priority || 'medium'} onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value as Priority }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="critical">קריטי</option>
                    <option value="high">גבוה</option>
                    <option value="medium">בינוני</option>
                    <option value="low">נמוך</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">סטטוס</label>
                  <select value={taskForm.status || 'todo'} onChange={e => setTaskForm(f => ({ ...f, status: e.target.value as TaskStatus }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="todo">לביצוע</option>
                    <option value="in-progress">בתהליך</option>
                    <option value="done">הושלם</option>
                    <option value="blocked">חסום</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">תאריך יעד</label>
                  <input type="date" value={taskForm.dueDate || ''} onChange={e => setTaskForm(f => ({ ...f, dueDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תגיות (מופרדות בפסיק)</label>
                <input type="text" value={(taskForm.tags || []).join(', ')} onChange={e => setTaskForm(f => ({ ...f, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => { setShowTaskModal(false); setEditingTask(null); }}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">ביטול</button>
              <button onClick={handleSaveTask}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
                {editingTask ? 'עדכן' : 'צור משימה'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
