import type { Symptom } from '@/types'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

const DEFAULT_SYSTEM_PROMPT =
  'You are a health assistant helping Nigerian patients understand patterns in their symptoms and medications. You do NOT diagnose. You surface 2-3 possible explanations and always end with "Please see a doctor to confirm." Be brief, plain, and direct. No medical jargon.'

export async function analyzeHealthPattern(
  symptoms: Symptom[],
  medications: { name: string }[],
  systemPrompt: string = DEFAULT_SYSTEM_PROMPT
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY
  if (!apiKey) return 'AI analysis is not available. Set your Groq API key in .env to enable it.'

  const symptomLines = symptoms
    .map((s) => `- ${s.description} (severity: ${s.severity}, logged: ${s.loggedAt})`)
    .join('\n')

  const medLines = medications
    .map((m) => `- ${m.name}`)
    .join('\n')

  const userPrompt = [
    'Here are my current symptoms:',
    symptomLines || '  (none)',
    '',
    'Here are my medications:',
    medLines || '  (none)',
  ].join('\n')

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.warn('Groq API error:', res.status, text)
      return 'Unable to analyze patterns right now. Please try again later.'
    }

    const json = await res.json()
    return json.choices?.[0]?.message?.content ?? 'No analysis available.'
  } catch (err) {
    console.warn('Groq API request failed:', err)
    return 'Unable to analyze patterns right now. Please try again later.'
  }
}