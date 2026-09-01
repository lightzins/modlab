export type BuildAssistantMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type BuildAssistantContext = {
  vehicle: string
  version?: string
  year?: string
  basePower?: string
  selectedTune: string
  savedParts: string[]
  estimatedBudget: string
  completedSteps: number
  totalSteps: number
}

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  error?: { message?: string }
}

export async function runBuildAssistant(
  apiKey: string,
  message: string,
  history: BuildAssistantMessage[],
  context: BuildAssistantContext,
) {
  const model = process.env.GEMINI_BUILD_MODEL || process.env.GEMINI_MODEL || 'gemini-3.7-flash'
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: [
          'Você é o assistente técnico automotivo do Modlab. Responda em português do Brasil.',
          'Ajude a planejar builds realistas, por etapas, considerando uso, orçamento, confiabilidade e segurança.',
          'Não invente potência, compatibilidade, legislação ou preço. Diferencie dados confirmados de estimativas.',
          'Recomendações remotas não substituem inspeção e instalação por profissional qualificado.',
          `Contexto atual da build: ${JSON.stringify(context)}.`,
        ].join('\n') }],
      },
      contents: [
        ...history.slice(-12).map((item) => ({ role: item.role === 'assistant' ? 'model' : 'user', parts: [{ text: item.content }] })),
        { role: 'user', parts: [{ text: message }] },
      ],
      generationConfig: { temperature: 0.35, maxOutputTokens: 1200 },
    }),
  })

  const payload = await response.json() as GeminiResponse
  if (!response.ok) throw new Error(payload.error?.message || 'A IA não conseguiu responder agora.')
  const answer = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('\n').trim()
  if (!answer) throw new Error('A IA retornou uma resposta vazia.')
  return { message: answer, responseId: undefined, sources: [] as Array<{ title: string; url: string }> }
}
