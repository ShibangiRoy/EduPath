import React, { useState, useEffect } from 'react';
import { useAuthAndSync } from '../context/AuthAndSyncContext';
import { QuizQuestion, ExperienceLevel } from '../types';
import { TOPIC_PRESETS, getLocalQuizForTopic } from '../utils/quizBank';
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  ChevronRight,
  HelpCircle,
  Layers,
  Flame,
  MessageSquareQuote,
  Clock,
  ArrowLeft
} from 'lucide-react';

export const QuizPage: React.FC = () => {
  const {
    goal,
    experience,
    customSkillRatings,
    upgradeSkillScore,
    quizHistory,
    saveQuizResult,
    activeQuizTopic,
    setActiveQuizTopic,
    setScreen,
    sendMessage,
  } = useAuthAndSync();

  // Configuration state
  const [selectedTopic, setSelectedTopic] = useState<string>(activeQuizTopic || 'React.js & Hooks');
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ExperienceLevel>(experience || 'beginner');
  const [questionCount, setQuestionCount] = useState<number>(3);

  // Active quiz state
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [hasUpgradedSkill, setHasUpgradedSkill] = useState(false);

  // If redirected from Chat or Roadmap with an activeQuizTopic
  useEffect(() => {
    if (activeQuizTopic) {
      setSelectedTopic(activeQuizTopic);
    }
  }, [activeQuizTopic]);

  // Start generating a quiz
  const handleStartQuiz = async (topicToUse?: string) => {
    const topic = (topicToUse || (customTopicInput.trim() ? customTopicInput.trim() : selectedTopic)).trim();
    if (!topic) return;

    setIsGenerating(true);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserAnswers([]);
    setQuizFinished(false);
    setHasUpgradedSkill(false);

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          difficulty: selectedDifficulty,
          count: questionCount,
          goal: goal || 'Full Stack Developer',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          setQuizQuestions(data.questions);
          setIsGenerating(false);
          return;
        }
      }

      // Safe resilient fallback
      const fallback = getLocalQuizForTopic(topic, selectedDifficulty);
      setQuizQuestions(fallback.slice(0, questionCount));
    } catch {
      const fallback = getLocalQuizForTopic(topic, selectedDifficulty);
      setQuizQuestions(fallback.slice(0, questionCount));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    setUserAnswers(prev => {
      const copy = [...prev];
      copy[currentIndex] = selectedOption;
      return copy;
    });
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < quizQuestions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Finish quiz
      const finalAnswers = [...userAnswers];
      if (finalAnswers[currentIndex] === undefined && selectedOption !== null) {
        finalAnswers[currentIndex] = selectedOption;
        setUserAnswers(finalAnswers);
      }
      const total = quizQuestions.length;
      const score = quizQuestions.reduce((acc, q, idx) => {
        return acc + (finalAnswers[idx] === q.correctIndex ? 1 : 0);
      }, 0);
      const percentage = Math.round((score / total) * 100);

      saveQuizResult({
        topic: selectedTopic,
        difficulty: selectedDifficulty,
        score,
        total,
        percentage,
      });

      setQuizFinished(true);
    }
  };

  const currentQ = quizQuestions[currentIndex];
  const isCorrect = isAnswerSubmitted && selectedOption === currentQ?.correctIndex;

  // Calculate score at finish
  const finalScore = quizFinished
    ? quizQuestions.reduce((acc, q, idx) => acc + (userAnswers[idx] === q.correctIndex ? 1 : 0), 0)
    : 0;
  const finalPercent = quizQuestions.length ? Math.round((finalScore / quizQuestions.length) * 100) : 0;

  const handleUpgradeSkill = () => {
    if (hasUpgradedSkill) return;
    upgradeSkillScore(currentQ?.skillTag || selectedTopic, 1);
    setHasUpgradedSkill(true);
  };

  const handleAskMentorAboutMissed = () => {
    const missedQuestions = quizQuestions.filter((q, idx) => userAnswers[idx] !== q.correctIndex);
    const missedSummaries = missedQuestions.map(q => `"${q.question}"`).slice(0, 2).join(' and ');
    const questionText = missedSummaries
      ? `Hey mentor! I just finished the quiz on ${selectedTopic} and missed questions like ${missedSummaries}. Could you explain these with code examples and pros/cons?`
      : `Hey mentor! I just finished the ${selectedTopic} quiz with a score of ${finalScore}/${quizQuestions.length}! What should I study next to master this?`;

    sendMessage(questionText, [selectedTopic, 'Quiz Follow-up', 'Code Examples']);
    setScreen('chat');
  };

  return (
    <div id="quiz-page" className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-sm">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight">AI Mentor Quizzes</h1>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Sparkles className="w-3 h-3" /> Interactive AI
              </span>
            </div>
            <p className="text-sm text-stone-600 mt-0.5">
              Personalized concept drills and code challenges generated on-the-fly by your AI Mentor.
            </p>
          </div>
        </div>

        {/* User Quick Stats */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-stone-50 border border-stone-200/80 rounded-xl px-4 py-2 text-xs">
          <div className="text-center">
            <span className="block text-stone-500 font-medium">Completed</span>
            <span className="font-bold text-stone-800 text-sm">{quizHistory.length}</span>
          </div>
          <div className="w-px h-6 bg-stone-200" />
          <div className="text-center">
            <span className="block text-stone-500 font-medium">Avg Score</span>
            <span className="font-bold text-emerald-600 text-sm">
              {quizHistory.length
                ? `${Math.round(quizHistory.reduce((a, b) => a + b.percentage, 0) / quizHistory.length)}%`
                : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* VIEW 1: QUIZ SETUP / SELECTION SCREEN */}
      {!isGenerating && quizQuestions.length === 0 && !quizFinished && (
        <div className="space-y-8">
          {/* Friendly Mentor Prompt Card */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50/40 to-stone-50 border border-amber-200/70 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-stone-900">
                &ldquo;Ready to test your intuition, friend? Let&rsquo;s generate a custom quiz!&rdquo;
              </h2>
              <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                Pick a suggested topic from your learning path or type any technical concept you want to master. Every question includes concrete code examples and explanations to level up your Skill Gap!
              </p>
            </div>
          </div>

          {/* Configuration Card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                1. Select Topic or Skill
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {TOPIC_PRESETS.map(preset => {
                  const isSelected = selectedTopic === preset.label;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedTopic(preset.label);
                        setCustomTopicInput('');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all text-xs flex flex-col gap-1.5 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 text-stone-900 font-semibold shadow-sm'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50/50 text-stone-700'
                      }`}
                    >
                      <span className="text-lg">{preset.icon}</span>
                      <span className="line-clamp-1">{preset.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Topic Input */}
              <div className="mt-4">
                <div className="text-xs text-stone-500 mb-1.5 font-medium">Or type any custom topic:</div>
                <input
                  type="text"
                  placeholder="e.g. Next.js 14 Server Actions, Docker Compose, Git Rebase..."
                  value={customTopicInput}
                  onChange={e => {
                    setCustomTopicInput(e.target.value);
                    if (e.target.value) setSelectedTopic(e.target.value);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white shadow-inner"
                />
              </div>
            </div>

            {/* Difficulty & Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-stone-100">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  2. Difficulty Level
                </label>
                <div className="flex gap-2">
                  {(['beginner', 'intermediate', 'advanced'] as ExperienceLevel[]).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSelectedDifficulty(lvl)}
                      className={`flex-1 py-2 text-xs font-medium capitalize rounded-xl border transition-all ${
                        selectedDifficulty === lvl
                          ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  3. Question Count
                </label>
                <div className="flex gap-2">
                  {[3, 5, 10].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCount(cnt)}
                      className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all ${
                        questionCount === cnt
                          ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {cnt} Questions
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-400" /> Takes ~2-4 minutes
              </span>
              <button
                type="button"
                onClick={() => handleStartQuiz()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-sm shadow-sm transition-all flex items-center gap-2 hover:shadow"
              >
                <Sparkles className="w-4 h-4" />
                Generate Quiz with AI Mentor
              </button>
            </div>
          </div>

          {/* Past Quiz History */}
          {quizHistory.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-amber-500" />
                Your Quiz Performance History
              </h3>
              <div className="divide-y divide-stone-100">
                {quizHistory.map(item => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-stone-800">{item.topic}</div>
                      <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                        <span className="capitalize">{item.difficulty}</span>
                        <span>•</span>
                        <span>{item.score} of {item.total} correct</span>
                        <span>•</span>
                        <span>{new Date(item.completedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          item.percentage >= 80
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.percentage >= 50
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {item.percentage}%
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTopic(item.topic);
                          handleStartQuiz(item.topic);
                        }}
                        className="text-xs text-stone-600 hover:text-stone-900 p-1.5 hover:bg-stone-100 rounded-lg transition"
                        title="Retake Quiz"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: LOADING STATE */}
      {isGenerating && (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-sm max-w-lg mx-auto my-12">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-amber-200 animate-ping opacity-25" />
            <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-stone-900">Crafting Your Custom Quiz...</h3>
          <p className="text-sm text-stone-600 mt-2 leading-relaxed">
            Your friendly AI Mentor is formulating interactive questions, code examples, and clear explanations for{' '}
            <strong className="text-stone-900">{selectedTopic}</strong> ({selectedDifficulty}).
          </p>
        </div>
      )}

      {/* VIEW 3: ACTIVE QUIZ QUESTIONS */}
      {!isGenerating && quizQuestions.length > 0 && !quizFinished && currentQ && (
        <div className="space-y-6">
          {/* Top Bar with Progress */}
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Quit this quiz session? Your progress on this quiz will reset.')) {
                  setQuizQuestions([]);
                }
              }}
              className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Exit Quiz
            </button>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 uppercase tracking-wider text-[10px] font-semibold text-stone-600">
                {currentQ.skillTag || selectedTopic}
              </span>
              <span>
                Question {currentIndex + 1} of {quizQuestions.length}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-300 rounded-full"
              style={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug">
              {currentQ.question}
            </h2>

            {/* Code Snippet if present */}
            {currentQ.codeSnippet && currentQ.codeSnippet.trim() !== '' && (
              <div className="rounded-xl bg-stone-950 text-stone-100 p-4 font-mono text-xs overflow-x-auto shadow-inner border border-stone-800">
                <pre>{currentQ.codeSnippet}</pre>
              </div>
            )}

            {/* Multiple Choice Options */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isThisCorrect = idx === currentQ.correctIndex;

                let optionStyles = 'border-stone-200 hover:border-stone-300 bg-stone-50/40 text-stone-800';

                if (isAnswerSubmitted) {
                  if (isThisCorrect) {
                    optionStyles = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500';
                  } else if (isSelected && !isThisCorrect) {
                    optionStyles = 'border-rose-400 bg-rose-50 text-rose-950 ring-1 ring-rose-400';
                  } else {
                    optionStyles = 'border-stone-200 opacity-50 bg-white text-stone-500';
                  }
                } else if (isSelected) {
                  optionStyles = 'border-amber-500 bg-amber-50/80 text-stone-950 ring-2 ring-amber-500';
                }

                const letter = String.fromCharCode(65 + idx);

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswerSubmitted}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-4 rounded-xl border text-left transition-all text-sm flex items-start gap-3.5 ${optionStyles}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                        isAnswerSubmitted && isThisCorrect
                          ? 'bg-emerald-600 text-white'
                          : isAnswerSubmitted && isSelected && !isThisCorrect
                          ? 'bg-rose-600 text-white'
                          : isSelected
                          ? 'bg-amber-500 text-white'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="flex-1 leading-relaxed">{option}</span>
                    {isAnswerSubmitted && isThisCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isThisCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Feedback / Mentor Explanation */}
            {isAnswerSubmitted && (
              <div
                className={`p-5 rounded-xl border transition-all ${
                  isCorrect
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50/80 border-amber-200 text-stone-900'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm mb-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-emerald-800">Spot on! Excellent intuition! 🎉</span>
                    </>
                  ) : (
                    <>
                      <HelpCircle className="w-5 h-5 text-amber-600" />
                      <span className="text-amber-900">Good try! Here is how to think about it:</span>
                    </>
                  )}
                </div>

                <p className="text-sm leading-relaxed text-stone-700">
                  {currentQ.explanation}
                </p>

                {/* Example Snippet */}
                {currentQ.exampleSnippet && currentQ.exampleSnippet.trim() !== '' && (
                  <div className="mt-3.5 pt-3 border-t border-stone-200/60">
                    <span className="text-xs font-bold text-stone-600 flex items-center gap-1 mb-1.5">
                      💡 Concrete Code Example:
                    </span>
                    <div className="rounded-lg bg-stone-900 text-emerald-400 p-3 font-mono text-xs overflow-x-auto border border-stone-800">
                      <pre>{currentQ.exampleSnippet}</pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-end pt-4 border-t border-stone-100">
              {!isAnswerSubmitted ? (
                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleSubmitAnswer}
                  className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition shadow-sm flex items-center gap-2"
                >
                  {currentIndex + 1 < quizQuestions.length ? (
                    <>
                      Next Question <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      View Final Results <Award className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: QUIZ COMPLETION / RESULTS SUMMARY */}
      {quizFinished && (
        <div className="space-y-8 max-w-2xl mx-auto">
          <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center shadow-sm space-y-6">
            {/* Score Ring / Icon */}
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-bold shadow-inner bg-gradient-to-tr from-amber-100 to-orange-100 text-amber-700 border border-amber-300">
              {finalPercent}%
            </div>

            <div>
              <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
                Quiz Completed! 🎯
              </h2>
              <p className="text-sm font-medium text-stone-500 mt-1">
                You scored <strong className="text-stone-900">{finalScore}</strong> out of{' '}
                <strong className="text-stone-900">{quizQuestions.length}</strong> on{' '}
                <span className="text-amber-700 font-semibold">{selectedTopic}</span>
              </p>
            </div>

            {/* Friendly Mentor Commentary */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-left flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs text-stone-700 leading-relaxed">
                <strong className="block text-stone-900 font-bold mb-1">
                  AI Mentor Feedback:
                </strong>
                {finalPercent >= 80 ? (
                  <span>
                    &ldquo;Incredible job, friend! 🌟 Your fundamentals in {selectedTopic} are very sharp. You can now comfortably level up this skill in your Skill Gap or ask me for senior-level challenges in the chat!&rdquo;
                  </span>
                ) : finalPercent >= 50 ? (
                  <span>
                    &ldquo;Solid effort! 🚀 You have grasped the main architecture. Reviewing the code examples below will close the remaining gaps in no time!&rdquo;
                  </span>
                ) : (
                  <span>
                    &ldquo;Every challenge is a stepping stone! 🌱 The best engineers learn by debugging their misconceptions. Click below to have me explain these exact questions with more examples in Chat!&rdquo;
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={hasUpgradedSkill}
                onClick={handleUpgradeSkill}
                className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm ${
                  hasUpgradedSkill
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                {hasUpgradedSkill ? 'Skill Upgraded in Skill Gap! ✓' : 'Upgrade Skill in Skill Gap (+1)'}
              </button>

              <button
                type="button"
                onClick={handleAskMentorAboutMissed}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageSquareQuote className="w-4 h-4" />
                Ask Mentor to Explain in Chat
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuizQuestions([]);
                  setQuizFinished(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Take Another Quiz
              </button>
            </div>
          </div>

          {/* Detailed Question Review Breakdown */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 pb-2 border-b border-stone-100">
              <BookOpen className="w-4 h-4 text-amber-500" />
              Review Answers & Mentor Notes
            </h3>

            <div className="space-y-4">
              {quizQuestions.map((q, idx) => {
                const userPicked = userAnswers[idx];
                const wasCorrect = userPicked === q.correctIndex;

                return (
                  <div
                    key={q.id || idx}
                    className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/50 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-bold text-stone-900 text-sm">
                        Q{idx + 1}: {q.question}
                      </div>
                      {wasCorrect ? (
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Correct
                        </span>
                      ) : (
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Incorrect
                        </span>
                      )}
                    </div>

                    <div className="text-stone-600">
                      <strong>Your answer:</strong> {q.options[userPicked] || 'Skipped'}
                    </div>
                    {!wasCorrect && (
                      <div className="text-emerald-700 font-medium">
                        <strong>Correct answer:</strong> {q.options[q.correctIndex]}
                      </div>
                    )}

                    <div className="pt-2 border-t border-stone-200/60 text-stone-700">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>

                    {q.exampleSnippet && (
                      <div className="rounded bg-stone-900 text-emerald-400 p-2.5 font-mono text-[11px] overflow-x-auto mt-2">
                        <pre>{q.exampleSnippet}</pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
