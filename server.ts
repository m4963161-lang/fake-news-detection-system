import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // Dedicated Real-World News & Vijay Analysis Endpoint
  app.post('/api/analyze-gemini', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'News text is required' });
      }

      const ai = getAIClient();
      if (!ai) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY is not configured',
          useLocalFallback: true
        });
      }

      const currentDateObj = new Date();
      const currentDateString = currentDateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const currentYear = currentDateObj.getFullYear();

      const prompt = `You are an expert real-world news verification and misinformation detection analyst with access to current real-world knowledge.
Your task is to analyze this submitted news text/claim with near 100% precision:
"${text}"

CURRENT DATE IDENTIFICATION & TEMPORAL CONTEXT:
- Today's Current Date: ${currentDateString} (Current Year: ${currentYear}).
- You MUST identify and consider both the current date and any dates mentioned in the text.
- Check the timeline of the reported news against the current date:
  * Has the event already occurred in reality on or before ${currentDateString}?
  * Is the event scheduled for the future (e.g., late 2026 or beyond)?
  * Is an old historical event being recycled or deceptively presented as breaking news today?
  * Are there anachronisms (e.g. claiming someone did something after their death, or citing impossible dates)?

CRITICAL MANDATE - DO NOT CONSIDER RAW WORDS:
- Do NOT judge or evaluate based on raw words, lexical choices, writing style, sensational words (e.g., "SHOCKING", "VIRAL", "BREAKING", "EXCLUSIVE"), uppercase letters, exclamation marks, or superficial tone.
- Consider ONLY the substantive CONTENT, EVENT DATES, and REAL-WORLD NEWS FACTUALITY.
- Ask: Did this event, announcement, statement, or occurrence actually happen in the real world on the stated or implied dates?
- A story written in emotional, casual, or sensational language that reports a TRUE event (e.g., Vijay launching TVK in Feb 2024, or a genuine scientific discovery) MUST be classified as REAL.
- A story written in calm, polished, formal journalistic language that reports a FALSE, fabricated, or non-existent event MUST be classified as FAKE.
- Judge strictly the truth of the news content, timeline, and real-world events.

Special attention instructions:
If the text pertains to actor and politician "Thalapathy" Vijay (C. Joseph Vijay), his role as Chief Minister of Tamil Nadu, his political party Tamilaga Vettri Kazhagam (TVK), Tamil Nadu politics, assembly election 2026, party flag (maroon-yellow with two fighting tuskers and vaagai flower), first state conference in Vikravandi, film retirement announcement, Thalapathy 69 directed by H. Vinoth, or related viral internet hoaxes (such as fabricated party merger with DMK/BJP, fake cash giveaways, forged resignation letters, deepfake videos, or reverse retirement rumors):
- Cross-examine the factual content against verified official statements, TVK press releases, Election Commission of India filings, and established journalistic reporting.
- Crucial chronological milestones: TVK party founding (Feb 2, 2024), ECI registration (2024), flag unveiling (Aug 2024), Vikravandi State Conference (Oct 27, 2024), 2026 Assembly Election polling (April 23, 2026), Election Results declaration (May 4, 2026 with TVK winning 108 seats), and C. Joseph Vijay sworn in as 22nd Chief Minister of Tamil Nadu (May 10, 2026).
- If the statement asserts that Vijay is the current Chief Minister of Tamil Nadu, that TVK won the 2026 election, or that Vijay formed the government, classify it strictly as REAL with high confidence.
- Determine whether the news content and timeline are REAL or FAKE.

If the input is an interrogative question (e.g., "Is Vijay joining politics?", "Did Vijay cancel TVK?", "Will Vijay act after Thalapathy 69?"):
- Evaluate the factual reality of the premise being asked. If the premise is a verified fact, mark REAL; if the premise is an untrue rumor/hoax, mark FAKE.
- Provide a clear, direct answer to the question in the verdict_summary and fact_check_details.

Provide your analysis in JSON format matching this schema:
{
  "prediction": "REAL" or "FAKE",
  "confidence": number between 88.0 and 99.9,
  "verdict_summary": "1-2 sentence executive summary of the verdict based purely on news content and facts",
  "fact_check_details": "Detailed factual explanation of whether the reported news event actually occurred in the real world, ignoring surface wording",
  "official_corroboration": "Official source confirmation or debunking details (e.g. 'Verified via official gazette / party press release' or 'Refuted by verified records')",
  "is_actor_vijay_topic": boolean,
  "category": "e.g. Politics - TVK & Vijay, Cinema & Arts, National News, Science & Tech, etc.",
  "current_date_identified": "${currentDateString}",
  "event_date_identified": "Identified event date or timeline from the news text (e.g. 'February 2, 2024', 'October 27, 2024', 'Upcoming 2026', or 'General / Undated')",
  "temporal_status": "CHRONOLOGICALLY_VALID" or "OUTDATED_RECYCLED" or "FUTURE_EVENT" or "ANACHRONISTIC" or "UNDATED",
  "temporal_analysis": "1-2 sentence assessment explaining how the event date/timeline relates to today's date (${currentDateString}) and verifies or refutes the claim",
  "key_evidence_points": ["fact point 1", "fact point 2", "fact point 3"],
  "key_indicators": [
    { "term": "Substantive news claim or factual assertion (NOT a single raw word)", "weight": number 1.0-4.0, "bias": "REAL" or "FAKE" }
  ]
}`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });
      } catch {
        // Fallback to gemini-flash-latest if needed
        response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });
      }

      const parsed = JSON.parse(response.text?.trim() || '{}');
      return res.json({ success: true, result: parsed });
    } catch {
      return res.status(500).json({
        error: 'Failed to analyze with Gemini',
        useLocalFallback: true
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
