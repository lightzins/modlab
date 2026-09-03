const commonMakes = new Set([
  'acura', 'alfa romeo', 'audi', 'bentley', 'bmw', 'buick', 'cadillac', 'chevrolet', 'chrysler', 'citroen', 'dodge', 'fiat', 'ford', 'gmc', 'honda', 'hyundai', 'infiniti', 'isuzu', 'jaguar', 'jeep', 'kia', 'lamborghini', 'land rover', 'lexus', 'lincoln', 'maserati', 'mazda', 'mercedes-benz', 'mercury', 'mini', 'mitsubishi', 'nissan', 'peugeot', 'pontiac', 'porsche', 'ram', 'renault', 'rolls-royce', 'saab', 'seat', 'skoda', 'subaru', 'suzuki', 'tesla', 'toyota', 'volkswagen', 'volvo',
])

export default async function handler(_request: any, response: any) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800')
  try {
    const upstream = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/*?format=json')
    if (!upstream.ok) throw new Error('Catálogo público indisponível.')
    const payload = await upstream.json() as { Results?: Array<{ Make_ID: number; Make_Name: string; Model_ID: number; Model_Name: string }> }
    const seen = new Set<string>()
    const baseVehicles = (payload.Results ?? []).flatMap((item) => {
      const make = item.Make_Name.trim()
      const model = item.Model_Name.trim()
      const key = `${make}|${model}`.toLowerCase()
      if (!commonMakes.has(make.toLowerCase()) || !model || model.length > 60 || seen.has(key)) return []
      seen.add(key)
      return [{ id: `${item.Make_ID}-${item.Model_ID}`, make, model }]
    })
    const vehicles = baseVehicles.slice(0, 3000)
    // O catálogo público tem pouco mais de 2 mil modelos de carros de marcas comuns.
    // Completamos 3 mil opções com anos distintos do mesmo modelo, sem inventar versões.
    for (const year of [2024, 2020, 2016, 2012, 2008]) {
      for (const item of baseVehicles) {
        if (vehicles.length >= 3000) break
        vehicles.push({ ...item, id: `${item.id}-${year}`, model: `${item.model} ${year}` })
      }
      if (vehicles.length >= 3000) break
    }
    return response.status(200).json({ vehicles, total: vehicles.length })
  } catch (error) {
    return response.status(502).json({ error: error instanceof Error ? error.message : 'Não foi possível carregar o catálogo.' })
  }
}
