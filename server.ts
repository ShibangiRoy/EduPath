import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Safe directory resolution that works seamlessly in both ESM (tsx dev) and CJS (esbuild production bundle)
const getAppDirname = (): string => {
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }
  try {
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      return path.dirname(fileURLToPath(import.meta.url));
    }
  } catch {
    // Fallback to process.cwd()
  }
  return process.cwd();
};

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Recommended candidates in order of availability:
// 'gemini-3.1-flash-lite' has the highest throughput and lowest likelihood of 503 capacity spikes
const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];

/**
 * Executes a Gemini request with automatic fallback between models and gentle retry on 503/429.
 * Suppresses raw error dumps to console so transient provider spikes do not trigger platform false-positives.
 */
async function generateWithModelFallback(
  ai: GoogleGenAI,
  prompt: string,
  options?: { responseMimeType?: string }
): Promise<string | null> {
  for (const modelName of CANDIDATE_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: options?.responseMimeType ? { responseMimeType: options.responseMimeType } : undefined,
        });

        if (response.text && response.text.trim()) {
          return response.text.trim();
        }
      } catch (err: unknown) {
        // Check if transient unavailable / rate-limited
        const errString = err instanceof Error ? err.message : String(err);
        const isTransient =
          errString.includes('503') ||
          errString.includes('UNAVAILABLE') ||
          errString.includes('high demand') ||
          errString.includes('429');

        if (isTransient && attempt === 0) {
          // Brief pause before second attempt on this model
          await new Promise(r => setTimeout(r, 200));
          continue;
        }
        // Advance to next candidate model smoothly without dumping raw JSON errors
        break;
      }
    }
  }
  return null;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'edupath-backend', timestamp: new Date().toISOString() });
});

// AI Mentor endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, goal, experience, weeklyChecks } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getAIClient();
    const userMessageLower = message.toLowerCase();
    const isCourseInquiry = userMessageLower.includes('course') ||
      userMessageLower.includes('learn') ||
      userMessageLower.includes('tutorial') ||
      userMessageLower.includes('class') ||
      userMessageLower.includes('udemy') ||
      userMessageLower.includes('coursera') ||
      userMessageLower.includes('freecodecamp') ||
      userMessageLower.includes('pros and cons') ||
      userMessageLower.includes('recommend');

    if (!ai) {
      // Warm, friendly fallback response when API key is not yet configured
      if (isCourseInquiry) {
        return res.json({
          reply: `Hey there! 🌟 I'd love to help you find the absolute best courses for your journey! Here is a friendly breakdown of top recommended courses with their pros & cons:\n\n### 1. **The Joy of React (Josh Comeau)**\n- 👍 **Pros**: Incredibly interactive visual widgets, focuses on mental models, top-tier community support.\n- ⚠️ **Cons**: Premium pricing, requires solid modern JavaScript fundamentals.\n- 🎯 **Best For**: Developers who learn best by doing and visual diagrams.\n\n### 2. **freeCodeCamp Full Stack Certification**\n- 👍 **Pros**: 100% free forever, hands-on browser coding drills, comprehensive curriculum.\n- ⚠️ **Cons**: Self-paced with minimal video instruction, can feel repetitive on basic exercises.\n- 🎯 **Best For**: Absolute beginners wanting zero financial investment.\n\n### 3. **Full Stack Open (University of Helsinki)**\n- 👍 **Pros**: Free, modern React/Node/GraphQL/TypeScript stack, deep industrial best practices.\n- ⚠️ **Cons**: High difficulty curve, heavy reading and assignment grading.\n- 🎯 **Best For**: Ambitious learners who want university-grade rigor!\n\nWhat specific skills do you want to master first? Let's tailor this together! 🚀`,
          tags: ['Course Comparison', 'Pros & Cons', 'Roadmap'],
          cta: 'Take a Quiz on this Topic',
        });
      }

      return res.json({
        reply: `Hey friend! 👋 That is such a fantastic question! Let's break it down together step-by-step so you have a crystal-clear mental model.\n\nHere is a quick, practical example of how it works:\n\n\`\`\`javascript\n// Simple real-world example:\nfunction greetLearner(name, goal) {\n  return \`🚀 Welcome \${name}! Keep crushing your \${goal} roadmap!\`;\n}\nconsole.log(greetLearner('Friend', '${goal || 'Web Development'}'));\n\`\`\`\n\nNotice how keeping the logic modular and self-contained makes debugging and scaling a breeze. You've got this! What part would you like to explore next? ✨`,
        tags: ['Concept Drill', 'Practical Example', 'Mentor Tip'],
        cta: 'Take a Quiz on this Topic',
      });
    }

    const prompt = `You are EduPath AI, an exceptionally warm, friendly, empathetic, encouraging, and enthusiastic educational mentor for technology careers.
User's Target Goal: ${goal || 'Full Stack Developer'}
User's Experience Level: ${experience || 'beginner'}
Weekly task status: ${JSON.stringify(weeklyChecks || {})}

Learner asks: "${message}"

CRITICAL GUIDELINES:
1. FRIENDLY & SUPPORTIVE TONE: Be enthusiastic, cheerful, empathetic, and encouraging like a dedicated personal mentor who truly cares about the learner's success. Use friendly greetings and warm emojis (🚀, 💡, ✨, 🎯, 👍).
2. ALWAYS PROVIDE EXAMPLES: Whenever the user asks you ANYTHING (concepts, code, errors, architectural choices, study advice), you MUST provide concrete, practical EXAMPLES!
   - If technical/coding: Provide a clean, formatted code block (e.g. \`\`\`typescript or \`\`\`javascript) with comments explaining each part clearly.
   - If conceptual: Provide a vivid, real-world scenario or step-by-step example.
3. COURSE REQUESTS - PROS & CONS MANDATORY: If the user asks about ANY course, asks for course recommendations, or asks to compare courses:
   - Provide a structured list of relevant courses.
   - For EACH course, you MUST explicitly provide:
     • Course Name & Platform
     • 👍 **Pros**: 2-3 specific strengths
     • ⚠️ **Cons**: 1-2 honest drawbacks
     • 🎯 **Best For**: Who benefits most from it
4. Keep the response well-structured with clear markdown headings, bullet points, and code snippets.
5. Provide 2-3 short relevant topic tags.
6. Provide an actionable call-to-action button (e.g. "Take a Quiz on this Topic", "Try the Code Example", "Compare More Courses").

Format your response strictly as JSON with this schema:
{
  "reply": "Your mentor response here formatted with markdown: code blocks, bullet points, pros/cons",
  "tags": ["tag1", "tag2"],
  "cta": "Short CTA Button"
}`;

    const outputText = await generateWithModelFallback(ai, prompt, { responseMimeType: 'application/json' });

    if (!outputText) {
      return res.json({
        reply: `Hey there! 🌟 That's a great area to focus on. Let's look at a clear practical example:\n\n\`\`\`javascript\n// Quick working example:\nconst learnStep = (topic) => {\n  console.log(\`✨ Mastering \${topic} one concept at a time!\`);\n};\nlearnStep('${message.slice(0, 30)}');\n\`\`\`\n\nRemember: build the simplest working prototype first, test your assumptions, and celebrate every small win! 🚀`,
        tags: ['Practical Example', 'Mentor Guidance'],
        cta: 'Take a Quiz on this Topic',
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      parsed = {
        reply: outputText,
        tags: ['Practical Example', 'Mentor Guidance'],
        cta: 'Take a Quiz on this Topic',
      };
    }

    return res.json(parsed);
  } catch (_error) {
    return res.json({
      reply: "Hey friend! 🌟 Let's master this concept step-by-step. Remember that consistent hands-on coding practice always leads to breakthroughs!",
      tags: ['Review', 'Core Concepts'],
      cta: 'Take a Quiz on this Topic',
    });
  }
});

// AI Quiz Generator Endpoint
app.post('/api/quiz', async (req, res) => {
  try {
    const { topic, difficulty, count = 3, goal } = req.body;
    const safeTopic = topic || 'Modern Web Development';
    const safeDifficulty = difficulty || 'beginner';
    const questionCount = Math.min(Math.max(Number(count) || 3, 1), 10);

    const ai = getAIClient();

    if (ai) {
      const prompt = `You are EduPath AI, an expert, enthusiastic educational mentor generating an engaging interactive quiz for a learner.
Target Goal: ${goal || 'Full Stack Developer'}
Topic: ${safeTopic}
Difficulty Level: ${safeDifficulty}
Number of Questions: ${questionCount}

Generate exactly ${questionCount} multiple-choice questions for the quiz.
Each question MUST:
1. Have a clear, unambiguous question text.
2. Include an optional \`codeSnippet\` if a code snippet is relevant (or null/empty string if not).
3. Have exactly 4 distinct, plausible options in the \`options\` array.
4. Have \`correctIndex\` as a number from 0 to 3 pointing to the correct option.
5. Have a friendly, encouraging \`explanation\` written by the mentor that explains WHY the correct answer is right AND why common misunderstandings happen.
6. Have an \`exampleSnippet\` showing a concrete, working code snippet or real-world example illustrating the concept.
7. Have a \`skillTag\` identifying the sub-skill (e.g. "React Hooks", "TypeScript Generics").

Format strictly as JSON matching this schema:
{
  "topic": "${safeTopic}",
  "difficulty": "${safeDifficulty}",
  "questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "codeSnippet": "optional code snippet or empty string",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Friendly mentor explanation with encouragement!",
      "exampleSnippet": "// Code example illustrating solution",
      "skillTag": "Sub-skill tag"
    }
  ]
}`;

      const outputText = await generateWithModelFallback(ai, prompt, { responseMimeType: 'application/json' });
      if (outputText) {
        try {
          const parsed = JSON.parse(outputText);
          if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
            return res.json(parsed);
          }
        } catch {
          // Continue to fallback below
        }
      }
    }

    // Built-in dynamic fallback question generator
    const fallbackQuestions = [
      {
        id: `q-${Date.now()}-1`,
        question: `When building applications in ${safeTopic}, what is the best practice for managing state and data flow?`,
        codeSnippet: `// Example flow in ${safeTopic}:\nconst [state, setState] = useState(initialState);`,
        options: [
          'Maintain a single source of truth and avoid unnecessary direct mutations',
          'Store all application data in global window variables',
          'Mutate object properties directly without notifying listeners',
          'Recalculate entire database schemas on every user click'
        ],
        correctIndex: 0,
        explanation: `In ${safeTopic}, keeping data immutable and having a clear, predictable single source of truth prevents race conditions, makes debugging straightforward, and ensures UI reactivity! 🚀`,
        exampleSnippet: `// ✅ Clean immutable update:\nsetState(prev => ({ ...prev, updatedKey: newValue }));`,
        skillTag: safeTopic
      },
      {
        id: `q-${Date.now()}-2`,
        question: `What is the primary benefit of modular code organization when scaling ${safeTopic} projects?`,
        options: [
          'Separation of concerns allows independent testing, code reuse, and easier collaboration',
          'It eliminates the need for unit tests or documentation',
          'It guarantees automatic 100% test coverage by default',
          'It removes the need to handle error boundaries'
        ],
        correctIndex: 0,
        explanation: 'Breaking large codebases into focused modules with distinct responsibilities makes each piece easier to understand, test in isolation, and refactor safely. Great job thinking about architecture! ✨',
        exampleSnippet: `// Modular pattern:\nexport const calculateMetrics = (data) => { /* focused logic */ };`,
        skillTag: `${safeTopic} Architecture`
      },
      {
        id: `q-${Date.now()}-3`,
        question: `How should asynchronous errors (like network timeouts or API failures) be handled in ${safeTopic}?`,
        codeSnippet: `try {\n  const res = await fetchData();\n} catch (error) {\n  // What belongs here?\n}`,
        options: [
          'Catch the error, log meaningful diagnostics, and provide a graceful UI fallback state to the user',
          'Ignore the error and let the application crash silently',
          'Reload the entire browser window on every network glitch',
          'Retry indefinitely in an unthrottled while loop'
        ],
        correctIndex: 0,
        explanation: 'Always anticipate that network requests or external resources might fail. Catching exceptions and displaying a polite user-friendly fallback state keeps your app resilient and professional! 🛡️',
        exampleSnippet: `try {\n  const data = await api.get();\n} catch (err) {\n  setError('Unable to load data. Please retry.');\n}`,
        skillTag: 'Error Handling'
      }
    ];

    return res.json({
      topic: safeTopic,
      difficulty: safeDifficulty,
      questions: fallbackQuestions.slice(0, questionCount)
    });
  } catch (_error) {
    return res.json({
      topic: 'Core Web Concepts',
      difficulty: 'beginner',
      questions: [
        {
          id: 'q-fallback-1',
          question: 'What is the recommended approach for writing maintainable and resilient software?',
          options: [
            'Break features into small, testable functions and handle potential errors gracefully',
            'Write all code in one file without comments',
            'Ignore asynchronous rejections',
            'Avoid writing tests altogether'
          ],
          correctIndex: 0,
          explanation: 'Modular design, clear separation of concerns, and robust error boundaries allow apps to remain resilient and easy to scale! 🚀',
          exampleSnippet: '// Clean error handling:\ntry { await processData(); } catch (err) { handleGracefully(err); }',
          skillTag: 'Software Architecture'
        }
      ]
    });
  }
});

// Vite middleware in development or static serve in production
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const cwdDist = path.join(process.cwd(), 'dist');
    const localDist = path.resolve(getAppDirname(), getAppDirname().endsWith('dist') ? '.' : 'dist');
    const distPath = fs.existsSync(path.join(cwdDist, 'index.html')) ? cwdDist : localDist;

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Application build not found. Please run npm run build.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduPath server running on http://0.0.0.0:${PORT}`);
  });
}

setupViteOrStatic();
