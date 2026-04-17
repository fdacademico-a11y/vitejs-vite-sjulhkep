export type LessonType = 'video' | 'article' | 'exercise' | 'quiz';
export type ContentStatus = 'draft' | 'published' | 'archived';

export interface Lesson {
  id: string;
  title: string;
  content: string;
  type: LessonType;
  durationMinutes: number;
  order: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  targetAudience: string;
  lessons: Lesson[];
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type View =
  | { type: 'dashboard' }
  | { type: 'courseEditor'; courseId?: string }
  | { type: 'lessonEditor'; courseId: string; lessonId?: string }
  | { type: 'newsletter' };

export const NEWSLETTER_TOPICS = [
  'מנהיגות טרנספורמטיבית',
  'ניהול ביצועים',
  'אינטליגנציה רגשית במנהיגות',
  'קבלת החלטות בלחץ',
  'בניית תרבות ארגונית',
  'ניהול שינוי',
  'פיתוח צוות מנצח',
  'תקשורת מנהיגותית',
  'חדשנות וחשיבה יצירתית',
  'ניהול עצמי ומיקוד',
  'השפעה ללא סמכות',
  'פסיכולוגיה של מוטיבציה',
];

export const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  video: 'וידאו',
  article: 'מאמר',
  exercise: 'תרגיל',
  quiz: 'חידון',
};

export const STATUS_LABELS: Record<ContentStatus, string> = {
  draft: 'טיוטה',
  published: 'פורסם',
  archived: 'בארכיון',
};

export const CATEGORIES = [
  'מנהיגות',
  'תקשורת',
  'ניהול צוות',
  'אסטרטגיה',
  'חדשנות',
  'ניהול זמן',
  'פיתוח אישי',
  'כלכלה ופיננסים',
  'שיווק ומכירות',
  'טכנולוגיה',
];
