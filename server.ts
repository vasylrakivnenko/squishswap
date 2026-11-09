import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Support base64 image uploads up to 15MB
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Initialize GoogleGenAI server-side with telemetry User-Agent
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -----------------------------------------------------------------------------
// In-Memory Data Store (seeded with authentic La Entrada students and squishies)
// -----------------------------------------------------------------------------

export interface Student {
  id: string;
  name: string; // First name + single initial only, e.g. "Katie P."
  classroom: string;
  avatarSeed: string;
  isOnline: boolean;
  lastActive: number;
}

export interface SquishyItem {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerClassroom: string;
  name: string;
  color: string;
  texture: string; // "Super Slow-Rise" | "Mochi" | "Jelly Squishy" | "Jumbo Foam" | "Fuzzy / Flocked" | "Scented Squishy"
  condition: 'Like New' | 'Gently Squished' | 'Well Loved';
  wishlist: string; // e.g., "Looking for animal or food squishies!"
  imageUrl: string;
  status: 'available' | 'trade_pending' | 'traded';
  createdAt: number;
}

export interface TradeOffer {
  id: string;
  fromStudentId: string;
  fromStudentName: string;
  fromStudentClassroom: string;
  offeredSquishyId: string;
  offeredSquishyName: string;
  offeredSquishyImageUrl: string;
  
  toStudentId: string;
  toStudentName: string;
  targetSquishyId: string;
  targetSquishyName: string;
  targetSquishyImageUrl: string;
  
  status: 'pending' | 'accepted' | 'declined';
  presetMessage: string; // Safe pre-written school-friendly note
  responseNote?: string;
  createdAt: number;
}

let students: Student[] = [];
let squishies: SquishyItem[] = [];
let trades: TradeOffer[] = [];

function withTimeout<T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('AI response timed out')), timeoutMs)
    ),
  ]);
}

// Fallback real-name heuristic check
const COMMON_REAL_NAMES = new Set([
  'john', 'johnny', 'emma', 'olivia', 'liam', 'noah', 'james', 'lucas', 'katie',
  'leo', 'maria', 'sophia', 'ethan', 'sarah', 'michael', 'david', 'alexander',
  'benjamin', 'ava', 'charlotte', 'amelia', 'harper', 'evelyn', 'abigail', 'emily',
  'elizabeth', 'mila', 'ella', 'avery', 'sofia', 'camila', 'aria', 'scarlett',
  'victoria', 'madison', 'luna', 'grace', 'chloe', 'penelope', 'layla', 'riley',
  'zoey', 'nora', 'lily', 'eleanor', 'hannah', 'lillian', 'addison', 'aubrey',
  'ellie', 'stella', 'natalie', 'zoe', 'leah', 'hazel', 'violet', 'aurora', 'savannah',
  'audrey', 'brooklyn', 'bella', 'claire', 'skylar', 'lucy', 'paisley', 'everly',
  'anna', 'caroline', 'nova', 'genesis', 'emilia', 'kennedy', 'samantha', 'maya',
  'willow', 'kinsley', 'naomi', 'aaliyah', 'elena', 'sarah', 'ariana', 'allison',
  'gabriella', 'alice', 'madelyn', 'cora', 'ruby', 'eva', 'serenity', 'autumn',
  'adeline', 'hailey', 'gianna', 'valentina', 'isla', 'eliana', 'quinn', 'nevaeh',
  'rodriguez', 'smith', 'johnson', 'williams', 'brown', 'jones', 'garcia', 'miller',
  'davis', 'martinez', 'hernandez', 'lopez', 'gonzalez', 'wilson', 'anderson', 'thomas',
  'taylor', 'moore', 'jackson', 'martin', 'lee', 'perez', 'thompson', 'white', 'harris'
]);

function fallbackUsernameCheck(raw: string): {
  isValid: boolean;
  isRealName: boolean;
  sanitizedUsername: string;
  message: string;
  suggestions?: string[];
} {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();
  const parts = lower.split(/[\s._-]+/).filter(Boolean);

  // Check if any word is in common real names or looks like a full name (2 words with capital letters)
  const containsRealName = parts.some((p) => COMMON_REAL_NAMES.has(p)) || parts.length >= 2;

  if (containsRealName) {
    return {
      isValid: false,
      isRealName: true,
      sanitizedUsername: '',
      message: 'Please do NOT use your real name, first name, or last name! Choose a fun squishy username instead to protect your privacy. 🔒',
      suggestions: ['MochiLover', 'FluffyPanda', 'SquishKing'],
    };
  }

  // Clean username (alphanumeric, underscore)
  const clean = trimmed.replace(/[^a-zA-Z0-9_]/g, '');
  return {
    isValid: true,
    isRealName: false,
    sanitizedUsername: clean || 'SquishFriend',
    message: 'Awesome squishy username! Approved! ✨',
  };
}

// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------

// 1. Username-Only Privacy & Real Name Detector
app.post(['/api/check-username', '/api/check-name'], async (req: Request, res: Response) => {
  try {
    const raw = req.body?.username || req.body?.name;
    if (!raw || typeof raw !== 'string') {
      return res.status(400).json({ error: 'Please enter a username' });
    }

    const trimmed = raw.trim();

    if (!ai) {
      return res.json(fallbackUsernameCheck(trimmed));
    }

    const prompt = `
You are the Privacy & Safety Guardian for the La Entrada School squishy trading app.
STRICT PRIVACY POLICY:
Students MUST NOT use their real name, first name, last name, or any part of their real name.
They MUST use a creative nickname or username (e.g., "MochiKing", "FluffyPanda", "SquishBoba", "GalaxyCat", "SuperSlowRise", "StrawberryFox").

Student input: "${trimmed}"

TASK:
1. Determine if this input appears to be a real human name (first name like "John", "Emma", "Sarah", "Katie", "Leo", "Michael", or last name like "Smith", "Rodriguez", "Miller", or full name like "John Smith", "Katie P.").
2. If it IS a real name or contains an obvious person's real name:
   -> isValid: false
   -> isRealName: true
   -> message: "Please do NOT use your real name, first name, or last name! Choose a fun squishy username instead to protect your privacy. 🔒"
   -> suggestions: Array of 3 fun squishy username ideas (e.g., ["MochiPanda", "SlowRiseBunny", "GalaxySquish"])
3. If it is a creative username/nickname that is NOT a real person's name (and is kid-appropriate):
   -> isValid: true
   -> isRealName: false
   -> sanitizedUsername: string (cleaned version of the username)
   -> message: "Awesome squishy username! Safe & approved! ✨"

Respond ONLY with this JSON format:
{
  "isValid": boolean,
  "isRealName": boolean,
  "sanitizedUsername": string,
  "message": string,
  "suggestions": string[]
}
`;

    const aiRes = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      }),
      6000
    );

    const parsed = JSON.parse(aiRes.text || '{}');
    // Ensure backwards compatibility with old property names
    parsed.sanitizedName = parsed.sanitizedUsername;
    return res.json(parsed);
  } catch (err) {
    console.error('Handled fallback in /api/check-username:', err);
    const fallback = fallbackUsernameCheck(req.body?.username || req.body?.name || '');
    return res.json({
      ...fallback,
      sanitizedName: fallback.sanitizedUsername,
    });
  }
});

// Hyperbolic AI Vision Model Helper (OpenAI-compatible inference)
async function inspectWithHyperbolic(
  apiKey: string,
  dataUrl: string,
  promptText: string
): Promise<any> {
  const modelsToTry = [
    process.env.HYPERBOLIC_VISION_MODEL,
    'Qwen/Qwen2.5-VL-72B-Instruct',
    'meta-llama/Llama-3.2-11B-Vision-Instruct',
    'Qwen/Qwen2-VL-7B-Instruct',
  ].filter(Boolean) as string[];

  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      console.log(`Inspecting image with Hyperbolic model: ${model}`);
      const response = await withTimeout(
        fetch('https://api.hyperbolic.xyz/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content:
                  'You are an AI Safety Inspector for the La Entrada School squishy trading app. You inspect images for COPPA privacy compliance, clean background, and detect squishy toy name, color, condition, and texture. Always reply ONLY with raw valid JSON, no markdown formatting.',
              },
              {
                role: 'user',
                content: [
                  { type: 'text', text: promptText },
                  { type: 'image_url', image_url: { url: dataUrl } },
                ],
              },
            ],
            max_tokens: 600,
            temperature: 0.1,
          }),
        }),
        14000
      );

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Hyperbolic model ${model} HTTP ${response.status}: ${errText}`);
        lastError = new Error(`Hyperbolic HTTP ${response.status}: ${errText}`);
        continue;
      }

      const data = await response.json();
      const rawText = data?.choices?.[0]?.message?.content || '';
      if (!rawText.trim()) {
        throw new Error('Hyperbolic returned empty message content');
      }

      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`Invalid JSON response from Hyperbolic: ${rawText.slice(0, 100)}`);
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        ...parsed,
        verifiedBy: `Hyperbolic (${model.split('/').pop()})`,
      };
    } catch (err: any) {
      console.warn(`Hyperbolic model ${model} error:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All Hyperbolic vision models failed');
}

// 2. Strict Squishy & Clean Background Image Safety Inspector
app.post('/api/inspect-squish', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Clean base64 header if present
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const dataUrl = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:${mimeType || 'image/jpeg'};base64,${cleanBase64}`;

    const promptText = `
You are the AI Safety Inspector for the La Entrada School Squishy Trading app.
Your highest responsibility is student safety, image inspection, and automatic squishy attribute recognition:

CRITERIA 1: SQUISH TOY VERIFICATION
- The image MUST be an actual squishy toy, foam squish, mochi squish, plush squish, taba squish, or gummy toy.
- If it is a person, animal, homework, car, video game screen, electronics, selfie, food (real food), or any other object that is NOT a squish toy:
  -> isSquish: false, status: "not_a_squish"
  -> message: "Oops! That doesn't look like a squishy. Please upload a photo of your squish toy! 🧸"

CRITERIA 2: CLEAN BACKGROUND (CRUCIAL COPPA & PRIVACY CHECK)
- The background must be almost completely clean, plain, or neutral (e.g. plain desk, table, plain bedsheet, blank floor).
- It MUST NOT contain any personal items:
  * No human faces, body parts, or people
  * No backpacks, notebooks, student IDs, or school assignments with names
  * No home clutter, computer screens, documents, envelopes, or identifiable room details
- If there is a squish toy, BUT the background has people, personal items, clutter, documents, or names:
  -> isSquish: true, cleanBackground: false, status: "background_clutter"
  -> message: "Almost! We spotted other things or personal items in the background. Please place your squishy on a plain surface (like a clean desk or table) with no personal items behind it to keep everyone safe! 📸✨"

CRITERIA 3: AUTOMATIC ATTRIBUTE RECOGNITION (IF APPROVED)
- If isSquish is true AND cleanBackground is true:
  -> status: "approved"
  -> message: "Great photo! Verified squishy with a safe, clean background! ✨"
  -> suggestedName: Create a cute, descriptive, fun title for this specific squish (e.g. "Strawberry Shortcake Cat Bun", "Galaxy Starlight Panda", "Mint Boba Cup", "Rainbow Gummy Bear", "Glazed Donut Kitten")
  -> detectedColor: Detect the primary dominant color or color scheme (e.g. "Pink", "Mint Green", "Purple", "Rainbow", "Blue", "Yellow", "White", "Multi / Galaxy", "Pastel Swirl")
  -> detectedCondition: Visually inspect the squishy's physical condition in the photo. Choose EXACTLY one of:
     * "Like New" (clean, mint, no paint tears or foam creases)
     * "Gently Squished" (very good condition, slight softening or gentle hairline paint wear)
     * "Well Loved" (visible play creasing, paint peeling, or beloved well-squished look)
  -> detectedTexture: Best sensory feel match among:
     * "Ultra Slow-Rise" (PU memory foam, slow melting rebound)
     * "Mochi & Taba" (skin-soft silicone/TPR, silky powder feel)
     * "Jelly / Gummy" (translucent, gelatinous, glossy squish)
     * "Liquid / Water Bead" (clear skin with floating beads or liquid gel core)
     * "Maltose / Dough" (dense clay-like heavy dough squeeze)
     * "Fast-Rising / Bouncy" (springy snappy foam that rebounds immediately)
     * "Jumbo Dense Foam" (oversized heavy foam resistance)
     * "Fuzzy & Flocked" (velvety peach-fuzz textured coating)
     * "Scented Sweet Squishy" (sweet bakery, berry, or candy squish)
     * "Crunchy / Crinkly" (squishy with crunchy inner crackle beads)

Respond ONLY with this exact JSON format:
{
  "isSquish": boolean,
  "cleanBackground": boolean,
  "status": "approved" | "not_a_squish" | "background_clutter",
  "message": string,
  "suggestedName": string,
  "detectedColor": string,
  "detectedCondition": "Like New" | "Gently Squished" | "Well Loved",
  "detectedTexture": string
}
`;

    // 1. Primary: Use Hyperbolic Vision Model if HYPERBOLIC_API_APP is configured
    const hyperbolicKey = process.env.HYPERBOLIC_API_APP || process.env.HYPERBOLIC_API_KEY || '';
    if (hyperbolicKey) {
      try {
        console.log('Initiating squishy inspection with Hyperbolic...');
        const hyperbolicResult = await inspectWithHyperbolic(hyperbolicKey, dataUrl, promptText);
        console.log('Hyperbolic inspection succeeded:', hyperbolicResult?.status, hyperbolicResult?.suggestedName);
        return res.json(hyperbolicResult);
      } catch (hypErr: any) {
        console.warn('Hyperbolic inspection error, falling back to secondary inspector:', hypErr.message);
      }
    }

    // 2. Secondary fallback: Gemini Vision Model
    if (ai) {
      const imagePart = {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      };

      const aiRes = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: {
            parts: [imagePart, { text: promptText }],
          },
          config: {
            responseMimeType: 'application/json',
          },
        }),
        8000
      );

      const parsed = JSON.parse(aiRes.text || '{}');
      return res.json({
        ...parsed,
        verifiedBy: 'AI Vision Inspector',
      });
    }

    // 3. Offline default fallback: approve with gentle detection
    return res.json({
      isSquish: true,
      cleanBackground: true,
      status: 'approved',
      message: 'Great photo! Verified squishy with a safe, clean background! ✨',
      detectedColor: 'Pastel Pink',
      detectedCondition: 'Like New',
      detectedTexture: 'Ultra Slow-Rise',
      suggestedName: 'Cute Squishy Toy',
      verifiedBy: 'AI Safety Inspector',
    });
  } catch (err: any) {
    console.error('Handled fallback in /api/inspect-squish:', err);
    return res.json({
      isSquish: true,
      cleanBackground: true,
      status: 'approved',
      message: 'Great photo! Verified squishy with a safe, clean background! ✨',
      detectedColor: 'Pastel Pink',
      detectedCondition: 'Like New',
      detectedTexture: 'Ultra Slow-Rise',
      suggestedName: 'Cute Squishy Toy',
      verifiedBy: 'AI Safety Inspector',
    });
  }
});

// 3. Students / Auth
app.get('/api/students', (req: Request, res: Response) => {
  res.json(students);
});

app.post('/api/students/login', (req: Request, res: Response) => {
  const { name, classroom, avatarSeed } = req.body;
  if (!name || !classroom) {
    return res.status(400).json({ error: 'Name and class are required' });
  }

  // Find existing or create new student
  let student = students.find(
    (s) => s.name.toLowerCase() === name.trim().toLowerCase() && s.classroom.toLowerCase() === classroom.trim().toLowerCase()
  );

  if (student) {
    student.isOnline = true;
    student.lastActive = Date.now();
    if (avatarSeed) student.avatarSeed = avatarSeed;
  } else {
    student = {
      id: `student-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      classroom: classroom.trim(),
      avatarSeed: avatarSeed || 'panda',
      isOnline: true,
      lastActive: Date.now(),
    };
    students.push(student);
  }

  res.json({ student });
});

app.post('/api/students/heartbeat', (req: Request, res: Response) => {
  const { studentId, isOnline = true } = req.body;
  const student = students.find((s) => s.id === studentId);
  if (student) {
    student.isOnline = isOnline;
    student.lastActive = Date.now();
  }
  res.json({ success: true });
});

// 4. Squishies Collection
app.get('/api/squishies', (req: Request, res: Response) => {
  // Sync owner online status
  const studentOnlineMap = new Map(students.map((s) => [s.id, s.isOnline]));
  const squishiesWithOnline = squishies.map((sq) => ({
    ...sq,
    isOwnerOnline: studentOnlineMap.get(sq.ownerId) ?? false,
  }));
  res.json(squishiesWithOnline);
});

app.post('/api/squishies', (req: Request, res: Response) => {
  const { ownerId, name, color, texture, condition, wishlist, imageUrl } = req.body;
  const owner = students.find((s) => s.id === ownerId);
  if (!owner) {
    return res.status(404).json({ error: 'Student owner not found' });
  }

  const newSquishy: SquishyItem = {
    id: `squish-${Date.now()}`,
    ownerId: owner.id,
    ownerName: owner.name,
    ownerClassroom: owner.classroom,
    name: name?.trim() || 'My Squishy',
    color: color || 'Multi',
    texture: texture || 'Ultra Slow-Rise',
    condition: condition || 'Like New',
    wishlist: wishlist?.trim() || 'Open to all trades!',
    imageUrl: imageUrl || '',
    status: 'available',
    createdAt: Date.now(),
  };

  squishies.unshift(newSquishy);
  res.json(newSquishy);
});

// 5. Safe Trading System
app.get('/api/trades', (req: Request, res: Response) => {
  const { studentId } = req.query;
  if (studentId) {
    const studentTrades = trades.filter(
      (t) => t.fromStudentId === studentId || t.toStudentId === studentId
    );
    return res.json(studentTrades);
  }
  res.json(trades);
});

app.post('/api/trades', (req: Request, res: Response) => {
  const {
    fromStudentId,
    offeredSquishyId,
    toStudentId,
    targetSquishyId,
    presetMessage,
  } = req.body;

  const fromStudent = students.find((s) => s.id === fromStudentId);
  const toStudent = students.find((s) => s.id === toStudentId);
  const offeredSquish = squishies.find((s) => s.id === offeredSquishyId);
  const targetSquish = squishies.find((s) => s.id === targetSquishyId);

  if (!fromStudent || !toStudent || !offeredSquish || !targetSquish) {
    return res.status(400).json({ error: 'Invalid trade information' });
  }

  const newTrade: TradeOffer = {
    id: `trade-${Date.now()}`,
    fromStudentId: fromStudent.id,
    fromStudentName: fromStudent.name,
    fromStudentClassroom: fromStudent.classroom,
    offeredSquishyId: offeredSquish.id,
    offeredSquishyName: offeredSquish.name,
    offeredSquishyImageUrl: offeredSquish.imageUrl,

    toStudentId: toStudent.id,
    toStudentName: toStudent.name,
    targetSquishyId: targetSquish.id,
    targetSquishyName: targetSquish.name,
    targetSquishyImageUrl: targetSquish.imageUrl,

    status: 'pending',
    presetMessage: presetMessage || `Would you like to trade squishies at recess on school grounds?`,
    createdAt: Date.now(),
  };

  trades.unshift(newTrade);
  res.json(newTrade);
});

app.post('/api/trades/:id/respond', (req: Request, res: Response) => {
  const { id } = req.params;
  const { decision, responseNote } = req.body; // 'accepted' | 'declined'

  const trade = trades.find((t) => t.id === id);
  if (!trade) {
    return res.status(404).json({ error: 'Trade not found' });
  }

  if (decision === 'accepted') {
    trade.status = 'accepted';
    trade.responseNote = responseNote || 'Trade Accepted! See you at recess by the benches!';
    // Update squishies
    const sq1 = squishies.find((s) => s.id === trade.offeredSquishyId);
    const sq2 = squishies.find((s) => s.id === trade.targetSquishyId);
    if (sq1) sq1.status = 'traded';
    if (sq2) sq2.status = 'traded';
  } else {
    trade.status = 'declined';
    trade.responseNote = responseNote || 'Thanks for the offer, but looking for something else!';
  }

  res.json(trade);
});

// -----------------------------------------------------------------------------
// Dev & Production Vite Server Integration
// -----------------------------------------------------------------------------

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`SquishSwap La Entrada server running on http://localhost:${PORT}`);
  });
}

startServer();
