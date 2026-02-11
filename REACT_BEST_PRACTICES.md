# React Best Practices Guide for Large Applications

> A comprehensive guide for LLMs and developers implementing React code that scales gracefully into larger projects. Based on the latest React documentation and community best practices.

## 📋 Table of Contents

1. [Component Architecture](#component-architecture)
2. [State Management](#state-management)
3. [Code Organization](#code-organization)
4. [Performance Optimization](#performance-optimization)
5. [Custom Hooks Patterns](#custom-hooks-patterns)
6. [Error Handling & Resilience](#error-handling--resilience)
7. [Testing Strategies](#testing-strategies)
8. [Accessibility](#accessibility)
9. [Build & Deployment](#build--deployment)
10. [Team Collaboration](#team-collaboration)

---

## 🏗️ Component Architecture

### ✅ **Single Responsibility Principle**
Each component should have one clear purpose and reason to change.

```jsx
// ✅ Good: Focused responsibility
export default function UserProfile({ userId }) {
  const user = useUser(userId);
  return <UserCard user={user} />;
}

// ❌ Bad: Multiple responsibilities
export default function UserSection({ userId }) {
  const user = useUser(userId);
  const posts = useUserPosts(userId);
  const settings = useUserSettings(userId);
  // Mixing concerns - hard to maintain and test
}
```

### ✅ **Composition Over Inheritance**
Prefer composition patterns and prop drilling for component relationships.

```jsx
// ✅ Good: Composable components
export default function App() {
  return (
    <TasksProvider>
      <Header />
      <MainContent />
      <Footer />
    </TasksProvider>
  );
}

function MainContent() {
  return (
    <Sidebar>
      <TaskList />
    </Sidebar>
    <Content>
      <TaskDetails />
    </Content>
  );
}
```

### ✅ **Component Declaration at Top Level**
Always declare components at the top level of the file for performance and predictability.

```jsx
// ✅ Good: Top-level declarations
export default function Gallery() {
  return <div><Profile /></div>;
}

function Profile() {
  return <div>Profile content</div>;
}

// ❌ Bad: Nested declarations cause performance issues
export default function Gallery() {
  function Profile() {
    return <div>Profile content</div>;
  }
  return <div><Profile /></div>;
}
```

---

## 🔄 State Management

### ✅ **Start with useState, Scale to useReducer**
Use `useState` for simple state, `useReducer` for complex state logic.

```jsx
// ✅ Simple state with useState
const [count, setCount] = useState(0);

// ✅ Complex state with useReducer
const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);

function tasksReducer(tasks, action) {
  switch (action.type) {
    case 'added':
      return [...tasks, { id: action.id, text: action.text, done: false }];
    case 'changed':
      return tasks.map(t => t.id === action.task.id ? action.task : t);
    case 'deleted':
      return tasks.filter(t => t.id !== action.id);
    default:
      throw Error('Unknown action: ' + action.type);
  }
}
```

### ✅ **Context for Global State**
Use Context for state that needs to be accessed by many components.

```jsx
// ✅ Separate contexts for state and dispatch
export const TasksContext = createContext(null);
export const TasksDispatchContext = createContext(null);

export function TasksProvider({ children }) {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
  
  return (
    <TasksContext value={tasks}>
      <TasksDispatchContext value={dispatch}>
        {children}
      </TasksDispatchContext>
    </TasksContext>
  );
}

// ✅ Consume contexts in child components
function TaskList() {
  const tasks = useContext(TasksContext);
  const dispatch = useContext(TasksDispatchContext);
  // Component logic...
}
```

### ✅ **State Colocation**
Keep state as close as possible to where it's used.

```jsx
// ✅ Good: State localized to component that needs it
function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  
  return (
    <input
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        onSearch(e.target.value);
      }}
    />
  );
}
```

---

## 📁 Code Organization

### ✅ **Feature-Based Structure**
Organize files by features rather than file types.

```
src/
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Modal/
│   └── features/         # Feature-specific components
│       ├── UserProfile/
│       │   ├── UserProfile.jsx
│       │   ├── UserProfile.test.jsx
│       │   └── UserProfile.module.css
│       └── TaskList/
├── hooks/                # Custom hooks
├── context/              # React contexts
├── utils/                # Utility functions
├── services/             # API services
└── styles/               # Global styles
```

### ✅ **Consistent Naming Conventions**
- **Components**: PascalCase (`UserProfile.jsx`)
- **Files**: camelCase for utilities (`userService.js`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **CSS Modules**: kebab-case (`user-profile.module.css`)

### ✅ **Index Files for Clean Imports**
Use index files to bundle related exports.

```jsx
// src/components/common/index.js
export { default as Button } from './Button/Button';
export { default as Input } from './Input/Input';
export { default as Modal } from './Modal/Modal';

// Usage in other files
import { Button, Input, Modal } from '@/components/common';
```

---

## ⚡ Performance Optimization

### ✅ **Code Splitting with Lazy Loading**
Implement route-based and component-based code splitting.

```jsx
// ✅ Route-based lazy loading
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/dashboard', element: <Dashboard /> }
]);

// ✅ Component-based lazy loading
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### ✅ **Memoization Strategies**
Use `React.memo`, `useMemo`, and `useCallback` appropriately.

```jsx
// ✅ Memoize expensive calculations
function ExpensiveComponent({ data }) {
  const processedData = useMemo(() => {
    return data.map(item => expensiveCalculation(item));
  }, [data]);

  return <div>{processedData}</div>;
}

// ✅ Memoize component props
const MemoizedChild = React.memo(function Child({ value, onClick }) {
  return <button onClick={onClick}>{value}</button>;
});

// ✅ Memoize event handlers
function Parent({ items }) {
  const handleClick = useCallback((id) => {
    // Handle click
  }, []);

  return items.map(item => (
    <MemoizedChild key={item.id} value={item.value} onClick={handleClick} />
  ));
}
```

### ✅ **Virtualization for Large Lists**
Use windowing techniques for large datasets.

```jsx
// ✅ Use react-window or react-virtualized
import { FixedSizeList as List } from 'react-window';

function BigList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].content}
    </div>
  );

  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={50}
    >
      {Row}
    </List>
  );
}
```

---

## 🪝 Custom Hooks Patterns

### ✅ **Extract Reusable Logic**
Create custom hooks for shared stateful logic.

```jsx
// ✅ Custom hook for API data
export function useApiData(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(url);
        const result = await response.json();
        
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();
    
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error };
}

// ✅ Custom hook for form inputs
export function useFormInput(initialValue) {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((e) => {
    setValue(e.target.value);
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  return {
    value,
    onChange: handleChange,
    reset
  };
}
```

### ✅ **Hook Composition**
Combine multiple hooks for complex functionality.

```jsx
// ✅ Compose hooks for complex interactions
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// ✅ Usage in components
function StatusBar() {
  const isOnline = useOnlineStatus();
  return <div>Status: {isOnline ? 'Online' : 'Offline'}</div>;
}
```

---

## 🛡️ Error Handling & Resilience

### ✅ **Error Boundaries**
Implement error boundaries to catch and handle errors gracefully.

```jsx
// ✅ Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

// ✅ Usage with Suspense
function App() {
  return (
    <ErrorBoundary fallback={<div>Failed to load</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <DataComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### ✅ **Graceful Loading States**
Use Suspense and loading indicators for better UX.

```jsx
// ✅ Suspense with loading states
function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  );
}

// ✅ Component-level loading states
function UserProfile({ userId }) {
  const { user, loading, error } = useApiData(`/api/users/${userId}`);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Failed to load profile</div>;
  if (!user) return <div>User not found</div>;

  return <div>{user.name}</div>;
}
```

---

## 🧪 Testing Strategies

### ✅ **Component Testing**
Test components in isolation with realistic data.

```jsx
// ✅ Component test with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskProvider } from './TasksContext';
import TaskList from './TaskList';

test('renders task list with tasks', () => {
  const mockTasks = [
    { id: 1, text: 'Test task', done: false }
  ];

  render(
    <TaskProvider initialTasks={mockTasks}>
      <TaskList />
    </TaskProvider>
  );

  expect(screen.getByText('Test task')).toBeInTheDocument();
});

test('handles task deletion', async () => {
  const mockTasks = [
    { id: 1, text: 'Test task', done: false }
  ];

  render(
    <TaskProvider initialTasks={mockTasks}>
      <TaskList />
    </TaskProvider>
  );

  const deleteButton = screen.getByRole('button', { name: /delete/i });
  fireEvent.click(deleteButton);

  expect(screen.queryByText('Test task')).not.toBeInTheDocument();
});
```

### ✅ **Hook Testing**
Test custom hooks independently.

```jsx
// ✅ Hook testing with @testing-library/react-hooks
import { renderHook, act } from '@testing-library/react';
import { useFormInput } from './useFormInput';

test('form input hook manages state correctly', () => {
  const { result } = renderHook(() => useFormInput('initial'));

  expect(result.current.value).toBe('initial');

  act(() => {
    result.current.onChange({ target: { value: 'new value' } });
  });

  expect(result.current.value).toBe('new value');
});
```

---

## ♿ Accessibility

### ✅ **Semantic HTML**
Use appropriate HTML elements for accessibility.

```jsx
// ✅ Good: Semantic HTML with proper ARIA
function TaskItem({ task, onToggle, onDelete }) {
  return (
    <article role="article" aria-label={`Task: ${task.text}`}>
      <header>
        <h3>{task.text}</h3>
      </header>
      <div className="task-actions">
        <button
          onClick={() => onToggle(task.id)}
          aria-pressed={task.done}
          aria-label={`Mark ${task.text} as ${task.done ? 'incomplete' : 'complete'}`}
        >
          {task.done ? 'Undo' : 'Complete'}
        </button>
        <button
          onClick={() => onDelete(task.id)}
          aria-label={`Delete task: ${task.text}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
```

### ✅ **Keyboard Navigation**
Ensure all interactive elements are keyboard accessible.

```jsx
// ✅ Keyboard-accessible modal
function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content">
        <button 
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
```

---

## 🏗️ Build & Deployment

### ✅ **Modern Build Tools**
Use Vite or Next.js for optimal development experience.

```bash
# ✅ Create new React project with Vite
npm create vite@latest my-app -- --template react-ts

# ✅ TypeScript setup
npm install --save-dev @types/react @types/react-dom
```

### ✅ **Environment Configuration**
Manage environment variables securely.

```javascript
// ✅ Environment configuration
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
};

export default config;
```

### ✅ **Bundle Optimization**
Configure build optimizations for production.

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
};
```

---

## 👥 Team Collaboration

### ✅ **Code Review Guidelines**
Establish clear review criteria for React code.

**Checklist for React Components:**
- [ ] Single responsibility principle followed
- [ ] Props are properly typed (TypeScript) or documented
- [ ] State management is appropriate for complexity
- [ ] Performance considerations (memoization) applied
- [ ] Accessibility features implemented
- [ ] Error handling in place
- [ ] Tests cover critical functionality
- [ ] No console.log statements in production code

### ✅ **Documentation Standards**
Document components and hooks effectively.

```jsx
/**
 * UserProfile component displays user information and actions
 * @param {Object} props - Component props
 * @param {string} props.userId - The ID of the user to display
 * @param {Function} props.onEdit - Callback when user is edited
 * @param {boolean} props.showActions - Whether to show action buttons
 * @returns {JSX.Element} User profile interface
 * @example
 * <UserProfile 
 *   userId="123" 
 *   onEdit={(user) => console.log(user)} 
 *   showActions={true} 
 * />
 */
export default function UserProfile({ userId, onEdit, showActions = false }) {
  // Component implementation
}
```

### ✅ **Git Workflow**
Use feature branches and conventional commits.

```bash
# ✅ Feature branch workflow
git checkout -b feature/user-profile-component
# Work on feature...
git add .
git commit -m "feat: add user profile component with edit functionality"
git push origin feature/user-profile-component
# Create pull request...
```

---

## 🚀 Migration Path for Existing Projects

### Phase 1: Foundation
1. **Set up TypeScript** (if not already)
2. **Implement testing framework** (Jest + React Testing Library)
3. **Add ESLint + Prettier** with React rules
4. **Establish code review process**

### Phase 2: Architecture
1. **Identify and extract custom hooks**
2. **Implement Context for global state**
3. **Add error boundaries**
4. **Optimize bundle with code splitting**

### Phase 3: Enhancement
1. **Add comprehensive testing**
2. **Implement accessibility improvements**
3. **Add performance monitoring**
4. **Set up CI/CD pipeline**

---

## 📚 Additional Resources

### Official Documentation
- [React.dev](https://react.dev) - Latest React documentation
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)

### Community Best Practices
- [React Patterns](https://reactpatterns.com)
- [Awesome React](https://github.com/enaqx/awesome-react)
- [React Performance](https://react.dev/learn/render-and-commit)

### Tools & Libraries
- **State Management**: Zustand, Jotai, Redux Toolkit
- **Styling**: Tailwind CSS, Styled Components, CSS Modules
- **Testing**: Jest, React Testing Library, MSW
- **Performance**: React DevTools Profiler, Bundle Analyzer

---

## 🎯 Key Takeaways

1. **Start simple, scale gradually** - Use useState initially, introduce useReducer and Context as needed
2. **Component composition over inheritance** - Build reusable components through composition
3. **State colocation** - Keep state close to where it's used
4. **Performance is a feature** - Implement code splitting and memoization early
5. **Test everything that could break** - Focus on user behavior over implementation details
6. **Accessibility is not optional** - Build inclusive experiences from the start
7. **Documentation enables scale** - Document components and decisions for team growth

This guide provides a foundation for building React applications that scale gracefully with team size and complexity. Follow these practices to ensure maintainable, performant, and accessible React applications.