import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuthAndSync } from './context/AuthAndSyncContext';
import { Screen, SkillEntry, RoadmapNode, DayPlan, CourseItem } from './types';
import { analyzeSkillGap, getAnalyzedRoadmap, getAnalyzedWeeklyPlan } from './utils/skillAnalysis';
import { getCoursesForTopic } from './utils/courseData';
import { getSkillsForGoal, detectSkillsFromText, findMatchingSkill } from './utils/goalSkills';
import { QuizPage } from './components/QuizPage';

// ── Shared primitives ────────────────────────────────────────────────────────

const P = {
  bg:         '#0B0D14',
  surface:    '#141720',
  surface2:   '#1C2030',
  border:     'rgba(255,255,255,0.06)',
  primary:    '#7B6FF7',
  primaryDim: 'rgba(123,111,247,0.12)',
  accent:     '#3BF5A5',
  warn:       '#F5A844',
  danger:     '#F06060',
  text:       '#E8EAF6',
  muted:      '#9EA4BE',
  subtle:     '#6B7080',
  mono:       '"JetBrains Mono", monospace',
};

function Pill({ children, color = P.primary }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="inline-block text-xs px-2.5 py-0.5 rounded-full font-medium"
      style={{ background: color + '1a', color, border: `1px solid ${color}33`, fontFamily: P.mono }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, full, variant = 'primary' }: {
  children: React.ReactNode; onClick?: () => void; full?: boolean; variant?: 'primary' | 'ghost'
}) {
  return (
    <button onClick={onClick}
      className={`${full ? 'w-full' : ''} py-4 px-7 rounded-xl font-semibold text-base transition-all duration-200 hover:opacity-90 active:scale-[0.98] cursor-pointer`}
      style={{
        background: variant === 'primary' ? P.primary : 'rgba(255,255,255,0.04)',
        color: variant === 'primary' ? '#fff' : P.muted,
        border: variant === 'ghost' ? `1px solid ${P.border}` : 'none',
      }}>
      {children}
    </button>
  );
}

// ── Nav with Real-time Multi-device Sync Status ──────────────────────────────

function Nav({ screen, go }: { screen: Screen; go: (s: Screen) => void }) {
  const { user, syncStatus, signInWithGoogle, logOut } = useAuthAndSync();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const links: { s: Screen; label: string }[] = [
    { s: 'skills',  label: 'Skill Gap'  },
    { s: 'roadmap', label: 'Roadmap'    },
    { s: 'weekly',  label: 'This Week'  },
    { s: 'quizzes', label: 'AI Quizzes' },
    { s: 'chat',    label: 'AI Mentor'  },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-8 py-4"
      style={{ background: 'rgba(11,13,20,0.88)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${P.border}` }}>
      <button onClick={() => go('landing')}
        className="text-sm font-bold tracking-widest uppercase cursor-pointer"
        style={{ color: P.primary, fontFamily: P.mono }}>
        EDUPATH
      </button>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Navigation Tabs */}
        <div className="flex gap-1">
          {links.map(({ s, label }) => (
            <button key={s} onClick={() => go(s)}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
              style={{
                background: screen === s ? P.primaryDim : 'transparent',
                color:      screen === s ? P.primary    : P.subtle,
                fontFamily: P.mono,
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Real-time Sync & Authentication Indicator */}
        <div className="relative flex items-center border-l pl-3 sm:pl-4" style={{ borderColor: P.border }}>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer"
                style={{ background: P.surface, border: `1px solid ${P.border}` }}
                title="Synced across all devices"
              >
                <span className="w-2 h-2 rounded-full"
                  style={{ background: syncStatus === 'syncing' ? P.warn : P.accent }} />
                <span className="hidden sm:inline font-medium" style={{ color: P.text, fontFamily: P.mono }}>
                  {user.displayName?.split(' ')[0] || 'Synced'}
                </span>
                <span className="text-[10px]" style={{ color: P.subtle }}>▼</span>
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-xl p-3 shadow-xl z-50"
                    style={{ background: P.surface2, border: `1px solid ${P.border}` }}
                  >
                    <div className="px-2 py-1.5 mb-2 border-b" style={{ borderColor: P.border }}>
                      <p className="text-xs font-semibold" style={{ color: P.text }}>{user.displayName || 'User'}</p>
                      <p className="text-[11px] truncate" style={{ color: P.subtle }}>{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 mb-2 text-xs" style={{ color: P.accent, fontFamily: P.mono }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: P.accent }} />
                      Live Cloud Sync Active
                    </div>
                    <button
                      onClick={() => { setShowUserMenu(false); logOut(); }}
                      className="w-full text-left px-2 py-1.5 rounded text-xs transition-colors cursor-pointer"
                      style={{ color: P.danger }}
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90 cursor-pointer"
              style={{
                background: P.primaryDim,
                color: P.primary,
                border: `1px solid ${P.primary}33`,
                fontFamily: P.mono,
              }}
              title="Sign in to synchronize your learning journey across all your devices in real-time"
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: P.accent }} />
              <span>Sync Devices</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

// ── 1. Landing ───────────────────────────────────────────────────────────────

function Landing({ go }: { go: (s: Screen) => void }) {
  const { user, signInWithGoogle } = useAuthAndSync();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: P.bg, color: P.text }}>
      <Nav screen="landing" go={go} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pt-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-12"
          style={{ background: P.primaryDim, color: P.primary, border: `1px solid ${P.primary}33`, fontFamily: P.mono }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: P.accent }} />
          AI-Powered Learning · Real-time Sync
        </div>

        <h1 className="font-bold leading-none mb-6"
          style={{ fontSize: 'clamp(3.5rem,9vw,8rem)', letterSpacing: '-0.04em', color: '#F0F2FF', fontFamily: 'Aclonica, sans-serif' }}>
          EDUPATH
        </h1>

        <p className="text-xl font-light mb-3" style={{ color: P.muted, maxWidth: 520, lineHeight: 1.55 }}>
          Your AI-powered learning journey.
        </p>
        <p className="text-base italic mb-14" style={{ color: P.subtle, maxWidth: 420, lineHeight: 1.7 }}>
          "Tell us where you want to go.<br />We'll figure out how to get you there."
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button onClick={() => go('onboarding')}
            className="flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            style={{ background: P.primary, color: '#fff' }}>
            Start My Journey
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {!user && (
            <button onClick={signInWithGoogle}
              className="flex items-center gap-2 px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 cursor-pointer"
              style={{ background: P.surface, border: `1px solid ${P.border}`, color: P.muted }}>
              <span>Sign in with Google</span>
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-4 w-full max-w-xl">
          {[
            { icon: '⚡', stat: '2.4×',  label: 'faster learning'   },
            { icon: '🎯', stat: '94%',   label: 'goal completion'    },
            { icon: '🤖', stat: '24/7',  label: 'AI mentor access'   },
          ].map(c => (
            <div key={c.label} className="rounded-xl p-5 text-center"
              style={{ background: P.surface, border: `1px solid ${P.border}` }}>
              <div className="text-3xl mb-2">{c.icon}</div>
              <div className="text-2xl font-bold mb-1" style={{ color: '#F0F2FF' }}>{c.stat}</div>
              <div className="text-xs" style={{ color: P.subtle, fontFamily: P.mono }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Subtle grid lines decoration */}
        <div className="mt-16 text-xs" style={{ color: P.subtle, fontFamily: P.mono, letterSpacing: '0.15em' }}>
          FULL STACK · DATA SCIENCE · UI/UX · MOBILE
        </div>
      </div>
    </div>
  );
}

// ── 2. Onboarding ────────────────────────────────────────────────────────────

function Onboarding({ go }: { go: (s: Screen) => void }) {
  const { goal, setGoal, experience, setExperience, hoursPerWeek, setHoursPerWeek } = useAuthAndSync();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: P.bg, color: P.text }}>
      <Nav screen="onboarding" go={go} />
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-lg">
          <div className="text-xs mb-8 tracking-widest uppercase" style={{ color: P.subtle, fontFamily: P.mono }}>
            Step 01 / 03
          </div>

          <h2 className="text-4xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>What's your goal?</h2>
          <p className="mb-10" style={{ color: P.subtle }}>Tell us your destination and we'll build the path.</p>

          <input
            type="text"
            value={goal}
            onChange={e => setGoal(e.target.value)}
            placeholder="e.g. Become a Full Stack Developer"
            className="w-full px-5 py-4 rounded-xl text-base outline-none mb-3 placeholder:opacity-30 transition-all"
            style={{
              background: P.surface,
              border: `1px solid ${goal ? P.primary : P.border}`,
              color: P.text,
              fontFamily: 'inherit',
            }}
          />

          <div className="mt-8 mb-6">
            <label className="block text-sm font-medium mb-4" style={{ color: P.muted }}>Current experience</label>
            <div className="flex gap-3">
              {(['beginner', 'intermediate', 'advanced'] as const).map(lvl => (
                <button key={lvl} onClick={() => setExperience(lvl)}
                  className="flex-1 py-3 rounded-lg text-sm font-medium capitalize transition-all cursor-pointer"
                  style={{
                    background: experience === lvl ? P.primaryDim      : P.surface,
                    border:     `1px solid ${experience === lvl ? P.primary : P.border}`,
                    color:       experience === lvl ? P.primary           : P.subtle,
                  }}>
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <label className="block text-sm font-medium mb-4" style={{ color: P.muted }}>Hours available per week</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={2}
                max={40}
                value={hoursPerWeek}
                onChange={e => setHoursPerWeek(+e.target.value)}
                className="flex-1 cursor-pointer"
              />
              <span className="font-bold text-lg w-20 text-center px-3 py-2 rounded-lg"
                style={{ background: P.surface, border: `1px solid ${P.border}`, fontFamily: P.mono, color: P.primary }}>
                {hoursPerWeek}h
              </span>
            </div>
          </div>

          <Btn full onClick={() => go('upload')}>Continue →</Btn>
        </div>
      </div>
    </div>
  );
}

// ── 3. Upload ────────────────────────────────────────────────────────────────

function Upload({ go }: { go: (s: Screen) => void }) {
  const {
    goal,
    resumeFileName, setResumeFileName,
    bioNote, setBioNote,
    recognizedSkills, setRecognizedSkills,
  } = useAuthAndSync();
  const [drag, setDrag] = useState(false);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Dynamically resolve catalog based on user's goal in Step 01/03
  const goalCatalog = useMemo(() => getSkillsForGoal(goal), [goal]);

  // Auto-detect recognized skills from bioNote & resume based on target goal
  useEffect(() => {
    const text = bioNote + ' ' + resumeFileName;
    if (!text.trim()) return;
    const detected = detectSkillsFromText(text, goal);
    const newItems = detected.filter(s => !recognizedSkills.includes(s));
    if (newItems.length > 0) {
      setRecognizedSkills(Array.from(new Set([...recognizedSkills, ...newItems])));
    }
  }, [bioNote, resumeFileName, goal]);

  const toggleSkill = (skill: string) => {
    if (recognizedSkills.includes(skill)) {
      setRecognizedSkills(recognizedSkills.filter(s => s !== skill));
    } else {
      setRecognizedSkills([...recognizedSkills, skill]);
    }
  };

  const addCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (trimmed && !recognizedSkills.includes(trimmed)) {
      setRecognizedSkills([...recognizedSkills, trimmed]);
      setCustomSkillInput('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: P.bg, color: P.text }}>
      <Nav screen="upload" go={go} />
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-lg">
          <div className="text-xs mb-8 tracking-widest uppercase" style={{ color: P.subtle, fontFamily: P.mono }}>
            Step 02 / 03 · Profile Intelligence
          </div>

          <h2 className="text-4xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>Upload your profile</h2>
          <p className="mb-8" style={{ color: P.subtle }}>We'll analyze your background and skills to calibrate your roadmap and skill gaps.</p>

          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
            onChange={e => setResumeFileName(e.target.files?.[0]?.name ?? '')} />

          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); setResumeFileName(e.dataTransfer.files?.[0]?.name ?? ''); }}
            className="rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all mb-6 select-none"
            style={{
              height: 180,
              background: drag ? 'rgba(123,111,247,0.08)' : P.surface,
              border: `2px dashed ${drag || resumeFileName ? P.primary : 'rgba(255,255,255,0.1)'}`,
            }}>
            {resumeFileName ? (
              <>
                <div className="text-4xl mb-3">📄</div>
                <p className="font-semibold" style={{ color: P.primary }}>{resumeFileName}</p>
                <p className="text-xs mt-1" style={{ color: P.subtle }}>Click to replace file</p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-3" style={{ opacity: 0.5 }}>↑</div>
                <p className="font-medium mb-1" style={{ color: P.muted }}>Drag & Drop Resume here</p>
                <p className="text-xs" style={{ color: P.subtle, fontFamily: P.mono }}>PDF · DOC · DOCX</p>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: P.border }} />
            <span className="text-xs" style={{ color: P.subtle, fontFamily: P.mono }}>OR DESCRIBE BACKGROUND</span>
            <div className="flex-1 h-px" style={{ background: P.border }} />
          </div>

          <textarea
            placeholder="Tell us about your projects, experience, languages or tools you've used (e.g. built React apps, Python scripts, SQL queries)..."
            value={bioNote}
            onChange={e => setBioNote(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none mb-6 placeholder:opacity-30"
            style={{ background: P.surface, border: `1px solid ${P.border}`, color: P.text, height: 95, fontFamily: 'inherit' }} />

          {/* Goal-Driven Known & Recognized Skills Selector */}
          <div className="rounded-xl p-4 mb-8" style={{ background: P.surface, border: `1px solid ${P.border}` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: P.text, fontFamily: P.mono }}>
                <span>🎯</span> RECOGNIZED & KNOWN SKILLS
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded font-bold"
                style={{ background: `${P.accent}1a`, color: P.accent, fontFamily: P.mono }}>
                {recognizedSkills.length} selected
              </span>
            </div>

            {/* Goal feedback badge */}
            <div className="flex items-center gap-2 mb-3 text-xs flex-wrap">
              <span style={{ color: P.subtle, fontFamily: P.mono }}>Goal:</span>
              <span className="px-2 py-0.5 rounded font-medium text-xs"
                style={{ background: P.primaryDim, color: P.primary, border: `1px solid ${P.primary}33` }}>
                {goal.trim() || 'Full Stack Developer'}
              </span>
              <span className="text-[11px]" style={{ color: P.subtle }}>
                ({goalCatalog.label})
              </span>
            </div>

            <p className="text-xs mb-3" style={{ color: P.subtle }}>
              Skills curated for your target goal. Tap the tools you already know to accurately calibrate your Skill Gap:
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {goalCatalog.skills.map(skill => {
                const isSelected = recognizedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className="text-xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer select-none flex items-center gap-1.5 active:scale-95"
                    style={{
                      background: isSelected ? `${P.accent}1a` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isSelected ? P.accent : 'rgba(255,255,255,0.08)'}`,
                      color: isSelected ? P.accent : P.muted,
                      fontFamily: P.mono,
                    }}
                  >
                    {isSelected ? <span>✓</span> : <span style={{ opacity: 0.35 }}>+</span>}
                    {skill}
                  </button>
                );
              })}
            </div>

            {/* Custom skill add input */}
            <form onSubmit={addCustomSkill} className="flex gap-2 pt-2.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <input
                type="text"
                placeholder="Add other known tool or skill..."
                value={customSkillInput}
                onChange={e => setCustomSkillInput(e.target.value)}
                className="flex-1 bg-transparent text-xs px-3 py-1.5 rounded-lg outline-none"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${P.border}`, color: P.text, fontFamily: P.mono }}
              />
              <button
                type="submit"
                disabled={!customSkillInput.trim()}
                className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-opacity disabled:opacity-30 cursor-pointer"
                style={{ background: P.primary, color: '#fff', fontFamily: P.mono }}
              >
                + Add
              </button>
            </form>
          </div>

          <Btn full onClick={() => go('skills')}>Analyze My Skill Gap →</Btn>
        </div>
      </div>
    </div>
  );
}

// ── 4. Skill Gap ─────────────────────────────────────────────────────────────

function Skills({ go }: { go: (s: Screen) => void }) {
  const {
    goal, experience, bioNote, resumeFileName,
    recognizedSkills, customSkillRatings, setCustomSkillRating
  } = useAuthAndSync();

  const skills = useMemo(
    () => analyzeSkillGap(goal, experience, bioNote, resumeFileName, recognizedSkills, customSkillRatings),
    [goal, experience, bioNote, resumeFileName, recognizedSkills, customSkillRatings]
  );

  const priorities = skills.filter(s => s.priority && s.current < s.required).map(s => s.name);
  const displayGoal = goal.trim() || 'Full Stack Developer';
  const displayExp = experience || 'Beginner';
  const masteredCount = skills.filter(s => s.current >= s.required).length;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: P.bg, color: P.text }}>
      <Nav screen="skills" go={go} />
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 pt-28 pb-16">
        <div className="text-xs mb-2 tracking-widest uppercase" style={{ color: P.subtle, fontFamily: P.mono }}>
          Profile Intelligence Analysis
        </div>
        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
          <div>
            <h2 className="text-4xl font-bold" style={{ letterSpacing: '-0.02em' }}>Your Skill Gap</h2>
            <p className="mt-1" style={{ color: P.subtle }}>
              Target: <span style={{ color: P.primary }}>{displayGoal}</span> · Experience: <span style={{ color: P.accent }}>{displayExp}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs px-3 py-1.5 rounded-lg inline-block"
              style={{ background: P.surface2, border: `1px solid ${P.border}`, color: P.muted, fontFamily: P.mono }}>
              {masteredCount}/{skills.length} Mastered
            </span>
          </div>
        </div>

        {/* Profile verification source notice */}
        <div className="rounded-xl p-3.5 mb-8 flex items-center justify-between text-xs"
          style={{ background: P.surface, border: `1px solid ${P.border}` }}>
          <div className="flex items-center gap-2" style={{ color: P.muted }}>
            <span>🔍</span>
            <span>
              Calculated from {resumeFileName ? `resume "${resumeFileName}"` : 'your background'},
              {' '}{recognizedSkills.length > 0 ? `${recognizedSkills.length} selected skills` : 'experience tier'} & goals.
            </span>
          </div>
          <button
            onClick={() => go('upload')}
            className="text-[11px] underline cursor-pointer hover:opacity-80"
            style={{ color: P.primary, fontFamily: P.mono }}>
            Edit Profile
          </button>
        </div>

        {/* Dynamic Leveling Info */}
        <div className="rounded-xl p-3.5 mb-6 flex items-center justify-between text-xs flex-wrap gap-2"
          style={{ background: 'rgba(59, 245, 165, 0.05)', border: `1px solid rgba(59, 245, 165, 0.2)` }}>
          <div className="flex items-center gap-2" style={{ color: P.text }}>
            <span style={{ color: P.accent }}>⚡</span>
            <span>
              <strong>Dynamic Leveling:</strong> Completing tasks in "This Week" automatically upgrades your skill ratings and unlocks follow-up challenges!
            </span>
          </div>
          <button
            onClick={() => go('weekly')}
            className="text-[11px] font-semibold px-2.5 py-1 rounded cursor-pointer hover:opacity-90 flex-shrink-0"
            style={{ background: P.accent, color: '#0B0D14', fontFamily: P.mono }}
          >
            Go to This Week →
          </button>
        </div>

        {/* Legend */}
        <div className="flex gap-6 mb-8">
          {[
            { label: 'Current Level', color: P.primary },
            { label: 'Required for Role', color: 'rgba(255,255,255,0.08)' },
            { label: 'Mastered', color: P.accent },
            { label: 'Priority Gap', color: P.warn },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2 text-xs" style={{ color: P.muted, fontFamily: P.mono }}>
              <span className="w-3 h-3 rounded-sm" style={{ background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>

        {/* Skill Gap Bars with live adjustment */}
        <div className="space-y-6 mb-10">
          {skills.map(sk => {
            const pct = sk.required === 0 ? 0 : Math.min(100, (sk.current / sk.required) * 100);
            const complete = sk.current >= sk.required;
            const barColor = complete ? P.accent : sk.current === 0 ? P.danger : sk.priority ? P.warn : P.primary;

            return (
              <div key={sk.name} className="p-4 rounded-xl transition-all"
                style={{ background: P.surface, border: `1px solid ${complete ? `${P.accent}33` : P.border}` }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm" style={{ fontFamily: P.mono, minWidth: 90 }}>{sk.name}</span>
                    {sk.priority && !complete && <Pill color={P.warn}>priority gap</Pill>}
                    {complete && <Pill color={P.accent}>✓ mastered</Pill>}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Interactive fine-tuner */}
                    <div className="flex items-center gap-1">
                      <button
                        title="Decrease rating"
                        onClick={() => setCustomSkillRating(sk.name, Math.max(0, sk.current - 1))}
                        className="w-5 h-5 rounded flex items-center justify-center text-xs cursor-pointer hover:opacity-80"
                        style={{ background: P.surface2, color: P.muted, border: `1px solid ${P.border}` }}
                      >
                        -
                      </button>
                      <button
                        title="Increase rating"
                        onClick={() => setCustomSkillRating(sk.name, Math.min(sk.required, sk.current + 1))}
                        className="w-5 h-5 rounded flex items-center justify-center text-xs cursor-pointer hover:opacity-80"
                        style={{ background: P.surface2, color: P.muted, border: `1px solid ${P.border}` }}
                      >
                        +
                      </button>
                    </div>

                    <span className="text-xs tabular-nums font-bold" style={{ color: complete ? P.accent : P.text, fontFamily: P.mono }}>
                      {sk.current}/{sk.required}
                    </span>
                  </div>
                </div>

                <div className="w-full rounded-full overflow-hidden mb-2" style={{ height: 8, background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: barColor }} />
                </div>

                {sk.notes && (
                  <p className="text-[11px]" style={{ color: P.subtle }}>
                    💡 {sk.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Priority Focus Callout */}
        {priorities.length > 0 && (
          <div className="rounded-xl p-5 mb-8"
            style={{ background: `${P.warn}0d`, border: `1px solid ${P.warn}33` }}>
            <div className="flex items-center gap-2 mb-2">
              <span>⚠</span>
              <span className="font-semibold text-sm" style={{ color: P.warn }}>Identified Skill Gaps to Bridge First</span>
            </div>
            <p className="text-xs mb-3" style={{ color: P.muted }}>
              Your Roadmap's "This Week" curriculum will directly target these priority areas:
            </p>
            <div className="flex gap-2 flex-wrap">
              {priorities.map(t => (
                <Pill key={t} color={P.warn}>{t}</Pill>
              ))}
            </div>
          </div>
        )}

        <Btn full onClick={() => go('roadmap')}>View My Journey in Roadmap →</Btn>
      </div>
    </div>
  );
}

// ── 5. Roadmap ───────────────────────────────────────────────────────────────

function Roadmap({ go }: { go: (s: Screen) => void }) {
  const {
    goal, experience, bioNote, resumeFileName,
    recognizedSkills, customSkillRatings, sendMessage
  } = useAuthAndSync();

  const skills = useMemo(
    () => analyzeSkillGap(goal, experience, bioNote, resumeFileName, recognizedSkills, customSkillRatings),
    [goal, experience, bioNote, resumeFileName, recognizedSkills, customSkillRatings]
  );

  const roadmapItems = useMemo(
    () => getAnalyzedRoadmap(goal, experience, skills),
    [goal, experience, skills]
  );

  const displayGoal = goal.trim() || 'Full Stack Developer';
  const activeMilestone = roadmapItems.find(item => item.current);

  const askAboutTopic = (topic: string) => {
    sendMessage(`I am following the learning path for ${displayGoal}. Can you give me a clear breakdown of "${topic}" with practical exercises?`);
    go('chat');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: P.bg, color: P.text }}>
      <Nav screen="roadmap" go={go} />
      <div className="flex-1 max-w-xl mx-auto w-full px-6 pt-28 pb-16">
        <div className="text-xs mb-2 tracking-widest uppercase" style={{ color: P.subtle, fontFamily: P.mono }}>
          Personalized Journey · Skill Gap Calibrated
        </div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-4xl font-bold" style={{ letterSpacing: '-0.02em' }}>Your Journey</h2>
          <span className="text-xs px-3 py-1.5 rounded-lg" style={{ background: P.surface2, border: `1px solid ${P.border}`, color: P.muted, fontFamily: P.mono }}>
            Tailored for {displayGoal}
          </span>
        </div>

        {/* Profile-analyzed calibration banner */}
        <div className="rounded-xl p-4 mb-8"
          style={{ background: P.surface, border: `1px solid ${P.border}` }}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-sm" style={{ color: P.text }}>Calibrated to Your Profile</span>
            <span style={{ color: P.accent, fontFamily: P.mono }}>
              {roadmapItems.filter(i => i.done).length} Mastered · {roadmapItems.filter(i => !i.done && !i.goal).length} To Go
            </span>
          </div>
          <p className="text-xs" style={{ color: P.subtle }}>
            Stages are marked based on your profile analysis and skill proficiency.
            {activeMilestone && (
              <span style={{ color: P.primary }}> Active frontier: <strong>{activeMilestone.label}</strong>.</span>
            )}
          </p>
        </div>

        <div className="relative">
          {/* Spine */}
          <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background: P.border }} />

          {roadmapItems.map(item => (
            <div key={item.id} className="relative pl-14 mb-5">
              {/* Node Icon */}
              <div className="absolute left-0 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: item.goal    ? P.primary
                             : item.done   ? P.surface
                             : item.current ? P.primaryDim
                             : P.surface,
                  border: `2px solid ${
                    item.goal    ? P.primary
                    : item.done   ? P.accent
                    : item.current ? P.primary
                    : 'rgba(255,255,255,0.08)'
                  }`,
                  zIndex: 1,
                }}>
                {item.goal    ? <span className="text-base">🎯</span>
                : item.done   ? <span className="font-bold" style={{ color: P.accent, fontSize: 14 }}>✓</span>
                : item.current ? <span style={{ color: P.primary, fontSize: 10 }}>▶</span>
                : <span className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />}
              </div>

              <div className="rounded-xl px-4 py-3 transition-colors"
                style={{
                  background: item.current ? P.primaryDim : item.goal ? `${P.primary}10` : 'transparent',
                  border: item.current ? `1px solid ${P.primary}44` : item.goal ? `1px solid ${P.primary}33` : 'none',
                }}>
                <div className="flex items-center gap-3 flex-wrap justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${item.goal ? 'text-lg' : 'text-base'}`}
                      style={{
                        color:         item.done ? P.subtle : item.goal ? P.primary : P.text,
                        textDecoration: item.done ? 'line-through' : 'none',
                      }}>
                      {item.label}
                    </span>
                    {item.current && <Pill color={P.primary}>active focus</Pill>}
                    {item.done && <span className="text-xs" style={{ color: P.accent, fontFamily: P.mono }}>done</span>}
                    {item.statusBadge && (
                      <span className="text-[11px] px-2 py-0.5 rounded"
                        style={{
                          background: item.done ? `${P.accent}15` : item.current ? `${P.warn}22` : 'rgba(255,255,255,0.04)',
                          color: item.done ? P.accent : item.current ? P.warn : P.subtle,
                          fontFamily: P.mono
                        }}>
                        {item.statusBadge}
                      </span>
                    )}
                  </div>

                  {item.current && (
                    <button
                      onClick={() => askAboutTopic(item.label)}
                      className="text-xs cursor-pointer px-2.5 py-1 rounded-md transition-opacity hover:opacity-80"
                      style={{ background: P.surface2, border: `1px solid ${P.border}`, color: P.primary, fontFamily: P.mono }}
                      title="Ask AI Mentor about this stage"
                    >
                      Ask Mentor ▸
                    </button>
                  )}
                </div>

                {item.explanation && (
                  <p className="text-xs mt-1" style={{ color: item.current ? P.muted : P.subtle }}>
                    {item.explanation}
                  </p>
                )}

                {item.children && (
                  <div className="mt-3 pl-3 space-y-2"
                    style={{ borderLeft: `2px solid ${P.primary}22` }}>
                    {item.children.map((c, ci) => (
                      <button
                        key={c}
                        onClick={() => askAboutTopic(c)}
                        className="w-full text-left flex items-center justify-between group cursor-pointer py-0.5 rounded transition-opacity hover:opacity-90"
                      >
                        <div className="flex items-center gap-2 text-sm"
                          style={{ color: ci === 0 ? P.muted : P.subtle }}>
                          <span style={{ color: ci === 0 ? P.primary : 'rgba(255,255,255,0.15)', fontSize: 10 }}>▸</span>
                          <span>{c}</span>
                        </div>
                        <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: P.primary, fontFamily: P.mono }}>
                          learn →
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <Btn full onClick={() => go('weekly')}>See This Week's Plan & Courses →</Btn>
        </div>
      </div>
    </div>
  );
}

// ── 6. Weekly Plan ───────────────────────────────────────────────────────────

function Weekly({ go }: { go: (s: Screen) => void }) {
  const {
    goal, experience, bioNote, resumeFileName,
    recognizedSkills, customSkillRatings,
    weeklyChecks, toggleWeeklyCheck,
    dynamicTasks, addDynamicTask, completeTaskAndUpgrade,
    taskUpgradeNotification, clearTaskUpgradeNotification,
    setActiveQuizTopic,
    sendMessage
  } = useAuthAndSync();

  const skills = useMemo(
    () => analyzeSkillGap(goal, experience, bioNote, resumeFileName, recognizedSkills, customSkillRatings),
    [goal, experience, bioNote, resumeFileName, recognizedSkills, customSkillRatings]
  );

  const roadmapItems = useMemo(
    () => getAnalyzedRoadmap(goal, experience, skills),
    [goal, experience, skills]
  );

  const activeMilestone = roadmapItems.find(item => item.current);

  const weekList = useMemo(
    () => getAnalyzedWeeklyPlan(goal, experience, activeMilestone),
    [goal, experience, activeMilestone]
  );

  const [courseFilter, setCourseFilter] = useState<'all' | 'free'>('all');
  const [expandedDayCourses, setExpandedDayCourses] = useState<Record<string, boolean>>({});
  const [addingTaskForDay, setAddingTaskForDay] = useState<string | null>(null);
  const [customTaskInput, setCustomTaskInput] = useState('');

  const displayGoal = goal.trim() || 'Full Stack Developer';
  
  // Total includes initial tasks + generated dynamic tasks
  const total = weekList.reduce((acc, d) => {
    const dayTasks = Array.from(new Set([...d.tasks, ...(dynamicTasks[d.day] || [])]));
    return acc + dayTasks.length;
  }, 0);
  const done = Object.values(weeklyChecks).filter(Boolean).length;

  const toggleDayCourses = (day: string) => {
    setExpandedDayCourses(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const launchAiAssessment = (topic: string) => {
    setActiveQuizTopic(topic);
    go('quizzes');
  };

  const askAboutCourse = (course: CourseItem, topic: string) => {
    sendMessage(`What are the pros and cons of the course "${course.title}" by ${course.provider} for "${topic}"? Can you also give me concrete code examples of what I will learn?`);
    go('chat');
  };

  const handleCreateCustomTask = (day: string) => {
    const trimmed = customTaskInput.trim();
    if (trimmed) {
      addDynamicTask(day, trimmed);
      setCustomTaskInput('');
      setAddingTaskForDay(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: P.bg, color: P.text }}>
      <Nav screen="weekly" go={go} />
      <div className="flex-1 max-w-xl mx-auto w-full px-6 pt-28 pb-16">
        <div className="text-xs mb-2 tracking-widest uppercase" style={{ color: P.subtle, fontFamily: P.mono }}>
          Curriculum Plan · {activeMilestone?.label || displayGoal}
        </div>

        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-4xl font-bold" style={{ letterSpacing: '-0.02em' }}>This Week</h2>
            <p className="text-xs mt-1" style={{ color: P.subtle }}>
              Weekly tasks with curated courses. Complete tasks to unlock new challenges & upgrade your Skill Gap!
            </p>
          </div>
          <span className="text-sm font-bold" style={{ color: P.accent, fontFamily: P.mono }}>
            {done}/{total} tasks done
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full rounded-full mb-6" style={{ height: 4, background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${total ? Math.min(100, (done / total) * 100) : 0}%`, background: P.accent }} />
        </div>

        {/* Celebratory Skill Gap Upgrade Notification Banner */}
        {taskUpgradeNotification && (
          <div
            className="mb-6 p-4 rounded-xl flex items-center justify-between gap-4 transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 245, 165, 0.12) 0%, rgba(123, 111, 247, 0.12) 100%)',
              border: `1px solid ${P.accent}`,
              boxShadow: '0 8px 30px rgba(59, 245, 165, 0.1)',
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: `${P.accent}2a`, color: P.accent }}>
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm" style={{ color: P.text }}>
                    Skill Gap Upgraded!
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${P.accent}26`, color: P.accent, fontFamily: P.mono }}>
                    +1 Level
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: P.muted }}>
                  <strong style={{ color: P.text }}>{taskUpgradeNotification.skillName}</strong> improved from{' '}
                  <span style={{ color: P.subtle }}>{taskUpgradeNotification.prevScore}/10</span> to{' '}
                  <span className="font-bold" style={{ color: P.accent }}>{taskUpgradeNotification.newScore}/10</span>!
                  {taskUpgradeNotification.unlockedTask && (
                    <span className="block mt-1 font-medium" style={{ color: P.primary }}>
                      ✨ New follow-up task added: "{taskUpgradeNotification.unlockedTask}"
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => go('skills')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                style={{ background: P.accent, color: '#0B0D14', fontFamily: P.mono }}
              >
                View Gap →
              </button>
              <button
                onClick={clearTaskUpgradeNotification}
                className="p-1.5 rounded-lg text-xs cursor-pointer hover:opacity-80"
                style={{ color: P.subtle }}
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Upgrade Feedback Indicator */}
        <div className="flex items-center justify-between mb-4 p-3 rounded-xl text-xs"
          style={{ background: 'rgba(123,111,247,0.06)', border: `1px solid ${P.primary}22` }}>
          <div className="flex items-center gap-2" style={{ color: P.muted }}>
            <span className="text-sm">🎯</span>
            <span>
              <strong>Dynamic Skill Leveling Active:</strong> Checking off tasks upgrades your matched skill and generates progressive tasks.
            </span>
          </div>
          <button
            onClick={() => go('skills')}
            className="text-[11px] underline flex-shrink-0 cursor-pointer hover:opacity-80"
            style={{ color: P.primary, fontFamily: P.mono }}
          >
            Check Skills
          </button>
        </div>

        {/* Course Filter Bar */}
        <div className="flex items-center justify-between mb-6 p-2.5 rounded-xl text-xs"
          style={{ background: P.surface, border: `1px solid ${P.border}` }}>
          <span className="font-medium flex items-center gap-1.5" style={{ color: P.muted, fontFamily: P.mono }}>
            <span>🎓</span> Recommended Courses:
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCourseFilter('all')}
              className="px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              style={{
                background: courseFilter === 'all' ? P.primaryDim : 'transparent',
                color: courseFilter === 'all' ? P.primary : P.subtle,
                fontFamily: P.mono,
              }}
            >
              All Courses
            </button>
            <button
              onClick={() => setCourseFilter('free')}
              className="px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
              style={{
                background: courseFilter === 'free' ? `${P.accent}22` : 'transparent',
                color: courseFilter === 'free' ? P.accent : P.subtle,
                fontFamily: P.mono,
              }}
            >
              <span>✓</span> Free Only
            </button>
          </div>
        </div>

        {/* Daily Schedule with Tasks & Prioritized Courses */}
        <div className="space-y-4">
          {weekList.map((day, i) => {
            const isToday = i === 0;
            const isCourseFree = (c: CourseItem) => c.type === 'free' || c.free === true;
            const displayedCourses = (day.courses || []).filter(c =>
              courseFilter === 'all' ? true : isCourseFree(c)
            );
            const isExpanded = !!expandedDayCourses[day.day];
            const coursesToShow = isExpanded ? displayedCourses : displayedCourses.slice(0, 1);

            // Merge initial day tasks with progressive dynamically generated tasks
            const allDayTasks = Array.from(new Set([...day.tasks, ...(dynamicTasks[day.day] || [])]));
            const matchedSkill = findMatchingSkill(day.topic, skills);
            const allDayCompleted = allDayTasks.length > 0 && allDayTasks.every(t => weeklyChecks[`${day.day}-${t}`]);

            return (
              <div key={day.day}
                className="rounded-xl p-5 transition-colors"
                style={{
                  background: isToday ? P.primaryDim : P.surface,
                  border: `1px solid ${isToday ? `${P.primary}44` : P.border}`,
                }}>
                {/* Header row: Day, Topic, and Actions */}
                <div className="flex items-start gap-4 mb-3">
                  <div className="text-xs font-bold w-10 pt-0.5 text-center flex-shrink-0"
                    style={{ color: isToday ? P.primary : P.subtle, fontFamily: P.mono }}>
                    {day.day}
                  </div>

                  <div className="w-px self-stretch"
                    style={{ background: isToday ? `${P.primary}33` : P.border }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm" style={{ color: isToday ? P.text : P.muted }}>
                        {day.topic}
                      </p>
                      {matchedSkill && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(255,255,255,0.05)', color: P.subtle, fontFamily: P.mono }}
                          title={`Completing tasks upgrades: ${matchedSkill.name}`}>
                          Upgrades: {matchedSkill.name} ({matchedSkill.current}/{matchedSkill.required})
                        </span>
                      )}
                    </div>
                  </div>

                  {day.ai && (
                    <button
                      onClick={() => launchAiAssessment(day.topic)}
                      className="cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                      title="Launch AI Assessment with Mentor"
                    >
                      <Pill color={P.primary}>AI Quiz</Pill>
                    </button>
                  )}
                </div>

                {/* Tasks row with auto-upgrade on click */}
                <div className="pl-14 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px]" style={{ color: P.subtle, fontFamily: P.mono }}>Tasks:</span>
                    {allDayCompleted && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded"
                        style={{ background: `${P.accent}1a`, color: P.accent, fontFamily: P.mono }}>
                        ✓ Completed & Upgraded
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {allDayTasks.map(task => {
                      const key = `${day.day}-${task}`;
                      const isDynamic = (dynamicTasks[day.day] || []).includes(task);
                      return (
                        <button key={task}
                          onClick={() => {
                            completeTaskAndUpgrade(
                              day.day,
                              task,
                              day.topic,
                              matchedSkill?.name || skills[0]?.name || 'Core Skill',
                              matchedSkill?.current ?? 2
                            );
                          }}
                          className="flex items-center gap-2 text-xs cursor-pointer select-none hover:opacity-80 transition-all active:scale-95"
                          style={{
                            color: weeklyChecks[key] ? P.accent : P.text,
                            fontFamily: P.mono,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: isDynamic ? 'rgba(123,111,247,0.08)' : 'transparent',
                            border: isDynamic ? `1px dashed ${P.primary}44` : 'none',
                          }}>
                          <span className="w-4 h-4 rounded flex items-center justify-center transition-all flex-shrink-0"
                            style={{
                              background: weeklyChecks[key] ? `${P.accent}1a` : 'rgba(255,255,255,0.04)',
                              border:     `1px solid ${weeklyChecks[key] ? P.accent : 'rgba(255,255,255,0.1)'}`,
                            }}>
                            {weeklyChecks[key] && <span style={{ fontSize: 9 }}>✓</span>}
                          </span>
                          <span>{task}</span>
                          {isDynamic && (
                            <span className="text-[9px] px-1 rounded" style={{ background: P.primaryDim, color: P.primary }}>
                              NEW
                            </span>
                          )}
                        </button>
                      );
                    })}

                    {/* Quick Add Custom Challenge for Day */}
                    {addingTaskForDay === day.day ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="New task..."
                          value={customTaskInput}
                          onChange={e => setCustomTaskInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleCreateCustomTask(day.day); }}
                          className="text-xs px-2 py-1 rounded bg-transparent outline-none w-28"
                          style={{ border: `1px solid ${P.primary}`, color: P.text, fontFamily: P.mono }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleCreateCustomTask(day.day)}
                          className="text-[11px] px-2 py-1 rounded font-bold cursor-pointer"
                          style={{ background: P.primary, color: '#fff', fontFamily: P.mono }}
                        >
                          Add
                        </button>
                        <button
                          onClick={() => { setAddingTaskForDay(null); setCustomTaskInput(''); }}
                          className="text-[11px] px-1 text-gray-400 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAddingTaskForDay(day.day); setCustomTaskInput(''); }}
                        className="text-[11px] px-2 py-0.5 rounded cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1"
                        style={{ background: 'rgba(255,255,255,0.04)', border: `1px dashed ${P.border}`, color: P.subtle, fontFamily: P.mono }}
                        title="Add extra challenge"
                      >
                        <span>+</span> Task
                      </button>
                    )}
                  </div>
                </div>

                {/* Course Recommendations for this topic (Free courses prioritized) */}
                {displayedCourses.length > 0 && (
                  <div className="pl-14 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5"
                        style={{ color: P.subtle, fontFamily: P.mono }}>
                        <span>📚</span> Course Recommendations
                      </span>
                      {displayedCourses.length > 1 && (
                        <button
                          onClick={() => toggleDayCourses(day.day)}
                          className="text-[11px] cursor-pointer hover:opacity-80"
                          style={{ color: P.primary, fontFamily: P.mono }}
                        >
                          {isExpanded ? 'Show less ▲' : `+${displayedCourses.length - 1} more courses ▼`}
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {coursesToShow.map((course, cIdx) => {
                        const freeFlag = isCourseFree(course);
                        return (
                          <div
                            key={cIdx}
                            className="rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs"
                            style={{
                              background: freeFlag ? 'rgba(59, 245, 165, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                              border: `1px solid ${freeFlag ? 'rgba(59, 245, 165, 0.2)' : 'rgba(255, 255, 255, 0.06)'}`,
                            }}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              {/* Free / Paid Badge */}
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase"
                                style={{
                                 background: freeFlag ? `${P.accent}22` : 'rgba(255,255,255,0.08)',
                                 color: freeFlag ? P.accent : P.subtle,
                                 fontFamily: P.mono,
                                }}
                              >
                                {freeFlag ? 'FREE' : 'PAID'}
                              </span>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold truncate" style={{ color: P.text }}>
                                    {course.title}
                                  </span>
                                  {course.rating && (
                                    <span className="text-[10px]" style={{ color: P.warn, fontFamily: P.mono }}>
                                      ★ {course.rating}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] truncate" style={{ color: P.subtle }}>
                                  <span>{course.provider}</span>
                                  {course.highlight && (
                                    <>
                                      <span>·</span>
                                      <span style={{ color: freeFlag ? P.accent : P.muted }}>{course.highlight}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Course Action Buttons */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => askAboutCourse(course, day.topic)}
                                className="text-[11px] px-2 py-1 rounded cursor-pointer transition-opacity hover:opacity-80"
                                style={{
                                  background: P.surface2,
                                  border: `1px solid ${P.border}`,
                                  color: P.muted,
                                  fontFamily: P.mono,
                                }}
                                title="Ask AI Mentor to explain this course"
                              >
                                Mentor 🤖
                              </button>
                              <a
                                href={course.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] px-2 py-1 rounded font-medium transition-opacity hover:opacity-90 flex items-center gap-1"
                                style={{
                                  background: freeFlag ? P.accent : P.primary,
                                  color: '#0B0D14',
                                  fontFamily: P.mono,
                                }}
                              >
                                <span>Open</span>
                                <span>↗</span>
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <Btn full onClick={() => go('chat')}>Talk to AI Mentor →</Btn>
        </div>
      </div>
    </div>
  );
}

// ── 7. AI Chat ───────────────────────────────────────────────────────────────

function CodeBox({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden my-3 border border-stone-800 bg-stone-950 shadow-inner">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-stone-900 border-b border-stone-800 text-[11px] text-stone-400 font-mono">
        <span>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1 font-mono text-[11px]"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-3 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

function AIMessageContent({ text }: { text: string }) {
  // Split into code blocks vs text
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2.5 text-sm leading-relaxed">
      {parts.map((part, idx) => {
        if (part.startsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const firstLine = lines[0]?.trim() || '';
          const isLang = /^[a-zA-Z0-9_#-]+$/.test(firstLine);
          const lang = isLang ? firstLine : '';
          const code = (isLang ? lines.slice(1) : lines).join('\n');

          return <CodeBox key={idx} code={code} language={lang} />;
        }

        return (
          <div key={idx} className="space-y-2">
            {part.split('\n\n').map((para, pi) => {
              if (!para.trim()) return null;

              if (para.startsWith('### ') || para.startsWith('## ')) {
                const title = para.replace(/^#+\s*/, '');
                return (
                  <h4 key={pi} className="font-bold text-sm mt-3 mb-1 text-white flex items-center gap-1.5">
                    {title}
                  </h4>
                );
              }

              const lines = para.split('\n');
              return (
                <div key={pi} className="space-y-1">
                  {lines.map((line, li) => {
                    const trimmed = line.trim();

                    // Pros card
                    if (
                      trimmed.startsWith('- 👍') ||
                      trimmed.startsWith('👍') ||
                      trimmed.toLowerCase().includes('**pros**:') ||
                      trimmed.toLowerCase().startsWith('pros:')
                    ) {
                      return (
                        <div
                          key={li}
                          className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium my-1 flex items-start gap-1.5"
                        >
                          <span>👍</span>
                          <span>{trimmed.replace(/^[-•]\s*/, '').replace(/^[👍⚠️🎯]\s*/, '')}</span>
                        </div>
                      );
                    }

                    // Cons card
                    if (
                      trimmed.startsWith('- ⚠️') ||
                      trimmed.startsWith('⚠️') ||
                      trimmed.toLowerCase().includes('**cons**:') ||
                      trimmed.toLowerCase().startsWith('cons:')
                    ) {
                      return (
                        <div
                          key={li}
                          className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-medium my-1 flex items-start gap-1.5"
                        >
                          <span>⚠️</span>
                          <span>{trimmed.replace(/^[-•]\s*/, '').replace(/^[👍⚠️🎯]\s*/, '')}</span>
                        </div>
                      );
                    }

                    // Best For card
                    if (
                      trimmed.startsWith('- 🎯') ||
                      trimmed.startsWith('🎯') ||
                      trimmed.toLowerCase().includes('**best for**:')
                    ) {
                      return (
                        <div
                          key={li}
                          className="p-2.5 rounded-lg bg-sky-950/40 border border-sky-500/30 text-sky-300 text-xs font-medium my-1 flex items-start gap-1.5"
                        >
                          <span>🎯</span>
                          <span>{trimmed.replace(/^[-•]\s*/, '').replace(/^[👍⚠️🎯]\s*/, '')}</span>
                        </div>
                      );
                    }

                    // Standard bullet point
                    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                      return (
                        <p key={li} className="pl-2 text-stone-300 flex items-start gap-2 text-xs">
                          <span className="text-amber-400 select-none">•</span>
                          <span>{trimmed.replace(/^[-•]\s*/, '')}</span>
                        </p>
                      );
                    }

                    return (
                      <p key={li} className={li > 0 ? 'mt-1' : ''} style={{ color: P.text }}>
                        {line}
                      </p>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function Chat({ go }: { go: (s: Screen) => void }) {
  const { messages, sendMessage, isAiGenerating, setActiveQuizTopic } = useAuthAndSync();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiGenerating]);

  const handleSend = () => {
    if (!input.trim() || isAiGenerating) return;
    sendMessage(input);
    setInput('');
  };

  const handlePromptClick = (text: string) => {
    sendMessage(text);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: P.bg, color: P.text }}>
      <Nav screen="chat" go={go} />

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full pt-20">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${P.border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow"
              style={{ background: P.primaryDim, border: `1px solid ${P.primary}44` }}>
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm" style={{ color: P.text }}>EduPath AI Mentor</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Friendly & Ready to Help
                </span>
              </div>
              <p className="text-xs" style={{ color: P.subtle, fontFamily: P.mono }}>
                Answers with concrete code examples · Compares courses with Pros & Cons
              </p>
            </div>
          </div>

          <button
            onClick={() => go('quizzes')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:opacity-90 transition shadow-sm"
            style={{ background: P.primaryDim, color: P.primary, border: `1px solid ${P.primary}44`, fontFamily: P.mono }}
          >
            <span>📝</span> Take AI Quizzes →
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={msg.id || i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'gap-3'}`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 mt-1 shadow-sm"
                  style={{ background: P.primaryDim, border: `1px solid ${P.primary}33` }}>
                  🤖
                </div>
              )}
              <div className={`flex-1 ${msg.role === 'user' ? 'max-w-md ml-auto' : 'max-w-xl'}`}>
                <div className={`rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                  style={{
                    background: msg.role === 'user' ? P.primary : P.surface,
                    color:      msg.role === 'user' ? '#fff'    : P.text,
                    border:     msg.role === 'user' ? 'none'    : `1px solid ${P.border}`,
                  }}>
                  {msg.role === 'user' ? (
                    <p>{msg.text}</p>
                  ) : (
                    <AIMessageContent text={msg.text} />
                  )}
                </div>

                {msg.role === 'ai' && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    {msg.tags && msg.tags.map(t => (
                      <button
                        key={t}
                        onClick={() => sendMessage(`Can you explain ${t} with an intuitive code example?`)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        title={`Ask mentor about ${t}`}
                      >
                        <Pill color={P.subtle}>{t}</Pill>
                      </button>
                    ))}

                    {msg.cta && (
                      <button
                        onClick={() => {
                          const ctaLower = msg.cta?.toLowerCase() || '';
                          if (ctaLower.includes('quiz')) {
                            setActiveQuizTopic(msg.tags?.[0] || 'Modern Web Development');
                            go('quizzes');
                          } else if (ctaLower.includes('roadmap')) {
                            go('roadmap');
                          } else if (ctaLower.includes('week') || ctaLower.includes('plan')) {
                            go('weekly');
                          } else {
                            sendMessage(`Let's explore: ${msg.cta}`);
                          }
                        }}
                        className="ml-auto px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 cursor-pointer shadow-sm flex items-center gap-1.5"
                        style={{ background: P.primary, color: '#fff' }}
                      >
                        <span>✨</span>
                        {msg.cta}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isAiGenerating && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                style={{ background: P.primaryDim, border: `1px solid ${P.primary}33` }}>
                🤖
              </div>
              <div className="rounded-2xl rounded-tl-sm px-4 py-3.5" style={{ background: P.surface }}>
                <div className="flex gap-1.5 items-center">
                  {[0, 1, 2].map(n => (
                    <span key={n} className="w-2 h-2 rounded-full dot-bounce"
                      style={{ background: P.primary }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="px-6 py-4" style={{ borderTop: `1px solid ${P.border}` }}>
          {/* Quick Mentor Prompts */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
            {[
              { label: '💡 Explain with code example', text: 'Can you explain JavaScript async/await with a clear, practical code example?' },
              { label: '📚 Compare courses with Pros & Cons', text: 'What are the top courses for full stack web development? Can you give me their pros and cons?' },
              { label: '📝 Take an AI Quiz', action: () => go('quizzes') },
              { label: '🎯 Break down React Hooks', text: 'Can you explain how useEffect works with a code example showing common mistakes to avoid?' },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => {
                  if (item.action) item.action();
                  else if (item.text) handlePromptClick(item.text);
                }}
                disabled={isAiGenerating}
                className="text-xs px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-all hover:opacity-80 disabled:opacity-50"
                style={{
                  background: P.surface2,
                  border: `1px solid ${P.border}`,
                  color: P.muted,
                  fontFamily: P.mono,
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3 items-center rounded-xl px-4 py-2.5"
            style={{ background: P.surface, border: `1px solid ${P.border}` }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything... (e.g. 'explain TypeScript generics with code', 'compare top Python courses')"
              disabled={isAiGenerating}
              className="flex-1 bg-transparent outline-none text-sm placeholder:opacity-30 disabled:opacity-50"
              style={{ color: P.text, fontFamily: 'inherit' }}
            />
            <button
              onClick={handleSend}
              disabled={isAiGenerating || !input.trim()}
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:opacity-80 cursor-pointer disabled:opacity-40"
              style={{ background: input.trim() ? P.primary : 'rgba(255,255,255,0.05)' }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <p className="text-center mt-3 text-xs" style={{ color: P.subtle, fontFamily: P.mono }}>
            Friendly AI Mentor · Always includes concrete examples & course pros/cons
          </p>
        </div>
      </div>
    </div>
  );
}

// ── 8. AI Quizzes Screen ─────────────────────────────────────────────────────

function QuizScreen({ go }: { go: (s: Screen) => void }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: P.bg, color: P.text }}>
      <Nav screen="quizzes" go={go} />
      <div className="flex-1 pt-24 pb-16">
        <QuizPage />
      </div>
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const { screen, setScreen } = useAuthAndSync();

  return (
    <>
      {screen === 'landing'    && <Landing    go={setScreen} />}
      {screen === 'onboarding' && <Onboarding go={setScreen} />}
      {screen === 'upload'     && <Upload     go={setScreen} />}
      {screen === 'skills'     && <Skills     go={setScreen} />}
      {screen === 'roadmap'    && <Roadmap    go={setScreen} />}
      {screen === 'weekly'     && <Weekly     go={setScreen} />}
      {screen === 'quizzes'    && <QuizScreen go={setScreen} />}
      {screen === 'chat'       && <Chat       go={setScreen} />}
    </>
  );
}
