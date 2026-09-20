import { QuizQuestion, ExperienceLevel } from '../types';

export const TOPIC_PRESETS = [
  { id: 'react', label: 'React.js & Hooks', icon: '⚛️', skill: 'React.js' },
  { id: 'typescript', label: 'TypeScript Mastery', icon: '🔷', skill: 'TypeScript' },
  { id: 'javascript', label: 'Modern JavaScript (ES6+)', icon: '💛', skill: 'JavaScript (ES6+)' },
  { id: 'tailwind', label: 'CSS & Modern Layouts', icon: '🎨', skill: 'CSS3 & Modern Layouts' },
  { id: 'nodejs', label: 'Node.js & Express APIs', icon: '🟢', skill: 'Node.js & Express' },
  { id: 'sql', label: 'SQL & Database Queries', icon: '🗄️', skill: 'SQL & Database Queries' },
  { id: 'python', label: 'Python Foundations', icon: '🐍', skill: 'Python Foundations' },
  { id: 'git', label: 'Git & Version Control', icon: '🌿', skill: 'Git & GitHub' },
  { id: 'uiux', label: 'UI/UX & Design Systems', icon: '✨', skill: 'UI/UX & Product Design' },
  { id: 'fullstack', label: 'Web Security (JWT/CORS)', icon: '🛡️', skill: 'Web Security (JWT/OAuth)' },
];

export const FALLBACK_QUIZZES: Record<string, QuizQuestion[]> = {
  react: [
    {
      id: 'react-1',
      question: 'Why should you avoid mutating state directly in React (e.g. `items.push(newItem)`)?',
      codeSnippet: `// ❌ Incorrect:\nitems.push(newItem);\nsetItems(items);`,
      options: [
        'React compares previous and next state by object reference; mutating the same array keeps the same reference, preventing re-renders',
        'Direct mutations cause JavaScript memory leaks in browser tabs',
        'React throws a runtime SyntaxError when arrays are modified',
        'The push method is deprecated in modern ECMAScript standards'
      ],
      correctIndex: 0,
      explanation: 'React uses shallow reference equality (`prev === next`) to detect changes. If you mutate the existing array in place, its reference never changes, so React assumes nothing changed and skips re-rendering!',
      exampleSnippet: `// ✅ Correct (creates a new array reference):\nsetItems(prevItems => [...prevItems, newItem]);`,
      skillTag: 'React.js'
    },
    {
      id: 'react-2',
      question: 'What is the primary purpose of passing a function to `useState` (e.g. `useState(() => computeInitialData())`)?',
      codeSnippet: `const [data, setData] = useState(() => calculateHeavyExpenseList());`,
      options: [
        'Lazy initialization: the heavy calculation runs only once on initial mount instead of every render cycle',
        'It makes the state asynchronous and non-blocking for Web Workers',
        'It binds the state to global window storage',
        'It allows the state to accept multiple arguments'
      ],
      correctIndex: 0,
      explanation: 'Passing a function initializer ensures expensive computations run only during the initial component mount, avoiding unnecessary recalculation on subsequent re-renders.',
      exampleSnippet: `// Only executes once when the component first mounts:\nconst [config, setConfig] = useState(() => JSON.parse(localStorage.getItem('saved_config') || '{}'));`,
      skillTag: 'React.js'
    },
    {
      id: 'react-3',
      question: 'In `useEffect`, why is returning a cleanup function critical when setting up subscriptions or event listeners?',
      codeSnippet: `useEffect(() => {\n  const timer = setInterval(tick, 1000);\n  return () => clearInterval(timer); // 👈 Why?\n}, []);`,
      options: [
        'To prevent memory leaks and duplicate listeners when the component unmounts or dependencies change',
        'To automatically refresh the page if an error occurs',
        'To tell React to trigger a garbage collection cycle immediately',
        'To convert the timer into a Web Worker process'
      ],
      correctIndex: 0,
      explanation: 'Without the cleanup function, listeners or timers persist in memory even after the component unmounts, causing subtle memory leaks, zombie callbacks, and duplicate executions.',
      exampleSnippet: `useEffect(() => {\n  const onResize = () => setWidth(window.innerWidth);\n  window.addEventListener('resize', onResize);\n  return () => window.removeEventListener('resize', onResize);\n}, []);`,
      skillTag: 'React.js'
    },
    {
      id: 'react-4',
      question: 'What is the key difference between `useMemo` and `useCallback`?',
      options: [
        'useMemo caches the result of calling a function; useCallback caches the function definition itself',
        'useMemo is for server components; useCallback is for client components',
        'useCallback runs asynchronously; useMemo runs synchronously',
        'useMemo only works with numbers and strings; useCallback works with objects'
      ],
      correctIndex: 0,
      explanation: '`useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`. `useCallback` returns a memoized callback function instance so child components that rely on reference equality do not re-render unnecessarily.',
      exampleSnippet: `// Returns cached function reference:\nconst handleClick = useCallback(() => {\n  doSomething(id);\n}, [id]);`,
      skillTag: 'React.js'
    }
  ],
  typescript: [
    {
      id: 'ts-1',
      question: 'What is the main difference between TypeScript `interface` and `type` alias when extending?',
      options: [
        'Interfaces support declaration merging (you can define the same interface multiple times); type aliases cannot be reopened',
        'Interfaces only work with primitive types',
        'Type aliases are compiled into JavaScript classes at runtime',
        'Interfaces cannot be exported from modules'
      ],
      correctIndex: 0,
      explanation: 'Interfaces allow declaration merging, meaning if you declare `interface User` twice, their fields combine. Type aliases are closed and cannot be re-declared in the same scope.',
      exampleSnippet: `interface Window {\n  analyticsToken?: string; // Merges into global Window interface\n}`,
      skillTag: 'TypeScript'
    },
    {
      id: 'ts-2',
      question: 'Why should you prefer `unknown` over `any` for untyped or third-party input data?',
      options: [
        'unknown enforces type checking and type narrowing before any properties or methods can be accessed, preventing runtime crashes',
        'unknown compiles to smaller JavaScript output than any',
        'any causes TypeScript compiler to fail with a warning',
        'unknown allows automatic serialization to JSON'
      ],
      correctIndex: 0,
      explanation: '`any` completely turns off TypeScript type checking, allowing unsafe operations that can crash at runtime. `unknown` forces you to perform runtime checks (like `typeof x === "string"`) before using the value.',
      exampleSnippet: `function parse(val: unknown) {\n  if (typeof val === 'string') {\n    console.log(val.toUpperCase()); // Safe!\n  }\n}`,
      skillTag: 'TypeScript'
    },
    {
      id: 'ts-3',
      question: 'What does the `keyof` operator produce in TypeScript?',
      codeSnippet: `interface User {\n  id: string;\n  name: string;\n  age: number;\n}\ntype UserKeys = keyof User;`,
      options: [
        'A union of string literal types representing the property names: "id" | "name" | "age"',
        'An array of runtime string values: ["id", "name", "age"]',
        'The number 3 representing total fields in the interface',
        'A prototype dictionary of getter methods'
      ],
      correctIndex: 0,
      explanation: '`keyof` creates a union of literal types from the keys of an object type. It allows you to build generic, type-safe accessor functions.',
      exampleSnippet: `function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}`,
      skillTag: 'TypeScript'
    }
  ],
  javascript: [
    {
      id: 'js-1',
      question: 'In the JavaScript Event Loop, which queue takes precedence after the current synchronous call stack finishes: Microtasks or Macrotasks?',
      options: [
        'Microtasks (Promises, queueMicrotask) execute before any Macrotasks (setTimeout, setInterval)',
        'Macrotasks execute first, followed by microtasks',
        'Both queues execute in parallel using web worker threads',
        'They alternate strictly one-by-one'
      ],
      correctIndex: 0,
      explanation: 'The event loop processes all pending microtasks (like Promise callbacks and MutationObservers) completely to exhaustion before picking the next macrotask (such as setTimeout callback).',
      exampleSnippet: `console.log('1');\nsetTimeout(() => console.log('2'), 0); // Macrotask\nPromise.resolve().then(() => console.log('3')); // Microtask\nconsole.log('4');\n// Output order: 1, 4, 3, 2`,
      skillTag: 'JavaScript (ES6+)'
    },
    {
      id: 'js-2',
      question: 'What does closure in JavaScript allow an inner function to do?',
      options: [
        'Access variables and parameters from its lexical outer scope even after the outer function has finished executing',
        'Prevent other scripts from inspecting its memory footprint',
        'Close network connections automatically when errors happen',
        'Convert private object keys into symbols'
      ],
      correctIndex: 0,
      explanation: 'A closure is the combination of a function bundled together with references to its surrounding state (lexical environment). It retains access to outer variables even after the outer function returns.',
      exampleSnippet: `function createCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst counter = createCounter();\nconsole.log(counter()); // 1\nconsole.log(counter()); // 2`,
      skillTag: 'JavaScript (ES6+)'
    }
  ],
  nodejs: [
    {
      id: 'node-1',
      question: 'Why should CPU-intensive operations (like large image transformations or massive synchronous loops) not run directly on the Node.js main thread?',
      options: [
        'Node.js uses a single-threaded event loop for handling requests; blocking it halts all other incoming HTTP connections',
        'Node.js will crash immediately if a loop exceeds 1,000 iterations',
        'V8 garbage collector refuses to run during loops',
        'Operating systems reject socket connections with CPU usage above 50%'
      ],
      correctIndex: 0,
      explanation: 'Because Node.js processes events on a single thread, any heavy synchronous CPU calculation blocks the event loop, causing all concurrent user requests to stall and timeout.',
      exampleSnippet: `// Use Worker Threads or offload to background queues:\nimport { Worker } from 'worker_threads';\nconst worker = new Worker('./heavy-processor.js');`,
      skillTag: 'Node.js & Express'
    },
    {
      id: 'node-2',
      question: 'In Express middleware, what happens if your middleware does not call `next()` or send a response via `res.send()` / `res.json()`?',
      options: [
        'The client HTTP request hangs indefinitely until the browser or client times out',
        'Express automatically returns a 200 OK status after 500ms',
        'Express skips to the next route handler automatically',
        'A 404 Not Found is immediately returned to the caller'
      ],
      correctIndex: 0,
      explanation: 'Every Express middleware must either pass control forward using `next()` or terminate the request-response cycle by sending a response (`res.json(...)`). If neither is called, the request stays pending until it times out.',
      exampleSnippet: `app.use((req, res, next) => {\n  console.log(\`Request to \${req.url}\`);\n  next(); // 👈 Must call next() to pass to next handler!\n});`,
      skillTag: 'Node.js & Express'
    }
  ],
  sql: [
    {
      id: 'sql-1',
      question: 'What is the fundamental difference between `INNER JOIN` and `LEFT JOIN` in SQL?',
      options: [
        'INNER JOIN returns only matching rows from both tables; LEFT JOIN returns all rows from the left table plus matching rows from the right',
        'INNER JOIN is for numeric columns; LEFT JOIN is for text columns',
        'LEFT JOIN removes NULL values automatically',
        'INNER JOIN cannot be combined with WHERE clauses'
      ],
      correctIndex: 0,
      explanation: '`INNER JOIN` excludes rows where no foreign key match exists. `LEFT JOIN` guarantees that every single record from the left table is returned, filling missing right-side values with `NULL`.',
      exampleSnippet: `SELECT users.name, orders.id\nFROM users\nLEFT JOIN orders ON users.id = orders.user_id;\n-- Returns users even if they have zero orders!`,
      skillTag: 'SQL & Database Queries'
    }
  ],
};

/**
 * Returns tailored quiz questions for a given topic and experience level
 */
export function getLocalQuizForTopic(topic: string, experience: ExperienceLevel = 'beginner'): QuizQuestion[] {
  const t = topic.toLowerCase();

  let matchedCategory: QuizQuestion[] | undefined;

  if (t.includes('react') || t.includes('hook') || t.includes('frontend') || t.includes('state')) {
    matchedCategory = FALLBACK_QUIZZES.react;
  } else if (t.includes('type') || t.includes('interface') || t.includes('generics')) {
    matchedCategory = FALLBACK_QUIZZES.typescript;
  } else if (t.includes('js') || t.includes('script') || t.includes('es6') || t.includes('async')) {
    matchedCategory = FALLBACK_QUIZZES.javascript;
  } else if (t.includes('node') || t.includes('express') || t.includes('backend') || t.includes('api')) {
    matchedCategory = FALLBACK_QUIZZES.nodejs;
  } else if (t.includes('sql') || t.includes('database') || t.includes('postgres') || t.includes('query')) {
    matchedCategory = FALLBACK_QUIZZES.sql;
  } else {
    // Return a curated mixed challenge
    matchedCategory = [
      FALLBACK_QUIZZES.react[0],
      FALLBACK_QUIZZES.typescript[0],
      FALLBACK_QUIZZES.javascript[0],
      FALLBACK_QUIZZES.nodejs[0],
    ];
  }

  // Clone so questions can be safely manipulated
  return JSON.parse(JSON.stringify(matchedCategory || FALLBACK_QUIZZES.react));
}
