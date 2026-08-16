import { useState, type ComponentType } from 'react'
import {
  BadgeDollarSign,
  CarFront,
  CheckSquare,
  Grid2X2,
  Menu,
  Search,
  Settings,
  SlidersHorizontal,
  Wrench,
  X,
} from 'lucide-react'

type NavItem = {
  label: string
  title: string
  description: string
  icon: ComponentType<{ size?: number; strokeWidth?: number }>
}

const navItems: NavItem[] = [
  { label: 'Visão geral', title: 'Visão geral', description: 'Sua garagem, projetos e próximos passos em um só lugar.', icon: Grid2X2 },
  { label: 'Minha Garagem', title: 'Minha Garagem', description: 'Seus carros e projetos salvos.', icon: CarFront },
  { label: 'Explorar carros', title: 'Explorar carros', description: 'Encontre o próximo carro para sua garagem.', icon: Search },
  { label: 'Minha build', title: 'Minha build', description: 'Monte e acompanhe a configuração do seu projeto.', icon: Wrench },
  { label: 'Etapas', title: 'Etapas', description: 'Organize o andamento da sua build.', icon: CheckSquare },
  { label: 'Orçamento', title: 'Orçamento', description: 'Planeje custos, peças e serviços.', icon: BadgeDollarSign },
  { label: 'Configurações', title: 'Configurações', description: 'Personalize sua experiência no Build Lab.', icon: Settings },
]

const cars = [
  { name: 'Porsche 911 GT3', spec: '502 cv • 0–100 km/h 3,4 s', price: 'R$ 1,2M', image: '/cars/porsche.png' },
  { name: 'Audi RS Q8', spec: '600 cv • 0–100 km/h 3,8 s', price: 'R$ 1,1M', image: '/cars/audi.png' },
  { name: 'BMW M5', spec: '635 cv • 0–100 km/h 3,1 s', price: 'R$ 950k', image: '/cars/bmw.png' },
  { name: 'Dodge Challenger', spec: '807 cv • 0–100 km/h 3,4 s', price: 'R$ 820k', image: '/cars/dodge.png' },
  { name: 'Tesla Model S Plaid', spec: '1.020 cv • 0–100 km/h 2,1 s', price: 'R$ 1,4M', image: '/cars/tesla.png' },
  { name: "Ford Mustang ’69", spec: '320 cv • 0–100 km/h 5,6 s', price: 'R$ 680k', image: '/cars/mustang.png' },
]

function Sidebar({ active, onChange, open, onClose }: { active: number; onChange: (index: number) => void; open: boolean; onClose: () => void }) {
  return (
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <button className="close-nav" onClick={onClose} aria-label="Fechar menu"><X size={19} /></button>
      <div className="brand">BUILD LAB<span /></div>
      <nav aria-label="Navegação principal">
        {navItems.map((item, index) => {
          const Icon = item.icon
          return (
            <button key={item.label} className={active === index ? 'nav-item active' : 'nav-item'} onClick={() => { onChange(index); onClose() }}>
              <Icon size={16} strokeWidth={1.7} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

function Overview() {
  const [query, setQuery] = useState('')
  const visibleCars = cars.filter((car) => car.name.toLowerCase().includes(query.toLowerCase()))
  return (
    <>
      <section className="hero">
        <h2>Todo projeto começa com um plano.</h2>
        <p>Adicione o primeiro veículo para começar a construir sua garagem digital.</p>
      </section>
      <section className="models">
        <div className="section-head">
          <h2>Explore modelos</h2>
          <label className="search-box">
            <SlidersHorizontal size={15} aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar modelos" aria-label="Buscar modelos" />
            <Search size={16} aria-hidden="true" />
          </label>
        </div>
        <div className="car-grid">
          {visibleCars.map((car) => (
            <article className="car-card" key={car.name}>
              <img src={car.image} alt={car.name} />
              <div className="car-info">
                <h3>{car.name}</h3>
                <p>{car.spec}</p>
                <div><strong>{car.price}</strong><button>Explorar</button></div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

function Garage() {
  return (
    <section className="garage" aria-label="Seus projetos">
      <div className="garage-hero">
        <h2><span>Seus</span><span>Projetos</span></h2>
      </div>
      <div className="project-grid" aria-label="Projetos da garagem">
        {Array.from({ length: 6 }, (_, index) => (
          <button className="project-slot" key={index} aria-label={`Projeto ${index + 1}`} />
        ))}
      </div>
    </section>
  )
}

function EmptyTab({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <section className="empty-tab">
      <Icon size={30} strokeWidth={1.4} />
      <h2>{item.title}</h2>
      <p>{item.description}</p>
    </section>
  )
}

export default function App() {
  const [active, setActive] = useState(0)
  const [navOpen, setNavOpen] = useState(false)
  const current = navItems[active]
  return (
    <div className="app-shell">
      <Sidebar active={active} onChange={setActive} open={navOpen} onClose={() => setNavOpen(false)} />
      {navOpen && <button className="backdrop" onClick={() => setNavOpen(false)} aria-label="Fechar menu" />}
      <main>
        <header className="page-header">
          <button className="menu-button" onClick={() => setNavOpen(true)} aria-label="Abrir menu"><Menu size={20} /></button>
          <div><h1>{current.title}</h1>{active !== 1 && <p>{current.description}</p>}</div>
        </header>
        {active === 0 ? <Overview /> : active === 1 ? <Garage /> : <EmptyTab item={current} />}
      </main>
    </div>
  )
}
