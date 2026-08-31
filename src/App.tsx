import { useEffect, useMemo, useRef, useState, type ComponentType, type FormEvent } from 'react'
import {
  BadgeDollarSign, Bell, CalendarDays, CarFront, Check, CheckSquare, ChevronRight,
  CircleDollarSign, Clock3, Database, Eye, Gauge, Grid2X2,
  ImageOff, Languages, LoaderCircle, Menu, Moon, MoreHorizontal, Plus, Ruler, Save,
  MessageCircle, Search, Settings, ShieldCheck, SlidersHorizontal, Sparkles,
  Wrench, X, Zap,
} from 'lucide-react'

type NavItem = { label: string; title: string; description: string; icon: ComponentType<{ size?: number; strokeWidth?: number }> }
type Car = { name: string; spec: string; price: string; image: string; category: 'Esportivos' | 'SUVs' | 'Clássicos' | 'Elétricos' | 'Outros' }
type VehicleSearchResult = { id: string; make: string; model: string; year: number; yearLabel?: string; image?: string; description?: string; imageYearMatched?: boolean; imageLabel?: string; featured?: Car }
type GarageProject = { car: Car; name: string; status: string; progress: number; updated: string }

const navItems: NavItem[] = [
  { label: 'Visão geral', title: 'Visão geral', description: 'Sua garagem, projetos e próximos passos em um só lugar.', icon: Grid2X2 },
  { label: 'Minha Garagem', title: 'Minha Garagem', description: 'Seus carros e projetos salvos.', icon: CarFront },
  { label: 'Explorar carros', title: 'Explorar carros', description: 'Encontre o próximo carro para sua garagem.', icon: Search },
  { label: 'Tuning IA', title: 'Tuning IA', description: 'Defina seu briefing e planeje a configuração do projeto.', icon: Wrench },
  { label: 'Etapas', title: 'Etapas', description: 'Organize o andamento da sua build.', icon: CheckSquare },
  { label: 'Orçamento', title: 'Orçamento', description: 'Planeje custos, peças e serviços.', icon: BadgeDollarSign },
  { label: 'Configurações', title: 'Configurações', description: 'Personalize sua experiência no Modlab.', icon: Settings },
  { label: 'Testes', title: 'Testes', description: 'Protótipo da garagem de personalização do Modlab.', icon: SlidersHorizontal },
]

const cars: Car[] = [
  { name: 'Porsche 911 GT3', spec: '502 cv • 0–100 km/h 3,4 s', price: 'R$ 1,2M', image: '/cars/porsche.jpg', category: 'Esportivos' },
  { name: 'Audi RS Q8', spec: '600 cv • 0–100 km/h 3,8 s', price: 'R$ 1,1M', image: '/cars/audi.jpg', category: 'SUVs' },
  { name: 'BMW M5', spec: '635 cv • 0–100 km/h 3,1 s', price: 'R$ 950k', image: '/cars/bmw.jpg', category: 'Esportivos' },
  { name: 'Dodge Challenger', spec: '807 cv • 0–100 km/h 3,4 s', price: 'R$ 820k', image: '/cars/dodge.jpg', category: 'Clássicos' },
  { name: 'Tesla Model S Plaid', spec: '1.020 cv • 0–100 km/h 2,1 s', price: 'R$ 1,4M', image: '/cars/tesla.jpg', category: 'Elétricos' },
  { name: "Ford Mustang ’69", spec: '320 cv • 0–100 km/h 5,6 s', price: 'R$ 680k', image: '/cars/mustang.jpg', category: 'Clássicos' },
]

const garageCatalog = ([
  ['Chevrolet', ['Onix', 'Onix Plus', 'Tracker', 'Montana', 'Spin', 'S10', 'Trailblazer', 'Cruze', 'Corsa', 'Celta', 'Prisma', 'Classic', 'Astra', 'Vectra', 'Meriva', 'Opala']],
  ['Fiat', ['Mobi', 'Argo', 'Cronos', 'Pulse', 'Fastback', 'Toro', 'Strada', 'Fiorino', 'Uno', 'Palio', 'Siena', 'Grand Siena', 'Punto', 'Bravo', 'Stilo', 'Doblò']],
  ['Volkswagen', ['Polo', 'T-Cross', 'Nivus', 'Tera', 'Taos', 'Virtus', 'Jetta', 'Saveiro', 'Amarok', 'Golf', 'Gol', 'Fox', 'Voyage', 'Fusca', 'Kombi', 'Santana']],
  ['Toyota', ['Corolla', 'Corolla Cross', 'Hilux', 'SW4', 'Yaris', 'Etios', 'RAV4', 'Camry', 'Prius', 'Fielder', 'Bandeirante', 'GR Corolla', 'GR Yaris', 'GR Supra', 'Land Cruiser', 'C-HR']],
  ['Honda', ['Civic', 'City', 'City Hatch', 'HR-V', 'WR-V', 'CR-V', 'Fit', 'Accord', 'ZR-V', 'Jazz', 'Prelude', 'NSX', 'CRX', 'Passport', 'Pilot', 'Odyssey']],
  ['Hyundai', ['HB20', 'HB20S', 'Creta', 'Tucson', 'Santa Fe', 'i30', 'ix35', 'Azera', 'Elantra', 'Veloster', 'Kona', 'Palisade', 'Sonata', 'Accent', 'Veracruz', 'H-1']],
  ['Ford', ['Ka', 'Ka Sedan', 'Fiesta', 'Focus', 'EcoSport', 'Territory', 'Ranger', 'Maverick', 'Mustang', 'Bronco', 'Edge', 'Fusion', 'F-150', 'Courier', 'Escort', 'Belina']],
  ['Renault', ['Kwid', 'Sandero', 'Logan', 'Duster', 'Oroch', 'Kardian', 'Captur', 'Megane', 'Scenic', 'Clio', 'Symbol', 'Fluence', 'Master', 'Kangoo', 'Twingo', '19']],
  ['Nissan', ['Kicks', 'Versa', 'Sentra', 'Frontier', 'March', 'Livina', 'Tiida', 'X-Trail', 'Pathfinder', '370Z', 'GT-R', 'Silvia S15', 'Skyline', 'Leaf', 'Murano', 'Altima']],
  ['Jeep', ['Renegade', 'Compass', 'Commander', 'Wrangler', 'Gladiator', 'Cherokee', 'Grand Cherokee', 'Wagoneer', 'CJ5', 'CJ7', 'Willys', 'Patriot', 'Liberty', 'Avenger', 'Comanche', 'Grand Wagoneer']],
  ['Peugeot', ['208', '2008', '3008', '5008', '206', '207', '307', '308', '408', '405', '406', '106', '306', '404', 'Partner', 'Expert']],
  ['Citroën', ['C3', 'C3 Aircross', 'C4 Cactus', 'Basalt', 'C4 Lounge', 'C4 Pallas', 'C3 Picasso', 'Xsara', 'C5', 'C6', 'ZX', 'AX', 'DS3', 'DS4', 'Berlingo', 'Jumper']],
  ['BMW', ['118i', '120i', '125i', '128ti', '135i', '220i', '320i', '330i', '335i', '340i', '420i', '430i', 'M3', 'M4', 'X1', 'X3']],
  ['Mercedes-Benz', ['A200', 'A250', 'A45 AMG', 'C180', 'C200', 'C300', 'C63 AMG', 'CLA200', 'CLA250', 'CLA45 AMG', 'E250', 'E350', 'E63 AMG', 'GLA200', 'GLC300', 'G63 AMG']],
  ['Audi', ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'RS 3', 'RS 4', 'RS 5', 'RS 6', 'TT']],
  ['Brasil e importados', ['BYD Song', 'BYD Dolphin', 'BYD Dolphin Mini', 'BYD King', 'BYD Shark', 'GWM Haval H6', 'GWM Haval H9', 'GWM Ora 03', 'Caoa Chery Tiggo 5X', 'Caoa Chery Tiggo 7', 'Caoa Chery Tiggo 8', 'RAM Rampage', 'RAM 1500', 'Kia Sportage', 'Mitsubishi Eclipse Cross', 'Subaru Impreza WRX STI']],
] as Array<[string, string[]]>).flatMap(([make, models]) => models.map((model) => `${make} ${model}`))

const buildParts = [
  { id: 'motor', name: 'Stage 2 ECU', detail: '+82 cv estimados', price: 'R$ 8.900', icon: Zap },
  { id: 'suspensao', name: 'Suspensão coilover', detail: 'Altura e carga ajustáveis', price: 'R$ 12.400', icon: SlidersHorizontal },
  { id: 'freios', name: 'Kit freios carbono', detail: 'Discos 410 mm', price: 'R$ 28.700', icon: Gauge },
  { id: 'escape', name: 'Escape esportivo', detail: 'Titânio valvulado', price: 'R$ 18.200', icon: Sparkles },
]

const initialStages = [
  { title: 'Definir o projeto', detail: 'Objetivo, uso e orçamento inicial', done: true },
  { title: 'Escolher o veículo', detail: 'Defina o carro que receberá a build.', done: false },
  { title: 'Planejar performance', detail: 'Motor, escape e arrefecimento', done: false },
  { title: 'Acerto de dinâmica', detail: 'Suspensão, pneus e freios', done: false },
  { title: 'Montagem e validação', detail: 'Instalação, testes e documentação', done: false },
]

const initialExpenses: Array<{ id: number; item: string; category: string; value: number }> = []

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const makeAliases: Record<string, string> = { vw: 'volkswagen', chevy: 'chevrolet', mercedes: 'mercedes-benz', merc: 'mercedes-benz', landrover: 'land rover' }
const featuredYears: Record<string, number> = { 'porsche 911 gt3': 2024, 'audi rs q8': 2025, 'bmw m5': 2019, 'dodge challenger': 2021, 'tesla model s plaid': 2022, 'ford mustang 69': 1969 }
const brazilianClassics = [
  { make: 'Chevrolet', model: 'Opala', from: 1969, to: 1992, description: 'Clássico brasileiro produzido pela Chevrolet do Brasil.' },
  { make: 'Chevrolet', model: 'Chevette', from: 1973, to: 1993, description: 'Compacto clássico produzido pela Chevrolet do Brasil.' },
  { make: 'Chevrolet', model: 'Monza', from: 1982, to: 1996, description: 'Sedã médio clássico da Chevrolet do Brasil.' },
  { make: 'Chevrolet', model: 'Kadett', from: 1989, to: 1998, description: 'Hatch e sedã esportivos da Chevrolet do Brasil.' },
  { make: 'Volkswagen', model: 'Fusca', from: 1959, to: 1996, description: 'Ícone da indústria automobilística brasileira.' },
  { make: 'Fiat', model: 'Uno', from: 1984, to: 2013, description: 'Compacto marcante da Fiat no Brasil.' },
]

const normalizeText = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const displayName = (value: string) => value.toLowerCase().replace(/(^|[\s-])\S/g, (letter) => letter.toUpperCase())
const displayMake = (value: string) => ({ bmw: 'BMW', gmc: 'GMC', mini: 'MINI', ram: 'RAM', fiat: 'FIAT' }[normalizeText(value)] ?? displayName(value))
const removeDuplicateVehicleImages = <T extends { image?: string; imageYear?: number }>(items: T[]) => {
  const usedImages = new Set<string>()
  return items.map((item) => {
    if (!item.image || !usedImages.has(item.image)) {
      if (item.image) usedImages.add(item.image)
      return item
    }
    return { ...item, image: undefined, imageYear: undefined }
  })
}

async function findWikipediaVehicleImage(make: string, model: string): Promise<Partial<Pick<VehicleSearchResult, 'image' | 'imageLabel'>>> {
  const modelTokens = normalizeText(model).split(' ').filter((token) => token.length > 1)
  const params = new URLSearchParams({ action: 'query', generator: 'search', gsrsearch: `"${make} ${model}" automobile`, gsrnamespace: '0', gsrlimit: '8', prop: 'pageimages|pageprops', piprop: 'thumbnail', pithumbsize: '1100', format: 'json', origin: '*' })
  const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`).catch(() => undefined)
  if (!response?.ok) return {}
  const payload = await response.json() as { query?: { pages?: Record<string, { title: string; thumbnail?: { source?: string }; pageprops?: { disambiguation?: string } }> } }
  const candidate = Object.values(payload.query?.pages ?? {})
    .filter((page) => page.thumbnail?.source && !page.pageprops?.disambiguation)
    .map((page) => {
      const title = normalizeText(page.title)
      const compactTitle = title.replaceAll(' ', '')
      const compactMake = normalizeText(make).replaceAll(' ', '')
      const score = modelTokens.filter((token) => title.includes(token) || compactTitle.includes(token.replaceAll(' ', ''))).length * 20 + (title.includes(normalizeText(make)) || compactTitle.includes(compactMake) ? 8 : 0)
      return { page, title, score }
    })
    .filter((item) => item.score >= 20)
    .sort((a, b) => b.score - a.score)[0]?.page
  return candidate?.thumbnail?.source ? { image: candidate.thumbnail.source, imageLabel: 'Imagem principal do artigo do modelo' } : {}
}

async function findModelImage(make: string, model: string, year?: number): Promise<Partial<Pick<VehicleSearchResult, 'image' | 'imageLabel'>>> {
  const expectedTokens = normalizeText(`${make} ${model}${year ? ` ${year}` : ''}`).split(' ').filter((token) => token.length > 1)
  const blockedTokens = ['interior', 'dashboard', 'engine', 'wheel', 'logo', 'badge', 'brochure', 'diagram', 'manual']
  const params = new URLSearchParams({ action: 'query', generator: 'search', gsrsearch: `"${make} ${model}"${year ? ` ${year}` : ''}`, gsrnamespace: '6', gsrlimit: '18', prop: 'imageinfo', iiprop: 'url', iiurlwidth: '1100', format: 'json', origin: '*' })
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`).catch(() => undefined)
  if (!response?.ok) return year ? {} : findWikipediaVehicleImage(make, model)
  const payload = await response.json() as { query?: { pages?: Record<string, { title: string; imageinfo?: Array<{ thumburl?: string; url?: string }> }> } }
  const best = Object.values(payload.query?.pages ?? {})
    .map((page) => {
      const title = normalizeText(page.title)
      const score = expectedTokens.filter((token) => title.includes(token)).length * 20
        + (['front', 'rear', 'side', 'sedan', 'hatchback', 'coupe', 'suv'].some((token) => title.includes(token)) ? 8 : 0)
        - (blockedTokens.some((token) => title.includes(token)) ? 100 : 0)
      return { page, score, title }
    })
    .filter((candidate) => expectedTokens.every((token) => candidate.title.includes(token)) && candidate.score > 0)
    .sort((a, b) => b.score - a.score)[0]?.page.imageinfo?.[0]
  const image = best?.thumburl ?? best?.url
  if (image) return { image, imageLabel: year ? `Imagem de referência do modelo · ${year}` : 'Imagem de referência do modelo' }
  return year ? {} : findWikipediaVehicleImage(make, model)
}

async function findWikipediaBasePower(modelName: string): Promise<string | undefined> {
  const queryPage = async (language: 'pt' | 'en') => {
    const params = new URLSearchParams({ action: 'query', titles: modelName, prop: 'revisions', rvprop: 'content', rvslots: 'main', format: 'json', origin: '*' })
    const response = await fetch(`https://${language}.wikipedia.org/w/api.php?${params}`)
    if (!response.ok) return ''
    const payload = await response.json() as { query?: { pages?: Record<string, { revisions?: Array<{ slots?: { main?: Record<string, string> } }> }> } }
    return Object.values(payload.query?.pages ?? {})[0]?.revisions?.[0]?.slots?.main?.['*'] ?? ''
  }
  const pages = await Promise.all([queryPage('pt'), queryPage('en')])
  const powers = pages.flatMap((page) => Array.from(page.matchAll(/(?:converter\s*\|\s*|\b)(\d{2,4})\s*(cv|hp|ps|kw)\b/gi)).flatMap((match) => {
    const amount = Number(match[1])
    const unit = match[2].toLowerCase()
    const cv = unit === 'kw' ? amount * 1.35962 : unit === 'hp' ? amount * 1.01387 : amount
    return cv >= 20 && cv <= 2_000 ? [Math.round(cv)] : []
  }))
  const uniquePowers = [...new Set(powers)]
  return uniquePowers.length === 1 ? String(uniquePowers[0]) : undefined
}

async function findBasePower(modelName: string): Promise<string | undefined> {
  const searchParams = new URLSearchParams({ action: 'wbsearchentities', search: modelName, language: 'en', limit: '6', format: 'json', origin: '*' })
  const searchResponse = await fetch(`https://www.wikidata.org/w/api.php?${searchParams}`)
  if (!searchResponse.ok) return findWikipediaBasePower(modelName).catch(() => undefined)
  const search = await searchResponse.json() as { search?: Array<{ id: string; label?: string; description?: string }> }
  const normalizedName = normalizeText(modelName)
  const entity = (search.search ?? []).find((item) => normalizeText(item.label ?? '') === normalizedName)
    ?? (search.search ?? []).find((item) => /car|automobile|vehicle|motor car/i.test(item.description ?? ''))
  if (!entity) return findWikipediaBasePower(modelName).catch(() => undefined)

  const claimsParams = new URLSearchParams({ action: 'wbgetentities', ids: entity.id, props: 'claims', format: 'json', origin: '*' })
  const claimsResponse = await fetch(`https://www.wikidata.org/w/api.php?${claimsParams}`)
  if (!claimsResponse.ok) return findWikipediaBasePower(modelName).catch(() => undefined)
  const claims = await claimsResponse.json() as {
    entities?: Record<string, {
      claims?: Record<string, Array<{
        mainsnak?: { datavalue?: { value?: { amount?: string; unit?: string } } }
      }>>
    }>
  }
  const values = claims.entities?.[entity.id]?.claims?.P2109 ?? []
  const powers = values.flatMap((claim) => {
    const value = claim.mainsnak?.datavalue?.value
    const amount = Number(value?.amount)
    if (!Number.isFinite(amount) || amount <= 0) return []
    const unit = value?.unit ?? ''
    const cv = unit.endsWith('/Q25236') ? amount / 735.49875 : amount
    return cv >= 20 && cv <= 2_000 ? [Math.round(cv)] : []
  })
  const uniquePowers = [...new Set(powers)]
  return uniquePowers.length === 1 ? String(uniquePowers[0]) : findWikipediaBasePower(modelName).catch(() => undefined)
}

async function searchInternetVehicles(query: string, year?: number): Promise<VehicleSearchResult[]> {
  const params = new URLSearchParams({ action: 'query', generator: 'search', gsrsearch: `${query} automobile`, gsrnamespace: '0', gsrlimit: '8', prop: 'pageimages|extracts', piprop: 'thumbnail', pithumbsize: '1100', exintro: '1', explaintext: '1', exsentences: '2', format: 'json', origin: '*' })
  const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`)
  if (!response.ok) return []
  const payload = await response.json() as { query?: { pages?: Record<string, { pageid: number; title: string; thumbnail?: { source?: string }; extract?: string }> } }
  const queryTokens = normalizeText(query).split(' ').filter(Boolean)
  const knownAutomakers = ['acura', 'alfa romeo', 'audi', 'bmw', 'byd', 'cadillac', 'chevrolet', 'citroen', 'dodge', 'fiat', 'ford', 'honda', 'hyundai', 'jeep', 'kia', 'mazda', 'mercedes', 'mitsubishi', 'nissan', 'peugeot', 'porsche', 'renault', 'subaru', 'tesla', 'toyota', 'volkswagen', 'volvo']
  return Object.values(payload.query?.pages ?? {})
    .filter((page) => {
      const title = normalizeText(page.title)
      const compactTitle = title.replaceAll(' ', '')
      const text = normalizeText(`${page.title} ${page.extract ?? ''}`)
      const matchesQuery = queryTokens.every((token) => compactTitle.includes(token))
      const isAutomotive = /automobile|car|vehicle|manufacturer|hatchback|sedan|suv|motorsport|produced/.test(text)
      const hasAutomaker = knownAutomakers.some((make) => title.includes(make))
      return matchesQuery && isAutomotive && hasAutomaker
    })
    .map((page) => {
      const title = page.title.replace(/\s*\([^)]*\)$/, '')
      const [make, ...model] = title.split(' ')
      return { id: `web-${page.pageid}`, make, model: model.join(' ') || title, year: year ?? new Date().getFullYear(), yearLabel: year ? String(year) : 'Todos os anos', image: year ? undefined : page.thumbnail?.source, imageLabel: year ? undefined : page.thumbnail?.source ? 'Imagem encontrada na internet' : undefined, description: page.extract || 'Modelo encontrado na base pública global.' }
    })
}

async function searchVehicles(query: string, year?: number): Promise<VehicleSearchResult[]> {
  const normalized = normalizeText(query)
  const tokens = normalized.split(' ').filter(Boolean)
  const requestedMake = makeAliases[tokens[0]] ?? tokens[0]
  const catalogMatches: VehicleSearchResult[] = cars.filter((car) => {
    const name = normalizeText(car.name)
    return tokens.every((token) => name.includes(token) || (makeAliases[token] && name.includes(makeAliases[token])))
  }).map((car) => {
    const [make, ...model] = car.name.replace('’', '').split(' ')
    const photoYear = featuredYears[normalizeText(car.name)]
    const displayYear = year ?? photoYear
    return { id: `catalog-${normalizeText(car.name)}`, make, model: model.join(' '), year: displayYear, yearLabel: year ? String(year) : `Modelo ${photoYear}`, image: !year || photoYear === year ? car.image : undefined, imageYearMatched: photoYear === year, imageLabel: photoYear === year ? `Foto verificada · ${year}` : !year ? `Foto verificada do modelo · ${photoYear}` : undefined, featured: car }
  })
  const classicMatches: VehicleSearchResult[] = brazilianClassics.filter((car) => {
    const name = normalizeText(`${car.make} ${car.model}`)
    return tokens.every((token) => name.includes(token) || (makeAliases[token] && name.includes(makeAliases[token]))) && (!year || (year >= car.from && year <= car.to))
  }).map((car) => ({ id: `classic-${normalizeText(`${car.make}-${car.model}`)}`, make: car.make, model: car.model, year: year ?? car.to, yearLabel: year ? String(year) : `${car.from}–${car.to}`, description: car.description }))
  const knownMakes = new Set(['audi', 'bmw', 'chevrolet', 'dodge', 'fiat', 'ford', 'honda', 'mercedes benz', 'nissan', 'porsche', 'tesla', 'toyota', 'volkswagen'])
  const endpoint = year && year > 1995 ? `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(requestedMake)}/modelyear/${year}?format=json` : `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(requestedMake)}?format=json`
  const payload = knownMakes.has(normalizeText(requestedMake))
    ? await fetch(endpoint).then(async (response) => response.ok ? response.json() as Promise<{ Results?: Array<{ Make_ID: number; Make_Name: string; Model_ID: number; Model_Name: string }> }> : { Results: [] }).catch(() => ({ Results: [] }))
    : { Results: [] }
  const matches = (payload.Results ?? []).filter((item) => {
    const fullName = normalizeText(`${item.Make_Name} ${item.Model_Name}`)
    const comparableTokens = tokens[0] in makeAliases ? [makeAliases[tokens[0]], ...tokens.slice(1)] : tokens
    return comparableTokens.every((token) => fullName.includes(token))
  }).slice(0, 12)
  const verified = matches.map((item) => {
    const make = displayMake(item.Make_Name)
    const model = displayName(item.Model_Name)
    const known = cars.find((car) => {
      const carName = normalizeText(car.name)
      return featuredYears[carName] === year && carName.includes(normalizeText(item.Make_Name)) && carName.includes(normalizeText(item.Model_Name))
    })
    const displayYear = year ?? featuredYears[normalizeText(known?.name ?? '')] ?? new Date().getFullYear()
    return { id: `${item.Make_ID}-${item.Model_ID}-${displayYear}`, make, model, year: displayYear, yearLabel: year ? String(year) : 'Todos os anos', image: !year || (known && featuredYears[normalizeText(known.name)] === year) ? known?.image : undefined, imageYearMatched: Boolean(known && featuredYears[normalizeText(known.name)] === year), imageLabel: known && (!year || featuredYears[normalizeText(known.name)] === year) ? `Foto verificada · ${featuredYears[normalizeText(known.name)]}` : undefined, featured: known, description: 'Modelo confirmado no catálogo do fabricante. A imagem só aparece quando foi validada para este modelo.' }
  })
  const internetMatches = await searchInternetVehicles(query, year).catch(() => [])
  const combined = [...catalogMatches, ...classicMatches, ...verified, ...internetMatches]
    .filter((item, index, values) => values.findIndex((candidate) => normalizeText(`${candidate.make} ${candidate.model}`) === normalizeText(`${item.make} ${item.model}`)) === index)
    .slice(0, 12)
  return Promise.all(combined.map(async (vehicle) => vehicle.image ? vehicle : { ...vehicle, ...await findModelImage(vehicle.make, vehicle.model, year).catch(() => ({})) }))
}

function Sidebar({ active, onChange, open, onClose }: { active: number; onChange: (index: number) => void; open: boolean; onClose: () => void }) {
  return <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
    <button className="close-nav" onClick={onClose} aria-label="Fechar menu"><X size={19} /></button>
    <div className="brand"><img src="/modlab-logo.png" alt="Logo Modlab" /><strong>MODLAB</strong></div>
    <nav aria-label="Navegação principal">{navItems.map((item, index) => { const Icon = item.icon; return <button key={item.label} className={active === index ? 'nav-item active' : 'nav-item'} onClick={() => { onChange(index); onClose() }}><Icon size={16} strokeWidth={1.7} /><span>{item.label}</span></button> })}</nav>
  </aside>
}

function SearchField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <label className="search-box"><SlidersHorizontal size={15} aria-hidden="true" /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Buscar modelos" aria-label="Buscar modelos" /><Search size={16} aria-hidden="true" /></label>
}

function CarGrid({ items, onExplore }: { items: Car[]; onExplore?: (car: Car) => void }) {
  return <div className="car-grid">{items.map((car) => <article className="car-card" key={car.name}><img src={car.image} alt={car.name} /><div className="car-info"><h3>{car.name}</h3><p>{car.spec}</p><div><strong>{car.price}</strong><button onClick={() => onExplore?.(car)}>Explorar</button></div></div></article>)}</div>
}

function Overview({ onBrowse }: { onBrowse: () => void }) {
  const [query, setQuery] = useState('')
  const visibleCars = cars.filter((car) => car.name.toLowerCase().includes(query.toLowerCase()))
  return <><section className="hero"><h2>Todo projeto começa com um plano.</h2><p>Adicione o primeiro veículo para começar a construir sua garagem digital.</p></section><section className="models"><div className="section-head"><h2>Explore modelos</h2><SearchField value={query} onChange={setQuery} /></div><CarGrid items={visibleCars} onExplore={onBrowse} /></section></>
}

function Garage({ projects, activeProjectName, onBrowse, onOpenBuild }: { projects: GarageProject[]; activeProjectName?: string; onBrowse: () => void; onOpenBuild: (project: GarageProject) => void }) {
  return <section className="garage" aria-label="Seus projetos">
    <div className="garage-hero"><div><span className="eyebrow">GARAGEM DIGITAL</span><h2><span>Seus</span><span>Projetos</span></h2></div><div className="garage-overview"><strong>{String(projects.length).padStart(2, '0')}</strong><span>projetos salvos</span><small>{projects.filter((project) => project.progress > 0 && project.progress < 100).length} em andamento</small></div></div>
    <div className="garage-toolbar"><div><h3>Todos os projetos</h3><p>Acompanhe suas builds e continue de onde parou.</p></div><button className="primary-action" onClick={onBrowse}><Plus size={15} /> Novo projeto</button></div>
    {projects.length === 0 ? <div className="empty-garage"><CarFront size={28} /><h3>Nenhum carro na sua garagem.</h3><p>Pesquise um veículo e adicione-o para iniciar sua primeira build.</p><button className="primary-action" onClick={onBrowse}><Plus size={15} /> Explorar carros</button></div> : <div className="project-grid" aria-label="Projetos da garagem">{projects.map((project) => <article className={`project-card ${activeProjectName === project.name ? 'selected' : ''}`} key={`${project.name}-${project.car.name}`} onClick={() => onOpenBuild(project)}><div className="project-image">{project.car.image ? <img src={project.car.image} alt={project.car.name} /> : <span className="project-no-image"><ImageOff size={24} /></span>}<span className={`project-badge ${project.progress === 100 ? 'complete' : ''}`}>{project.status}</span><button className="project-menu" onClick={(event) => { event.stopPropagation(); onOpenBuild(project) }} aria-label={`Abrir ${project.name}`}><MoreHorizontal size={17} /></button></div><div className="project-copy"><span className="project-category">{project.car.category}</span><h3>{project.name}</h3><p>{project.car.name} · {project.car.spec.split(' • ')[0]}</p><div className="project-progress"><div><i style={{ width: `${project.progress}%` }} /></div><span>{project.progress}%</span></div><footer><span><Clock3 size={12} /> {project.updated}</span><button onClick={(event) => { event.stopPropagation(); onOpenBuild(project) }}>Ver projeto <ChevronRight size={13} /></button></footer></div></article>)}</div>}
  </section>
}

function VehicleResultGrid({ items, onSelect }: { items: VehicleSearchResult[]; onSelect: (vehicle: VehicleSearchResult) => void }) {
  return <div className="vehicle-result-grid">{items.map((vehicle) => <article className="vehicle-result-card" key={vehicle.id}><div className="vehicle-result-image">{vehicle.image ? <img src={vehicle.image} alt={`${vehicle.make} ${vehicle.model} ${vehicle.imageYearMatched ? vehicle.year : ''}`.trim()} /> : <span><ImageOff size={25} /><small>Imagem ainda não validada</small></span>}<i className={vehicle.image ? (vehicle.imageYearMatched ? 'matched' : 'reference') : 'reference'}>{vehicle.imageLabel ?? 'Sem foto validada'}</i></div><div className="vehicle-result-copy"><span className="vehicle-source"><Database size={11} /> MODELO VERIFICADO</span><h3>{vehicle.make} {vehicle.model}</h3>{vehicle.featured ? <p className="vehicle-performance">{vehicle.featured.spec}</p> : <p className="vehicle-description">{vehicle.description || 'Modelo confirmado no catálogo do fabricante.'}</p>}<div className="vehicle-metrics"><span><small>ANO</small><strong>{vehicle.yearLabel ?? vehicle.year}</strong></span><span><small>MARCA</small><strong>{vehicle.make}</strong></span><span><small>CLASSE</small><strong>Veículo</strong></span></div><footer>{vehicle.featured ? <strong>{vehicle.featured.price}</strong> : <span>Dados: catálogo Modlab</span>}<button onClick={() => onSelect(vehicle)}>Adicionar à garagem <Plus size={13} /></button></footer></div></article>)}</div>
}

function ExploreCars({ onAddVehicle }: { onAddVehicle: (vehicle: VehicleSearchResult) => void }) {
  const [query, setQuery] = useState('')
  const [year, setYear] = useState<number | undefined>(undefined)
  const [results, setResults] = useState<VehicleSearchResult[]>([])
  const [selected, setSelected] = useState<VehicleSearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const runSearch = async (event?: FormEvent) => {
    event?.preventDefault()
    if (query.trim().length < 2) { setError('Digite pelo menos duas letras para pesquisar marca ou modelo.'); return }
    setLoading(true); setError(''); setSelected(null); setSearched(true)
    try { const found = await searchVehicles(query.trim(), year); setResults(found); if (!found.length) setError('Nenhum modelo correspondente foi encontrado para esse ano.') }
    catch { setResults([]); setError('A busca está temporariamente indisponível. Tente novamente em instantes.') }
    finally { setLoading(false) }
  }
  const useExample = (value: string) => { setQuery(value); setError(''); setSearched(false) }
  const selectFeatured = (car: Car) => {
    const [make, ...modelParts] = car.name.split(' ')
    const photoYear = featuredYears[normalizeText(car.name)]
    selectVehicle({ id: `featured-${normalizeText(car.name)}`, make, model: modelParts.join(' '), year: year ?? photoYear, yearLabel: year ? String(year) : `Modelo ${photoYear}`, image: car.image, imageYearMatched: year === photoYear, imageLabel: `Foto verificada · ${photoYear}`, featured: car })
  }
  const selectVehicle = (vehicle: VehicleSearchResult) => { setSelected(vehicle); onAddVehicle(vehicle) }
  return <section className="content-page explore-page"><div className="wide-hero explore-hero"><div><span className="eyebrow">BUSCA AUTOMOTIVA GLOBAL</span><h2>Pesquise marca, modelo ou versão.</h2><p>Modelos vêm do catálogo do fabricante. Fotos só aparecem quando correspondem ao carro validado.</p></div><Search size={54} strokeWidth={1.15} /></div><form className="vehicle-search-panel" onSubmit={runSearch}><label className="vehicle-query"><Search size={19} /><span><small>MARCA, MODELO OU VERSÃO</small><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: Opala, Chevette, Toyota Corolla ou Porsche 911 GT3" aria-label="Marca e modelo do carro" /></span>{query && <button type="button" onClick={() => { setQuery(''); setResults([]); setSearched(false); setError('') }} aria-label="Limpar busca"><X size={16} /></button>}</label><label className="year-field"><CalendarDays size={18} /><span><small>ANO</small><select value={year ?? ''} onChange={(event) => setYear(event.target.value ? Number(event.target.value) : undefined)} aria-label="Ano do modelo"><option value="">Todos os anos</option>{Array.from({ length: 67 }, (_, index) => 2026 - index).map((item) => <option key={item}>{item}</option>)}</select></span></label><button className="search-action" type="submit" disabled={loading}>{loading ? <LoaderCircle className="spin" size={17} /> : <Search size={17} />}{loading ? 'Buscando...' : 'Pesquisar carro'}</button></form><div className="search-examples"><span>Experimente:</span>{['Chevrolet Opala', 'Chevette', 'Toyota Corolla', 'Porsche 911 GT3'].map((item) => <button type="button" key={item} onClick={() => useExample(item)}>{item}</button>)}</div>{error && <div className="search-feedback error"><X size={15} /><span>{error}</span></div>}{selected && <div className="search-feedback success"><Check size={15} /><span><strong>{selected.make} {selected.model}</strong> foi adicionado à sua garagem.</span><button onClick={() => setSelected(null)} aria-label="Fechar aviso"><X size={14} /></button></div>}{loading && <div className="search-loading"><LoaderCircle className="spin" size={25} /><strong>Procurando modelos...</strong><span>Validando o catálogo do fabricante.</span></div>}{!loading && results.length > 0 && <><div className="results-title"><div><h2>Resultados encontrados</h2><p>{results.length} {results.length === 1 ? 'modelo compatível' : 'modelos compatíveis'} {year ? `para ${year}` : 'em todos os anos'}</p></div><span><Database size={13} /> Catálogo Modlab + vPIC</span></div><VehicleResultGrid items={results} onSelect={selectVehicle} /></>}{!loading && !searched && <div className="featured-catalog"><div className="results-title"><div><h2>Modelos em destaque</h2><p>Fotos presentes neste catálogo já foram associadas ao modelo.</p></div></div><CarGrid items={cars} onExplore={selectFeatured} /></div>}</section>
}

function MyBuild({ project }: { project?: GarageProject }) {
  const [selectedParts, setSelectedParts] = useState<string[]>(['motor'])
  const [activeMode, setActiveMode] = useState('performance')
  const [saved, setSaved] = useState(false)
  const [objective, setObjective] = useState('Rua com performance')
  const [budget, setBudget] = useState('')
  useEffect(() => {
    if (!project) return
    try {
      const draft = JSON.parse(window.localStorage.getItem(`modlab-build-draft-${normalizeText(project.name)}`) ?? '{}') as { selectedParts?: string[]; objective?: string; budget?: string }
      if (Array.isArray(draft.selectedParts)) setSelectedParts(draft.selectedParts)
      if (draft.objective) setObjective(draft.objective)
      if (typeof draft.budget === 'string') setBudget(draft.budget)
    } catch { /* A build começa com o estado padrão se o rascunho estiver inválido. */ }
  }, [project])
  const togglePart = (id: string) => setSelectedParts((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const progress = Math.min(25 + selectedParts.length * 15, 100)
  const saveBuild = () => {
    if (!project) return
    window.localStorage.setItem(`modlab-build-draft-${normalizeText(project.name)}`, JSON.stringify({ selectedParts, objective, budget }))
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2400)
  }
  if (!project) return <section className="content-page empty-tab"><Wrench size={30} strokeWidth={1.4} /><h2>Selecione um carro primeiro.</h2><p>Abra um projeto da sua garagem para configurar a build certa.</p></section>
  const garageModes = [
    { id: 'performance', label: 'Performance', detail: 'Motor, freios e dinâmica', icon: Gauge },
    { id: 'visual', label: 'Visual', detail: 'Rodas, cor e acabamento', icon: Sparkles },
    { id: 'setup', label: 'Acerto', detail: 'Suspensão e comportamento', icon: SlidersHorizontal },
    { id: 'assistant', label: 'Assistente IA', detail: 'Planejar com orientação', icon: MessageCircle },
  ]
  return <section className="content-page build-page"><section className="workshop-bay" aria-label="Garagem de personalização"><div className="workshop-scene">{project.car.image ? <img src={project.car.image} alt={project.car.name} /> : <div className="build-no-image"><ImageOff size={30} /><span>Imagem não validada</span></div>}<div className="workshop-vignette" /></div><div className="workshop-info"><span className="eyebrow">OFICINA MODLAB · PROJETO ATIVO</span><h2>{project.car.name}</h2><p>{project.name}</p><div className="workshop-stats"><span><small>POTÊNCIA</small><b>{project.car.spec.split(' • ')[0]}</b></span><span><small>STATUS</small><b>{progress}% planejado</b></span></div><div className="progress-row"><span><b>Progresso da build</b><b>{progress}%</b></span><div><i style={{ width: `${progress}%` }} /></div></div></div></section><div className="garage-mode-grid">{garageModes.map((mode) => { const Icon = mode.icon; return <button key={mode.id} className={`garage-mode ${activeMode === mode.id ? 'active' : ''}`} onClick={() => setActiveMode(mode.id)}><span><Icon size={21} /></span><div><strong>{mode.label}</strong><small>{mode.detail}</small></div><ChevronRight size={17} /></button> })}</div>{saved && <div className="success-note"><Check size={15} /> Build salva neste dispositivo.</div>}<div className="section-title"><div><span className="eyebrow">{activeMode === 'visual' ? 'ESTILO E ACABAMENTO' : activeMode === 'setup' ? 'DINÂMICA DO VEÍCULO' : 'UPGRADES DO PROJETO'}</span><h2>{activeMode === 'visual' ? 'Personalização visual' : activeMode === 'setup' ? 'Acerto de pista e rua' : 'Componentes de referência'}</h2><p>Marque itens iniciais; a IA vai validar compatibilidade após a conexão.</p></div><button className="primary-action" onClick={saveBuild}><Save size={15} /> Salvar build</button></div><div className="parts-grid">{buildParts.map((part) => { const Icon = part.icon; const selected = selectedParts.includes(part.id); return <button className={`part-card ${selected ? 'selected' : ''}`} key={part.id} onClick={() => togglePart(part.id)}><span className="part-icon"><Icon size={20} /></span><span><strong>{part.name}</strong><small>{part.detail}</small></span><b>{part.price}</b><i>{selected ? <Check size={14} /> : <Plus size={14} />}</i></button> })}</div><div className="tuning-layout"><section className="tuning-chat"><header><span className="tuning-chat-icon"><MessageCircle size={18} /></span><div><strong>Assistente de Tuning</strong><small>Planejamento técnico da build</small></div><span className="connection-status"><i /> Beta aguardando integração</span></header><div className="tuning-empty"><MessageCircle size={25} /><strong>Assistente IA em preparação</strong><p>O chat será ativado com Gemini e Supabase. Não simulamos respostas: quando estiver conectado, ele vai analisar seu briefing de verdade.</p></div></section><aside className="tuning-context"><div className="tuning-context-title"><div><span className="eyebrow">CONTEXTO DA IA</span><h2>Seu briefing</h2></div><ShieldCheck size={20} /></div><label><small>OBJETIVO</small><select value={objective} onChange={(event) => setObjective(event.target.value)}><option>Rua com performance</option><option>Track day</option><option>Arrancada</option><option>Restomod</option><option>Off-road</option></select></label><label><small>ORÇAMENTO ESTIMADO</small><input value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="Ex.: R$ 25.000" /></label><div className="tuning-vehicle"><small>VEÍCULO VINCULADO</small><strong>{project.car.name}</strong><span>{project.car.spec}</span></div><p className="tuning-disclaimer">O briefing fica salvo neste dispositivo até conectarmos sua conta. A chave da IA ficará protegida no Supabase, nunca no navegador.</p></aside></div></section>
}

function Stages() {
  const [stages, setStages] = useState(initialStages)
  const complete = stages.filter((stage) => stage.done).length
  const toggle = (index: number) => setStages((current) => current.map((stage, stageIndex) => stageIndex === index ? { ...stage, done: !stage.done } : stage))
  return <section className="content-page stages-page"><div className="metric-strip"><div><span>PROGRESSO GERAL</span><strong>{Math.round((complete / stages.length) * 100)}%</strong></div><div><span>ETAPAS CONCLUÍDAS</span><strong>{complete} de {stages.length}</strong></div><div><span>PRÓXIMO FOCO</span><strong>{stages.find((stage) => !stage.done)?.title ?? 'Projeto concluído'}</strong></div></div><div className="stage-list">{stages.map((stage, index) => <button className={`stage-row ${stage.done ? 'done' : ''}`} key={stage.title} onClick={() => toggle(index)}><span className="stage-number">{stage.done ? <Check size={17} /> : String(index + 1).padStart(2, '0')}</span><span><strong>{stage.title}</strong><small>{stage.detail}</small></span><span className="stage-status">{stage.done ? 'Concluída' : 'Pendente'} <ChevronRight size={16} /></span></button>)}</div></section>
}

function Budget() {
  const [expenses, setExpenses] = useState(initialExpenses)
  const [item, setItem] = useState('')
  const [value, setValue] = useState('')
  const total = useMemo(() => expenses.reduce((sum, expense) => sum + expense.value, 0), [expenses])
  const budget = 1350000
  const addExpense = (event: FormEvent) => { event.preventDefault(); const parsed = Number(value.replace(/[^0-9]/g, '')); if (!item.trim() || !parsed) return; setExpenses((current) => [...current, { id: Date.now(), item: item.trim(), category: 'Personalizado', value: parsed }]); setItem(''); setValue('') }
  return <section className="content-page budget-page"><div className="budget-summary"><article><span>ORÇAMENTO TOTAL</span><strong>{currency.format(budget)}</strong><small>Limite definido para o projeto</small></article><article><span>INVESTIMENTO PLANEJADO</span><strong>{currency.format(total)}</strong><small>{Math.round((total / budget) * 100)}% do orçamento utilizado</small></article><article><span>SALDO DISPONÍVEL</span><strong>{currency.format(budget - total)}</strong><small>Reserva para próximas etapas</small></article></div><div className="budget-panel"><div className="section-title"><div><h2>Itens do projeto</h2><p>Custos previstos para veículo, peças e serviços.</p></div></div><div className="expense-table">{expenses.map((expense) => <div className="expense-row" key={expense.id}><span><strong>{expense.item}</strong><small>{expense.category}</small></span><b>{currency.format(expense.value)}</b><button onClick={() => setExpenses((current) => current.filter((item) => item.id !== expense.id))} aria-label={`Remover ${expense.item}`}><X size={14} /></button></div>)}</div><form className="expense-form" onSubmit={addExpense}><input value={item} onChange={(event) => setItem(event.target.value)} placeholder="Novo item" aria-label="Novo item" /><input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Valor em reais" aria-label="Valor em reais" inputMode="numeric" /><button className="primary-action" type="submit"><Plus size={15} /> Adicionar</button></form></div></section>
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) { return <button className={`toggle ${enabled ? 'on' : ''}`} onClick={onChange} role="switch" aria-checked={enabled}><span /></button> }

function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [publicProfile, setPublicProfile] = useState(false)
  const [language, setLanguage] = useState('Português (Brasil)')
  const [units, setUnits] = useState('Métrico (km, cv)')
  const [currencySetting, setCurrencySetting] = useState('Real brasileiro (R$)')
  return <section className="content-page settings-page">
    <div className="settings-section-title"><div><h2>Preferências gerais</h2><p>Personalize como o Modlab funciona para você.</p></div></div>
    <div className="settings-grid"><article className="settings-card"><header><span className="setting-icon"><Bell size={18} /></span><div><strong>Notificações</strong><small>Atualizações sobre etapas e orçamento.</small></div></header><Toggle enabled={notifications} onChange={() => setNotifications(!notifications)} /></article><article className="settings-card"><header><span className="setting-icon"><Moon size={18} /></span><div><strong>Tema escuro</strong><small>Interface otimizada para baixa luminosidade.</small></div></header><Toggle enabled={darkMode} onChange={() => setDarkMode(!darkMode)} /></article><article className="settings-card"><header><span className="setting-icon"><Save size={18} /></span><div><strong>Salvar automaticamente</strong><small>Preservar alterações enquanto você trabalha.</small></div></header><Toggle enabled={autoSave} onChange={() => setAutoSave(!autoSave)} /></article><article className="settings-card"><header><span className="setting-icon"><Eye size={18} /></span><div><strong>Perfil público</strong><small>Permitir que outras pessoas vejam suas builds.</small></div></header><Toggle enabled={publicProfile} onChange={() => setPublicProfile(!publicProfile)} /></article></div>
    <div className="settings-section-title"><div><h2>Localização e medidas</h2><p>Formatos usados nos carros, peças e valores.</p></div></div>
    <div className="preference-list"><label><span className="setting-icon"><Languages size={18} /></span><span><strong>Idioma</strong><small>Idioma principal da interface.</small></span><select value={language} onChange={(event) => setLanguage(event.target.value)}><option>Português (Brasil)</option><option>English</option><option>Español</option></select></label><label><span className="setting-icon"><Ruler size={18} /></span><span><strong>Unidades</strong><small>Medidas de distância e potência.</small></span><select value={units} onChange={(event) => setUnits(event.target.value)}><option>Métrico (km, cv)</option><option>Imperial (mi, hp)</option></select></label><label><span className="setting-icon"><CircleDollarSign size={18} /></span><span><strong>Moeda</strong><small>Formato de valores do orçamento.</small></span><select value={currencySetting} onChange={(event) => setCurrencySetting(event.target.value)}><option>Real brasileiro (R$)</option><option>Dólar americano (US$)</option><option>Euro (€)</option></select></label></div>
  </section>
}

function DesignLab() {
  const [screen, setScreen] = useState('TUNING')
  const [section, setSection] = useState(() => window.localStorage.getItem('modlab-showcase-section') ?? 'Performance')
  const [selected, setSelected] = useState(() => window.localStorage.getItem('modlab-showcase-selected') ?? 'Stage 2 ECU')
  const [vehicleIndex, setVehicleIndex] = useState(() => Number(window.localStorage.getItem('modlab-showcase-vehicle') ?? '0'))
  const [buildSteps, setBuildSteps] = useState<boolean[]>(() => { try { const stored = window.localStorage.getItem('modlab-showcase-steps'); return stored ? JSON.parse(stored) as boolean[] : [true, true, false, false] } catch { return [true, true, false, false] } })
  const [savedParts, setSavedParts] = useState<string[]>(() => { try { const stored = window.localStorage.getItem('modlab-showcase-parts'); return stored ? JSON.parse(stored) as string[] : [] } catch { return [] } })
  const [configurationSaved, setConfigurationSaved] = useState(false)
  const [vehiclePickerOpen, setVehiclePickerOpen] = useState(false)
  const [garageQuery, setGarageQuery] = useState('')
  const [searchingGarage, setSearchingGarage] = useState(false)
  const [vehicles, setVehicles] = useState(() => {
    type ShowcaseVehicle = { name: string; tag: string; power: string; grade: string; progress: string; image?: string; imageYear?: number }
    const seed = garageCatalog.map((name, index): ShowcaseVehicle => { const featured = cars.find((car) => normalizeText(car.name) === normalizeText(name)); const imageYear = featured ? featuredYears[normalizeText(featured.name)] : undefined; return { name, tag: featured ? `${featured.category} · projeto ${String(index + 1).padStart(2, '0')}` : `Catálogo curado · projeto ${String(index + 1).padStart(2, '0')}`, power: featured ? featured.spec.split(' • ')[0].replace(/[^0-9.]/g, '') : '—', grade: ['S+', 'A+', 'S', 'A', 'S+', 'A'][index % 6], progress: String([42, 28, 17, 12, 8, 5][index % 6]), image: featured?.image, imageYear } })
    try {
      const stored = window.localStorage.getItem('modlab-showcase-catalog')
      if (!stored) return seed
      const existing = (JSON.parse(stored) as ShowcaseVehicle[]).map((item) => item.tag.includes('potência base consultada') ? { ...item, power: '—', tag: item.tag.replace(' · potência base consultada', '') } : item)
      const merged = seed.map((item) => {
        const saved = existing.find((candidate) => normalizeText(candidate.name) === normalizeText(item.name))
        return saved ? { ...item, ...saved, imageYear: saved.imageYear ?? item.imageYear } : item
      })
      const extras = existing.filter((saved) => !merged.some((item) => normalizeText(item.name) === normalizeText(saved.name))).map((saved) => {
        const featured = cars.find((car) => normalizeText(car.name) === normalizeText(saved.name))
        const imageYear = saved.imageYear ?? (featured ? featuredYears[normalizeText(featured.name)] : undefined)
        return { ...saved, image: saved.image ?? featured?.image, imageYear }
      })
      return removeDuplicateVehicleImages([...merged, ...extras])
    } catch { return seed }
  })
  useEffect(() => { window.localStorage.setItem('modlab-showcase-section', section); window.localStorage.setItem('modlab-showcase-selected', selected); window.localStorage.setItem('modlab-showcase-vehicle', String(vehicleIndex)); window.localStorage.setItem('modlab-showcase-steps', JSON.stringify(buildSteps)); window.localStorage.setItem('modlab-showcase-parts', JSON.stringify(savedParts)); window.localStorage.setItem('modlab-showcase-catalog', JSON.stringify(vehicles)) }, [section, selected, vehicleIndex, buildSteps, savedParts, vehicles])
  useEffect(() => {
    let cancelled = false
    const hydrateCatalogImages = async () => {
      const missingImages = vehicles.filter((item) => !item.image).slice(0, 256)
      for (let position = 0; position < missingImages.length; position += 8) {
        const batch = missingImages.slice(position, position + 8)
        const found = await Promise.all(batch.map(async (item) => {
          const [make, ...model] = item.name.replace('1969', '').split(' ')
          const image = await findModelImage(make, model.join(' ')).then((result) => result.image).catch(() => undefined)
          return { name: item.name, image }
        }))
        if (cancelled) return
        const images = new Map(found.filter((item): item is { name: string; image: string } => Boolean(item.image)) .map((item) => [item.name, item.image]))
        if (images.size) setVehicles((currentVehicles) => removeDuplicateVehicleImages(currentVehicles.map((candidate) => images.has(candidate.name) ? { ...candidate, image: images.get(candidate.name) } : candidate)))
      }
    }
    void hydrateCatalogImages()
    return () => { cancelled = true }
  // As imagens ausentes são carregadas uma vez e cacheadas no navegador.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const options = {
    Performance: { icon: Gauge, title: 'Performance', description: 'Potência, resposta e confiabilidade do conjunto.', items: ['Stage 1 ECU', 'Stage 2 ECU', 'Turbo upgrade'] },
    Visual: { icon: Sparkles, title: 'Visual', description: 'Rodas, acabamento e presença da build.', items: ['Rodas forjadas 19”', 'Pacote aerodinâmico', 'Livery discreta'] },
    Dinâmica: { icon: SlidersHorizontal, title: 'Dinâmica', description: 'Altura, aderência e comportamento em curva.', items: ['Coilover ajustável', 'Barras estabilizadoras', 'Pneus semi-slick'] },
    'Assistente IA': { icon: MessageCircle, title: 'Assistente IA', description: 'Planejamento técnico guiado para o beta.', items: ['Definir objetivo', 'Estimar orçamento', 'Validar compatibilidade'] },
  }
  const current = options[section as keyof typeof options]
  const Icon = current.icon
  const vehicle = vehicles[vehicleIndex] ?? vehicles[0]
  const selectVehicle = (index: number) => { setVehicleIndex(index); setVehiclePickerOpen(false); setScreen('TUNING') }
  const marketParts = [{ name: 'Kit freios carbono', type: 'FREIOS · 410 MM', price: 'R$ 28.700', supplier: 'Apex Performance' }, { name: 'Coilover Clubsport', type: 'SUSPENSÃO · AJUSTÁVEL', price: 'R$ 12.400', supplier: 'Trackline Garage' }, { name: 'Escape valvulado', type: 'ESCAPE · TITÂNIO', price: 'R$ 18.200', supplier: 'Ferrovia Motorsport' }]
  const totalSaved = savedParts.reduce((sum, partName) => sum + Number(marketParts.find((part) => part.name === partName)?.price.replace(/[^0-9]/g, '') ?? 0), 0)
  const saveConfiguration = () => { setConfigurationSaved(true); window.setTimeout(() => setConfigurationSaved(false), 1800) }
  const searchGarage = async (event: FormEvent) => {
    event.preventDefault()
    const query = garageQuery.trim()
    if (!query) return
    setSearchingGarage(true)
    try {
      const results = await searchVehicles(query)
      const additions = results.map((result, index) => ({ name: `${result.make} ${result.model}`, tag: 'Busca pública · adicionar ao projeto', power: '—', grade: 'B', progress: '0', image: result.image, imageYear: undefined }))
      setVehicles((currentVehicles) => additions.reduce((nextVehicles, addition) => {
        const existingIndex = nextVehicles.findIndex((currentVehicle) => normalizeText(currentVehicle.name) === normalizeText(addition.name))
        if (existingIndex < 0) return [...nextVehicles, addition]
        if (!addition.image || !addition.imageYear) return nextVehicles
        return nextVehicles.map((currentVehicle, index) => index === existingIndex ? { ...currentVehicle, image: addition.image, imageYear: addition.imageYear, tag: addition.tag } : currentVehicle)
      }, currentVehicles))
    } finally { setSearchingGarage(false) }
  }
  const visibleVehicles = vehicles.filter((car) => normalizeText(car.name).includes(normalizeText(garageQuery)))
  const vehiclePicker = vehiclePickerOpen ? <div className="vehicle-picker-backdrop" role="dialog" aria-modal="true" aria-label="Trocar veículo"><section className="vehicle-picker"><header><div><span className="eyebrow">GARAGEM MODLAB</span><h2>Escolha seu veículo</h2><p>Selecione um projeto para continuar a personalização.</p></div><button aria-label="Fechar seletor" onClick={() => setVehiclePickerOpen(false)}><X size={18} /></button></header><div className="vehicle-picker__list">{vehicles.slice(0, 12).map((car, index) => <button className={vehicleIndex === index ? 'selected' : ''} key={car.name} onClick={() => selectVehicle(index)}>{car.image ? <img src={car.image} alt="" /> : <span><ImageOff size={16} /></span>}<div><small>BUILD {String(index + 1).padStart(3, '0')}</small><strong>{car.name}</strong><em>{car.power === '—' ? 'Versão pendente' : `${car.power} cv`} · Classe {car.grade}</em></div>{vehicleIndex === index && <Check size={16} />}</button>)}</div><footer><button onClick={() => { setVehiclePickerOpen(false); setScreen('GARAGEM') }}><Search size={15} /> Ver catálogo completo</button><span>{vehicles.length} modelos no catálogo local</span></footer></section></div> : null
  const renderShowcaseHeader = () => <><header className="showcase-header"><a className="showcase-brand" href="/"><img src="/modlab-logo.png" alt="Modlab" /><strong>MODLAB</strong></a><nav>{['GARAGEM', 'BUILD', 'TUNING', 'MERCADO'].map((item) => <button onClick={() => setScreen(item)} className={item === screen ? 'active' : ''} key={item}>{item}</button>)}</nav><div className="showcase-profile"><i /><span>SESSÃO LOCAL</span></div></header><div className="showcase-subnav"><span>{screen === 'GARAGEM' ? 'GARAGEM / CATÁLOGO DE VEÍCULOS' : 'OFICINA / PERSONALIZAÇÃO'}</span><span>ALTERAÇÕES SALVAS NESTE DISPOSITIVO</span><button onClick={() => setVehiclePickerOpen(true)}><CarFront size={15} /> Veículo atual</button></div>{vehiclePicker}</>
  if (screen === 'GARAGEM' && garageQuery.trim()) return <section className="showcase-site" aria-label="Resultados de busca da garagem">
    {renderShowcaseHeader()}
    <main className="showcase-search-page">
      <header><span className="eyebrow">BUSCA DE VEÍCULOS</span><h1>Resultados para<br />“{garageQuery}”.</h1><p>Escolha um modelo para abrir sua personalização.</p></header>
      <form className="collection-search" onSubmit={searchGarage}>
        <Search size={17} />
        <input value={garageQuery} onChange={(event) => setGarageQuery(event.target.value)} placeholder="Buscar modelo" aria-label="Buscar carro no catálogo" autoFocus />
        <button type="submit" disabled={searchingGarage}>{searchingGarage ? 'Buscando...' : 'Buscar online'}</button>
      </form>
      <div className="vertical-search-results">{visibleVehicles.length ? visibleVehicles.map((car) => { const index = vehicles.findIndex((item) => item.name === car.name); return <button key={car.name} onClick={() => selectVehicle(index)}>{car.image ? <img src={car.image} alt={car.name} /> : <span className="vertical-search-no-image"><ImageOff size={22} /> Imagem em validação</span>}<span><small>MODELO {String(index + 1).padStart(3, '0')}</small><strong>{car.name}</strong><em>{car.power === '—' ? 'Informe versão para confirmar a potência' : `${car.power} cv · Classe ${car.grade}`}</em></span><ChevronRight size={18} /></button> }) : <div className="empty-search"><Search size={28} /><strong>Nenhum modelo local encontrado.</strong><p>Use “Buscar online” para consultar bases públicas e adicionar o carro ao catálogo.</p></div>}</div>
    </main>
    <footer className="showcase-footer"><button onClick={() => setGarageQuery('')}>Limpar busca e voltar à garagem</button><span><i /> {visibleVehicles.length} resultados</span></footer>
  </section>
  if (screen === 'TUNING') return <section className="showcase-site" aria-label="Oficina de personalização">{renderShowcaseHeader()}<main className="showcase-main"><div className="showcase-photo">{vehicle.image ? <img src={vehicle.image} alt={vehicle.name} /> : <div className="showcase-no-image"><ImageOff size={32} /> Imagem do modelo em validação</div>}<div className="showcase-light" /></div><section className="showcase-identity"><span className="eyebrow">GARAGEM 01 · BUILD ATIVA</span><h1>{vehicle.name}</h1><p>{vehicle.tag}</p><div className="showcase-stats"><article><small>POTÊNCIA</small><strong>{vehicle.power === '—' ? 'N/D' : <>{vehicle.power}<em> cv</em></>}</strong></article><article><small>CLASSE</small><strong>{vehicle.grade}</strong></article><article><small>BUILD</small><strong>{vehicle.progress}<em>%</em></strong></article></div><div className="showcase-meter"><span><b>ÍNDICE DE PREPARO</b><b>{vehicle.progress}%</b></span><i style={{ width: `${vehicle.progress}%` }} /></div></section><aside className="showcase-config"><header><span><Icon size={20} /></span><div><small>AJUSTE ATUAL</small><strong>{current.title}</strong></div></header><p>{current.description}</p><div>{current.items.map((item, index) => <button className={selected === item ? 'selected' : ''} key={item} onClick={() => setSelected(item)}><b>{String(index + 1).padStart(2, '0')}</b><span>{item}</span>{selected === item ? <Check size={15} /> : <Plus size={15} />}</button>)}</div><footer><span>SELECIONADO</span><strong>{selected}</strong><button onClick={saveConfiguration}>{configurationSaved ? <><Check size={13} /> Salvo</> : <><Save size={13} /> Salvar ajuste</>}</button></footer></aside></main><nav className="showcase-actions" aria-label="Categorias de personalização">{Object.entries(options).map(([name, option]) => { const ActionIcon = option.icon; return <button className={section === name ? 'active' : ''} key={name} onClick={() => { setSection(name); setSelected(option.items[0]) }}><span><ActionIcon size={21} /></span><strong>{name}</strong><small>{name === 'Performance' ? 'motor & transmissão' : name === 'Visual' ? 'estilo & acabamento' : name === 'Dinâmica' ? 'suspensão & grip' : 'planejamento guiado'}</small></button> })}</nav><footer className="showcase-footer"><span><b>SELECIONE UM MÓDULO</b> para editar sua build</span><span><i /> Dados incompletos nunca recebem potência estimada</span></footer></section>
  if (screen === 'GARAGEM') return <section className="showcase-site" aria-label="Garagem Modlab">
    {renderShowcaseHeader()}
    <main className="showcase-collection showcase-collection--catalog">
      <header><span className="eyebrow">COLEÇÃO MODLAB</span><h1>Encontre o carro<br />da sua build.</h1><p>Selecione um modelo e abra sua personalização.</p></header>
      <form className="collection-search" onSubmit={searchGarage}>
        <Search size={17} />
        <input value={garageQuery} onChange={(event) => setGarageQuery(event.target.value)} placeholder="Buscar modelo: Opala, Civic, Corolla, GT-R..." aria-label="Buscar carro no catálogo" />
        <button type="submit" disabled={searchingGarage}>{searchingGarage ? 'Buscando...' : 'Buscar modelo'}</button>
      </form>
      <div className="collection-grid">{visibleVehicles.map((car) => { const index = vehicles.findIndex((item) => item.name === car.name); return <button className={vehicleIndex === index ? 'selected' : ''} key={car.name} onClick={() => selectVehicle(index)}>{car.image ? <img src={car.image} alt={car.name} /> : <span className="collection-image-loading"><ImageOff size={22} /> Buscando imagem do modelo</span>}<span><small>BUILD {String(index + 1).padStart(3, '0')}</small><strong>{car.name}</strong><em>{car.power === '—' ? 'Versão necessária para confirmar CV' : `${car.power} cv · Classe ${car.grade}`}</em></span>{vehicleIndex === index && <i><Check size={15} /></i>}</button> })}</div>
      <footer><span><b>{visibleVehicles.length}</b> modelos exibidos · role verticalmente para explorar</span><button onClick={() => setScreen('TUNING')}>Abrir personalização <ChevronRight size={15} /></button></footer>
    </main>
    <footer className="showcase-footer"><span><b>BETA LOCAL FUNCIONAL</b> catálogo persistido neste navegador</span><span><i /> Fotos por ano só aparecem após validação</span></footer>
  </section>
  return <section className="showcase-site" aria-label="Novo conceito visual do Modlab"><header className="showcase-header"><a className="showcase-brand" href="/"><img src="/modlab-logo.png" alt="Modlab" /><strong>MODLAB</strong></a><nav>{['GARAGEM', 'BUILD', 'TUNING', 'MERCADO'].map((item) => <button onClick={() => setScreen(item)} className={item === screen ? 'active' : ''} key={item}>{item}</button>)}</nav><div className="showcase-profile"><i /><span>BETA LOCAL</span></div></header><div className="showcase-subnav"><span>{screen === 'GARAGEM' ? 'GARAGEM / SEUS VEÍCULOS' : screen === 'BUILD' ? 'BUILD / PLANO DE MONTAGEM' : screen === 'MERCADO' ? 'MERCADO / PEÇAS E FORNECEDORES' : 'OFICINA / PERSONALIZAÇÃO'}</span><span>ALTERAÇÕES SALVAS NESTE DISPOSITIVO</span><button onClick={() => setVehicleIndex((index) => (index + 1) % vehicles.length)}><CarFront size={15} /> Trocar veículo</button></div>{screen === 'GARAGEM' ? <main className="showcase-collection"><header><span className="eyebrow">COLEÇÃO MODLAB</span><h1>Escolha a próxima<br />build.</h1><p>Todos os carros deste catálogo podem ser selecionados e configurados no protótipo.</p></header><div className="collection-grid">{vehicles.map((car, index) => <button className={vehicleIndex === index ? 'selected' : ''} key={car.name} onClick={() => selectVehicle(index)}><img src={car.image} alt={car.name} /><span><small>BUILD {String(index + 1).padStart(2, '0')}</small><strong>{car.name}</strong><em>{car.power} cv · Classe {car.grade}</em></span>{vehicleIndex === index && <i><Check size={15} /></i>}</button>)}</div><footer><span><b>{vehicles.length}</b> veículos disponíveis no catálogo local</span><button onClick={() => setScreen('TUNING')}>Abrir personalização <ChevronRight size={15} /></button></footer></main> : screen === 'BUILD' ? <main className="showcase-build"><section><header><span className="eyebrow">BUILD PLAN / {vehicle.name}</span><h1>Plano de montagem</h1><p>Marque cada etapa para acompanhar a montagem de verdade.</p></header><div className="build-track">{['Briefing definido', 'Veículo vinculado', 'Performance', 'Dinâmica'].map((step, index) => <button className={buildSteps[index] ? 'done' : ''} key={step} onClick={() => setBuildSteps((currentSteps) => currentSteps.map((value, stepIndex) => stepIndex === index ? !value : value))}><span>{buildSteps[index] ? <Check size={15} /> : String(index + 1).padStart(2, '0')}</span><div><strong>{step}</strong><small>{buildSteps[index] ? 'Concluído — clique para desfazer' : 'Pendente — clique para concluir'}</small></div></button>)}</div></section><aside><span className="eyebrow">RESUMO DA BUILD</span><div><small>CONFIGURAÇÃO ATUAL</small><strong>{selected}</strong></div><div><small>ETAPAS CONCLUÍDAS</small><strong>{buildSteps.filter(Boolean).length} / {buildSteps.length}</strong></div><div><small>PEÇAS SALVAS</small><strong>{savedParts.length ? `${savedParts.length} · ${currency.format(totalSaved)}` : 'Nenhuma peça'}</strong></div><button onClick={() => setScreen('TUNING')}><Wrench size={16} /> Ajustar configuração</button></aside></main> : screen === 'MERCADO' ? <main className="showcase-market"><header><div><span className="eyebrow">PEÇAS CURADAS</span><h1>Mercado da build</h1><p>Salve peças para levá-las ao resumo da montagem.</p></div><span>{savedParts.length} salvos · {currency.format(totalSaved)}</span></header><div>{marketParts.map((part) => { const savedPart = savedParts.includes(part.name); return <article key={part.name}><span className="market-image"><Gauge size={26} /></span><div><small>{part.type}</small><h3>{part.name}</h3><p>{part.supplier}</p></div><strong>{part.price}</strong><button className={savedPart ? 'saved' : ''} onClick={() => setSavedParts((items) => savedPart ? items.filter((item) => item !== part.name) : [...items, part.name])}>{savedPart ? <Check size={15} /> : <Plus size={15} />}{savedPart ? 'Salvo' : 'Salvar'}</button></article> })}</div></main> : <><main className="showcase-main"><div className="showcase-photo"><img src={vehicle.image} alt={vehicle.name} /><div className="showcase-light" /></div><section className="showcase-identity"><span className="eyebrow">GARAGEM 01 · BUILD ATIVA</span><h1>{vehicle.name}</h1><p>{vehicle.tag}</p><div className="showcase-stats"><article><small>POTÊNCIA</small><strong>{vehicle.power}<em> cv</em></strong></article><article><small>CLASSE</small><strong>{vehicle.grade}</strong></article><article><small>BUILD</small><strong>{vehicle.progress}<em>%</em></strong></article></div><div className="showcase-meter"><span><b>ÍNDICE DE PREPARO</b><b>{vehicle.progress}%</b></span><i style={{ width: `${vehicle.progress}%` }} /></div></section><aside className="showcase-config"><header><span><Icon size={20} /></span><div><small>AJUSTE ATUAL</small><strong>{current.title}</strong></div></header><p>{current.description}</p><div>{current.items.map((item, index) => <button className={selected === item ? 'selected' : ''} key={item} onClick={() => setSelected(item)}><b>{String(index + 1).padStart(2, '0')}</b><span>{item}</span>{selected === item ? <Check size={15} /> : <Plus size={15} />}</button>)}</div><footer><span>SELECIONADO</span><strong>{selected}</strong><button onClick={saveConfiguration}>{configurationSaved ? <><Check size={13} /> Salvo</> : <><Save size={13} /> Salvar ajuste</>}</button></footer></aside></main><nav className="showcase-actions" aria-label="Categorias de personalização">{Object.entries(options).map(([name, option]) => { const ActionIcon = option.icon; return <button className={section === name ? 'active' : ''} key={name} onClick={() => { setSection(name); setSelected(option.items[0]) }}><span><ActionIcon size={21} /></span><strong>{name}</strong><small>{name === 'Performance' ? 'motor & transmissão' : name === 'Visual' ? 'estilo & acabamento' : name === 'Dinâmica' ? 'suspensão & grip' : 'planejamento guiado'}</small></button> })}</nav></>}<footer className="showcase-footer"><span><b>{screen === 'TUNING' ? 'SELECIONE UM MÓDULO' : 'BETA LOCAL FUNCIONAL'}</b> {screen === 'TUNING' ? 'para editar sua build' : 'suas escolhas são persistidas neste navegador'}</span><span><i /> Supabase será a próxima camada de sincronização</span></footer></section>
}

function AppContent({ active, projects, activeProjectName, onNavigate, onAddVehicle, onOpenProject }: { active: number; projects: GarageProject[]; activeProjectName?: string; onNavigate: (index: number) => void; onAddVehicle: (vehicle: VehicleSearchResult) => void; onOpenProject: (project: GarageProject) => void }) {
  const activeProject = projects.find((project) => project.name === activeProjectName)
  if (active === 0) return <Overview onBrowse={() => onNavigate(2)} />
  if (active === 1) return <Garage projects={projects} activeProjectName={activeProjectName} onBrowse={() => onNavigate(2)} onOpenBuild={onOpenProject} />
  if (active === 2) return <ExploreCars onAddVehicle={onAddVehicle} />
  if (active === 3) return <MyBuild project={activeProject} />
  if (active === 4) return <Stages />
  if (active === 5) return <Budget />
  if (active === 6) return <SettingsPage />
  return <DesignLab />
}

export default function App() {
  const isTestPath = () => window.location.pathname === '/teste' || window.location.pathname === '/testes'
  const [active, setActive] = useState(() => isTestPath() ? 7 : 0)
  const [introEntered, setIntroEntered] = useState(false)
  const engineAudioRef = useRef<HTMLAudioElement>(null)
  const engineAudioContextRef = useRef<AudioContext | null>(null)
  const engineGainRef = useRef<GainNode | null>(null)
  const engineEndTimerRef = useRef<number | null>(null)
  const [navOpen, setNavOpen] = useState(false)
  const [activeProjectName, setActiveProjectName] = useState<string>()
  const [projects, setProjects] = useState<GarageProject[]>(() => {
    try { const saved = window.localStorage.getItem('modlab-projects-v2') ?? window.localStorage.getItem('build-lab-projects-v2'); return saved ? JSON.parse(saved) as GarageProject[] : [] }
    catch { return [] }
  })
  const current = navItems[active]
  useEffect(() => { window.localStorage.setItem('modlab-projects-v2', JSON.stringify(projects)) }, [projects])
  useEffect(() => {
    return () => {
      if (engineEndTimerRef.current) window.clearTimeout(engineEndTimerRef.current)
      void engineAudioContextRef.current?.close()
    }
  }, [])
  useEffect(() => {
    const syncRoute = () => setActive(isTestPath() ? 7 : 0)
    window.addEventListener('popstate', syncRoute)
    return () => window.removeEventListener('popstate', syncRoute)
  }, [])
  const navigate = (index: number) => {
    setActive(index)
    const path = index === 7 ? '/teste' : '/'
    if (window.location.pathname !== path) window.history.pushState({}, '', path)
  }
  const addVehicle = (vehicle: VehicleSearchResult) => {
    const vehicleName = `${vehicle.make} ${vehicle.model}`
    const projectName = `${vehicle.model} ${vehicle.year}`
    const car: Car = vehicle.featured ?? { name: vehicleName, spec: `${vehicle.year} • Dados oficiais do modelo`, price: 'A consultar', image: vehicle.image ?? '', category: 'Outros' }
    const nextProject: GarageProject = { car, name: projectName, status: 'Novo projeto', progress: 5, updated: 'Agora' }
    setProjects((currentProjects) => currentProjects.some((project) => project.name === projectName && project.car.name === vehicleName) ? currentProjects : [nextProject, ...currentProjects])
    setActiveProjectName(projectName)
    navigate(1)
  }
  const openProject = (project: GarageProject) => { setActiveProjectName(project.name); navigate(3) }
  const enterWorkshop = async () => {
    if (introEntered) return
    setIntroEntered(true)
    const audio = engineAudioRef.current
    const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!audio || !AudioContextClass) return
    if (!engineAudioContextRef.current) {
      const context = new AudioContextClass()
      const gain = context.createGain()
      context.createMediaElementSource(audio).connect(gain).connect(context.destination)
      engineAudioContextRef.current = context
      engineGainRef.current = gain
    }
    const context = engineAudioContextRef.current
    const gain = engineGainRef.current
    if (!context || !gain) return
    try {
      await context.resume()
      audio.volume = 1
      audio.currentTime = 0
      gain.gain.cancelScheduledValues(context.currentTime)
      gain.gain.setValueAtTime(.72, context.currentTime)
      gain.gain.linearRampToValueAtTime(.0001, context.currentTime + 1.8)
      await audio.play()
      engineEndTimerRef.current = window.setTimeout(() => { audio.pause(); audio.currentTime = 0 }, 1_800)
    } catch { /* A entrada continua mesmo sem saída de áudio disponível. */ }
  }
  const introOverlay = <section className={introEntered ? 'site-intro site-intro--hidden' : 'site-intro site-intro--active'} aria-label="Entrada da oficina"><div className="site-intro__panel"><img src="/modlab-logo.png" alt="Modlab" /><span>MODLAB / PERFORMANCE GARAGE</span><h1>Entre na oficina.</h1><button type="button" onClick={() => void enterWorkshop()}>Entrar na oficina <span>↗</span></button></div></section>
  if (active === 7) return <><audio ref={engineAudioRef} src="/audio/vw-r32-v6.mp3" playsInline preload="auto" />{introOverlay}<DesignLab /></>
  return <><audio ref={engineAudioRef} src="/audio/vw-r32-v6.mp3" playsInline preload="auto" />{introOverlay}<div className="app-shell"><Sidebar active={active} onChange={navigate} open={navOpen} onClose={() => setNavOpen(false)} />{navOpen && <button className="backdrop" onClick={() => setNavOpen(false)} aria-label="Fechar menu" />}<main><header className="page-header"><button className="menu-button" onClick={() => setNavOpen(true)} aria-label="Abrir menu"><Menu size={20} /></button><div><h1>{current.title}</h1>{active !== 1 && <p>{current.description}</p>}</div></header><AppContent active={active} projects={projects} activeProjectName={activeProjectName} onNavigate={navigate} onAddVehicle={addVehicle} onOpenProject={openProject} /></main></div></>
}
