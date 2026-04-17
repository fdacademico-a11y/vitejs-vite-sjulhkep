import type { Course, ContentStatus } from '../types';
import { STATUS_LABELS } from '../types';

interface Props {
  courses: Course[];
  onNewCourse: () => void;
  onEditCourse: (id: string) => void;
  onDeleteCourse: (id: string) => void;
}

const STATUS_COLORS: Record<ContentStatus, string> = {
  draft: 'status-draft',
  published: 'status-published',
  archived: 'status-archived',
};

export function Dashboard({ courses, onNewCourse, onEditCourse, onDeleteCourse }: Props) {
  const total = courses.length;
  const published = courses.filter((c) => c.status === 'published').length;
  const totalLessons = courses.reduce((sum, c) => sum + c.lessons.length, 0);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">האקדמיה למנהלים</h1>
          <p className="page-subtitle">מערכת ניהול תוכן</p>
        </div>
        <button className="btn btn-primary" onClick={onNewCourse}>
          + קורס חדש
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{total}</span>
          <span className="stat-label">קורסים</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{published}</span>
          <span className="stat-label">פורסמו</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{totalLessons}</span>
          <span className="stat-label">שיעורים</span>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>אין קורסים עדיין</h3>
          <p>לחץ על "קורס חדש" כדי להתחיל לבנות את תוכן האקדמיה</p>
        </div>
      ) : (
        <div className="course-grid">
          {courses.map((course) => (
            <div key={course.id} className="course-card">
              <div className="course-card-header">
                <span className={`status-badge ${STATUS_COLORS[course.status]}`}>
                  {STATUS_LABELS[course.status]}
                </span>
                <span className="course-category">{course.category}</span>
              </div>
              <h3 className="course-title">{course.title}</h3>
              <p className="course-description">{course.description}</p>
              <div className="course-meta">
                <span>👥 {course.targetAudience}</span>
                <span>📖 {course.lessons.length} שיעורים</span>
              </div>
              <div className="course-actions">
                <button className="btn btn-secondary" onClick={() => onEditCourse(course.id)}>
                  ערוך
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    if (confirm(`למחוק את הקורס "${course.title}"?`)) {
                      onDeleteCourse(course.id);
                    }
                  }}
                >
                  מחק
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
