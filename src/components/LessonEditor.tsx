import { useState } from 'react';
import type { Lesson, LessonType, ContentStatus } from '../types';
import { STATUS_LABELS, LESSON_TYPE_LABELS } from '../types';
import { store } from '../store';

interface Props {
  courseId: string;
  lesson?: Lesson;
  onSave: () => void;
  onBack: () => void;
}

export function LessonEditor({ courseId, lesson, onSave, onBack }: Props) {
  const [title, setTitle] = useState(lesson?.title ?? '');
  const [content, setContent] = useState(lesson?.content ?? '');
  const [type, setType] = useState<LessonType>(lesson?.type ?? 'article');
  const [duration, setDuration] = useState(lesson?.durationMinutes ?? 30);
  const [status, setStatus] = useState<ContentStatus>(lesson?.status ?? 'draft');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('כותרת חובה'); return; }
    if (!content.trim()) { setError('תוכן חובה'); return; }

    if (lesson) {
      store.updateLesson(courseId, lesson.id, { title, content, type, durationMinutes: duration, status });
    } else {
      store.createLesson(courseId, { title, content, type, durationMinutes: duration, status });
    }
    onSave();
  }

  return (
    <div className="editor">
      <div className="editor-header">
        <button className="btn-back" onClick={onBack}>← חזרה</button>
        <h2>{lesson ? 'עריכת שיעור' : 'שיעור חדש'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="editor-form">
        {error && <div className="form-error">{error}</div>}

        <div className="form-row">
          <div className="form-group">
            <label>כותרת השיעור *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="לדוגמה: מהי מנהיגות טרנספורמטיבית?"
            />
          </div>
          <div className="form-group form-group-sm">
            <label>סוג</label>
            <select value={type} onChange={(e) => setType(e.target.value as LessonType)}>
              {(Object.keys(LESSON_TYPE_LABELS) as LessonType[]).map((t) => (
                <option key={t} value={t}>{LESSON_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div className="form-group form-group-sm">
            <label>משך (דקות)</label>
            <input
              type="number"
              min={1}
              max={300}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
          <div className="form-group form-group-sm">
            <label>סטטוס</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as ContentStatus)}>
              {(Object.keys(STATUS_LABELS) as ContentStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>תוכן השיעור *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            placeholder="כתוב כאן את תוכן השיעור. ניתן להשתמש בסוכן ה-AI לסיוע ביצירת תוכן איכותי..."
            className="content-textarea"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {lesson ? 'שמור שינויים' : 'צור שיעור'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            ביטול
          </button>
        </div>
      </form>
    </div>
  );
}
