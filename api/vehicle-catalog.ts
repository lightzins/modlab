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
  const vehicles: CatalogVehicle[] = []
  for (const { brand, models } of modelLists) {
    for (const model of models) {
      const name = model.name.trim()
      const identity = `${normalized(brand.name)}:${normalized(name)}`
      if (!name || seen.has(identity)) continue
      seen.add(identity)
      vehicles.push({
        id: `fipe-${brand.code}-${model.code}`,
        make: brand.name.replace(/^GM - /, '').replace(/^VW - /, ''),
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
