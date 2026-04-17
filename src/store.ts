import type { Course, Lesson } from './types';

const STORAGE_KEY = 'academy-content';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function now(): string {
  return new Date().toISOString();
}

function loadCourses(): Course[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCourses(courses: Course[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

export const store = {
  getCourses(): Course[] {
    return loadCourses();
  },

  getCourse(id: string): Course | undefined {
    return loadCourses().find((c) => c.id === id);
  },

  createCourse(data: Omit<Course, 'id' | 'lessons' | 'createdAt' | 'updatedAt'>): Course {
    const course: Course = {
      ...data,
      id: generateId(),
      lessons: [],
      createdAt: now(),
      updatedAt: now(),
    };
    const courses = loadCourses();
    courses.push(course);
    saveCourses(courses);
    return course;
  },

  updateCourse(id: string, data: Partial<Omit<Course, 'id' | 'lessons' | 'createdAt'>>): Course {
    const courses = loadCourses();
    const idx = courses.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Course not found');
    courses[idx] = { ...courses[idx], ...data, updatedAt: now() };
    saveCourses(courses);
    return courses[idx];
  },

  deleteCourse(id: string): void {
    saveCourses(loadCourses().filter((c) => c.id !== id));
  },

  createLesson(
    courseId: string,
    data: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt' | 'order'>
  ): Lesson {
    const courses = loadCourses();
    const course = courses.find((c) => c.id === courseId);
    if (!course) throw new Error('Course not found');
    const lesson: Lesson = {
      ...data,
      id: generateId(),
      order: course.lessons.length,
      createdAt: now(),
      updatedAt: now(),
    };
    course.lessons.push(lesson);
    course.updatedAt = now();
    saveCourses(courses);
    return lesson;
  },

  updateLesson(courseId: string, lessonId: string, data: Partial<Omit<Lesson, 'id' | 'createdAt'>>): Lesson {
    const courses = loadCourses();
    const course = courses.find((c) => c.id === courseId);
    if (!course) throw new Error('Course not found');
    const idx = course.lessons.findIndex((l) => l.id === lessonId);
    if (idx === -1) throw new Error('Lesson not found');
    course.lessons[idx] = { ...course.lessons[idx], ...data, updatedAt: now() };
    course.updatedAt = now();
    saveCourses(courses);
    return course.lessons[idx];
  },

  deleteLesson(courseId: string, lessonId: string): void {
    const courses = loadCourses();
    const course = courses.find((c) => c.id === courseId);
    if (!course) throw new Error('Course not found');
    course.lessons = course.lessons
      .filter((l) => l.id !== lessonId)
      .map((l, i) => ({ ...l, order: i }));
    course.updatedAt = now();
    saveCourses(courses);
  },
};
