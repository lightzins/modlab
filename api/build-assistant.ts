import { GeminiRateLimitError, runBuildAssistant, type BuildAssistantContext, type BuildAssistantMessage } from '../server/buildAssistant.js'
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
  if (!apiKey) return response.status(503).json({ error: 'Assistente de IA ainda não configurado.', code: 'AI_NOT_CONFIGURED' })

  try {
    const message = typeof request.body?.message === 'string' ? request.body.message.trim().slice(0, 2_000) : ''
    const rawHistory = Array.isArray(request.body?.history) ? request.body.history : []
    const history: BuildAssistantMessage[] = rawHistory.slice(-12).flatMap((item: any) => {
      if ((item?.role !== 'user' && item?.role !== 'assistant') || typeof item?.content !== 'string') return []
      return [{ role: item.role, content: item.content.slice(0, 4_000) }]
    })
    const context = request.body?.context as BuildAssistantContext | undefined
    if (!message) return response.status(400).json({ error: 'Digite uma pergunta para o assistente.' })
    if (!context?.vehicle) return response.status(400).json({ error: 'O contexto do veículo está incompleto.' })
    return response.status(200).json(await runBuildAssistant(apiKey, message, history, context))
  } catch (error) {
    if (error instanceof GeminiRateLimitError) return response.status(429).json({ error: error.message, code: 'AI_RATE_LIMIT' })
    return response.status(502).json({ error: error instanceof Error ? error.message : 'Falha ao consultar o assistente.' })
  }
}
