type FipeBrand = { code: string; name: string }
type FipeModel = { code: string; name: string }
type CatalogVehicle = { id: string; make: string; model: string }

const FIPE_CARS_API = 'https://fipe.parallelum.com.br/api/v2/cars'
const CATALOG_SIZE = 3000

// A ordem privilegia marcas com presença forte no Brasil. A rota da FIPE é
// exclusivamente de carros, portanto motos não fazem parte deste catálogo.
const priorityBrands = [
  'GM - Chevrolet', 'VW - VolksWagen', 'Fiat', 'Ford', 'Honda', 'Toyota',
  'Hyundai', 'Renault', 'Nissan', 'Jeep', 'Peugeot', 'Citroën', 'Mitsubishi',
  'Kia Motors', 'BMW', 'Mercedes-Benz', 'Audi', 'Volvo', 'Land Rover', 'MINI',
  'Suzuki', 'Subaru', 'Porsche', 'RAM', 'Dodge', 'Chery', 'BYD', 'GWM',
  'Caoa Chery', 'JAC', 'Lexus', 'Jaguar', 'Mazda', 'Acura', 'Volkswagen',
]

// Estes aparecem primeiro para que a navegação inicial mostre carros comuns
// nas ruas brasileiras, antes das versões históricas da base FIPE.
const featuredModels: Array<[string, string]> = [
  ['Chevrolet', 'Onix'], ['Chevrolet', 'Onix Plus'], ['Chevrolet', 'Tracker'], ['Chevrolet', 'S10'], ['Chevrolet', 'Corsa'], ['Chevrolet', 'Celta'], ['Chevrolet', 'Cruze'], ['Chevrolet', 'Vectra'],
  ['VolksWagen', 'Polo'], ['VolksWagen', 'T-Cross'], ['VolksWagen', 'Nivus'], ['VolksWagen', 'Virtus'], ['VolksWagen', 'Gol'], ['VolksWagen', 'Saveiro'], ['VolksWagen', 'Jetta'],
  ['Fiat', 'Strada'], ['Fiat', 'Argo'], ['Fiat', 'Mobi'], ['Fiat', 'Cronos'], ['Fiat', 'Toro'], ['Fiat', 'Pulse'], ['Fiat', 'Fastback'], ['Fiat', 'Uno'], ['Fiat', 'Palio'],
  ['Hyundai', 'HB20'], ['Hyundai', 'Creta'], ['Toyota', 'Corolla'], ['Toyota', 'Hilux'], ['Toyota', 'Yaris'], ['Honda', 'Civic'], ['Honda', 'City'], ['Honda', 'HR-V'],
  ['Renault', 'Kwid'], ['Renault', 'Duster'], ['Renault', 'Sandero'], ['Nissan', 'Kicks'], ['Nissan', 'Versa'], ['Jeep', 'Renegade'], ['Jeep', 'Compass'],
  ['Ford', 'Ranger'], ['Ford', 'Maverick'], ['Ford', 'Ka'], ['Ford', 'EcoSport'], ['Peugeot', '208'], ['Citroën', 'C3'], ['Mitsubishi', 'L200 Triton'],
]

let cachedVehicles: CatalogVehicle[] | null = null

function normalized(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

async function getJson<T>(url: string): Promise<T> {
  const result = await fetch(url)
  if (!result.ok) throw new Error(`FIPE respondeu ${result.status}`)
  return result.json() as Promise<T>
}

async function buildCatalog() {
  const brands = await getJson<FipeBrand[]>(`${FIPE_CARS_API}/brands`)
  const chosenBrands = priorityBrands
    .map((wanted) => brands.find((brand) => normalized(brand.name) === normalized(wanted)))
    .filter((brand): brand is FipeBrand => Boolean(brand))

  const modelLists = await Promise.all(chosenBrands.map(async (brand) => ({
    brand,
    models: await getJson<FipeModel[]>(`${FIPE_CARS_API}/brands/${brand.code}/models`),
  })))

  const seen = new Set<string>()
  const vehicles: CatalogVehicle[] = featuredModels.map(([make, model], index) => {
    seen.add(`${normalized(make)}:${normalized(model)}`)
    return { id: `featured-${index + 1}`, make, model }
  })
  for (const { brand, models } of modelLists) {
    for (const model of models) {
      const name = model.name.trim()
      const make = brand.name.replace(/^GM - /, '').replace(/^VW - /, '')
      const identity = `${normalized(make)}:${normalized(name)}`
      if (!name || seen.has(identity)) continue
      seen.add(identity)
      vehicles.push({
        id: `fipe-${brand.code}-${model.code}`,
        make,
        model: name,
      })
      if (vehicles.length === CATALOG_SIZE) return vehicles
    }
  }

  return vehicles
}

export default async function handler(_request: any, response: any) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800')

  try {
    cachedVehicles ??= await buildCatalog()
    return response.status(200).json({ vehicles: cachedVehicles, total: cachedVehicles.length, source: 'FIPE carros' })
  } catch (error) {
    console.error('Não foi possível carregar o catálogo FIPE', error)
    return response.status(503).json({ error: 'Catálogo de carros temporariamente indisponível.' })
  }
}
