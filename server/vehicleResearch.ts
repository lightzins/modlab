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

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> }; groundingMetadata?: { groundingChunks?: Array<{ web?: { uri?: string; title?: string } }> } }>
  error?: { message?: string }
}

const emptyResult = (id: string, note: string): VehicleResearchResult => ({
  id, version: null, engine: null, horsepowerCv: null, torqueNm: null,
  zeroToHundredSeconds: null, topSpeedKmh: null, sourceUrl: null, sourceTitle: null,
  confidence: 'unavailable', note,
})

export async function researchVehicleSpecs(apiKey: string, vehicles: VehicleResearchInput[]) {
  const requestedVehicles = vehicles.slice(0, 6)
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
