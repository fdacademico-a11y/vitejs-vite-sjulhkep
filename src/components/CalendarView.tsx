import { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, BookOpen, CheckSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { CalendarEvent } from '../types';

const hebrewMonths = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const dayToIndex: Record<string, number> = {
  'ראשון': 0, 'שני': 1, 'שלישי': 2, 'רביעי': 3, 'חמישי': 4, 'שישי': 5, 'שבת': 6,
};

export default function CalendarView() {
  const { state } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // Feb 2026

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const events = useMemo(() => {
    const evts: CalendarEvent[] = [];

    // Course sessions
    state.courseInstances.forEach(course => {
      const start = new Date(course.startDate);
      const end = new Date(course.endDate);
      const dayIdx = dayToIndex[course.dayOfWeek];
      if (dayIdx === undefined) return;

      const d = new Date(start);
      while (d <= end) {
        if (d.getDay() === dayIdx) {
          evts.push({
            id: `evt-${course.id}-${d.toISOString()}`,
            title: `${course.name} ${course.timeSlot}`,
            date: d.toISOString().split('T')[0],
            type: 'course-session',
            color: course.status === 'at-risk' ? '#ef4444' : '#3b82f6',
            courseId: course.id,
          });
        }
        d.setDate(d.getDate() + 1);
      }
    });

    // Task deadlines
    state.tasks.forEach(task => {
      if (task.dueDate) {
        evts.push({
          id: `evt-task-${task.id}`,
          title: task.title,
          date: task.dueDate,
          type: 'task-deadline',
          color: task.status === 'done' ? '#10b981' : '#f59e0b',
          taskId: task.id,
        });
      }
    });

    return evts;
  }, [state.courseInstances, state.tasks]);

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const navigate = (dir: number) => {
    setCurrentDate(new Date(year, month + dir, 1));
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-900">לוח שנה</h2>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight size={20} /></button>
          <span className="text-lg font-semibold min-w-[140px] text-center">{hebrewMonths[month]} {year}</span>
          <button onClick={() => navigate(1)} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20} /></button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1"><BookOpen size={14} className="text-blue-500" /> שיעור קורס</span>
        <span className="flex items-center gap-1"><BookOpen size={14} className="text-red-500" /> קורס בסיכון</span>
        <span className="flex items-center gap-1"><CheckSquare size={14} className="text-yellow-500" /> דדליין משימה</span>
        <span className="flex items-center gap-1"><CheckSquare size={14} className="text-green-500" /> משימה שהושלמה</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {hebrewDays.map(d => (
            <div key={d} className="py-3 text-center text-sm font-semibold text-gray-600">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const dayEvents = day ? getEventsForDay(day) : [];
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            return (
              <div key={i} className={`min-h-[100px] border-b border-l border-gray-100 p-1.5 ${day ? '' : 'bg-gray-50'}`}>
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-600 text-white' : 'text-gray-700'}`}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map(evt => (
                        <div key={evt.id} className="text-[10px] px-1 py-0.5 rounded truncate" style={{ backgroundColor: evt.color + '20', color: evt.color }}>
                          {evt.type === 'course-session' ? <BookOpen size={8} className="inline ml-0.5" /> : <CheckSquare size={8} className="inline ml-0.5" />}
                          {evt.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px] text-gray-400 text-center">+{dayEvents.length - 3} נוספים</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
