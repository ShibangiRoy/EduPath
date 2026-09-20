import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { Screen, UserEducationalProfile, ChatMessage, ExperienceLevel, QuizHistoryItem } from '../types';
import { getNextProgressiveTask } from '../utils/goalSkills';

export interface TaskUpgradeNotification {
  skillName: string;
  prevScore: number;
  newScore: number;
  task: string;
  unlockedTask?: string;
}

interface AuthAndSyncContextType {
  user: User | null;
  loadingAuth: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'local';
  lastSyncedAt: Date | null;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;

  // Synchronized state
  screen: Screen;
  setScreen: (s: Screen) => void;
  goal: string;
  setGoal: (g: string) => void;
  experience: ExperienceLevel;
  setExperience: (exp: ExperienceLevel) => void;
  hoursPerWeek: number;
  setHoursPerWeek: (hrs: number) => void;
  resumeFileName: string;
  setResumeFileName: (name: string) => void;
  bioNote: string;
  setBioNote: (note: string) => void;
  recognizedSkills: string[];
  setRecognizedSkills: (skills: string[]) => void;
  customSkillRatings: Record<string, number>;
  setCustomSkillRating: (skillName: string, rating: number) => void;
  upgradeSkillScore: (skillName: string, points?: number) => void;
  weeklyChecks: Record<string, boolean>;
  toggleWeeklyCheck: (taskKey: string) => void;
  dynamicTasks: Record<string, string[]>;
  addDynamicTask: (day: string, task: string) => void;
  completeTaskAndUpgrade: (day: string, task: string, topic: string, skillName: string, currentScore: number) => void;
  taskUpgradeNotification: TaskUpgradeNotification | null;
  clearTaskUpgradeNotification: () => void;

  // Quiz state & actions
  quizHistory: QuizHistoryItem[];
  saveQuizResult: (result: Omit<QuizHistoryItem, 'id' | 'completedAt'>) => void;
  activeQuizTopic: string | null;
  setActiveQuizTopic: (topic: string | null) => void;

  // Chat messages
  messages: ChatMessage[];
  sendMessage: (text: string, tags?: string[], cta?: string) => Promise<void>;
  isAiGenerating: boolean;
}

const AuthAndSyncContext = createContext<AuthAndSyncContextType | null>(null);

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'seed-1',
    userId: 'system',
    role: 'user',
    text: "Can you explain JavaScript closures with an easy example?",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'seed-2',
    userId: 'system',
    role: 'ai',
    text: "Hey there! 👋 I would love to explain closures — they are one of the coolest and most powerful superpowers in JavaScript! 🚀\n\nThink of a closure like a backpack: whenever a function is created, it packs up all the variables from its surrounding neighborhood and carries them wherever it goes, even after the parent function has finished running!\n\nHere is a simple, working example you can try:\n\n```javascript\n// Simple closure counter example:\nfunction createSecretCounter() {\n  let count = 0; // 🎒 Kept safely inside the backpack!\n\n  return function increment() {\n    count += 1;\n    return `Current score: ${count} ✨`;\n  };\n}\n\nconst playerOneScore = createSecretCounter();\nconsole.log(playerOneScore()); // 'Current score: 1 ✨'\nconsole.log(playerOneScore()); // 'Current score: 2 ✨'\n```\n\nNotice how `count` stays private and persists between calls! Would you like to test your understanding with a quick quiz, or should we look at how closures power React hooks? 😊",
    tags: ['JavaScript', 'Closures', 'Code Example'],
    cta: 'Take a Quiz on Closures',
    createdAt: new Date(Date.now() - 6500000).toISOString(),
  },
  {
    id: 'seed-3',
    userId: 'system',
    role: 'user',
    text: 'What are the pros and cons of the top React courses?',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'seed-4',
    userId: 'system',
    role: 'ai',
    text: "Awesome question! 🌟 Choosing the right course saves you months of trial-and-error. Here is an honest, friendly breakdown of the top React courses with their pros & cons:\n\n### 1. **The Joy of React (Josh W. Comeau)**\n- 👍 **Pros**: Interactive interactive diagrams, explains mental models visually, ultra-modern code style.\n- ⚠️ **Cons**: Premium pricing; moves fast if your vanilla JS fundamentals are rusty.\n- 🎯 **Best For**: Visual learners who want deep intuition over dry syntax.\n\n### 2. **freeCodeCamp React & Redux Certification**\n- 👍 **Pros**: 100% Free forever, hands-on coding directly in browser, huge supportive global community.\n- ⚠️ **Cons**: Text-heavy drills; limited large-scale project architecture.\n- 🎯 **Best For**: Budget-conscious learners who love practice drills.\n\n### 3. **Epic React (Kent C. Dodds)**\n- 👍 **Pros**: Production-grade patterns, performance profiling, enterprise testing strategies.\n- ⚠️ **Cons**: High price point, steep learning curve tailored for intermediate developers.\n- 🎯 **Best For**: Developers looking to step into Senior React roles!\n\nLet me know which learning style suits you best and I'll tailor your roadmap! 🚀",
    tags: ['React Courses', 'Pros & Cons', 'Course Review'],
    cta: 'Take React Quiz',
    createdAt: new Date(Date.now() - 3000000).toISOString(),
  }
];

function cleanForFirestore<T extends Record<string, any>>(data: T): Partial<T> {
  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      cleaned[key] = val;
    }
  }
  return cleaned as Partial<T>;
}

export const AuthAndSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'local'>('local');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Application state with local storage fallback
  const [screen, setScreenState] = useState<Screen>(() => {
    return (localStorage.getItem('edupath_screen') as Screen) || 'landing';
  });
  const [goal, setGoalState] = useState<string>(() => {
    return localStorage.getItem('edupath_goal') || '';
  });
  const [experience, setExperienceState] = useState<ExperienceLevel>(() => {
    return (localStorage.getItem('edupath_experience') as ExperienceLevel) || 'beginner';
  });
  const [hoursPerWeek, setHoursPerWeekState] = useState<number>(() => {
    const saved = localStorage.getItem('edupath_hours');
    return saved ? parseInt(saved, 10) : 10;
  });
  const [resumeFileName, setResumeFileNameState] = useState<string>(() => {
    return localStorage.getItem('edupath_resume') || '';
  });
  const [bioNote, setBioNoteState] = useState<string>(() => {
    return localStorage.getItem('edupath_bio') || '';
  });
  const [recognizedSkills, setRecognizedSkillsState] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('edupath_skills');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [customSkillRatings, setCustomSkillRatingsState] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('edupath_custom_ratings');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [weeklyChecks, setWeeklyChecksState] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('edupath_weekly');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [dynamicTasks, setDynamicTasksState] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem('edupath_dynamic_tasks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [taskUpgradeNotification, setTaskUpgradeNotification] = useState<TaskUpgradeNotification | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('edupath_messages');
      return saved ? JSON.parse(saved) : DEFAULT_MESSAGES;
    } catch {
      return DEFAULT_MESSAGES;
    }
  });
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('edupath_quiz_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeQuizTopic, setActiveQuizTopic] = useState<string | null>(null);

  // Sync to local storage for guests
  useEffect(() => {
    localStorage.setItem('edupath_screen', screen);
    localStorage.setItem('edupath_goal', goal);
    localStorage.setItem('edupath_experience', experience);
    localStorage.setItem('edupath_hours', String(hoursPerWeek));
    localStorage.setItem('edupath_resume', resumeFileName);
    localStorage.setItem('edupath_bio', bioNote);
    localStorage.setItem('edupath_skills', JSON.stringify(recognizedSkills));
    localStorage.setItem('edupath_custom_ratings', JSON.stringify(customSkillRatings));
    localStorage.setItem('edupath_weekly', JSON.stringify(weeklyChecks));
    localStorage.setItem('edupath_dynamic_tasks', JSON.stringify(dynamicTasks));
    localStorage.setItem('edupath_messages', JSON.stringify(messages));
    localStorage.setItem('edupath_quiz_history', JSON.stringify(quizHistory));
  }, [screen, goal, experience, hoursPerWeek, resumeFileName, bioNote, recognizedSkills, customSkillRatings, weeklyChecks, dynamicTasks, messages, quizHistory]);

  // Keep a ref of local state for debouncing server writes
  const stateRef = useRef({
    screen,
    goal,
    experience,
    hoursPerWeek,
    resumeFileName,
    bioNote,
    recognizedSkills,
    customSkillRatings,
    weeklyChecks,
    dynamicTasks,
    quizHistory,
  });

  useEffect(() => {
    stateRef.current = {
      screen,
      goal,
      experience,
      hoursPerWeek,
      resumeFileName,
      bioNote,
      recognizedSkills,
      customSkillRatings,
      weeklyChecks,
      dynamicTasks,
      quizHistory,
    };
  }, [screen, goal, experience, hoursPerWeek, resumeFileName, bioNote, recognizedSkills, customSkillRatings, weeklyChecks, dynamicTasks, quizHistory]);

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setLoadingAuth(false);
      if (currentUser) {
        setSyncStatus('synced');
      } else {
        setSyncStatus('local');
      }
    });
    return () => unsubscribe();
  }, []);

  // Save profile state to Firestore with optimistic local updates
  const persistProfileToCloud = useCallback(async (partial: Partial<UserEducationalProfile>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    setSyncStatus('syncing');

    try {
      const userRef = doc(db, 'users', uid);
      const payload: Partial<UserEducationalProfile> = {
        ...partial,
        id: uid,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userRef, cleanForFirestore(payload), { merge: true });
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (error) {
      setSyncStatus('offline');
      console.warn('Profile sync issue:', error);
    }
  }, []);

  // Subscribe to real-time user profile when logged in
  useEffect(() => {
    if (!user) return;
    const uid = user.uid;

    const userRef = doc(db, 'users', uid);
    const unsubscribe = onSnapshot(
      userRef,
      snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data() as UserEducationalProfile;
          if (data.currentScreen) setScreenState(data.currentScreen);
          if (data.goal !== undefined) setGoalState(data.goal);
          if (data.experience) setExperienceState(data.experience);
          if (typeof data.hoursPerWeek === 'number') setHoursPerWeekState(data.hoursPerWeek);
          if (data.resumeFileName !== undefined) setResumeFileNameState(data.resumeFileName);
          if (data.bioNote !== undefined) setBioNoteState(data.bioNote);
          if (data.recognizedSkills) setRecognizedSkillsState(data.recognizedSkills);
          if (data.customSkillRatings) setCustomSkillRatingsState(data.customSkillRatings);
          if (data.weeklyChecks) setWeeklyChecksState(data.weeklyChecks);
          if (data.dynamicTasks) setDynamicTasksState(data.dynamicTasks);
          if (Array.isArray(data.quizHistory)) setQuizHistory(data.quizHistory);
          setSyncStatus('synced');
          setLastSyncedAt(new Date());
        } else {
          // Initialize user document in cloud with existing state
          const initialProfile: UserEducationalProfile = {
            id: uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            goal: stateRef.current.goal,
            experience: stateRef.current.experience,
            hoursPerWeek: stateRef.current.hoursPerWeek,
            resumeFileName: stateRef.current.resumeFileName,
            bioNote: stateRef.current.bioNote,
            recognizedSkills: stateRef.current.recognizedSkills,
            customSkillRatings: stateRef.current.customSkillRatings,
            currentScreen: stateRef.current.screen,
            weeklyChecks: stateRef.current.weeklyChecks,
            dynamicTasks: stateRef.current.dynamicTasks,
            quizHistory: stateRef.current.quizHistory || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setDoc(userRef, cleanForFirestore(initialProfile)).catch(err => {
            console.warn('Initial profile creation note:', err);
          });
        }
      },
      error => {
        setSyncStatus('offline');
        console.warn('User sync error:', error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Subscribe to real-time chat messages
  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    const messagesColl = collection(db, 'users', uid, 'messages');
    const q = query(messagesColl, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        if (!snapshot.empty) {
          const cloudMsgs: ChatMessage[] = snapshot.docs.map(docSnap => docSnap.data() as ChatMessage);
          setMessages(cloudMsgs);
        } else {
          // Seed initial messages for this user if collection is empty
          DEFAULT_MESSAGES.forEach(msg => {
            const docRef = doc(db, 'users', uid, 'messages', msg.id);
            setDoc(docRef, cleanForFirestore({ ...msg, userId: uid })).catch(() => {});
          });
        }
      },
      error => {
        console.warn('Chat messages sync note:', error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // State setters with automatic cloud synchronization
  const setScreen = useCallback((s: Screen) => {
    setScreenState(s);
    if (auth.currentUser) {
      persistProfileToCloud({ currentScreen: s });
    }
  }, [persistProfileToCloud]);

  const setGoal = useCallback((g: string) => {
    setGoalState(g);
    if (auth.currentUser) {
      persistProfileToCloud({ goal: g });
    }
  }, [persistProfileToCloud]);

  const setExperience = useCallback((exp: ExperienceLevel) => {
    setExperienceState(exp);
    if (auth.currentUser) {
      persistProfileToCloud({ experience: exp });
    }
  }, [persistProfileToCloud]);

  const setHoursPerWeek = useCallback((hrs: number) => {
    setHoursPerWeekState(hrs);
    if (auth.currentUser) {
      persistProfileToCloud({ hoursPerWeek: hrs });
    }
  }, [persistProfileToCloud]);

  const setResumeFileName = useCallback((name: string) => {
    setResumeFileNameState(name);
    if (auth.currentUser) {
      persistProfileToCloud({ resumeFileName: name });
    }
  }, [persistProfileToCloud]);

  const setBioNote = useCallback((note: string) => {
    setBioNoteState(note);
    if (auth.currentUser) {
      persistProfileToCloud({ bioNote: note });
    }
  }, [persistProfileToCloud]);

  const setRecognizedSkills = useCallback((skills: string[]) => {
    setRecognizedSkillsState(skills);
    if (auth.currentUser) {
      persistProfileToCloud({ recognizedSkills: skills });
    }
  }, [persistProfileToCloud]);

  const setCustomSkillRating = useCallback((skillName: string, rating: number) => {
    setCustomSkillRatingsState(prev => {
      const updated = { ...prev, [skillName]: rating };
      if (auth.currentUser) {
        persistProfileToCloud({ customSkillRatings: updated });
      }
      return updated;
    });
  }, [persistProfileToCloud]);

  const toggleWeeklyCheck = useCallback((taskKey: string) => {
    setWeeklyChecksState(prev => {
      const updated = { ...prev, [taskKey]: !prev[taskKey] };
      if (auth.currentUser) {
        persistProfileToCloud({ weeklyChecks: updated });
      }
      return updated;
    });
  }, [persistProfileToCloud]);

  const addDynamicTask = useCallback((day: string, task: string) => {
    const trimmed = task.trim();
    if (!trimmed) return;
    setDynamicTasksState(prev => {
      const existing = prev[day] || [];
      if (existing.includes(trimmed)) return prev;
      const updated = { ...prev, [day]: [...existing, trimmed] };
      if (auth.currentUser) {
        persistProfileToCloud({ dynamicTasks: updated });
      }
      return updated;
    });
  }, [persistProfileToCloud]);

  const clearTaskUpgradeNotification = useCallback(() => {
    setTaskUpgradeNotification(null);
  }, []);

  const completeTaskAndUpgrade = useCallback((
    day: string,
    task: string,
    topic: string,
    skillName: string,
    currentScore: number
  ) => {
    const taskKey = `${day}-${task}`;
    const willBeChecked = !stateRef.current.weeklyChecks[taskKey];

    // 1. Update weekly checks
    const updatedChecks = { ...stateRef.current.weeklyChecks, [taskKey]: willBeChecked };
    setWeeklyChecksState(updatedChecks);

    let updatedCustomRatings = { ...stateRef.current.customSkillRatings };
    let updatedDynamic = { ...stateRef.current.dynamicTasks };
    let unlockedTaskName: string | undefined = undefined;

    if (willBeChecked) {
      // 2. Upgrade skill level in Skill Gap based on their level
      const prevRating = stateRef.current.customSkillRatings[skillName] ?? currentScore;
      const newRating = Math.min(10, prevRating + 1);
      updatedCustomRatings[skillName] = newRating;
      setCustomSkillRatingsState(updatedCustomRatings);

      // 3. Give new progressive task for that day!
      const currentDayTasks = [
        ...(stateRef.current.dynamicTasks[day] || []),
      ];
      unlockedTaskName = getNextProgressiveTask(day, topic, currentDayTasks, stateRef.current.experience);
      if (!currentDayTasks.includes(unlockedTaskName)) {
        updatedDynamic[day] = [...(stateRef.current.dynamicTasks[day] || []), unlockedTaskName];
        setDynamicTasksState(updatedDynamic);
      }

      // 4. Trigger celebration banner/toast
      setTaskUpgradeNotification({
        skillName,
        prevScore: prevRating,
        newScore: newRating,
        task,
        unlockedTask: unlockedTaskName,
      });
    }

    // Persist to Firestore if signed in
    if (auth.currentUser) {
      persistProfileToCloud({
        weeklyChecks: updatedChecks,
        customSkillRatings: updatedCustomRatings,
        dynamicTasks: updatedDynamic,
      });
    }
  }, [persistProfileToCloud]);

  const upgradeSkillScore = useCallback((skillName: string, points: number = 1) => {
    setCustomSkillRatingsState(prev => {
      const prevScore = prev[skillName] ?? 3;
      const newScore = Math.min(10, prevScore + points);
      const updated = { ...prev, [skillName]: newScore };

      setTaskUpgradeNotification({
        skillName,
        prevScore,
        newScore,
        task: `AI Quiz Mastery: ${skillName}`,
        unlockedTask: `Advanced ${skillName} Challenge Module`,
      });

      if (auth.currentUser) {
        persistProfileToCloud({ customSkillRatings: updated });
      }
      return updated;
    });
  }, [persistProfileToCloud]);

  const saveQuizResult = useCallback((result: Omit<QuizHistoryItem, 'id' | 'completedAt'>) => {
    const newEntry: QuizHistoryItem = {
      ...result,
      id: 'quiz-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      completedAt: new Date().toISOString(),
    };

    setQuizHistory(prev => {
      const updated = [newEntry, ...prev].slice(0, 30);
      if (auth.currentUser) {
        persistProfileToCloud({ quizHistory: updated });
      }
      return updated;
    });
  }, [persistProfileToCloud]);

  // Send message and get AI response
  const sendMessage = useCallback(async (text: string, tags?: string[], cta?: string) => {
    if (!text.trim()) return;

    const currentUid = auth.currentUser?.uid || 'guest-device';
    const userMsgId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const userMsg: ChatMessage = {
      id: userMsgId,
      userId: currentUid,
      role: 'user',
      text: text.trim(),
      ...(tags && tags.length ? { tags } : {}),
      ...(cta ? { cta } : {}),
      createdAt: new Date().toISOString(),
    };

    // Optimistic append
    setMessages(prev => [...prev, userMsg]);

    // Persist user message to Firestore if authenticated
    if (auth.currentUser) {
      const msgRef = doc(db, 'users', currentUid, 'messages', userMsgId);
      setDoc(msgRef, cleanForFirestore(userMsg)).catch(err => {
        console.warn('User message sync issue:', err);
      });
    }

    // Generate AI Mentor response
    setIsAiGenerating(true);

    try {
      // Call backend API with context
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          goal: stateRef.current.goal || 'Full Stack Developer',
          experience: stateRef.current.experience,
          weeklyChecks: stateRef.current.weeklyChecks,
        }),
      });

      let aiText = '';
      let aiTags: string[] = ['Mentorship', 'Practice'];
      let aiCta: string | undefined = undefined;

      if (res.ok) {
        const json = await res.json();
        aiText = json.reply;
        if (json.tags && Array.isArray(json.tags)) aiTags = json.tags;
        if (json.cta) aiCta = json.cta;
      } else {
        // Fallback intelligent mentor response
        aiText = `Great question regarding ${stateRef.current.goal || 'your learning roadmap'}! When tackling this, start by breaking down the core concepts step-by-step. Let's make sure you test your understanding with small code drills before moving forward.`;
        aiTags = ['Concept Deep Dive', 'Step-by-step'];
        aiCta = 'Review Roadmap';
      }

      const aiMsgId = 'ai-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        userId: currentUid,
        role: 'ai',
        text: aiText,
        ...(aiTags && aiTags.length ? { tags: aiTags } : {}),
        ...(aiCta ? { cta: aiCta } : {}),
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMsg]);

      if (auth.currentUser) {
        const aiDocRef = doc(db, 'users', currentUid, 'messages', aiMsgId);
        setDoc(aiDocRef, cleanForFirestore(aiMsg)).catch(err => {
          console.warn('AI message sync issue:', err);
        });
      }
    } catch {
      const fallbackAiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        userId: currentUid,
        role: 'ai',
        text: "I'm monitoring your study path. Let's review the fundamental principles and continue practicing through this week's checklist!",
        tags: ['Review', 'Consistency'],
        cta: 'Open Weekly Plan',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, fallbackAiMsg]);
    } finally {
      setIsAiGenerating(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
        return;
      }
      console.warn('Sign-in status:', error?.message || error);
    }
  }, []);

  const logOut = useCallback(async () => {
    try {
      await signOut(auth);
      setSyncStatus('local');
    } catch (error: any) {
      console.warn('Sign-out status:', error?.message || error);
    }
  }, []);

  return (
    <AuthAndSyncContext.Provider
      value={{
        user,
        loadingAuth,
        syncStatus,
        lastSyncedAt,
        signInWithGoogle,
        logOut,
        screen,
        setScreen,
        goal,
        setGoal,
        experience,
        setExperience,
        hoursPerWeek,
        setHoursPerWeek,
        resumeFileName,
        setResumeFileName,
        bioNote,
        setBioNote,
        recognizedSkills,
        setRecognizedSkills,
        customSkillRatings,
        setCustomSkillRating,
        upgradeSkillScore,
        weeklyChecks,
        toggleWeeklyCheck,
        dynamicTasks,
        addDynamicTask,
        completeTaskAndUpgrade,
        taskUpgradeNotification,
        clearTaskUpgradeNotification,
        quizHistory,
        saveQuizResult,
        activeQuizTopic,
        setActiveQuizTopic,
        messages,
        sendMessage,
        isAiGenerating,
      }}
    >
      {children}
    </AuthAndSyncContext.Provider>
  );
};

export function useAuthAndSync() {
  const context = useContext(AuthAndSyncContext);
  if (!context) {
    throw new Error('useAuthAndSync must be used within an AuthAndSyncProvider');
  }
  return context;
}
