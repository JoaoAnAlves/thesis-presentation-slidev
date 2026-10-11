// Line icons for the three stations (24 × 24 viewBox, drawn with stroke only).
// Shared by FactoryFloor (slide 6) and ArchitectureTiers (slide 7) so both
// slides show exactly the same drawing.
export const stationIcons = {
  // chart
  office: 'M4 4v16h16M8 15l3-4 3 2 4-6',
  // truck
  dock: 'M2 7h11v9H2zM13 10h5l3 3v3h-8zM6.500 16a1.500 1.500 0 1 0 0 3 1.500 1.500 0 0 0 0-3ZM17.500 16a1.500 1.500 0 1 0 0 3 1.500 1.500 0 0 0 0-3Z',
  // production line
  work: 'M3 14h18v4H3zM6 14V9h4v5M14 14V9h4v5M6 18v2M18 18v2',
} as const

export type StationId = keyof typeof stationIcons
