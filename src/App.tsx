import { useState, useCallback } from 'react';
import type { Course, View } from './types';
import { store } from './store';
import { Dashboard } from './components/Dashboard';
import { CourseEditor } from './components/CourseEditor';
import { LessonEditor } from './components/LessonEditor';
import { AIAssistant } from './components/AIAssistant';
import { NewsletterAgent } from './components/NewsletterAgent';
import './App.css';

function App() {
  const [view, setView] = useState<View>({ type: 'dashboard' });
  const [courses, setCourses] = useState<Course[]>(() => store.getCourses());
  const [showAI, setShowAI] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('anthropic-api-key') ?? '');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const refreshCourses = useCallback(() => {
    setCourses(store.getCourses());
  }, []);

  function navigate(v: View) {
    setView(v);
    setMobileMenuOpen(false);
  }

  function saveApiKey() {
    localStorage.setItem('anthropic-api-key', apiKeyInput);
    setApiKey(apiKeyInput);
    setApiKeyInput('');
    setShowApiSetup(false);
    setShowAI(true);
  }

  function handleToggleAI() {
    if (!apiKey) {
      setShowApiSetup(true);
    } else {
      setShowAI((v) => !v);
      setMobileMenuOpen(false);
    }
  }

  function getCourseForView(): Course | undefined {
    if (view.type === 'courseEditor' && view.courseId) {
      return store.getCourse(view.courseId);
    }
    return undefined;
  }

  function getLessonForView() {
    if (view.type !== 'lessonEditor') return undefined;
    const course = store.getCourse(view.courseId);
    if (!course || !view.lessonId) return undefined;
    return course.lessons.find((l) => l.id === view.lessonId);
  }

  return (
    <div className="app-layout" dir="rtl">

      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <div className="mobile-logo">🎓 האקדמיה</div>
        <button
          className="hamburger"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="תפריט"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <nav className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">🎓</span>
          <span className="logo-text">האקדמיה</span>
        </div>

        <div className="sidebar-nav">
          <button
            className={`nav-item ${view.type === 'dashboard' ? 'active' : ''}`}
            onClick={() => { navigate({ type: 'dashboard' }); refreshCourses(); }}
          >
            <span className="nav-icon">🏠</span>
            <span>לוח בקרה</span>
          </button>

          <button
            className="nav-item"
            onClick={() => navigate({ type: 'courseEditor' })}
          >
            <span className="nav-icon">➕</span>
            <span>קורס חדש</span>
          </button>

          <button
            className={`nav-item ${view.type === 'newsletter' ? 'active' : ''}`}
            onClick={() => navigate({ type: 'newsletter' })}
          >
            <span className="nav-icon">📰</span>
            <span>ניוזלטר AI</span>
          </button>

          <button
            className={`nav-item ${showAI ? 'active' : ''}`}
            onClick={handleToggleAI}
          >
            <span className="nav-icon">🤖</span>
            <span>סוכן AI</span>
          </button>
        </div>

        <div className="sidebar-footer">
          <button className="nav-item-small" onClick={() => { setShowApiSetup(true); setMobileMenuOpen(false); }}>
            ⚙️ הגדרות API
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="main-content">
        {view.type === 'dashboard' && (
          <Dashboard
            courses={courses}
            onNewCourse={() => navigate({ type: 'courseEditor' })}
            onEditCourse={(id) => navigate({ type: 'courseEditor', courseId: id })}
            onDeleteCourse={(id) => { store.deleteCourse(id); refreshCourses(); }}
          />
        )}

        {view.type === 'courseEditor' && (
          <CourseEditor
            course={getCourseForView()}
            onSave={(course) => {
              refreshCourses();
              setView({ type: 'courseEditor', courseId: course.id });
            }}
            onBack={() => { navigate({ type: 'dashboard' }); refreshCourses(); }}
            onEditLesson={(courseId, lessonId) =>
              setView({ type: 'lessonEditor', courseId, lessonId })
            }
          />
        )}

        {view.type === 'newsletter' && (
          <NewsletterAgent apiKey={apiKey} />
        )}

        {view.type === 'lessonEditor' && (
          <LessonEditor
            courseId={view.courseId}
            lesson={getLessonForView()}
            onSave={() => {
              refreshCourses();
              setView({ type: 'courseEditor', courseId: view.courseId });
            }}
            onBack={() => setView({ type: 'courseEditor', courseId: view.courseId })}
          />
        )}
      </main>

      {/* AI panel */}
      {showAI && apiKey && (
        <aside className="ai-panel">
          <div className="ai-panel-header">
            <span>סוכן תוכן AI</span>
            <button className="close-btn" onClick={() => setShowAI(false)}>✕</button>
          </div>
          <AIAssistant apiKey={apiKey} />
        </aside>
      )}

      {/* API setup modal */}
      {showApiSetup && (
        <div className="modal-overlay" onClick={() => setShowApiSetup(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>הגדרת מפתח Anthropic API</h3>
            <p>הזן את מפתח ה-API שלך מ-console.anthropic.com</p>
            <input
              type="password"
              placeholder="sk-ant-..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveApiKey()}
            />
            <p className="api-note">המפתח נשמר רק בדפדפן שלך (localStorage)</p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={saveApiKey} disabled={!apiKeyInput.trim()}>
                שמור ופתח סוכן AI
              </button>
              <button className="btn btn-secondary" onClick={() => setShowApiSetup(false)}>
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
