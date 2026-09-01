import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { researchVehicleSpecs } from './server/vehicleResearch.ts'
import { runBuildAssistant, type BuildAssistantContext, type BuildAssistantMessage } from './server/buildAssistant.ts'

function vehicleResearchApi(apiKey: string): Plugin {
  return {
    name: 'modlab-vehicle-research-api',
    configureServer(server) {
      server.middlewares.use('/api/vehicle-specs', (request, response) => {
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        if (request.method !== 'POST') { response.statusCode = 405; response.end(JSON.stringify({ error: 'Método não permitido.' })); return }
        let rawBody = ''
        request.on('data', (chunk) => { rawBody += chunk })
        request.on('end', async () => {
          if (!apiKey) { response.statusCode = 503; response.end(JSON.stringify({ error: 'Pesquisa por IA ainda não configurada.', code: 'AI_NOT_CONFIGURED' })); return }
          try {
            const body = JSON.parse(rawBody) as { vehicles?: Parameters<typeof researchVehicleSpecs>[1] }
            if (!Array.isArray(body.vehicles) || body.vehicles.length === 0) { response.statusCode = 400; response.end(JSON.stringify({ error: 'Informe pelo menos um veículo.' })); return }
            response.statusCode = 200
            response.end(JSON.stringify(await researchVehicleSpecs(apiKey, body.vehicles)))
          } catch (error) {
            response.statusCode = 502
            response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Falha na pesquisa automotiva.' }))
          }
        })
      })
    },
  }
}

function buildAssistantApi(apiKey: string): Plugin {
  return {
    name: 'modlab-build-assistant-api',
    configureServer(server) {
      server.middlewares.use('/api/build-assistant', (request, response) => {
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        if (request.method !== 'POST') { response.statusCode = 405; response.end(JSON.stringify({ error: 'Método não permitido.' })); return }
        let rawBody = ''
        request.on('data', (chunk) => { rawBody += chunk })
        request.on('end', async () => {
          if (!apiKey) { response.statusCode = 503; response.end(JSON.stringify({ error: 'Assistente de IA ainda não configurado.', code: 'AI_NOT_CONFIGURED' })); return }
          try {
            const body = JSON.parse(rawBody) as { message?: string; history?: BuildAssistantMessage[]; context?: BuildAssistantContext }
            const message = typeof body.message === 'string' ? body.message.trim().slice(0, 2_000) : ''
            if (!message || !body.context?.vehicle) { response.statusCode = 400; response.end(JSON.stringify({ error: 'Mensagem ou contexto inválido.' })); return }
            const history = Array.isArray(body.history) ? body.history.slice(-12) : []
            response.statusCode = 200
            response.end(JSON.stringify(await runBuildAssistant(apiKey, message, history, body.context)))
          } catch (error) {
            response.statusCode = 502
            response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Falha ao consultar o assistente.' }))
          }
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return { plugins: [react(), vehicleResearchApi(env.GEMINI_API_KEY || ''), buildAssistantApi(env.GEMINI_API_KEY || '')] }
})
