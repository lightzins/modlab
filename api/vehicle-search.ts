import { searchVehicleModels } from '../server/vehicleResearch.js'
import { AuthenticationError, requireAuthenticatedUser } from '../server/requireUser.js'

export default async function handler(request: any, response: any) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (request.method !== 'POST') return response.status(405).json({ error: 'Método não permitido.' })
  try { await requireAuthenticatedUser(request) }
  catch (error) {
    if (error instanceof AuthenticationError) return response.status(401).json({ error: error.message, code: 'AUTH_REQUIRED' })
    return response.status(503).json({ error: error instanceof Error ? error.message : 'Autenticação indisponível.' })
  }
  const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) return response.status(503).json({ error: 'Pesquisa por IA ainda não configurada.', code: 'AI_NOT_CONFIGURED' })
  try {
    const query = typeof request.body?.query === 'string' ? request.body.query : ''
    return response.status(200).json(await searchVehicleModels(apiKey, query))
  } catch (error) {
    return response.status(502).json({ error: error instanceof Error ? error.message : 'Falha na busca automotiva.' })
  }
}
