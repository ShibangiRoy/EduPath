import { CourseItem } from '../types';

export const ALL_COURSES: Record<string, CourseItem[]> = {
  // Web & Full Stack
  web_foundations: [
    {
      id: 'fcc-responsive-web',
      title: 'Responsive Web Design Certification',
      provider: 'freeCodeCamp',
      type: 'free',
      url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
      description: 'Master HTML5 semantic elements, CSS3 flexbox, grid, and accessibility with 15+ hands-on projects.',
      duration: '300 hrs · Self-paced',
      rating: 4.9,
      highlight: '100% Free · Interactive Project Certificate',
    },
    {
      id: 'odin-foundations',
      title: 'The Odin Project: Foundations Path',
      provider: 'The Odin Project',
      type: 'free',
      url: 'https://www.theodinproject.com/paths/foundations/courses/foundations',
      description: 'Free open-source full-stack curriculum teaching Git, command line, HTML, and vanilla JavaScript in depth.',
      duration: '80 hrs · Project-driven',
      rating: 4.9,
      highlight: '100% Free · Real Developer Workflow',
    },
    {
      id: 'harvard-cs50x',
      title: 'CS50x: Introduction to Computer Science',
      provider: 'Harvard University / edX',
      type: 'free',
      url: 'https://pll.harvard.edu/course/cs50-introduction-computer-science',
      description: 'World-renowned introductory CS course covering algorithms, memory, data structures, and web development fundamentals.',
      duration: '12 weeks · 6-18 hrs/wk',
      rating: 5.0,
      highlight: 'Free to Audit · Harvard Curriculum',
    },
    {
      id: 'mdn-web-docs',
      title: 'MDN Web Docs: Front-end Web Developer',
      provider: 'Mozilla Developer Network',
      type: 'free',
      url: 'https://developer.mozilla.org/en-US/docs/Learn',
      description: 'The definitive open-web curriculum by Mozilla covering modern HTML, CSS, JavaScript, and Web APIs.',
      duration: 'Self-paced reference',
      rating: 4.9,
      highlight: '100% Free · Industry Gold Standard',
    },
    {
      id: 'meta-frontend-cert',
      title: 'Meta Front-End Developer Professional Certificate',
      provider: 'Coursera (Meta)',
      type: 'paid',
      url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
      description: 'Comprehensive 9-course program by Meta engineers covering React, UX principles, and career interview prep.',
      duration: '7 months · 6 hrs/wk',
      rating: 4.7,
      highlight: 'Paid with Financial Aid · Industry Credential',
    },
  ],

  javascript_mastery: [
    {
      id: 'fcc-js-algo',
      title: 'JavaScript Algorithms and Data Structures',
      provider: 'freeCodeCamp',
      type: 'free',
      url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/',
      description: 'Deep dive into ES6+, Object-Oriented Programming, functional programming, closures, and algorithmic problem solving.',
      duration: '300 hrs · Self-paced',
      rating: 4.9,
      highlight: '100% Free · Comprehensive Code Sandbox',
    },
    {
      id: 'javascript-info',
      title: 'The Modern JavaScript Tutorial',
      provider: 'JavaScript.info',
      type: 'free',
      url: 'https://javascript.info/',
      description: 'From fundamentals to event loops, prototypes, Promises, async/await, and DOM manipulation in granular detail.',
      duration: 'Self-paced textbook',
      rating: 5.0,
      highlight: '100% Free · Unmatched Depth & Clarity',
    },
    {
      id: 'scrimba-js-intro',
      title: 'The Frontend Developer Career Path (JS Track)',
      provider: 'Scrimba',
      type: 'free',
      url: 'https://scrimba.com/learn/frontend',
      description: 'Interactive coding screencasts where you pause and code directly in the instructor browser.',
      duration: '70 hrs interactive',
      rating: 4.8,
      highlight: 'Free modules available',
    },
    {
      id: 'jonas-complete-js',
      title: 'The Complete JavaScript Course: From Zero to Expert!',
      provider: 'Udemy (Jonas Schmedtmann)',
      type: 'paid',
      url: 'https://www.udemy.com/course/the-complete-javascript-course/',
      description: 'Top-rated 68-hour comprehensive deep-dive into how JS works behind the scenes (V8, scoping, hoisting).',
      duration: '68 hrs video',
      rating: 4.8,
      highlight: 'Paid · Best-selling Video Course',
    },
  ],

  react_frontend: [
    {
      id: 'fullstackopen-react',
      title: 'Full Stack Open: Part 1 - 3 (Modern React)',
      provider: 'University of Helsinki',
      type: 'free',
      url: 'https://fullstackopen.com/en/',
      description: 'Deep, university-accredited course in modern React with hooks, state management, and production-grade tooling.',
      duration: 'Self-paced university course',
      rating: 5.0,
      highlight: '100% Free · University of Helsinki ECTS Credits',
    },
    {
      id: 'react-dev-learn',
      title: 'React.dev Official Interactive Tutorials',
      provider: 'React Core Team',
      type: 'free',
      url: 'https://react.dev/learn',
      description: 'The all-new official documentation built with interactive Sandpack exercises teaching thinking in React.',
      duration: 'Self-paced interactive',
      rating: 4.9,
      highlight: '100% Free · Direct from Meta Core Team',
    },
    {
      id: 'epic-react-free',
      title: 'Beginner React Foundations',
      provider: 'Kent C. Dodds / Egghead',
      type: 'free',
      url: 'https://egghead.io/courses/the-beginner-s-guide-to-react',
      description: 'Understand what JSX really compiles to, raw React.createElement, and component lifecycles from scratch.',
      duration: '2.5 hrs fast-track',
      rating: 4.8,
      highlight: '100% Free · Deep Conceptual Grounding',
    },
    {
      id: 'frontend-masters-react',
      title: 'Complete Intro to React v8',
      provider: 'Frontend Masters (Brian Holt)',
      type: 'paid',
      url: 'https://frontendmasters.com/courses/complete-react-v8/',
      description: 'Enterprise React development with Vite, ESLint, React Router, and state machines with engineering leaders.',
      duration: '6 hrs in-depth',
      rating: 4.9,
      highlight: 'Paid Subscription · Enterprise Polish',
    },
  ],

  backend_databases: [
    {
      id: 'fcc-backend-apis',
      title: 'Back End Development and APIs',
      provider: 'freeCodeCamp',
      type: 'free',
      url: 'https://www.freecodecamp.org/learn/back-end-development-and-apis/',
      description: 'Build microservices and RESTful APIs using Node.js, Express, MongoDB, and Mongoose with automated tests.',
      duration: '300 hrs project-based',
      rating: 4.8,
      highlight: '100% Free · Real API Verification',
    },
    {
      id: 'sqlzoo-interactive',
      title: 'SQLZoo & PostgreSQL Exercises',
      provider: 'SQLZoo',
      type: 'free',
      url: 'https://sqlzoo.net/',
      description: 'Interactive SQL tutorial covering SELECT, JOINs, aggregations, window functions, and relational schema design.',
      duration: '20 hrs interactive',
      rating: 4.7,
      highlight: '100% Free · Instant Query Feedback',
    },
    {
      id: 'node-university-helsinki',
      title: 'Full Stack Open: Node.js, Express & Mongo',
      provider: 'University of Helsinki',
      type: 'free',
      url: 'https://fullstackopen.com/en/part3',
      description: 'Production backend engineering: middleware pipelines, authentication via JWT, error handlers, and cloud deploy.',
      duration: 'Self-paced',
      rating: 4.9,
      highlight: '100% Free · Real World Architecture',
    },
    {
      id: 'stephen-grider-node',
      title: 'Node.js, Express, MongoDB & More: The Complete Bootcamp',
      provider: 'Udemy (Jonas Schmedtmann)',
      type: 'paid',
      url: 'https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/',
      description: 'Build Natours, a full-featured server-side rendered and REST API web app with Stripe payments and security.',
      duration: '42 hrs video',
      rating: 4.8,
      highlight: 'Paid · Comprehensive Backend Architecture',
    },
  ],

  // Data Science & AI / ML
  data_science_python: [
    {
      id: 'kaggle-python-intro',
      title: 'Kaggle Learn: Python & Pandas Micro-Courses',
      provider: 'Kaggle (Google)',
      type: 'free',
      url: 'https://www.kaggle.com/learn',
      description: 'Concise, hands-on micro-courses in Python, Pandas dataframes, data visualization, and feature engineering.',
      duration: '20 hrs · Jupyter Notebooks',
      rating: 4.9,
      highlight: '100% Free · Cloud GPU & Notebooks Included',
    },
    {
      id: 'cs50p-python',
      title: "CS50P: CS50's Introduction to Programming with Python",
      provider: 'Harvard University / edX',
      type: 'free',
      url: 'https://cs50.harvard.edu/python/',
      description: 'David J. Malan introduces functions, loops, object-oriented programming, unit testing, and file I/O.',
      duration: '10 weeks · Harvard edX',
      rating: 5.0,
      highlight: 'Free to Audit · Harvard Professor Guidance',
    },
    {
      id: 'fastai-ml',
      title: 'Practical Deep Learning for Coders',
      provider: 'Fast.ai',
      type: 'free',
      url: 'https://course.fast.ai/',
      description: 'Top-down approach to state-of-the-art deep learning, PyTorch, vision, and NLP models with zero math gating.',
      duration: '7 weeks · 10 hrs/wk',
      rating: 5.0,
      highlight: '100% Free · Open Research Mission',
    },
    {
      id: 'coursera-deeplearning',
      title: 'Deep Learning Specialization by Andrew Ng',
      provider: 'DeepLearning.AI / Coursera',
      type: 'paid',
      url: 'https://www.coursera.org/specializations/deep-learning',
      description: 'Build neural networks from scratch in Python/NumPy, tune hyperparameters, and deploy CNNs & Transformers.',
      duration: '3 months · 10 hrs/wk',
      rating: 4.9,
      highlight: 'Paid with Financial Aid · Andrew Ng Instruction',
    },
  ],

  // UI/UX Design
  ui_ux_design: [
    {
      id: 'figma-official-tutorials',
      title: 'Figma for Beginners & Design Systems 101',
      provider: 'Figma Official',
      type: 'free',
      url: 'https://www.youtube.com/c/Figmadesign',
      description: 'Learn Auto Layout v5, component variants, design tokens, responsive typography, and interactive prototypes.',
      duration: '15 hrs video tutorials',
      rating: 4.9,
      highlight: '100% Free · Official Figma Creators',
    },
    {
      id: 'lawsofux',
      title: 'Laws of UX & Cognitive Psychology in Product Design',
      provider: 'Laws of UX (Jon Yablonski)',
      type: 'free',
      url: 'https://lawsofux.com/',
      description: 'A collection of the best practices that designers consider when building user interfaces and experiences.',
      duration: 'Self-paced interactive guide',
      rating: 4.9,
      highlight: '100% Free · Essential Mental Models',
    },
    {
      id: 'google-ux-cert',
      title: 'Google UX Design Professional Certificate',
      provider: 'Google / Coursera',
      type: 'paid',
      url: 'https://www.coursera.org/professional-certificates/google-ux-design',
      description: 'Complete foundational program by Google designers covering empathizing with users, wireframing, and usability studies.',
      duration: '6 months · 10 hrs/wk',
      rating: 4.8,
      highlight: 'Paid with Financial Aid · Portfolio Projects',
    },
  ],

  // Mobile App Development
  mobile_dev: [
    {
      id: 'react-native-official',
      title: 'React Native & Expo Official Interactive Track',
      provider: 'React Native / Expo Team',
      type: 'free',
      url: 'https://reactnative.dev/docs/getting-started',
      description: 'Build cross-platform iOS and Android apps using native components, Expo tooling, and navigation stacks.',
      duration: 'Self-paced documentation & sandboxes',
      rating: 4.8,
      highlight: '100% Free · Cross-Platform Foundation',
    },
    {
      id: 'google-android-compose',
      title: 'Android Basics with Jetpack Compose',
      provider: 'Google Developers',
      type: 'free',
      url: 'https://developer.android.com/courses/android-basics-compose/course',
      description: 'Learn modern Android development using Kotlin and Jetpack Compose to build native smartphone apps.',
      duration: 'Self-paced codelabs',
      rating: 4.9,
      highlight: '100% Free · Official Google Curriculum',
    },
    {
      id: 'udemy-react-native-max',
      title: 'React Native - The Practical Guide',
      provider: 'Udemy (Maximilian Schwarzmüller)',
      type: 'paid',
      url: 'https://www.udemy.com/course/react-native-the-practical-guide/',
      description: 'Complete guide from zero to app store publishing including SQLite, Redux Toolkit, animations, and push notifications.',
      duration: '32 hrs video',
      rating: 4.7,
      highlight: 'Paid · Real Device Testing',
    },
  ],
};

/**
 * Returns prioritized course recommendations for a given topic and career goal.
 * CRITICAL RULE: Free courses are strictly prioritized and sorted first!
 */
export function getCoursesForTopic(topic: string, goal: string): CourseItem[] {
  const t = (topic || '').toLowerCase();
  const g = (goal || '').toLowerCase();

  let pool: CourseItem[] = [];

  if (t.includes('html') || t.includes('css') || t.includes('layout') || t.includes('web foundation') || t.includes('semantic')) {
    pool = ALL_COURSES.web_foundations;
  } else if (t.includes('js') || t.includes('javascript') || t.includes('async') || t.includes('callback') || t.includes('event loop') || t.includes('promise') || t.includes('es6')) {
    pool = ALL_COURSES.javascript_mastery;
  } else if (t.includes('react') || t.includes('component') || t.includes('state') || t.includes('hooks') || t.includes('frontend')) {
    pool = ALL_COURSES.react_frontend;
  } else if (t.includes('sql') || t.includes('node') || t.includes('backend') || t.includes('database') || t.includes('mongo') || t.includes('express') || t.includes('api')) {
    pool = ALL_COURSES.backend_databases;
  } else if (g.includes('data') || g.includes('machine') || g.includes('ai') || t.includes('python') || t.includes('pandas') || t.includes('numpy')) {
    pool = ALL_COURSES.data_science_python;
  } else if (g.includes('ui') || g.includes('ux') || g.includes('design') || t.includes('figma')) {
    pool = ALL_COURSES.ui_ux_design;
  } else if (g.includes('mobile') || g.includes('native') || t.includes('mobile')) {
    pool = ALL_COURSES.mobile_dev;
  } else {
    // Default smart mix based on goal
    if (g.includes('data') || g.includes('analyst') || g.includes('ai')) {
      pool = ALL_COURSES.data_science_python;
    } else {
      pool = [...ALL_COURSES.web_foundations, ...ALL_COURSES.javascript_mastery];
    }
  }

  // Strictly prioritize FREE courses over PAID courses!
  const freeCourses = pool.filter(c => c.type === 'free');
  const paidCourses = pool.filter(c => c.type === 'paid');

  return [...freeCourses, ...paidCourses];
}
