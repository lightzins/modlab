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

type GroqResponse = {
  choices?: Array<{ message?: { content?: string } }>
  error?: { message?: string }
}

export class GeminiRateLimitError extends Error {}

const wait = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds))

export async function runBuildAssistant(
  apiKey: string,
  message: string,
  history: BuildAssistantMessage[],
  context: BuildAssistantContext,
) {
  const groqApiKey = process.env.GROQ_API_KEY
  if (groqApiKey) {
    const prompt = [
      'Você é o assistente técnico automotivo do Modlab. Responda em português do Brasil.',
      'Não chame ferramentas, funções, pesquisa web ou código. Responda somente com orientação em texto baseada no contexto fornecido.',
      'Ajude a planejar builds realistas, por etapas, considerando uso, orçamento, confiabilidade e segurança.',
      'Não invente potência, compatibilidade, legislação ou preço. Diferencie dados confirmados de estimativas.',
      'Recomendações remotas não substituem inspeção e instalação por profissional qualificado.',
      'Quando o usuário pedir uma build ou lista de peças, entregue o máximo de informações úteis em seções curtas: objetivo e premissas; compatibilidade; peças principais; peças auxiliares e consumíveis; fixadores, parafusos, abraçadeiras, juntas e mangueiras; ferramentas e mão de obra; sequência de instalação; testes após montagem; custos; riscos, legalização e manutenção.',
      'Para torque, medida, passo, grau de parafuso, código de peça ou compatibilidade específica, informe o valor apenas quando ele estiver confirmado. Sem confirmação, escreva claramente “confirmar no manual de serviço ou com o fornecedor”; nunca chute esses dados.',
      'Inclua sempre itens frequentemente esquecidos, como juntas, retentores, fluidos, filtros, abraçadeiras, conectores, fusíveis, chicotes, mangueiras, parafusos e reaperto, mas explique que a necessidade depende da aplicação e da inspeção do veículo.',
      'Para cada peça sugerida, informe quando possível: nome da peça; marca e modelo/linha da peça; aplicação; quantidade; especificação relevante; faixa de preço; e o que precisa ser confirmado antes da compra. Não atribua marca, modelo, código ou compatibilidade exatos sem confirmação.',
      'Use texto simples e legível: não use Markdown, asteriscos, hashtags, tabelas, blocos de citação, backticks ou emojis.',
      'Quando houver links realmente verificados e disponíveis no contexto, termine com uma seção FONTES e uma URL por linha. Nunca invente links nem diga que pesquisou na web sem ter pesquisado.',
      `Contexto atual da build: ${JSON.stringify(context)}.`,
    ].join('\n')
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${groqApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.GROQ_CHAT_MODEL || 'openai/gpt-oss-20b', messages: [
        { role: 'system', content: prompt },
        ...history.slice(-4).map((item) => ({ role: item.role, content: item.content.slice(0, 1_200) })),
        { role: 'user', content: message },
      ], temperature: 0.3, max_tokens: 850 }),
    })
    const payload = await response.json() as GroqResponse
    if (!response.ok) {
      if (response.status === 429) throw new GeminiRateLimitError('Limite temporário da IA atingido. Aguarde alguns minutos antes de tentar novamente.')
      throw new Error(payload.error?.message || 'A IA não conseguiu responder agora.')
    }
    const answer = payload.choices?.[0]?.message?.content?.trim()
    if (!answer) throw new Error('A IA retornou uma resposta vazia.')
    return { message: answer, responseId: undefined, sources: [] as Array<{ title: string; url: string }> }
  }
  const model = process.env.GEMINI_BUILD_MODEL || process.env.GEMINI_MODEL || 'gemini-3.7-flash'
  const requestBody = JSON.stringify({
      systemInstruction: {
        parts: [{ text: [
          'Você é o assistente técnico automotivo do Modlab. Responda em português do Brasil.',
          'Ajude a planejar builds realistas, por etapas, considerando uso, orçamento, confiabilidade e segurança.',
          'Não invente potência, compatibilidade, legislação ou preço. Diferencie dados confirmados de estimativas.',
          'Recomendações remotas não substituem inspeção e instalação por profissional qualificado.',
          'Quando o usuário pedir uma build ou lista de peças, entregue o máximo de informações úteis em seções curtas: objetivo e premissas; compatibilidade; peças principais; peças auxiliares e consumíveis; fixadores, parafusos, abraçadeiras, juntas e mangueiras; ferramentas e mão de obra; sequência de instalação; testes após montagem; custos; riscos, legalização e manutenção.',
          'Para torque, medida, passo, grau de parafuso, código de peça ou compatibilidade específica, informe o valor apenas quando ele estiver confirmado. Sem confirmação, escreva claramente “confirmar no manual de serviço ou com o fornecedor”; nunca chute esses dados.',
          'Inclua sempre itens frequentemente esquecidos, como juntas, retentores, fluidos, filtros, abraçadeiras, conectores, fusíveis, chicotes, mangueiras, parafusos e reaperto, mas explique que a necessidade depende da aplicação e da inspeção do veículo.',
          'Para cada peça sugerida, informe quando possível: nome da peça; marca e modelo/linha da peça; aplicação; quantidade; especificação relevante; faixa de preço; e o que precisa ser confirmado antes da compra. Não atribua marca, modelo, código ou compatibilidade exatos sem confirmação.',
          'Use texto simples e legível: não use Markdown, asteriscos, hashtags, tabelas, blocos de citação, backticks ou emojis.',
          'Quando houver links realmente verificados e disponíveis no contexto, termine com uma seção FONTES e uma URL por linha. Nunca invente links nem diga que pesquisou na web sem ter pesquisado.',
          `Contexto atual da build: ${JSON.stringify(context)}.`,
        ].join('\n') }],
      },
      contents: [
        ...history.slice(-4).map((item) => ({ role: item.role === 'assistant' ? 'model' : 'user', parts: [{ text: item.content.slice(0, 1_200) }] })),
        { role: 'user', parts: [{ text: message }] },
      ],
      generationConfig: { temperature: 0.3, maxOutputTokens: 850 },
    })
  let response: Response | undefined
  let payload: GeminiResponse = {}
  for (let attempt = 0; attempt < 2; attempt += 1) {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST', headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' }, body: requestBody,
    })
    payload = await response.json() as GeminiResponse
    const highDemand = response.status === 503 && /high demand|temporarily unavailable/i.test(payload.error?.message ?? '')
    if (!highDemand || attempt === 1) break
    await wait(1_500)
  }

  if (!response?.ok) {
    if (response.status === 429) throw new GeminiRateLimitError('Limite temporário da IA atingido. Aguarde alguns minutos antes de tentar novamente.')
    throw new Error(payload.error?.message || 'A IA não conseguiu responder agora.')
  }
  const answer = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('\n').trim()
  if (!answer) throw new Error('A IA retornou uma resposta vazia.')
  return { message: answer, responseId: undefined, sources: [] as Array<{ title: string; url: string }> }
}
