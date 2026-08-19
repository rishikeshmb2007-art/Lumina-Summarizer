import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'Route is alive!' });
}

// Default mock data for testing & rate-limit fallback
const MOCK_CHEATSHEET = {
  title: "Operating Systems & AI/ML Core Review",
  formulasAndRules: [
    "Need[i][j] = Max[i][j] - Allocation[i][j]",
    "Work = Work + Allocation[i] (when Finish[i] == false & Need[i] <= Work)",
    "ReLU Activation: f(x) = max(0, x) | Derivative: f'(x) = 1 if x > 0 else 0"
  ],
  coreDefinitions: [
    { term: "Banker's Algorithm", definition: "A deadlock avoidance resource allocation algorithm that tests system safety states." },
    { term: "Vanishing Gradient", definition: "Issue where gradients approach zero in deep networks during backprop, halting weight updates." },
    { term: "ReLU Activation", definition: "Non-linear function solving vanishing gradients in hidden layers, though prone to dying neurons." }
  ],
  quickTakeaways: [
    "Always check if Need <= Work before updating the Available resource vector in Banker's safety state evaluation.",
    "ReLU speeds up convergence compared to Sigmoid/Tanh but watch out for high learning rates causing dead units."
  ]
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'No text provided.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback if API key is not configured
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY missing — Serving Mock Data');
      return NextResponse.json({ success: true, data: MOCK_CHEATSHEET });
    }

    const prompt = `
    You are an expert academic tutor creating a dense, 1-page Exam Cheat Sheet / Formula Sheet.
    Analyze the following material and condense it into a highly scannable, high-density format.

    Return ONLY a raw JSON object matching this exact format:
    {
      "title": "Subject / Topic Name",
      "formulasAndRules": ["Key Formula / Rule 1", "Key Formula / Rule 2"],
      "coreDefinitions": [
        { "term": "Term Name", "definition": "One-line razor-sharp definition" }
      ],
      "quickTakeaways": ["Crucial exam tip or step-by-step process 1", "Crucial tip 2"]
    }

    Input Text:
    ${text}
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      }
    );

    const apiData = await response.json();

    if (!response.ok) {
      // Check if it's a Rate Limit / Quota Exceeded error (HTTP 429 or quota message)
      if (response.status === 429 || apiData?.error?.message?.includes('Quota exceeded')) {
        console.warn('⚠️ Gemini API rate limit hit! Falling back to generated mock cheatsheet view.');
        return NextResponse.json({ 
          success: true, 
          data: MOCK_CHEATSHEET,
          warning: "Rate limit reached. Displaying preview data."
        });
      }

      console.error('Gemini API Error details:', apiData);
      return NextResponse.json({
        success: false,
        error: apiData?.error?.message || 'Gemini API call failed.'
      }, { status: response.status });
    }

    const rawText = apiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanedText);

    return NextResponse.json({ success: true, data: result });

  } catch (error: any) {
    console.error('Server catch error:', error);
    // Graceful error fallback
    return NextResponse.json({ success: true, data: MOCK_CHEATSHEET });
  }
}