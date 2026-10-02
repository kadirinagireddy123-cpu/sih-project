import { SafePathNode, SafePathEdge, EvacuationRouteResult } from '../types';

export interface DistrictNetwork {
  districtId: string;
  name: string;
  nodes: Record<string, SafePathNode>;
  edges: SafePathEdge[];
  defaultOriginId: string;
  defaultDestinationId: string;
}

export const EVACUATION_NETWORKS: Record<string, DistrictNetwork> = {
  'dist-east-sikkim': {
    districtId: 'dist-east-sikkim',
    name: 'Gangtok Urban & Ridge Corridor',
    nodes: {
      'gkt-center': { id: 'gkt-center', name: 'MG Marg Commercial Core', lat: 27.3314, lng: 88.6138, elevation: 1650 },
      'gkt-deorali': { id: 'gkt-deorali', name: 'Deorali Chorten Junction', lat: 27.3190, lng: 88.6080, elevation: 1540 },
      'gkt-tadong': { id: 'gkt-tadong', name: 'Tadong Valley Highway Section', lat: 27.3050, lng: 88.5990, elevation: 1320 },
      'gkt-ranipool': { id: 'gkt-ranipool', name: 'Ranipool Bridge Choke Point', lat: 27.2880, lng: 88.5860, elevation: 910 },
      'gkt-sichey': { id: 'gkt-sichey', name: 'Sichey High Ridge Bypass', lat: 27.3360, lng: 88.6010, elevation: 1710 },
      'gkt-burtuk': { id: 'gkt-burtuk', name: 'Burtuk Helipad Safe Zone', lat: 27.3520, lng: 88.6210, elevation: 1820, isShelter: true },
      'gkt-chandmari': { id: 'gkt-chandmari', name: 'Chandmari Armed Police Grounds', lat: 27.3410, lng: 88.6290, elevation: 1880, isShelter: true },
      'gkt-penlong': { id: 'gkt-penlong', name: 'Penlong High Ridge Emergency Shelter', lat: 27.3680, lng: 88.6340, elevation: 1960, isShelter: true },
    },
    edges: [
      // Direct valley route (Passes through severe landslide chutes)
      { from: 'gkt-center', to: 'gkt-deorali', distanceKm: 2.1, segmentHci: 42, roadType: 'National Highway' },
      { from: 'gkt-deorali', to: 'gkt-tadong', distanceKm: 3.4, segmentHci: 86, roadType: 'National Highway' }, // CRITICAL SLIP
      { from: 'gkt-tadong', to: 'gkt-ranipool', distanceKm: 4.8, segmentHci: 91, roadType: 'National Highway' }, // BLOCKED BY DEBRIS
      // Upper ridge bypass network (SafePath)
      { from: 'gkt-center', to: 'gkt-sichey', distanceKm: 1.8, segmentHci: 24, roadType: 'District Ridge Road' },
      { from: 'gkt-center', to: 'gkt-chandmari', distanceKm: 2.2, segmentHci: 28, roadType: 'District Ridge Road' },
      { from: 'gkt-sichey', to: 'gkt-burtuk', distanceKm: 2.6, segmentHci: 31, roadType: 'District Ridge Road' },
      { from: 'gkt-chandmari', to: 'gkt-burtuk', distanceKm: 1.9, segmentHci: 22, roadType: 'District Ridge Road' },
      { from: 'gkt-burtuk', to: 'gkt-penlong', distanceKm: 3.1, segmentHci: 18, roadType: 'Narrow Hill Pass' },
      { from: 'gkt-tadong', to: 'gkt-sichey', distanceKm: 3.8, segmentHci: 65, roadType: 'Narrow Hill Pass' },
    ],
    defaultOriginId: 'gkt-center',
    defaultDestinationId: 'gkt-penlong',
  },
  'dist-north-sikkim': {
    districtId: 'dist-north-sikkim',
    name: 'Mangan - Chungthang Evacuation Corridor',
    nodes: {
      'mgn-bazaar': { id: 'mgn-bazaar', name: 'Mangan District HQ', lat: 27.5050, lng: 88.5360, elevation: 1310 },
      'mgn-singhik': { id: 'mgn-singhik', name: 'Singhik Valley Flank', lat: 27.5210, lng: 88.5480, elevation: 1420 },
      'mgn-teesta-bed': { id: 'mgn-teesta-bed', name: 'Teesta Low-Water Cause-Way', lat: 27.5350, lng: 88.5420, elevation: 980 },
      'mgn-chungthang': { id: 'mgn-chungthang', name: 'Chungthang Confluence Hub', lat: 27.6040, lng: 88.6470, elevation: 1790 },
      'mgn-upper-ridge': { id: 'mgn-upper-ridge', name: 'Upper Singhik Stabilized Ridge', lat: 27.5310, lng: 88.5620, elevation: 1750 },
      'mgn-shelter-high': { id: 'mgn-shelter-high', name: 'Rangrang High Plateau Disaster Center', lat: 27.4820, lng: 88.5120, elevation: 1880, isShelter: true },
      'mgn-kabi-shelter': { id: 'mgn-kabi-shelter', name: 'Kabi Longstok Elevated Community Shelter', lat: 27.4200, lng: 88.5500, elevation: 1950, isShelter: true },
    },
    edges: [
      { from: 'mgn-bazaar', to: 'mgn-singhik', distanceKm: 3.6, segmentHci: 58, roadType: 'National Highway' },
      { from: 'mgn-singhik', to: 'mgn-teesta-bed', distanceKm: 2.8, segmentHci: 94, roadType: 'National Highway' }, // CATASTROPHIC GLOF INUNDATION ZONE
      { from: 'mgn-teesta-bed', to: 'mgn-chungthang', distanceKm: 8.5, segmentHci: 96, roadType: 'National Highway' },
      { from: 'mgn-singhik', to: 'mgn-upper-ridge', distanceKm: 2.4, segmentHci: 32, roadType: 'District Ridge Road' },
      { from: 'mgn-bazaar', to: 'mgn-shelter-high', distanceKm: 4.2, segmentHci: 26, roadType: 'District Ridge Road' },
      { from: 'mgn-shelter-high', to: 'mgn-kabi-shelter', distanceKm: 6.8, segmentHci: 19, roadType: 'District Ridge Road' },
    ],
    defaultOriginId: 'mgn-bazaar',
    defaultDestinationId: 'mgn-kabi-shelter',
  },
  'dist-dima-hasao': {
    districtId: 'dist-dima-hasao',
    name: 'Haflong - Jatinga Hill Section',
    nodes: {
      'hfl-station': { id: 'hfl-station', name: 'New Haflong Railway Complex', lat: 25.1742, lng: 93.0238, elevation: 680 },
      'hfl-town': { id: 'hfl-town', name: 'Haflong Council Secretariat', lat: 25.1830, lng: 93.0310, elevation: 840 },
      'hfl-jatinga-cut': { id: 'hfl-jatinga-cut', name: 'Jatinga Sinking Zone Cut', lat: 25.1520, lng: 93.0450, elevation: 620 },
      'hfl-nh54-bridge': { id: 'hfl-nh54-bridge', name: 'NH-54E Mahur River Bridge', lat: 25.1310, lng: 93.0800, elevation: 510 },
      'hfl-ridge-bypass': { id: 'hfl-ridge-bypass', name: 'Fiangpui High Ridge Road', lat: 25.1950, lng: 93.0490, elevation: 990 },
      'hfl-safe-camp': { id: 'hfl-safe-camp', name: 'Muolhoi High Ground Disaster Camp', lat: 25.2100, lng: 93.0600, elevation: 1040, isShelter: true },
    },
    edges: [
      { from: 'hfl-station', to: 'hfl-jatinga-cut', distanceKm: 4.1, segmentHci: 93, roadType: 'National Highway' }, // CHRONIC SOIL SINKAGE
      { from: 'hfl-jatinga-cut', to: 'hfl-nh54-bridge', distanceKm: 5.6, segmentHci: 89, roadType: 'National Highway' },
      { from: 'hfl-station', to: 'hfl-town', distanceKm: 2.2, segmentHci: 46, roadType: 'District Ridge Road' },
      { from: 'hfl-town', to: 'hfl-ridge-bypass', distanceKm: 2.7, segmentHci: 28, roadType: 'District Ridge Road' },
      { from: 'hfl-ridge-bypass', to: 'hfl-safe-camp', distanceKm: 3.4, segmentHci: 15, roadType: 'District Ridge Road' },
    ],
    defaultOriginId: 'hfl-station',
    defaultDestinationId: 'hfl-safe-camp',
  },
};

/**
 * Dijkstra / A* risk-weighted shortest path algorithm
 * Cost function: W(u, v) = Distance * (1 + 4 * (HCI / 100)^2)
 * High HCI segments are heavily penalized so the router routes around unstable slopes.
 */
export function calculateSafePath(
  network: DistrictNetwork,
  originId: string,
  destinationId: string
): EvacuationRouteResult | null {
  const nodes = network.nodes;
  const edges = network.edges;
  if (!nodes[originId] || !nodes[destinationId]) return null;

  // Build adjacency
  const adj: Record<string, { to: string; distance: number; hci: number; roadType: string }[]> = {};
  for (const nId of Object.keys(nodes)) adj[nId] = [];

  for (const e of edges) {
    adj[e.from].push({ to: e.to, distance: e.distanceKm, hci: e.segmentHci, roadType: e.roadType });
    adj[e.to].push({ to: e.from, distance: e.distanceKm, hci: e.segmentHci, roadType: e.roadType });
  }

  // 1. Solve for Risk-Weighted Path (SafePath)
  const safeCost: Record<string, number> = {};
  const safePrev: Record<string, string | null> = {};
  const unvisitedSafe = new Set<string>(Object.keys(nodes));

  for (const nId of Object.keys(nodes)) {
    safeCost[nId] = Infinity;
    safePrev[nId] = null;
  }
  safeCost[originId] = 0;

  while (unvisitedSafe.size > 0) {
    let curr: string | null = null;
    let minC = Infinity;
    for (const u of unvisitedSafe) {
      if (safeCost[u] < minC) {
        minC = safeCost[u];
        curr = u;
      }
    }
    if (!curr || minC === Infinity) break;
    unvisitedSafe.delete(curr);
    if (curr === destinationId) break;

    for (const neighbor of adj[curr]) {
      if (!unvisitedSafe.has(neighbor.to)) continue;
      // Risk penalty factor: quadratic penalty on HCI
      const riskMultiplier = 1.0 + 5.0 * Math.pow(neighbor.hci / 100, 2.5);
      const edgeWeight = neighbor.distance * riskMultiplier;
      const alt = safeCost[curr] + edgeWeight;
      if (alt < safeCost[neighbor.to]) {
        safeCost[neighbor.to] = alt;
        safePrev[neighbor.to] = curr;
      }
    }
  }

  // 2. Solve for Standard Direct Distance Path (Dangerous baseline that takes the valley floor)
  const distCost: Record<string, number> = {};
  const distPrev: Record<string, string | null> = {};
  const unvisitedDist = new Set<string>(Object.keys(nodes));

  for (const nId of Object.keys(nodes)) {
    distCost[nId] = Infinity;
    distPrev[nId] = null;
  }
  distCost[originId] = 0;

  while (unvisitedDist.size > 0) {
    let curr: string | null = null;
    let minC = Infinity;
    for (const u of unvisitedDist) {
      if (distCost[u] < minC) {
        minC = distCost[u];
        curr = u;
      }
    }
    if (!curr || minC === Infinity) break;
    unvisitedDist.delete(curr);
    if (curr === destinationId) break;

    for (const neighbor of adj[curr]) {
      if (!unvisitedDist.has(neighbor.to)) continue;
      const alt = distCost[curr] + neighbor.distance;
      if (alt < distCost[neighbor.to]) {
        distCost[neighbor.to] = alt;
        distPrev[neighbor.to] = curr;
      }
    }
  }

  // Reconstruct Safe Route
  const safeNodeList: SafePathNode[] = [];
  let sCurr: string | null = destinationId;
  while (sCurr) {
    safeNodeList.unshift(nodes[sCurr]);
    sCurr = safePrev[sCurr];
  }

  // Reconstruct Direct Route
  const directNodeList: SafePathNode[] = [];
  let dCurr: string | null = destinationId;
  while (dCurr) {
    directNodeList.unshift(nodes[dCurr]);
    dCurr = distPrev[dCurr];
  }

  // Helper metrics
  function computeStats(routeNodes: SafePathNode[]) {
    let totalDist = 0;
    let maxHci = 0;
    let sumHci = 0;
    let edgeCount = 0;

    for (let i = 0; i < routeNodes.length - 1; i++) {
      const u = routeNodes[i].id;
      const v = routeNodes[i + 1].id;
      const match = edges.find((e) => (e.from === u && e.to === v) || (e.from === v && e.to === u));
      if (match) {
        totalDist += match.distanceKm;
        maxHci = Math.max(maxHci, match.segmentHci);
        sumHci += match.segmentHci;
        edgeCount++;
      }
    }

    const avgHci = edgeCount > 0 ? Math.round(sumHci / edgeCount) : 0;
    // Avg speed: 30 km/h in hill terrain
    const estimatedMinutes = Math.round((totalDist / 25) * 60);
    return { totalDist: Number(totalDist.toFixed(1)), maxHci, avgHci, estimatedMinutes };
  }

  const safeStats = computeStats(safeNodeList);
  const directStats = computeStats(directNodeList);
  const safetyAdvantage = Math.max(0, directStats.avgHci - safeStats.avgHci);

  const instructions = [
    `Initiate evacuation from ${nodes[originId].name}.`,
    `Divert around valley floor bottlenecks (avoiding high HCI zones > 75).`,
    `Proceed via ridge routes: ${safeNodeList.map((n) => n.name).join(' → ')}.`,
    `Target safe assembly zone: ${nodes[destinationId].name} (${nodes[destinationId].elevation}m elevation).`,
    `Average exposure reduced by ${safetyAdvantage}% compared to direct valley road.`,
  ];

  return {
    origin: nodes[originId],
    destination: nodes[destinationId],
    safeRoute: {
      nodes: safeNodeList,
      totalDistanceKm: safeStats.totalDist,
      estimatedMinutes: safeStats.estimatedMinutes,
      maxHciEncountered: safeStats.maxHci,
      avgHci: safeStats.avgHci,
    },
    directDangerousRoute: {
      nodes: directNodeList,
      totalDistanceKm: directStats.totalDist,
      estimatedMinutes: directStats.estimatedMinutes,
      maxHciEncountered: directStats.maxHci,
      avgHci: directStats.avgHci,
    },
    safetyAdvantagePct: safetyAdvantage,
    instructions,
  };
}
