import { GoogleGenAI } from '@google/genai'

const MODEL = 'gemini-2.5-flash-lite'

export async function translateToEnglish(
  fields: Record<string, string>,
): Promise<Record<string, string>> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return {}

  const nonEmpty = Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v.trim() !== ''),
  )
  if (Object.keys(nonEmpty).length === 0) return {}

  const ai = new GoogleGenAI({ apiKey })
  const prompt = `You are a professional Korean-to-English translator for a developer portfolio website.
Translate the values from Korean to English. Preserve all markdown formatting.
Return ONLY a valid JSON object with the same keys and English-translated values.

Input: ${JSON.stringify(nonEmpty)}`

  const response = await ai.models.generateContent({ model: MODEL, contents: prompt })
  const text = response.text ?? ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return {}
  return JSON.parse(jsonMatch[0]) as Record<string, string>
}
