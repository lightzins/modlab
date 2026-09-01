export class AuthenticationError extends Error {}

type AuthenticatedUser = { id: string; email?: string }

export async function requireAuthenticatedUser(request: { headers?: Record<string, string | string[] | undefined> }): Promise<AuthenticatedUser> {
  const authorization = request.headers?.authorization
  const bearer = Array.isArray(authorization) ? authorization[0] : authorization
  const token = bearer?.startsWith('Bearer ') ? bearer.slice(7) : ''
  const url = process.env.VITE_SUPABASE_URL
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!token) throw new AuthenticationError('Entre na sua conta para usar a IA.')
  if (!url || !publishableKey) throw new Error('Supabase ainda não está configurado no servidor.')

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: publishableKey, Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new AuthenticationError('Sua sessão expirou. Entre novamente para continuar.')
  const user = await response.json() as AuthenticatedUser
  if (!user?.id) throw new AuthenticationError('Não foi possível identificar sua conta.')
  return user
}
