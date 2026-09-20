import { ExperienceLevel, SkillEntry } from '../types';

export const GOAL_SKILL_CATALOG: Record<string, { label: string; skills: string[] }> = {
  fullstack: {
    label: 'Full Stack Web Development',
    skills: [
      'HTML5 / Semantic Web',
      'CSS3 & Modern Layouts',
      'JavaScript (ES6+)',
      'TypeScript',
      'React.js',
      'Next.js',
      'Node.js & Express',
      'Tailwind CSS',
      'PostgreSQL',
      'MongoDB',
      'REST APIs',
      'GraphQL',
      'Git & GitHub',
      'Docker Basics',
      'State Management (Zustand/Redux)',
      'Web Security (JWT/OAuth)',
    ],
  },
  datascience: {
    label: 'Data Science & AI Engineering',
    skills: [
      'Python Foundations',
      'Pandas & DataFrames',
      'NumPy Vector Computing',
      'SQL & Database Queries',
      'Scikit-Learn Machine Learning',
      'PyTorch / Neural Networks',
      'TensorFlow Basics',
      'Data Visualization (Seaborn/Matplotlib)',
      'Probability & Statistics',
      'Exploratory Data Analysis (EDA)',
      'Jupyter Notebooks',
      'Feature Engineering & Pipelines',
      'BigQuery / Cloud SQL',
      'Git for Data Teams',
    ],
  },
  uiux: {
    label: 'UI/UX & Product Design',
    skills: [
      'Figma & Auto Layout',
      'User Research & Interviews',
      'Wireframing & Lo-Fi Flows',
      'Interactive Prototyping',
      'Design Systems & Tokens',
      'Information Architecture',
      'Usability Testing & Feedback',
      'Typography & Visual Hierarchy',
      'Color Theory & Accessibility (a11y)',
      'Responsive Mobile UI',
      'Component Variants & Modes',
      'Developer Handoff & Specs',
    ],
  },
  mobile: {
    label: 'Mobile App Development',
    skills: [
      'React Native & Expo',
      'TypeScript for Mobile',
      'Swift / iOS Native',
      'Kotlin / Android Native',
      'Flutter & Dart',
      'Mobile Navigation (Tabs/Stacks)',
      'State Management (Zustand/Redux)',
      'Mobile UI & Gesture Handling',
      'Offline Storage (AsyncStorage/SQLite)',
      'Device APIs (Camera/Location)',
      'Push Notifications',
      'App Store & Play Store Release',
      'Git & Version Control',
    ],
  },
  backend: {
    label: 'Backend & Cloud / DevOps',
    skills: [
      'Node.js & Express',
      'Python & FastAPI',
      'Go (Golang)',
      'Docker & Containers',
      'Kubernetes Basics',
      'PostgreSQL & Complex Joins',
      'Redis In-Memory Caching',
      'AWS / GCP Cloud Services',
      'CI/CD Pipelines (GitHub Actions)',
      'REST & GraphQL API Design',
      'Microservices & Message Queues',
      'Linux & Shell Scripting',
      'Auth, JWT & CORS Security',
    ],
  },
  cybersecurity: {
    label: 'Cybersecurity & InfoSec',
    skills: [
      'Network Security & TCP/IP',
      'Linux System Administration',
      'Python / Bash Automation',
      'OWASP Top 10 Web Security',
      'Penetration Testing (Burp Suite)',
      'Vulnerability Scanning & CVEs',
      'SIEM & Log Monitoring (Splunk)',
      'Cryptography & SSL/TLS',
      'Firewalls & IDS/IPS',
      'Wireshark Packet Analysis',
      'Identity & Access Management (IAM)',
    ],
  },
  blockchain: {
    label: 'Blockchain & Web3',
    skills: [
      'Solidity Smart Contracts',
      'Ethereum & EVM Architecture',
      'Web3.js / Ethers.js',
      'Hardhat & Foundry Testing',
      'DeFi & Tokenomics (ERC-20/721)',
      'Rust for Smart Contracts',
      'IPFS & Decentralized Storage',
      'Smart Contract Security Audits',
      'TypeScript',
      'Git & GitHub',
    ],
  },
  gamedev: {
    label: 'Game Development',
    skills: [
      'Unity 3D / 2D Engine',
      'C# Scripting for Games',
      'Unreal Engine 5',
      'C++ for Game Dev',
      '3D Math & Vector Physics',
      'Shaders & Materials',
      'Blender 3D Asset Pipeline',
      'Game Loop & State Systems',
      'Audio & SFX Integration',
      'Git for Game Assets',
    ],
  },
};

/**
 * Returns the relevant recognized & known skills catalog based on user's selected Goal
 */
export function getSkillsForGoal(goal: string): { label: string; skills: string[] } {
  const g = (goal || '').toLowerCase().trim();

  if (g.includes('data') || g.includes('machine learn') || g.includes('ai') || g.includes('analyst') || g.includes('deep learn')) {
    return GOAL_SKILL_CATALOG.datascience;
  }
  if (g.includes('ui') || g.includes('ux') || g.includes('design') || g.includes('product design') || g.includes('figma')) {
    return GOAL_SKILL_CATALOG.uiux;
  }
  if (g.includes('mobile') || g.includes('ios') || g.includes('android') || g.includes('flutter') || g.includes('react native') || g.includes('swift')) {
    return GOAL_SKILL_CATALOG.mobile;
  }
  if (g.includes('backend') || g.includes('devops') || g.includes('cloud') || g.includes('systems') || g.includes('sre') || g.includes('server')) {
    return GOAL_SKILL_CATALOG.backend;
  }
  if (g.includes('cyber') || g.includes('security') || g.includes('infosec') || g.includes('pentest') || g.includes('ethical hack')) {
    return GOAL_SKILL_CATALOG.cybersecurity;
  }
  if (g.includes('block') || g.includes('web3') || g.includes('crypto') || g.includes('solidity')) {
    return GOAL_SKILL_CATALOG.blockchain;
  }
  if (g.includes('game') || g.includes('unity') || g.includes('unreal')) {
    return GOAL_SKILL_CATALOG.gamedev;
  }

  // If the user specified a custom goal like "React & Node Developer", see if fullstack fits best
  return GOAL_SKILL_CATALOG.fullstack;
}

/**
 * Automatically scans text (notes, resume) against the goal-specific skills
 */
export function detectSkillsFromText(text: string, goal: string): string[] {
  const normalized = (text || '').toLowerCase();
  if (!normalized.trim()) return [];

  const catalog = getSkillsForGoal(goal);
  const detected: string[] = [];

  for (const skill of catalog.skills) {
    // Break skill into searchable tokens
    const parts = skill.toLowerCase()
      .replace(/[()\/&]/g, ' ')
      .split(/\s+/)
      .filter(p => p.length >= 3);

    for (const part of parts) {
      if (normalized.includes(part)) {
        detected.push(skill);
        break;
      }
    }
  }

  return detected;
}

/**
 * Returns progressive follow-up tasks when a user completes their tasks in "This Week"
 */
export function getNextProgressiveTask(
  day: string,
  topic: string,
  currentTasks: string[],
  experience: ExperienceLevel
): string {
  const count = currentTasks.length;

  const progressivePool: string[] = [
    'Mini-Drill',
    'Edge Case Test',
    'Code Refactor',
    'Deep Dive Note',
    'Portfolio Add-on',
    'Peer Review Drill',
    'Speed Run Challenge',
    'Mentor Discussion',
  ];

  // Pick task based on experience and task position
  if (count <= 2) {
    return experience === 'beginner' ? 'Concept Check' : 'Hands-on Drill';
  } else if (count === 3) {
    return experience === 'advanced' ? 'Performance Polish' : 'Mini Challenge';
  } else if (count === 4) {
    return 'Debug Edge Cases';
  } else {
    // Pick an unused one
    for (const cand of progressivePool) {
      if (!currentTasks.includes(cand)) {
        return cand;
      }
    }
    return `Challenge #${count + 1}`;
  }
}

/**
 * Finds the matching SkillEntry for a given weekly topic or milestone
 */
export function findMatchingSkill(topic: string, skills: SkillEntry[]): SkillEntry | undefined {
  const t = topic.toLowerCase();
  
  // 1. Direct match
  const exact = skills.find(s => t.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(t));
  if (exact) return exact;

  // 2. Keyword match
  let bestSkill: SkillEntry | undefined;
  let maxMatches = 0;

  for (const s of skills) {
    const tokens = s.name.toLowerCase().split(/\s+/);
    let matches = 0;
    for (const tok of tokens) {
      if (tok.length > 2 && t.includes(tok)) matches++;
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      bestSkill = s;
    }
  }

  return bestSkill || skills[0];
}
