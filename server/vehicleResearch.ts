export type VehicleResearchInput = {
  id: string
  make: string
  model: string
  year: number
  version?: string
}

export type VehicleResearchResult = {
  id: string
  version: string | null
  engine: string | null
  horsepowerCv: number | null
  torqueNm: number | null
  zeroToHundredSeconds: number | null
  topSpeedKmh: number | null
  sourceUrl: string | null
  sourceTitle: string | null
  confidence: 'high' | 'medium' | 'low' | 'unavailable'
  note: string
}

export type VehicleSearchResearchResult = {
  id: string
  make: string
  model: string
  year: number | null
  version: string | null
  engine: string | null
  horsepowerCv: number | null
  description: string
  sourceUrl: string | null
  sourceTitle: string | null
}

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> }; groundingMetadata?: { groundingChunks?: Array<{ web?: { uri?: string; title?: string } }> } }>
  error?: { message?: string }
}

type GroqResponse = {
  choices?: Array<{ message?: { content?: string } }>
  error?: { message?: string }
}

const parseStructuredResponse = <T>(content: string) => JSON.parse(content.replace(/^```(?:json)?\s*|\s*```$/g, '').trim()) as T

async function askGroqForJson(apiKey: string, instructions: string, maxTokens: number) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: process.env.GROQ_MODEL || 'groq/compound', messages: [
      { role: 'system', content: 'Você é um pesquisador automotivo rigoroso. Use busca web quando for necessária. Nunca invente dados ou fontes.' },
      { role: 'user', content: instructions },
    ], temperature: 0.1, max_tokens: maxTokens }),
  })
  const payload = await response.json() as GroqResponse
  if (!response.ok) throw new Error(payload.error?.message || 'Falha ao consultar a pesquisa automotiva.')
  const content = payload.choices?.[0]?.message?.content
  if (!content) throw new Error('A pesquisa não retornou dados estruturados.')
  return content
}

const emptyResult = (id: string, note: string): VehicleResearchResult => ({
  id, version: null, engine: null, horsepowerCv: null, torqueNm: null,
  zeroToHundredSeconds: null, topSpeedKmh: null, sourceUrl: null, sourceTitle: null,
  confidence: 'unavailable', note,
})

export async function researchVehicleSpecs(apiKey: string, vehicles: VehicleResearchInput[]) {
  const requestedVehicles = vehicles.slice(0, 6)
  if (process.env.GROQ_API_KEY) {
    const content = await askGroqForJson(apiKey, [
      'Responda somente JSON válido, sem markdown, no formato {"vehicles":[...]}.',
      'Para cada veículo, inclua: id, version, engine, horsepowerCv, torqueNm, zeroToHundredSeconds, topSpeedKmh, sourceUrl, sourceTitle, confidence, note.',
      'Pesquise especificações automotivas na web com rigor. Não misture gerações, motores, versões ou mercados.',
      'Se a versão não estiver clara, use null nos números e confidence "low". Não invente números nem URLs.',
      `Veículos: ${JSON.stringify(requestedVehicles)}`,
    ].join('\n'), 900)
    try {
      const parsed = parseStructuredResponse<{ vehicles?: VehicleResearchResult[] }>(content)
      const byId = new Map((parsed.vehicles ?? []).filter((item) => item?.id).map((item) => [item.id, item]))
      return { vehicles: requestedVehicles.map((vehicle) => byId.get(vehicle.id) ?? emptyResult(vehicle.id, 'A IA não retornou uma ficha confirmada para este veículo.')) }
    } catch { throw new Error('A IA retornou uma ficha em formato inválido.') }
  }
  const model = process.env.GEMINI_VEHICLE_MODEL || process.env.GEMINI_MODEL || 'gemini-3.7-flash'
  const requestBody = {
      contents: [{ parts: [{ text: [
        'Responda somente JSON válido, sem markdown, no formato {"vehicles":[...]}.',
        'Para cada veículo, inclua: id, version, engine, horsepowerCv, torqueNm, zeroToHundredSeconds, topSpeedKmh, sourceUrl, sourceTitle, confidence, note.',
        'Pesquise especificações automotivas com rigor. Não misture gerações, motores, versões ou mercados.',
        'Se houver mais de uma motorização possível e a versão não estiver clara, use null nos números, confidence "low" e explique em note.',
        'Nunca invente números ou fontes. Responda em português do Brasil.',
        `Veículos: ${JSON.stringify(requestedVehicles)}`,
      ].join('\n') }] }],
      tools: [{ google_search: {} }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.1, maxOutputTokens: 900 },
  }
  let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST', headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody),
  })

  let payload = await response.json() as GeminiResponse
  if (!response.ok && /google search|grounding|tool/i.test(payload.error?.message ?? '')) {
    delete (requestBody as { tools?: unknown }).tools
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST', headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody),
    })
    payload = await response.json() as GeminiResponse
  }

  if (!response.ok) throw new Error(payload.error?.message || 'Falha ao consultar a pesquisa automotiva.')
  const output = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim()
  if (!output) throw new Error('A pesquisa não retornou dados estruturados.')

  try {
    const parsed = JSON.parse(output) as { vehicles?: VehicleResearchResult[] }
    const byId = new Map((parsed.vehicles ?? []).filter((item) => item?.id).map((item) => [item.id, item]))
    const groundedSource = payload.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk) => chunk.web).find((web): web is { uri: string; title?: string } => Boolean(web?.uri))
    return { vehicles: requestedVehicles.map((vehicle) => {
      const result = byId.get(vehicle.id) ?? emptyResult(vehicle.id, 'A IA não retornou uma ficha confirmada para este veículo.')
      return { ...result, sourceUrl: result.sourceUrl ?? groundedSource?.uri ?? null, sourceTitle: result.sourceTitle ?? groundedSource?.title ?? null }
    }) }
  } catch {
    throw new Error('A IA retornou uma ficha em formato inválido.')
  }
}

export async function searchVehicleModels(apiKey: string, rawQuery: string) {
  const query = rawQuery.trim().slice(0, 100)
  if (!query) throw new Error('Informe marca ou modelo para pesquisar.')
  if (process.env.GROQ_API_KEY) {
    const content = await askGroqForJson(apiKey, [
      'Responda somente JSON válido, sem markdown, exatamente no formato {"vehicles":[...]}.',
      'Pesquise na web modelos de veículos que correspondam à busca. Não use lista interna ou exemplos fictícios.',
      'Retorne no máximo 6 opções reais. Para cada uma, use: id, make, model, year, version, engine, horsepowerCv, description, sourceUrl, sourceTitle.',
      'year e horsepowerCv podem ser null quando a busca não definir uma versão única. Não invente especificações, fontes ou links.',
      'Escreva descrição em português do Brasil, curta e útil. Considere o mercado brasileiro quando ele for relevante.',
      `Busca do usuário: ${query}`,
    ].join('\n'), 1200)
    try {
      const parsed = parseStructuredResponse<{ vehicles?: VehicleSearchResearchResult[] }>(content)
      const vehicles = (parsed.vehicles ?? []).slice(0, 6).filter((vehicle) => vehicle?.make && vehicle?.model).map((vehicle, index) => ({ ...vehicle, id: vehicle.id || `research-${index + 1}` }))
      if (!vehicles.length) throw new Error('Nenhum veículo confiável foi encontrado para essa busca.')
      return { vehicles }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Nenhum veículo')) throw error
      throw new Error('A IA retornou a busca em um formato inválido.')
    }
  }
  const model = process.env.GEMINI_VEHICLE_MODEL || process.env.GEMINI_MODEL || 'gemini-3.7-flash'
  const requestBody = {
    contents: [{ parts: [{ text: [
      'Responda somente JSON válido, sem markdown, exatamente no formato {"vehicles":[...]}.',
      'Pesquise na web modelos de veículos que correspondam à busca. Não use lista interna ou exemplos fictícios.',
      'Retorne no máximo 6 opções reais. Para cada uma, use: id, make, model, year, version, engine, horsepowerCv, description, sourceUrl, sourceTitle.',
      'year e horsepowerCv podem ser null quando a busca não definir uma versão única. Não invente especificações, fontes ou links.',
      'Escreva descrição em português do Brasil, curta e útil. Considere o mercado brasileiro quando ele for relevante.',
      `Busca do usuário: ${query}`,
    ].join('\n') }] }],
    tools: [{ google_search: {} }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.1, maxOutputTokens: 1200 },
  }
  let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST', headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody),
  })
  let payload = await response.json() as GeminiResponse
  if (!response.ok && /google search|grounding|tool/i.test(payload.error?.message ?? '')) {
    delete (requestBody as { tools?: unknown }).tools
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST', headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody),
    })
    payload = await response.json() as GeminiResponse
  }
  if (!response.ok) throw new Error(payload.error?.message || 'Falha ao pesquisar veículos.')
  const output = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim()
  if (!output) throw new Error('A IA não retornou veículos para essa busca.')
  try {
    const parsed = JSON.parse(output) as { vehicles?: VehicleSearchResearchResult[] }
    const groundedSource = payload.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk) => chunk.web).find((web): web is { uri: string; title?: string } => Boolean(web?.uri))
    const vehicles = (parsed.vehicles ?? []).slice(0, 6).filter((vehicle) => vehicle?.make && vehicle?.model).map((vehicle, index) => ({
      ...vehicle,
      id: vehicle.id || `research-${index + 1}`,
      sourceUrl: vehicle.sourceUrl ?? groundedSource?.uri ?? null,
      sourceTitle: vehicle.sourceTitle ?? groundedSource?.title ?? null,
    }))
    if (!vehicles.length) throw new Error('Nenhum veículo confiável foi encontrado para essa busca.')
    return { vehicles }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Nenhum veículo')) throw error
    throw new Error('A IA retornou a busca em um formato inválido.')
  }
}
