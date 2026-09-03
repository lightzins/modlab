type BrazilianCar = { make: string; model: string }

// Catálogo curado: carros de passeio, SUVs e picapes conhecidos no Brasil.
// Cada entrada é expandida por ano, para oferecer 3.000 opções sem misturar motos.
const brazilianCars: BrazilianCar[] = [
  ...['Onix', 'Onix Plus', 'Corsa', 'Celta', 'Prisma', 'Classic', 'Cruze', 'S10', 'Tracker', 'Spin', 'Montana', 'Astra', 'Vectra', 'Blazer'].map((model) => ({ make: 'Chevrolet', model })),
  ...['Gol', 'Polo', 'T-Cross', 'Nivus', 'Virtus', 'Jetta', 'Passat', 'Voyage', 'Saveiro', 'Fox', 'Up', 'Santana', 'Parati', 'Tiguan'].map((model) => ({ make: 'Volkswagen', model })),
  ...['Uno', 'Palio', 'Siena', 'Strada', 'Argo', 'Mobi', 'Cronos', 'Toro', 'Pulse', 'Fastback', 'Idea', 'Punto', 'Bravo', 'Doblo', 'Fiorino', 'Tempra'].map((model) => ({ make: 'Fiat', model })),
  ...['Ka', 'Fiesta', 'Focus', 'EcoSport', 'Ranger', 'Fusion', 'Territory', 'Maverick', 'Courier', 'Escort'].map((model) => ({ make: 'Ford', model })),
  ...['Civic', 'City', 'Fit', 'HR-V', 'CR-V', 'Accord', 'WR-V'].map((model) => ({ make: 'Honda', model })),
  ...['Corolla', 'Etios', 'Yaris', 'Hilux', 'SW4', 'RAV4', 'Camry'].map((model) => ({ make: 'Toyota', model })),
  ...['HB20', 'HB20S', 'Creta', 'Tucson', 'i30', 'Santa Fe', 'Azera', 'Veloster'].map((model) => ({ make: 'Hyundai', model })),
  ...['Kwid', 'Sandero', 'Logan', 'Duster', 'Captur', 'Megane', 'Clio', 'Scenic', 'Kangoo'].map((model) => ({ make: 'Renault', model })),
  ...['Versa', 'Sentra', 'Kicks', 'March', 'Frontier', 'Tiida', 'Livina', 'X-Terra'].map((model) => ({ make: 'Nissan', model })),
  ...['Renegade', 'Compass', 'Commander', 'Wrangler', 'Cherokee'].map((model) => ({ make: 'Jeep', model })),
  ...['206', '207', '208', '2008', '3008', '307', '308', 'Partner'].map((model) => ({ make: 'Peugeot', model })),
  ...['C3', 'C4', 'C4 Cactus', 'Aircross', 'Xsara Picasso', 'Berlingo'].map((model) => ({ make: 'Citroën', model })),
  ...['Lancer', 'ASX', 'Outlander', 'Pajero', 'Eclipse Cross', 'Triton'].map((model) => ({ make: 'Mitsubishi', model })),
  ...['Picanto', 'Cerato', 'Soul', 'Sportage', 'Sorento', 'Rio', 'Carnival'].map((model) => ({ make: 'Kia', model })),
  ...['320i', '328i', 'M3', 'X1', 'X3', 'X5'].map((model) => ({ make: 'BMW', model })),
  ...['C 180', 'C 200', 'A 200', 'GLA 200', 'GLB 200', 'Sprinter'].map((model) => ({ make: 'Mercedes-Benz', model })),
  ...['A3', 'A4', 'Q3', 'Q5', 'TT'].map((model) => ({ make: 'Audi', model })),
  ...['Forester', 'Impreza', 'Legacy', 'Outback', 'XV'].map((model) => ({ make: 'Subaru', model })),
  ...['Cayenne', 'Macan', 'Panamera', '911', 'Boxster'].map((model) => ({ make: 'Porsche', model })),
]

export default function handler(_request: any, response: any) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800')
  const vehicles = Array.from({ length: 3000 }, (_, index) => {
    const car = brazilianCars[index % brazilianCars.length]
    const year = 2025 - Math.floor(index / brazilianCars.length)
    return { id: `${car.make}-${car.model}-${year}`.toLowerCase().replace(/\s+/g, '-'), make: car.make, model: `${car.model} ${year}` }
  })
  return response.status(200).json({ vehicles, total: vehicles.length })
}
