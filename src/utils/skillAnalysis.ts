import { ExperienceLevel, SkillEntry, RoadmapNode, DayPlan } from '../types';
import { getCoursesForTopic } from './courseData';

interface CompetencyDef {
  name: string;
  required: number;
  keywords: string[];
  description: string;
}

const GOAL_COMPETENCIES: Record<string, CompetencyDef[]> = {
  fullstack: [
    {
      name: 'HTML & Semantic Markup',
      required: 10,
      keywords: ['html', 'html5', 'semantic', 'markup', 'dom', 'web standards'],
      description: 'Document structure, accessible tags, and SEO semantics.',
    },
    {
      name: 'CSS & Modern Layouts',
      required: 10,
      keywords: ['css', 'css3', 'flexbox', 'grid', 'tailwind', 'sass', 'responsive', 'styling', 'bootstrap'],
      description: 'Responsive design, Flexbox, CSS Grid, and utility styling.',
    },
    {
      name: 'JavaScript Core & Async',
      required: 10,
      keywords: ['javascript', 'js', 'es6', 'typescript', 'ts', 'promises', 'async', 'event loop', 'closures', 'fetch'],
      description: 'Data structures, asynchronous programming, and DOM APIs.',
    },
    {
      name: 'React & State Architecture',
      required: 10,
      keywords: ['react', 'reactjs', 'nextjs', 'redux', 'hooks', 'zustand', 'component', 'jsx', 'frontend'],
      description: 'Component lifecycles, hooks, client state, and modern UI rendering.',
    },
    {
      name: 'Node.js & Backend APIs',
      required: 9,
      keywords: ['node', 'nodejs', 'express', 'backend', 'api', 'rest', 'server', 'http', 'middleware'],
      description: 'Server architecture, REST endpoints, authentication, and services.',
    },
    {
      name: 'Databases & System Design',
      required: 8,
      keywords: ['database', 'sql', 'postgresql', 'postgres', 'mongodb', 'mongo', 'mysql', 'prisma', 'orm', 'schema'],
      description: 'Relational & NoSQL persistence, data modeling, and query optimization.',
    },
  ],

  datascience: [
    {
      name: 'Python Foundations',
      required: 10,
      keywords: ['python', 'python3', 'oop', 'scripts', 'jupyter', 'functions'],
      description: 'Syntax, control flow, functions, and standard libraries.',
    },
    {
      name: 'Math & Statistical Analysis',
      required: 9,
      keywords: ['statistics', 'stats', 'probability', 'linear algebra', 'calculus', 'math'],
      description: 'Distributions, hypothesis testing, regression analysis, and variance.',
    },
    {
      name: 'Data Wrangling (Pandas & NumPy)',
      required: 10,
      keywords: ['pandas', 'numpy', 'data wrangling', 'dataframe', 'cleaning', 'etl', 'eda'],
      description: 'Vectorized computing, exploratory data analysis, and missing data imputation.',
    },
    {
      name: 'SQL & Data Warehousing',
      required: 8,
      keywords: ['sql', 'queries', 'postgres', 'bigquery', 'snowflake', 'joins', 'aggregations'],
      description: 'Complex joins, window functions, and analytics query design.',
    },
    {
      name: 'Machine Learning (Scikit-Learn)',
      required: 10,
      keywords: ['machine learning', 'ml', 'scikit-learn', 'sklearn', 'classification', 'random forest', 'clustering'],
      description: 'Supervised & unsupervised models, cross-validation, and metrics.',
    },
    {
      name: 'Deep Learning & Neural Nets',
      required: 7,
      keywords: ['deep learning', 'neural networks', 'pytorch', 'tensorflow', 'keras', 'nlp', 'vision', 'llm'],
      description: 'Tensors, backpropagation, CNNs, transformers, and model inference.',
    },
  ],

  uiux: [
    {
      name: 'UX Research & Information Architecture',
      required: 9,
      keywords: ['user research', 'research', 'interviews', 'personas', 'ia', 'user flow', 'wireframes'],
      description: 'Empathy mapping, user journeys, usability testing, and hierarchy.',
    },
    {
      name: 'Visual & UI Design Principles',
      required: 10,
      keywords: ['ui design', 'visual design', 'typography', 'color theory', 'spacing', 'grids', 'layout'],
      description: 'Visual balance, typography pairings, color systems, and contrast.',
    },
    {
      name: 'Figma Mastery & Prototyping',
      required: 10,
      keywords: ['figma', 'auto layout', 'components', 'variants', 'prototype', 'interactive prototype'],
      description: 'Auto layout, component libraries, variable tokens, and micro-interactions.',
    },
    {
      name: 'Design Systems & Tokens',
      required: 9,
      keywords: ['design system', 'tokens', 'atomic design', 'component library', 'figma tokens'],
      description: 'Scalable pattern libraries, token hierarchies, and cross-team consistency.',
    },
    {
      name: 'Accessibility (a11y) & Usability',
      required: 8,
      keywords: ['accessibility', 'a11y', 'wcag', 'contrast', 'screen readers', 'usability'],
      description: 'WCAG 2.1 compliance, accessible interactive states, and inclusive design.',
    },
    {
      name: 'Frontend Handoff & HTML/CSS',
      required: 7,
      keywords: ['developer handoff', 'html', 'css', 'inspect', 'box model', 'handoff'],
      description: 'Dev specifications, asset preparation, and responsive implementation constraints.',
    },
  ],

  mobile: [
    {
      name: 'Modern JavaScript / TypeScript',
      required: 9,
      keywords: ['javascript', 'typescript', 'ts', 'es6', 'async'],
      description: 'Type safety, asynchronous programming, and clean code architecture.',
    },
    {
      name: 'React Native & Mobile UI',
      required: 10,
      keywords: ['react native', 'native', 'expo', 'mobile ui', 'stylesheet', 'components'],
      description: 'Cross-platform views, gestures, native styles, and adaptive screen layouts.',
    },
    {
      name: 'Navigation & Architecture',
      required: 9,
      keywords: ['react navigation', 'navigation', 'stack', 'tabs', 'drawer', 'deep linking'],
      description: 'Stack/tab routing, parameter passing, and screen transition flows.',
    },
    {
      name: 'State Management & Offline Storage',
      required: 8,
      keywords: ['redux', 'zustand', 'asyncstorage', 'sqlite', 'offline', 'mmkv'],
      description: 'Global state synchronization, caching, and offline-first persistence.',
    },
    {
      name: 'Device APIs & Native Modules',
      required: 8,
      keywords: ['camera', 'notifications', 'location', 'gps', 'sensors', 'biometrics', 'expo modules'],
      description: 'Push notifications, camera capture, location tracking, and device permissions.',
    },
    {
      name: 'App Store Deploy & Publishing',
      required: 6,
      keywords: ['app store', 'play store', 'eas', 'build', 'release', 'signing', 'publishing'],
      description: 'Bundle signing, EAS build pipelines, and production release distribution.',
    },
  ],

  backend: [
    {
      name: 'Language Proficiency (Node/Python/Go)',
      required: 10,
      keywords: ['node', 'nodejs', 'python', 'go', 'golang', 'java', 'typescript'],
      description: 'Core language mastery, standard runtime libraries, and async event loops.',
    },
    {
      name: 'REST & GraphQL API Architecture',
      required: 10,
      keywords: ['rest', 'api', 'graphql', 'endpoints', 'middleware', 'status codes', 'swagger'],
      description: 'Idempotency, status design, serialization, and versioning standards.',
    },
    {
      name: 'Relational & NoSQL Databases',
      required: 9,
      keywords: ['sql', 'postgres', 'postgresql', 'mysql', 'mongodb', 'indexing', 'queries', 'transactions'],
      description: 'ACID transactions, schema migrations, indexing, and connection pools.',
    },
    {
      name: 'Auth, Security & JWT',
      required: 9,
      keywords: ['auth', 'jwt', 'oauth', 'security', 'cors', 'hashing', 'bcrypt', 'rbac'],
      description: 'Session handling, bearer tokens, encryption, and permission models.',
    },
    {
      name: 'Caching & Message Queues',
      required: 8,
      keywords: ['redis', 'cache', 'rabbitmq', 'kafka', 'pubsub', 'celery', 'bull'],
      description: 'In-memory key-value caching, asynchronous queues, and job processing.',
    },
    {
      name: 'Docker & Cloud Deployment',
      required: 8,
      keywords: ['docker', 'container', 'kubernetes', 'aws', 'gcp', 'ci/cd', 'deploy', 'linux'],
      description: 'Containerization, environment configuration, and cloud deployment.',
    },
  ],
};

function getCategoryForGoal(goal: string): string {
  const g = (goal || '').toLowerCase();
  if (g.includes('data') || g.includes('machine learn') || g.includes('ai') || g.includes('analyst')) return 'datascience';
  if (g.includes('ui') || g.includes('ux') || g.includes('design') || g.includes('product design')) return 'uiux';
  if (g.includes('mobile') || g.includes('ios') || g.includes('android') || g.includes('flutter') || g.includes('react native')) return 'mobile';
  if (g.includes('backend') || g.includes('devops') || g.includes('cloud') || g.includes('systems')) return 'backend';
  return 'fullstack';
}

/**
 * Analyzes the user's skill gap based on:
 * - Target Goal
 * - Experience Level (beginner, intermediate, advanced)
 * - Bio Note (user description of projects/experience)
 * - Uploaded Resume file name
 * - User-selected / recognized skills
 * - Custom skill rating overrides
 */
export function analyzeSkillGap(
  goal: string,
  experience: ExperienceLevel,
  bioNote: string = '',
  resumeFileName: string = '',
  recognizedSkills: string[] = [],
  customRatings: Record<string, number> = {}
): SkillEntry[] {
  const category = getCategoryForGoal(goal);
  const definitions = GOAL_COMPETENCIES[category] || GOAL_COMPETENCIES.fullstack;

  const textToScan = `${bioNote} ${resumeFileName} ${recognizedSkills.join(' ')}`.toLowerCase();
  const isBeginnerText = textToScan.includes('beginner') || textToScan.includes('no experience') || textToScan.includes('zero knowledge') || textToScan.includes('just starting');
  const isExperiencedText = textToScan.includes('years') || textToScan.includes('experienced') || textToScan.includes('senior') || textToScan.includes('built many') || textToScan.includes('proficient');

  return definitions.map((def, idx) => {
    // 1. Calculate baseline score based on declared experience level and position in curriculum
    let baseline = 0;
    if (experience === 'beginner') {
      // Beginners start at zero or minimal fundamentals
      baseline = idx === 0 ? 1 : 0;
    } else if (experience === 'intermediate') {
      // Intermediates know foundational steps, partial intermediate, little advanced
      if (idx === 0) baseline = 8;
      else if (idx === 1) baseline = 7;
      else if (idx === 2) baseline = 4;
      else if (idx === 3) baseline = 2;
      else baseline = 1;
    } else if (experience === 'advanced') {
      // Advanced know foundations thoroughly, working on specialized areas
      if (idx <= 1) baseline = 9;
      else if (idx <= 3) baseline = 7;
      else baseline = 5;
    }

    // 2. Search for explicit mentions in bio note or resume
    let detectedMatches = 0;
    let highProficiencyMention = false;
    let struggleMention = false;

    for (const kw of def.keywords) {
      if (textToScan.includes(kw)) {
        detectedMatches++;
        // Check if mentioned in a positive "built" or "proficient" context
        const kwIdx = textToScan.indexOf(kw);
        const snippet = textToScan.slice(Math.max(0, kwIdx - 30), Math.min(textToScan.length, kwIdx + 40));
        if (snippet.includes('know') || snippet.includes('built') || snippet.includes('experience') || snippet.includes('proficient') || snippet.includes('used') || snippet.includes('work with') || snippet.includes('created')) {
          highProficiencyMention = true;
        }
        if (snippet.includes('struggle') || snippet.includes('hard') || snippet.includes('confused') || snippet.includes('want to learn') || snippet.includes('need to learn') || snippet.includes('learning')) {
          struggleMention = true;
        }
      }
    }

    let calculatedCurrent = baseline;
    let note = '';
    let source: 'detected' | 'baseline' | 'user' = 'baseline';

    if (isBeginnerText && experience === 'beginner') {
      calculatedCurrent = Math.min(calculatedCurrent, 1);
      note = 'Identified as beginner baseline.';
    } else if (detectedMatches > 0) {
      source = 'detected';
      if (highProficiencyMention || isExperiencedText) {
        calculatedCurrent = Math.max(calculatedCurrent, Math.min(def.required, 8 + Math.min(2, detectedMatches)));
        note = `Identified from your projects & skills description (${def.keywords.filter(k => textToScan.includes(k)).slice(0, 2).join(', ')}).`;
      } else if (struggleMention) {
        calculatedCurrent = Math.max(1, Math.min(calculatedCurrent, 3));
        note = 'Identified as a growth/struggle area in your profile.';
      } else {
        calculatedCurrent = Math.max(calculatedCurrent, Math.min(def.required - 1, 5 + detectedMatches));
        note = `Mentioned in your background background profile.`;
      }
    } else {
      note = `Standard ${experience} curriculum baseline.`;
    }

    // 3. Apply custom user rating override if provided
    if (typeof customRatings[def.name] === 'number') {
      calculatedCurrent = Math.max(0, Math.min(10, customRatings[def.name]));
      source = 'user';
      note = 'Adjusted manually by you.';
    }

    const gap = Math.max(0, def.required - calculatedCurrent);
    const priority = gap >= 4 || (calculatedCurrent <= 2 && def.required >= 8) || struggleMention;

    return {
      name: def.name,
      current: calculatedCurrent,
      required: def.required,
      priority,
      notes: note,
      source,
    };
  });
}

/**
 * Builds the personalized Roadmap ("Your Journey") dynamically based on the analyzed Skill Gap!
 * CRITICAL FIX:
 * - Nodes for skills the user has already mastered (current >= required - 1 or current >= 7) are marked done: true!
 * - The very first node where current < required is marked current: true (active focus frontier)!
 * - Subsequent nodes are marked done: false, current: false!
 * - The final node represents the career goal!
 */
export function getAnalyzedRoadmap(
  goal: string,
  experience: ExperienceLevel,
  skills: SkillEntry[]
): RoadmapNode[] {
  const category = getCategoryForGoal(goal);
  const targetTitle = goal.trim() || 'Full Stack Developer';

  // Sub-topics for each roadmap stage
  const stageSubTopics: Record<string, string[][]> = {
    fullstack: [
      ['HTML5 Semantic Elements', 'Accessible Forms & ARIA Labels', 'Document Structure & SEO Best Practices', 'Responsive Images & Media Elements'],
      ['CSS3 Flexbox Mastery', 'CSS Grid 2D Layouts', 'Tailwind CSS Utility Design', 'Mobile-First Responsive Breakpoints'],
      ['Modern ES6+ Syntax & Scope', 'Asynchronous JS, Promises & Async/Await', 'DOM Event Handling & Propagation', 'API Fetching & Error Handling'],
      ['Thinking in Components', 'React Hooks (useState, useEffect, useMemo)', 'Custom Hooks & Reusable Patterns', 'State Architecture & Store Sync'],
      ['RESTful API Routing in Express', 'Middleware Pipeline & Error Handling', 'JWT Authentication & Cookies', 'Security Best Practices (CORS, Helmet)'],
      ['Relational Schema Modeling (PostgreSQL)', 'SQL Joins, Aggregations & Indexes', 'Prisma ORM & Type-Safe Queries', 'Cloud DB Provisioning & Migrations'],
    ],
    datascience: [
      ['Python Syntax, Loops & Functions', 'Object-Oriented Python', 'Data Structures (Lists, Dicts, Sets)', 'Virtual Environments & Packaging'],
      ['Descriptive & Inferential Statistics', 'Probability Distributions & p-values', 'Hypothesis Testing & A/B Analysis', 'Linear Algebra & Matrix Operations'],
      ['Pandas DataFrames & Series Indexing', 'NumPy Vectorized Array Operations', 'Handling Missing Data & Outliers', 'Exploratory Data Analysis (EDA) & Seaborn'],
      ['Advanced SQL Joins & Window Functions', 'Database Normalization for Analytics', 'ETL Data Pipeline Construction', 'Connecting Python to PostgreSQL'],
      ['Scikit-Learn Regression & Classification', 'Cross-Validation & Hyperparameter Tuning', 'Random Forests & Gradient Boosting (XGBoost)', 'Feature Engineering & Ensembling'],
      ['Neural Network Fundamentals in PyTorch', 'Convolutional Networks for Computer Vision', 'Transformer Models & LLM Fine-Tuning', 'Model Evaluation & Cloud Deployment'],
    ],
    uiux: [
      ['User Interviews & Empathy Maps', 'Synthesizing Affinity Diagrams', 'Information Architecture & Sitemap', 'User Journey Mapping & Personas'],
      ['Visual Hierarchy & Optical Spacing', 'Typography Scales & Contrast Ratios', 'Harmonious Color Palettes', 'Affordances & Laws of UX'],
      ['Figma Auto Layout v5 in Depth', 'Component Variants & Component Sets', 'Interactive Micro-Prototypes', 'Variable Modes (Light/Dark Switch)'],
      ['Design Tokens & Semantic Naming', 'Atomic Design Frameworks', 'Reusable Pattern Documentation', 'Managing Cross-Platform Token Exports'],
      ['WCAG 2.1 AA Compliance Rules', 'Color Contrast & Accessible Focus Rings', 'Screen Reader Navigation Audits', 'Inclusive Interaction Design'],
      ['Design Specifications for Engineers', 'Asset Export Optimization (SVG/WebP)', 'Design System Alignment with React/Tailwind', 'Collaborative QA & Design Reviews'],
    ],
    mobile: [
      ['TypeScript Types, Interfaces & Generics', 'Async/Await & Error Boundaries', 'Functional Programming in Mobile', 'Clean Code Principles'],
      ['React Native Core Components & Views', 'Flexbox for Native Screens', 'Expo Workflow & Simulator Setup', 'Platform-Specific Styling (iOS vs Android)'],
      ['React Navigation Stack & Tabs', 'Passing Route Parameters with TypeScript', 'Modal Sheets & Custom Headers', 'Handling Deep Links'],
      ['Global State with Zustand or Redux Toolkit', 'Offline Storage with MMKV/AsyncStorage', 'Optimistic UI Updates', 'Cache Invalidation with React Query'],
      ['Camera & Image Picker Integration', 'Location Tracking & Mapbox/Google Maps', 'Push Notifications with Expo/FCM', 'Biometric Authentication (FaceID/TouchID)'],
      ['Building iOS & Android Bundles with EAS', 'Creating App Store & Google Play Listings', 'TestFlight & Internal Track Deployment', 'Monitoring Crashlytics & Over-The-Air Updates'],
    ],
    backend: [
      ['Advanced Node.js / Python Architecture', 'Asynchronous Event Loop Mechanics', 'Modular Directory Structures', 'Unit & Integration Testing (Vitest/Jest)'],
      ['RESTful Resource Design & Status Codes', 'GraphQL Schemas & Resolvers', 'Request Validation & Sanitization', 'Swagger / OpenAPI Documentation'],
      ['PostgreSQL Normalization & Indexing', 'ACID Transactions & Row Locking', 'Database Migration Management', 'Connection Pooling & Query Optimization'],
      ['OAuth2 & OpenID Connect Flows', 'JWT Signing, Rotation & Revocation', 'Role-Based Access Control (RBAC)', 'Rate Limiting & DDoS Prevention'],
      ['Redis In-Memory Caching Strategies', 'Background Workers & Queue Systems', 'Pub/Sub Event-Driven Patterns', 'Cache Invalidation Best Practices'],
      ['Multi-Stage Dockerfile Optimization', 'CI/CD Pipelines (GitHub Actions)', 'Reverse Proxies (Nginx) & SSL', 'Deploying to Cloud Run / Kubernetes'],
    ],
  };

  const subTopicList = stageSubTopics[category] || stageSubTopics.fullstack;

  // Determine active frontier: find the first milestone where the skill gap is not yet closed
  // A milestone is considered "done" if the user has scored at least 7/10 or current >= required - 1
  let firstIncompleteIndex = -1;
  for (let i = 0; i < skills.length; i++) {
    const s = skills[i];
    const isMastered = s.current >= s.required - 1 || s.current >= 7;
    if (!isMastered && firstIncompleteIndex === -1) {
      firstIncompleteIndex = i;
      break;
    }
  }

  // If user mastered all skills, the last milestone is in progress or final goal is reached
  if (firstIncompleteIndex === -1) {
    firstIncompleteIndex = skills.length - 1;
  }

  const nodes: RoadmapNode[] = skills.map((skill, index) => {
    const isMastered = index < firstIncompleteIndex;
    const isCurrent = index === firstIncompleteIndex;
    const gap = Math.max(0, skill.required - skill.current);

    let statusBadge = '';
    let explanation = '';

    if (isMastered) {
      statusBadge = `✓ Mastered (${skill.current}/${skill.required})`;
      explanation = `Verified proficient based on your profile and experience level.`;
    } else if (isCurrent) {
      statusBadge = `▶ Active Frontier (Score ${skill.current}/${skill.required} · Gap: -${gap})`;
      explanation = `Your highest-priority milestone to bridge before moving to ${skills[index + 1]?.name || 'final mastery'}.`;
    } else {
      statusBadge = `⏳ Upcoming Milestone`;
      explanation = `Scheduled after completing ${skills[firstIncompleteIndex]?.name}.`;
    }

    return {
      id: `stage-${index + 1}`,
      label: skill.name,
      done: isMastered,
      current: isCurrent,
      matchedSkill: skill.name,
      currentScore: skill.current,
      requiredScore: skill.required,
      statusBadge,
      explanation,
      children: subTopicList[index] || ['Foundational Concepts', 'Practical Implementation', 'Portfolio Project'],
    };
  });

  // Final destination milestone
  nodes.push({
    id: 'stage-final-goal',
    label: targetTitle,
    done: false,
    goal: true,
    statusBadge: '🎯 Destination Role',
    explanation: 'Full mastery reached across all required competencies.',
  });

  return nodes;
}

/**
 * Builds the 7-day schedule for "This Week", targeting the active milestone.
 * Accurately pairs each day with:
 * - Specific targeted tasks
 * - Curated Free and Paid courses (with Free strictly prioritized!)
 */
export function getAnalyzedWeeklyPlan(
  goal: string,
  experience: ExperienceLevel,
  activeRoadmapNode?: RoadmapNode
): DayPlan[] {
  const nodeTopic = activeRoadmapNode?.label || 'Core Fundamentals';
  const subTopics = activeRoadmapNode?.children || [
    'Foundations & Syntax',
    'Practical Architecture',
    'Applied Problem Solving',
    'Mini-Project & Integration',
  ];

  const days: DayPlan[] = [
    {
      day: 'MON',
      topic: `${subTopics[0] || nodeTopic} (Mental Models)`,
      tasks: ['Learn', 'Practice'],
      courses: getCoursesForTopic(subTopics[0] || nodeTopic, goal),
    },
    {
      day: 'TUE',
      topic: `${subTopics[0] || nodeTopic} (Hands-on Drill)`,
      tasks: ['Code Drill', 'Test'],
      courses: getCoursesForTopic(subTopics[0] || nodeTopic, goal),
    },
    {
      day: 'WED',
      topic: `${subTopics[1] || subTopics[0] || nodeTopic} (Patterns)`,
      tasks: ['Deep Dive', 'Solve'],
      courses: getCoursesForTopic(subTopics[1] || nodeTopic, goal),
    },
    {
      day: 'THU',
      topic: `${subTopics[2] || subTopics[1] || nodeTopic} (Real Projects)`,
      tasks: ['Build', 'Debug'],
      courses: getCoursesForTopic(subTopics[2] || nodeTopic, goal),
    },
    {
      day: 'FRI',
      topic: `${subTopics[3] || subTopics[2] || nodeTopic} (Optimization)`,
      tasks: ['Refactor', 'Profile'],
      courses: getCoursesForTopic(subTopics[3] || nodeTopic, goal),
    },
    {
      day: 'SAT',
      topic: `${nodeTopic} (Portfolio Milestone Project)`,
      tasks: ['Build', 'Ship'],
      courses: getCoursesForTopic(nodeTopic, goal),
    },
    {
      day: 'SUN',
      topic: `Weekly AI Mastery Assessment & Review`,
      tasks: ['Quiz', 'Submit'],
      ai: true,
      courses: getCoursesForTopic(nodeTopic, goal),
    },
  ];

  return days;
}
