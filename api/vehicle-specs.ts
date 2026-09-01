import { researchVehicleSpecs, type VehicleResearchInput } from '../server/vehicleResearch.js'
import { AuthenticationError, requireAuthenticatedUser } from '../server/requireUser.js'

export default async function handler(request: any, response: any) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (request.method !== 'POST') return response.status(405).json({ error: 'Método não permitido.' })
  try { await requireAuthenticatedUser(request) }
  catch (error) {
    if (error instanceof AuthenticationError) return response.status(401).json({ error: error.message, code: 'AUTH_REQUIRED' })
    return response.status(503).json({ error: error instanceof Error ? error.message : 'Autenticação indisponível.' })
  }
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return response.status(503).json({ error: 'Pesquisa por IA ainda não configurada.', code: 'AI_NOT_CONFIGURED' })
  try {
    const vehicles = request.body?.vehicles as VehicleResearchInput[] | undefined
    if (!Array.isArray(vehicles) || vehicles.length === 0) return response.status(400).json({ error: 'Informe pelo menos um veículo.' })
    return response.status(200).json(await researchVehicleSpecs(apiKey, vehicles))
  } catch (error) {
    return response.status(502).json({ error: error instanceof Error ? error.message : 'Falha na pesquisa automotiva.' })
  }
}
