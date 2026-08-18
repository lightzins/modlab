import { useEffect, useMemo, useState, type ComponentType, type FormEvent } from 'react'
import {
  BadgeDollarSign, Bell, CalendarDays, CarFront, Check, CheckSquare, ChevronRight,
  CircleDollarSign, Clock3, Database, Download, Eye, Gauge, GitBranch, Globe2, Grid2X2,
  ImageOff, Languages, LoaderCircle, LogOut, Menu, Moon, MoreHorizontal, Plus, Ruler, Save,
  MessageCircle, Search, Send, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, UserRound,
  Wrench, X, Zap,
} from 'lucide-react'

type NavItem = { label: string; title: string; description: string; icon: ComponentType<{ size?: number; strokeWidth?: number }> }
type Car = { name: string; spec: string; price: string; image: string; category: 'Esportivos' | 'SUVs' | 'Clássicos' | 'Elétricos' | 'Outros' }
type VehicleSearchResult = { id: string; make: string; model: string; year: number; yearLabel?: string; image?: string; description?: string; imageYearMatched?: boolean; imageLabel?: string; featured?: Car }
type GarageProject = { car: Car; name: string; status: string; progress: number; updated: string }
type TuningMessage = { id: number; role: 'assistant' | 'user'; content: string }

const navItems: NavItem[] = [
  { label: 'Visão geral', title: 'Visão geral', description: 'Sua garagem, projetos e próximos passos em um só lugar.', icon: Grid2X2 },
  { label: 'Minha Garagem', title: 'Minha Garagem', description: 'Seus carros e projetos salvos.', icon: CarFront },
  { label: 'Explorar carros', title: 'Explorar carros', description: 'Encontre o próximo carro para sua garagem.', icon: Search },
  { label: 'Tuning IA', title: 'Tuning IA', description: 'Defina seu briefing e planeje a configuração do projeto.', icon: Wrench },
  { label: 'Etapas', title: 'Etapas', description: 'Organize o andamento da sua build.', icon: CheckSquare },
  { label: 'Orçamento', title: 'Orçamento', description: 'Planeje custos, peças e serviços.', icon: BadgeDollarSign },
  { label: 'Configurações', title: 'Configurações', description: 'Personalize sua experiência no Modlab.', icon: Settings },
]

const cars: Car[] = [
  { name: 'Porsche 911 GT3', spec: '502 cv • 0–100 km/h 3,4 s', price: 'R$ 1,2M', image: '/cars/porsche.jpg', category: 'Esportivos' },
  { name: 'Audi RS Q8', spec: '600 cv • 0–100 km/h 3,8 s', price: 'R$ 1,1M', image: '/cars/audi.jpg', category: 'SUVs' },
  { name: 'BMW M5', spec: '635 cv • 0–100 km/h 3,1 s', price: 'R$ 950k', image: '/cars/bmw.jpg', category: 'Esportivos' },
  { name: 'Dodge Challenger', spec: '807 cv • 0–100 km/h 3,4 s', price: 'R$ 820k', image: '/cars/dodge.jpg', category: 'Clássicos' },
  { name: 'Tesla Model S Plaid', spec: '1.020 cv • 0–100 km/h 2,1 s', price: 'R$ 1,4M', image: '/cars/tesla.jpg', category: 'Elétricos' },
  { name: "Ford Mustang ’69", spec: '320 cv • 0–100 km/h 5,6 s', price: 'R$ 680k', image: '/cars/mustang.jpg', category: 'Clássicos' },
]

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

async function findModelImage(make: string, model: string): Promise<Partial<Pick<VehicleSearchResult, 'image' | 'imageLabel'>>> {
  const expectedTokens = normalizeText(`${make} ${model}`).split(' ').filter((token) => token.length > 1)
  const blockedTokens = ['interior', 'dashboard', 'engine', 'wheel', 'logo', 'badge', 'brochure', 'diagram', 'manual']
  const params = new URLSearchParams({ action: 'query', generator: 'search', gsrsearch: `"${make} ${model}"`, gsrnamespace: '6', gsrlimit: '18', prop: 'imageinfo', iiprop: 'url', iiurlwidth: '1100', format: 'json', origin: '*' })
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`)
  if (!response.ok) return {}
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
  return image ? { image, imageLabel: 'Imagem de referência do modelo' } : {}
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
      return { id: `web-${page.pageid}`, make, model: model.join(' ') || title, year: year ?? new Date().getFullYear(), yearLabel: year ? String(year) : 'Todos os anos', image: page.thumbnail?.source, imageLabel: page.thumbnail?.source ? 'Imagem encontrada na internet' : undefined, description: page.extract || 'Modelo encontrado na base pública global.' }
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
    return { id: `catalog-${normalizeText(car.name)}`, make, model: model.join(' '), year: displayYear, yearLabel: year ? String(year) : `Modelo ${photoYear}`, image: car.image, imageYearMatched: photoYear === year, imageLabel: photoYear === year ? `Foto verificada · ${year}` : `Foto verificada do modelo · ${photoYear}`, featured: car }
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
    return { id: `${item.Make_ID}-${item.Model_ID}-${displayYear}`, make, model, year: displayYear, yearLabel: year ? String(year) : 'Todos os anos', image: known?.image, imageYearMatched: Boolean(known && featuredYears[normalizeText(known.name)] === year), imageLabel: known ? `Foto verificada · ${featuredYears[normalizeText(known.name)]}` : undefined, featured: known, description: 'Modelo confirmado no catálogo do fabricante. A imagem só aparece quando foi validada para este modelo.' }
  })
  const internetMatches = await searchInternetVehicles(query, year).catch(() => [])
  const combined = [...catalogMatches, ...classicMatches, ...verified, ...internetMatches]
    .filter((item, index, values) => values.findIndex((candidate) => normalizeText(`${candidate.make} ${candidate.model}`) === normalizeText(`${item.make} ${item.model}`)) === index)
    .slice(0, 12)
  return Promise.all(combined.map(async (vehicle) => vehicle.image ? vehicle : { ...vehicle, ...await findModelImage(vehicle.make, vehicle.model).catch(() => ({})) }))
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
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<TuningMessage[]>([
    { id: 1, role: 'assistant', content: 'Me conte o objetivo da sua build, o uso do carro e a faixa de orçamento. Já deixo o briefing organizado para a análise técnica.' },
  ])
  const togglePart = (id: string) => setSelectedParts((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const progress = Math.min(25 + selectedParts.length * 15, 100)
  const sendMessage = (event: FormEvent) => {
    event.preventDefault()
    const content = message.trim()
    if (!content || !project) return
    const id = Date.now()
    setMessages((current) => [...current, { id, role: 'user', content }, { id: id + 1, role: 'assistant', content: `Briefing registrado para ${project.car.name}. A conexão com a IA ainda está em preparação; quando o Supabase e a chave do modelo estiverem configurados, vou devolver compatibilidade, etapas e estimativa para “${objective}”.` }])
    setMessage('')
  }
  if (!project) return <section className="content-page empty-tab"><Wrench size={30} strokeWidth={1.4} /><h2>Selecione um carro primeiro.</h2><p>Abra um projeto da sua garagem para configurar a build certa.</p></section>
  const garageModes = [
    { id: 'performance', label: 'Performance', detail: 'Motor, freios e dinâmica', icon: Gauge },
    { id: 'visual', label: 'Visual', detail: 'Rodas, cor e acabamento', icon: Sparkles },
    { id: 'setup', label: 'Acerto', detail: 'Suspensão e comportamento', icon: SlidersHorizontal },
    { id: 'assistant', label: 'Assistente IA', detail: 'Planejar com orientação', icon: MessageCircle },
  ]
  return <section className="content-page build-page"><section className="workshop-bay" aria-label="Garagem de personalização"><div className="workshop-scene">{project.car.image ? <img src={project.car.image} alt={project.car.name} /> : <div className="build-no-image"><ImageOff size={30} /><span>Imagem não validada</span></div>}<div className="workshop-vignette" /></div><div className="workshop-info"><span className="eyebrow">OFICINA MODLAB · PROJETO ATIVO</span><h2>{project.car.name}</h2><p>{project.name}</p><div className="workshop-stats"><span><small>POTÊNCIA</small><b>{project.car.spec.split(' • ')[0]}</b></span><span><small>STATUS</small><b>{progress}% planejado</b></span></div><div className="progress-row"><span><b>Progresso da build</b><b>{progress}%</b></span><div><i style={{ width: `${progress}%` }} /></div></div></div><div className="workshop-controls" aria-label="Ações da garagem"><button className="secondary-action"><CarFront size={15} /> Ver veículo</button><button className="secondary-action"><MoreHorizontal size={17} /> Opções</button></div></section><div className="garage-mode-grid">{garageModes.map((mode) => { const Icon = mode.icon; return <button key={mode.id} className={`garage-mode ${activeMode === mode.id ? 'active' : ''}`} onClick={() => setActiveMode(mode.id)}><span><Icon size={21} /></span><div><strong>{mode.label}</strong><small>{mode.detail}</small></div><ChevronRight size={17} /></button> })}</div>{saved && <div className="success-note"><Check size={15} /> Build salva com sucesso.</div>}<div className="section-title"><div><span className="eyebrow">{activeMode === 'visual' ? 'ESTILO E ACABAMENTO' : activeMode === 'setup' ? 'DINÂMICA DO VEÍCULO' : 'UPGRADES DO PROJETO'}</span><h2>{activeMode === 'visual' ? 'Personalização visual' : activeMode === 'setup' ? 'Acerto de pista e rua' : 'Componentes de referência'}</h2><p>Marque itens iniciais; a IA vai validar compatibilidade após a conexão.</p></div><button className="primary-action" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 2400) }}><Save size={15} /> Salvar build</button></div><div className="parts-grid">{buildParts.map((part) => { const Icon = part.icon; const selected = selectedParts.includes(part.id); return <button className={`part-card ${selected ? 'selected' : ''}`} key={part.id} onClick={() => togglePart(part.id)}><span className="part-icon"><Icon size={20} /></span><span><strong>{part.name}</strong><small>{part.detail}</small></span><b>{part.price}</b><i>{selected ? <Check size={14} /> : <Plus size={14} />}</i></button> })}</div><div className="tuning-layout"><section className="tuning-chat"><header><span className="tuning-chat-icon"><MessageCircle size={18} /></span><div><strong>Assistente de Tuning</strong><small>Briefing técnico do projeto</small></div><span className="connection-status"><i /> Preparando conexão</span></header><div className="tuning-messages" aria-live="polite">{messages.map((item) => <div className={`tuning-message ${item.role}`} key={item.id}><span>{item.role === 'assistant' ? 'ML' : 'Você'}</span><p>{item.content}</p></div>)}</div><form className="tuning-composer" onSubmit={sendMessage}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ex.: quero 300 cv confiáveis para uso diário" aria-label="Mensagem para o assistente" /><button type="submit" aria-label="Enviar mensagem"><Send size={16} /></button></form></section><aside className="tuning-context"><div className="tuning-context-title"><div><span className="eyebrow">CONTEXTO DA IA</span><h2>Seu briefing</h2></div><ShieldCheck size={20} /></div><label><small>OBJETIVO</small><select value={objective} onChange={(event) => setObjective(event.target.value)}><option>Rua com performance</option><option>Track day</option><option>Arrancada</option><option>Restomod</option><option>Off-road</option></select></label><label><small>ORÇAMENTO ESTIMADO</small><input value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="Ex.: R$ 25.000" /></label><div className="tuning-vehicle"><small>VEÍCULO VINCULADO</small><strong>{project.car.name}</strong><span>{project.car.spec}</span></div><p className="tuning-disclaimer">O chat já registra seu briefing localmente nesta sessão. A análise por IA será ativada pela função segura do Supabase, sem expor a chave do modelo no navegador.</p></aside></div></section>
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
    <div className="settings-profile"><span><UserRound size={28} /></span><div><strong>lightzins</strong><small>Conta Modlab conectada ao GitHub</small><em><GitBranch size={12} /> github.com/lightzins</em></div><button className="secondary-action">Editar perfil</button></div>
    <div className="settings-section-title"><div><h2>Preferências gerais</h2><p>Personalize como o Modlab funciona para você.</p></div></div>
    <div className="settings-grid"><article className="settings-card"><header><span className="setting-icon"><Bell size={18} /></span><div><strong>Notificações</strong><small>Atualizações sobre etapas e orçamento.</small></div></header><Toggle enabled={notifications} onChange={() => setNotifications(!notifications)} /></article><article className="settings-card"><header><span className="setting-icon"><Moon size={18} /></span><div><strong>Tema escuro</strong><small>Interface otimizada para baixa luminosidade.</small></div></header><Toggle enabled={darkMode} onChange={() => setDarkMode(!darkMode)} /></article><article className="settings-card"><header><span className="setting-icon"><Save size={18} /></span><div><strong>Salvar automaticamente</strong><small>Preservar alterações enquanto você trabalha.</small></div></header><Toggle enabled={autoSave} onChange={() => setAutoSave(!autoSave)} /></article><article className="settings-card"><header><span className="setting-icon"><Eye size={18} /></span><div><strong>Perfil público</strong><small>Permitir que outras pessoas vejam suas builds.</small></div></header><Toggle enabled={publicProfile} onChange={() => setPublicProfile(!publicProfile)} /></article></div>
    <div className="settings-section-title"><div><h2>Localização e medidas</h2><p>Formatos usados nos carros, peças e valores.</p></div></div>
    <div className="preference-list"><label><span className="setting-icon"><Languages size={18} /></span><span><strong>Idioma</strong><small>Idioma principal da interface.</small></span><select value={language} onChange={(event) => setLanguage(event.target.value)}><option>Português (Brasil)</option><option>English</option><option>Español</option></select></label><label><span className="setting-icon"><Ruler size={18} /></span><span><strong>Unidades</strong><small>Medidas de distância e potência.</small></span><select value={units} onChange={(event) => setUnits(event.target.value)}><option>Métrico (km, cv)</option><option>Imperial (mi, hp)</option></select></label><label><span className="setting-icon"><CircleDollarSign size={18} /></span><span><strong>Moeda</strong><small>Formato de valores do orçamento.</small></span><select value={currencySetting} onChange={(event) => setCurrencySetting(event.target.value)}><option>Real brasileiro (R$)</option><option>Dólar americano (US$)</option><option>Euro (€)</option></select></label></div>
    <div className="settings-section-title"><div><h2>Dados e conta</h2><p>Gerencie os dados salvos no seu perfil.</p></div></div>
    <div className="account-actions"><button><Download size={16} /><span><strong>Exportar meus dados</strong><small>Baixe projetos e orçamentos em um arquivo.</small></span><ChevronRight size={16} /></button><button><Globe2 size={16} /><span><strong>Privacidade e segurança</strong><small>Revise permissões e visibilidade.</small></span><ChevronRight size={16} /></button><button className="danger-action"><Trash2 size={16} /><span><strong>Excluir todos os projetos</strong><small>Esta ação não poderá ser desfeita.</small></span><ChevronRight size={16} /></button><button><LogOut size={16} /><span><strong>Sair da conta</strong><small>Desconectar esta sessão do Modlab.</small></span><ChevronRight size={16} /></button></div>
  </section>
}

function AppContent({ active, projects, activeProjectName, onNavigate, onAddVehicle, onOpenProject }: { active: number; projects: GarageProject[]; activeProjectName?: string; onNavigate: (index: number) => void; onAddVehicle: (vehicle: VehicleSearchResult) => void; onOpenProject: (project: GarageProject) => void }) {
  const activeProject = projects.find((project) => project.name === activeProjectName)
  if (active === 0) return <Overview onBrowse={() => onNavigate(2)} />
  if (active === 1) return <Garage projects={projects} activeProjectName={activeProjectName} onBrowse={() => onNavigate(2)} onOpenBuild={onOpenProject} />
  if (active === 2) return <ExploreCars onAddVehicle={onAddVehicle} />
  if (active === 3) return <MyBuild project={activeProject} />
  if (active === 4) return <Stages />
  if (active === 5) return <Budget />
  return <SettingsPage />
}

export default function App() {
  const [active, setActive] = useState(0)
  const [navOpen, setNavOpen] = useState(false)
  const [activeProjectName, setActiveProjectName] = useState<string>()
  const [projects, setProjects] = useState<GarageProject[]>(() => {
    try { const saved = window.localStorage.getItem('modlab-projects-v2') ?? window.localStorage.getItem('build-lab-projects-v2'); return saved ? JSON.parse(saved) as GarageProject[] : [] }
    catch { return [] }
  })
  const current = navItems[active]
  useEffect(() => { window.localStorage.setItem('modlab-projects-v2', JSON.stringify(projects)) }, [projects])
  const addVehicle = (vehicle: VehicleSearchResult) => {
    const vehicleName = `${vehicle.make} ${vehicle.model}`
    const projectName = `${vehicle.model} ${vehicle.year}`
    const car: Car = vehicle.featured ?? { name: vehicleName, spec: `${vehicle.year} • Dados oficiais do modelo`, price: 'A consultar', image: vehicle.image ?? '', category: 'Outros' }
    const nextProject: GarageProject = { car, name: projectName, status: 'Novo projeto', progress: 5, updated: 'Agora' }
    setProjects((currentProjects) => currentProjects.some((project) => project.name === projectName && project.car.name === vehicleName) ? currentProjects : [nextProject, ...currentProjects])
    setActiveProjectName(projectName)
    setActive(1)
  }
  const openProject = (project: GarageProject) => { setActiveProjectName(project.name); setActive(3) }
  return <div className="app-shell"><Sidebar active={active} onChange={setActive} open={navOpen} onClose={() => setNavOpen(false)} />{navOpen && <button className="backdrop" onClick={() => setNavOpen(false)} aria-label="Fechar menu" />}<main><header className="page-header"><button className="menu-button" onClick={() => setNavOpen(true)} aria-label="Abrir menu"><Menu size={20} /></button><div><h1>{current.title}</h1>{active !== 1 && <p>{current.description}</p>}</div></header><AppContent active={active} projects={projects} activeProjectName={activeProjectName} onNavigate={setActive} onAddVehicle={addVehicle} onOpenProject={openProject} /></main></div>
}
