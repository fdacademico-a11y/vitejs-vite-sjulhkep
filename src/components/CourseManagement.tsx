import { useState } from 'react';
import { MapPin, Clock, Users, AlertTriangle, Zap, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { CourseCategory, CourseInstance, CourseStatus } from '../types';

const categoryLabels: Record<CourseCategory, string> = {
  core: 'ליבה', advanced: 'מתקדם', workshop: 'סדנה', bootcamp: 'בוטקמפ', seminar: 'סמינר',
};

const categoryColors: Record<CourseCategory, string> = {
  core: 'bg-blue-100 text-blue-700', advanced: 'bg-purple-100 text-purple-700', workshop: 'bg-green-100 text-green-700', bootcamp: 'bg-red-100 text-red-700', seminar: 'bg-orange-100 text-orange-700',
};

const statusLabels: Record<CourseStatus, string> = {
  'scheduled': 'מתוכנן', 'open-for-registration': 'פתוח להרשמה', 'in-progress': 'בתהליך', 'completed': 'הושלם', 'cancelled': 'בוטל', 'at-risk': 'בסיכון',
};

const statusColors: Record<CourseStatus, string> = {
  'scheduled': 'bg-gray-100 text-gray-600', 'open-for-registration': 'bg-green-100 text-green-700', 'in-progress': 'bg-blue-100 text-blue-700', 'completed': 'bg-gray-100 text-gray-500', 'cancelled': 'bg-red-100 text-red-700', 'at-risk': 'bg-red-100 text-red-700',
};

const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'];

export default function CourseManagement() {
  const { state, dispatch } = useApp();
  const { courseTemplates, courseInstances, teamMembers } = state;
  const [tab, setTab] = useState<'portfolio' | 'broadcast'>('portfolio');
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const quickSchedule = (templateId: string) => {
    const tpl = courseTemplates.find(t => t.id === templateId);
    if (!tpl) return;
    const instructors = teamMembers.filter(m => m.role === 'Instructor');
    const futureStart = new Date();
    futureStart.setDate(futureStart.getDate() + 30);
    const futureEnd = new Date(futureStart);
    futureEnd.setDate(futureEnd.getDate() + tpl.durationWeeks * 7);
    const newCourse: CourseInstance = {
      id: `ci-${crypto.randomUUID()}`,
      templateId: tpl.id,
      name: `${tpl.name} - חדש`,
      city: 'תל אביב',
      location: 'TBD',
      dayOfWeek: 'ראשון',
      timeSlot: '18:00-21:00',
      startDate: futureStart.toISOString().split('T')[0],
      endDate: futureEnd.toISOString().split('T')[0],
      instructorId: instructors[0]?.id || '',
      status: 'scheduled',
      registeredStudents: [],
      maxStudents: tpl.maxStudents,
      pricePerStudent: tpl.pricePerStudent,
      instructorCostPerSession: tpl.instructorCostPerSession,
      sessionsTotal: tpl.durationWeeks * tpl.sessionsPerWeek,
      notes: '',
    };
    dispatch({ type: 'ADD_COURSE_INSTANCE', payload: newCourse });
  };

  // Broadcast board data
  const cities = [...new Set(courseInstances.map(c => c.city))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-900">ניהול קורסים</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button onClick={() => setTab('portfolio')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'portfolio' ? 'bg-white shadow text-brand-700' : 'text-gray-500'}`}>
            פורטפוליו
          </button>
          <button onClick={() => setTab('broadcast')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'broadcast' ? 'bg-white shadow text-brand-700' : 'text-gray-500'}`}>
            לוח שידורים
          </button>
        </div>
      </div>

      {tab === 'portfolio' && (
        <div className="space-y-4">
          {/* Templates */}
          <h3 className="text-lg font-semibold text-gray-700">תבניות קורסים</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courseTemplates.map(tpl => (
              <div key={tpl.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[tpl.category]}`}>
                      {categoryLabels[tpl.category]}
                    </span>
                    <span className="text-sm font-bold text-green-600">₪{tpl.pricePerStudent.toLocaleString()}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{tpl.name}</h4>
                  <p className="text-xs text-gray-500 mb-3">{tpl.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1"><Clock size={12} />{tpl.durationWeeks} שבועות</span>
                    <span className="flex items-center gap-1"><Users size={12} />עד {tpl.maxStudents}</span>
                  </div>

                  <button onClick={() => setExpandedTemplate(expandedTemplate === tpl.id ? null : tpl.id)}
                    className="text-xs text-brand-600 flex items-center gap-1 mb-2">
                    {expandedTemplate === tpl.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {expandedTemplate === tpl.id ? 'הסתר נושאים' : 'הצג נושאים'}
                  </button>

                  {expandedTemplate === tpl.id && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {tpl.topics.map(topic => (
                        <span key={topic} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{topic}</span>
                      ))}
                    </div>
                  )}

                  <button onClick={() => quickSchedule(tpl.id)}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                    <Zap size={14} /> תזמון מהיר
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Active Instances */}
          <h3 className="text-lg font-semibold text-gray-700 mt-8">קורסים פעילים</h3>
          <div className="space-y-3">
            {courseInstances.map(course => {
              const instructor = teamMembers.find(m => m.id === course.instructorId);
              const occupancy = course.maxStudents > 0 ? Math.round((course.registeredStudents.length / course.maxStudents) * 100) : 0;
              return (
                <div key={course.id} className={`bg-white rounded-xl border shadow-sm p-4 ${course.status === 'at-risk' ? 'border-red-200' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      {course.status === 'at-risk' && <AlertTriangle size={18} className="text-red-500" />}
                      <div>
                        <h4 className="font-semibold text-gray-900">{course.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                          <span className="flex items-center gap-1"><MapPin size={12} />{course.city}</span>
                          <span>{course.dayOfWeek} {course.timeSlot}</span>
                          <span className="flex items-center gap-1"><Eye size={12} />{instructor?.name || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[course.status]}`}>
                            {statusLabels[course.status]}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            <Users size={14} className="inline ml-1" />
                            {course.registeredStudents.length}/{course.maxStudents}
                          </span>
                        </div>
                        <div className="w-24 bg-gray-100 rounded-full h-1.5 mt-1">
                          <div className={`h-1.5 rounded-full ${occupancy < 30 ? 'bg-red-500' : occupancy < 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(occupancy, 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  {course.notes && <p className="text-xs text-red-500 mt-2 bg-red-50 px-3 py-1.5 rounded">{course.notes}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'broadcast' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <h3 className="text-lg font-semibold p-4 border-b border-gray-100">לוח שידורים - קורסים לפי עיר ויום</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-right py-3 px-4 font-semibold text-gray-600">עיר / יום</th>
                {days.map(d => <th key={d} className="text-center py-3 px-3 font-semibold text-gray-600">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {cities.map(city => (
                <tr key={city} className="border-b border-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{city}</td>
                  {days.map(day => {
                    const courses = courseInstances.filter(c => c.city === city && c.dayOfWeek === day);
                    return (
                      <td key={day} className="py-2 px-2 text-center">
                        {courses.map(c => (
                          <div key={c.id} className={`text-xs p-1.5 rounded mb-1 ${c.status === 'at-risk' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700'}`}>
                            <div className="font-medium truncate">{c.name.split(' - ')[0]}</div>
                            <div className="text-gray-400">{c.timeSlot}</div>
                            <div>{c.registeredStudents.length}/{c.maxStudents}</div>
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
