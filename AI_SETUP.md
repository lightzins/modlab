# Pesquisa de especificações por IA

O assistente e a pesquisa de potência usam Gemini no backend. A chave fica apenas no servidor.

## Desenvolvimento local

1. Copie `.env.example` para `.env.local`.
2. Preencha `GEMINI_API_KEY`.
3. Reinicie `npm run dev`.

## Vercel

Adicione `GEMINI_API_KEY` como **Secret** em **Project Settings → Environment Variables** e faça um novo deploy.

Opcionalmente, `GEMINI_BUILD_MODEL` e `GEMINI_VEHICLE_MODEL` permitem trocar os modelos do chat e da pesquisa de fichas. Para o beta, o padrão é `gemini-3.5-flash-lite`, que consome menos cota.

Nunca use o prefixo `VITE_` na chave: variáveis com esse prefixo são enviadas ao navegador.
