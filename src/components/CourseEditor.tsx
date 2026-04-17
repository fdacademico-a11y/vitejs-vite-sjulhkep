import { useState } from 'react';
import type { Course, Lesson, ContentStatus } from '../types';
import { STATUS_LABELS, CATEGORIES, LESSON_TYPE_LABELS } from '../types';
import { store } from '../store';

interface Props {
  course?: Course;
  onSave: (course: Course) => void;
  onBack: () => void;
  onEditLesson: (courseId: string, lessonId?: string) => void;
}

export function CourseEditor({ course, onSave, onBack, onEditLesson }: Props) {
  const [title, setTitle] = useState(course?.title ?? '');
  const [description, setDescription] = useState(course?.description ?? '');
  const [category, setCategory] = useState(course?.category ?? CATEGORIES[0]);
  const [targetAudience, setTargetAudience] = useState(course?.targetAudience ?? '');
  const [status, setStatus] = useState<ContentStatus>(course?.status ?? 'draft');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('כותרת חובה'); return; }
    if (!description.trim()) { setError('תיאור חובה'); return; }

    const saved = course
      ? store.updateCourse(course.id, { title, description, category, targetAudience, status })
      : store.createCourse({ title, description, category, targetAudience, status });
    onSave(saved);
  }

  function handleDeleteLesson(lesson: Lesson) {
    if (!course) return;
    if (confirm(`למחוק את השיעור "${lesson.title}"?`)) {
      store.deleteLesson(course.id, lesson.id);
      onSave(store.getCourse(course.id)!);
    }
  }

  return (
    <div className="editor">
      <div className="editor-header">
        <button className="btn-back" onClick={onBack}>← חזרה</button>
        <h2>{course ? 'עריכת קורס' : 'קורס חדש'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="editor-form">
        {error && <div className="form-error">{error}</div>}

        <div className="form-row">
          <div className="form-group">
            <label>כותרת הקורס *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="לדוגמה: מנהיגות אפקטיבית בעידן המודרני"
            />
          </div>
          <div className="form-group">
            <label>קטגוריה</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>תיאור הקורס *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="תאר את מטרות הקורס ומה הלומדים ירוויחו ממנו"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>קהל יעד</label>
            <input
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="לדוגמה: מנהלי ביניים עם 2-5 שנות ניסיון"
            />
          </div>
          <div className="form-group">
            <label>סטטוס</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as ContentStatus)}>
              {(Object.keys(STATUS_LABELS) as ContentStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {course ? 'שמור שינויים' : 'צור קורס'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            ביטול
          </button>
        </div>
      </form>

      {course && (
        <div className="lessons-section">
          <div className="lessons-header">
            <h3>שיעורים ({course.lessons.length})</h3>
            <button className="btn btn-primary" onClick={() => onEditLesson(course.id)}>
              + שיעור חדש
            </button>
          </div>

          {course.lessons.length === 0 ? (
            <div className="empty-state small">
              <p>אין שיעורים עדיין. לחץ על "שיעור חדש" כדי להוסיף.</p>
            </div>
          ) : (
            <div className="lessons-list">
              {[...course.lessons]
                .sort((a, b) => a.order - b.order)
                .map((lesson) => (
                  <div key={lesson.id} className="lesson-item">
                    <div className="lesson-info">
                      <span className="lesson-type-badge">{LESSON_TYPE_LABELS[lesson.type]}</span>
                      <span className="lesson-title">{lesson.title}</span>
                      <span className="lesson-duration">{lesson.durationMinutes} דק'</span>
                    </div>
                    <div className="lesson-actions">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onEditLesson(course.id, lesson.id)}
                      >
                        ערוך
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteLesson(lesson)}
                      >
                        מחק
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
