// EF Register v1.0 — DEFRA 2025, GWP basis IPCC AR5.
// This module is the single source of truth for the entry cascade and the maths.
// Natural gas is on a Gross Calorific Value basis.

export const PLANTS = [
  { plant_id: 'TC-FAC-001', plant_name: 'TC-FAC-001 — Vietnam', country: 'Vietnam' },
  { plant_id: 'TC-FAC-002', plant_name: 'TC-FAC-002 — Mexico', country: 'Mexico' },
  { plant_id: 'TC-FAC-003', plant_name: 'TC-FAC-003 — China', country: 'China' },
  { plant_id: 'TC-FAC-004', plant_name: 'TC-FAC-004 — Poland', country: 'Poland' },
  { plant_id: 'TC-FAC-005', plant_name: 'TC-FAC-005 — India', country: 'India' },
]

// Year dropdown range (Open Question default: 2022–2026).
export const YEARS = [2026, 2025, 2024, 2023, 2022]

const ALL_PLANTS = PLANTS.map((p) => p.plant_id)

// ef_id, scope, category, fuel, unit, ef_kgco2e, status, appliesTo[]
// montrealProtocol: R-22 is calculated but EXCLUDED from the Scope 1 total (memo line only).
export const EF_REGISTER = [
  { ef_id: 'EF-S1-001', scope: 'Scope 1', category: 'Stationary Combustion', fuel: 'Diesel',           unit: 'litres',          ef_kgco2e: 2.57082,  status: 'PRIMARY',     appliesTo: ['TC-FAC-001', 'TC-FAC-003', 'TC-FAC-004', 'TC-FAC-005'] },
  { ef_id: 'EF-S1-002', scope: 'Scope 1', category: 'Stationary Combustion', fuel: 'LPG',              unit: 'litres',          ef_kgco2e: 1.55713,  status: 'PRIMARY',     appliesTo: ['TC-FAC-001', 'TC-FAC-002', 'TC-FAC-005'] },
  { ef_id: 'EF-S1-003', scope: 'Scope 1', category: 'Stationary Combustion', fuel: 'Natural gas',      unit: 'kWh (Gross CV)',  ef_kgco2e: 0.18296,  status: 'PRIMARY',     appliesTo: ['TC-FAC-002', 'TC-FAC-003', 'TC-FAC-004'] },
  { ef_id: 'EF-S1-004', scope: 'Scope 1', category: 'Mobile Combustion',     fuel: 'Diesel',           unit: 'litres',          ef_kgco2e: 2.57082,  status: 'PRIMARY',     appliesTo: ALL_PLANTS },
  { ef_id: 'EF-S1-005', scope: 'Scope 1', category: 'Mobile Combustion',     fuel: 'Petrol',           unit: 'litres',          ef_kgco2e: 2.06916,  status: 'PRIMARY',     appliesTo: ALL_PLANTS },
  { ef_id: 'EF-S1-006', scope: 'Scope 1', category: 'Fugitive Emissions',    fuel: 'R-410A',           unit: 'kg',              ef_kgco2e: 1924,     status: 'PRIMARY',     appliesTo: ['TC-FAC-001', 'TC-FAC-002', 'TC-FAC-003', 'TC-FAC-005'] },
  { ef_id: 'EF-S1-007', scope: 'Scope 1', category: 'Fugitive Emissions',    fuel: 'R-134a',           unit: 'kg',              ef_kgco2e: 1300,     status: 'PRIMARY',     appliesTo: ['TC-FAC-001', 'TC-FAC-003', 'TC-FAC-004'] },
  { ef_id: 'EF-S1-008', scope: 'Scope 1', category: 'Fugitive Emissions',    fuel: 'R-32',             unit: 'kg',              ef_kgco2e: 677,      status: 'PRIMARY',     appliesTo: ['TC-FAC-002'] },
  { ef_id: 'EF-S1-009', scope: 'Scope 1', category: 'Fugitive Emissions',    fuel: 'SF6',              unit: 'kg',              ef_kgco2e: 23500,    status: 'PRIMARY',     appliesTo: ['TC-FAC-004'] },
  { ef_id: 'EF-S1-010', scope: 'Scope 1', category: 'Fugitive Emissions',    fuel: 'R-22',             unit: 'kg',              ef_kgco2e: 1760,     status: 'PRIMARY',     appliesTo: ['TC-FAC-005'], montrealProtocol: true },
  { ef_id: 'EF-S2-L01', scope: 'Scope 2', category: 'Purchased Electricity', fuel: 'Grid electricity', unit: 'kWh',             ef_kgco2e: 0.681,    status: 'PRIMARY',     appliesTo: ['TC-FAC-001'] },
  { ef_id: 'EF-S2-L02', scope: 'Scope 2', category: 'Purchased Electricity', fuel: 'Grid electricity', unit: 'kWh',             ef_kgco2e: 0.444,    status: 'PRIMARY',     appliesTo: ['TC-FAC-002'] },
  { ef_id: 'EF-S2-L03', scope: 'Scope 2', category: 'Purchased Electricity', fuel: 'Grid electricity', unit: 'kWh',             ef_kgco2e: 0.5306,   status: 'PRIMARY',     appliesTo: ['TC-FAC-003'] },
  { ef_id: 'EF-S2-L04', scope: 'Scope 2', category: 'Purchased Electricity', fuel: 'Grid electricity', unit: 'kWh',             ef_kgco2e: 0.597,    status: 'PRIMARY',     appliesTo: ['TC-FAC-004'] },
  { ef_id: 'EF-S2-L05', scope: 'Scope 2', category: 'Purchased Electricity', fuel: 'Grid electricity', unit: 'kWh',             ef_kgco2e: 0.7117,   status: 'PRIMARY',     appliesTo: ['TC-FAC-005'] },
  { ef_id: 'EF-S2-DH01', scope: 'Scope 2', category: 'Purchased Heat',       fuel: 'District heating', unit: 'kWh',             ef_kgco2e: 0.33,     status: 'PROVISIONAL', appliesTo: ['TC-FAC-004'] },
]

export function plantById(id) {
  return PLANTS.find((p) => p.plant_id === id) || null
}

// Distinct categories valid for a plant, in register order.
export function categoriesForPlant(plantId) {
  const out = []
  for (const row of EF_REGISTER) {
    if (row.appliesTo.includes(plantId) && !out.includes(row.category)) out.push(row.category)
  }
  return out
}

// Fuels/substances valid for a plant + category, in register order.
export function fuelsForPlantCategory(plantId, category) {
  return EF_REGISTER.filter(
    (r) => r.appliesTo.includes(plantId) && r.category === category,
  ).map((r) => r.fuel)
}

// The single matching register row for a plant + category + fuel (unique by construction).
export function efRow(plantId, category, fuel) {
  return (
    EF_REGISTER.find(
      (r) => r.appliesTo.includes(plantId) && r.category === category && r.fuel === fuel,
    ) || null
  )
}
