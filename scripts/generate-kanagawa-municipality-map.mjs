/**
 * 神奈川県市区町村境界 GeoJSON → SVG path データを生成する。
 * データ元: smartnews-smri/japan-topography (国土数値情報ベース)
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { geoMercator } from "d3-geo";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const GEOJSON_URL =
  "https://raw.githubusercontent.com/smartnews-smri/japan-topography/main/data/municipality/geojson/s0010/N03-21_14_210101.json";

const WIDTH = 800;
const HEIGHT = 1000;

const PASTEL_COLORS = [
  "#f5b4c8",
  "#9ed4f5",
  "#f5d48a",
  "#a8e6c4",
  "#c8b4f0",
  "#f5c4a8",
  "#8ed4c8",
  "#e8b4f0",
  "#b4d8f5",
  "#f5a8b4",
  "#d4f0b4",
  "#f0d4b4",
  "#b4f0e8",
  "#e8d4f5",
  "#c4e8f5",
  "#f5e8b4",
  "#d4b4e8",
  "#a8f0d4",
  "#f5b4e8",
  "#b4e8c4",
];

const CREMATORIUM_COORDS = [
  { id: "kuboyama", lat: 35.4458, lng: 139.6185 },
  { id: "totsuka", lat: 35.3968, lng: 139.4902 },
  { id: "yokohama-hokubu", lat: 35.5491, lng: 139.4994 },
  { id: "yokohama-minami", lat: 35.3578, lng: 139.6225 },
  { id: "kawasaki-kita", lat: 35.5905, lng: 139.593 },
  { id: "kawasaki-minami", lat: 35.5288, lng: 139.7156 },
  { id: "aikawa", lat: 35.521, lng: 139.3135 },
  { id: "atsugi", lat: 35.4545, lng: 139.351 },
  { id: "odawara", lat: 35.2835, lng: 139.152 },
  { id: "sagamihara", lat: 35.5895, lng: 139.419 },
  { id: "chigasaki", lat: 35.3695, lng: 139.388 },
  { id: "hadano", lat: 35.371, lng: 139.228 },
  { id: "hiratsuka", lat: 35.336, lng: 139.365 },
  { id: "fujisawa", lat: 35.4005, lng: 139.472 },
  { id: "manazuru", lat: 35.156, lng: 139.6225 },
  { id: "miura", lat: 35.136, lng: 139.632 },
  { id: "yamato", lat: 35.471, lng: 139.441 },
  { id: "yokosuka", lat: 35.283, lng: 139.668 },
  { id: "nishiterao", lat: 35.438, lng: 139.552 },
  { id: "ozu", lat: 35.298, lng: 139.578 },
];

function geojsonBbox(geojson) {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  const walk = (coords) => {
    if (typeof coords[0] === "number") {
      const [lng, lat] = coords;
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
    } else {
      for (const child of coords) walk(child);
    }
  };

  for (const feature of geojson.features) {
    walk(feature.geometry.coordinates);
  }

  return { minLng, minLat, maxLng, maxLat };
}

const DESIGNATED_CITIES = new Set(["横浜市", "川崎市", "相模原市"]);

/** 地図ラベル用（区名・郡名ではなく市町村名） */
function labelName(props) {
  if (props.N03_003 && DESIGNATED_CITIES.has(props.N03_003)) {
    return props.N03_003;
  }
  return props.N03_004 || props.N03_003;
}

function ringToPath(ring, projection) {
  const points = ring.map(([lng, lat]) => projection([lng, lat]));
  if (points.length === 0) return "";
  const first = points[0];
  const rest = points
    .slice(1)
    .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join("L");
  return `M${first[0].toFixed(2)},${first[1].toFixed(2)}L${rest}Z`;
}

function geometryToPaths(geometry, projection) {
  const paths = [];
  if (geometry.type === "Polygon") {
    for (const ring of geometry.coordinates) {
      paths.push(ringToPath(ring, projection));
    }
  } else if (geometry.type === "MultiPolygon") {
    for (const polygon of geometry.coordinates) {
      for (const ring of polygon) {
        paths.push(ringToPath(ring, projection));
      }
    }
  }
  return paths.filter(Boolean);
}

function largestRing(geometry) {
  const rings = [];
  if (geometry.type === "Polygon") {
    rings.push(...geometry.coordinates);
  } else if (geometry.type === "MultiPolygon") {
    for (const polygon of geometry.coordinates) {
      rings.push(...polygon);
    }
  }
  return rings.sort((a, b) => b.length - a.length)[0] ?? [];
}

function ringBounds(ring, projection) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let sumX = 0;
  let sumY = 0;
  for (const [lng, lat] of ring) {
    const [x, y] = projection([lng, lat]);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    sumX += x;
    sumY += y;
  }
  const count = ring.length || 1;
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    cx: sumX / count,
    cy: sumY / count,
  };
}

const geojson = await fetch(GEOJSON_URL).then((r) => r.json());
const bbox = geojsonBbox(geojson);
const padding = 24;
const centerLng = (bbox.minLng + bbox.maxLng) / 2;
const centerLat = (bbox.minLat + bbox.maxLat) / 2;
const lngSpan = bbox.maxLng - bbox.minLng;
const latSpan = bbox.maxLat - bbox.minLat;
const cosLat = Math.cos((centerLat * Math.PI) / 180);
const usableWidth = WIDTH - 2 * padding;
const usableHeight = HEIGHT - 2 * padding;
const scaleByLng = usableWidth / ((lngSpan * Math.PI) / 180 * cosLat);
const scaleByLat = usableHeight / (latSpan * Math.PI / 180);
const scale = Math.min(scaleByLng, scaleByLat);

const projection = geoMercator()
  .center([centerLng, centerLat])
  .scale(scale)
  .translate([WIDTH / 2, HEIGHT / 2]);

const municipalities = geojson.features.map((feature, index) => {
  const props = feature.properties;
  const paths = geometryToPaths(feature.geometry, projection);
  const pathD = paths.join("");
  const mainRing = largestRing(feature.geometry);
  const bounds = ringBounds(mainRing, projection);
  const label = labelName(props);
  const area = bounds.width * bounds.height;

  return {
    code: props.N03_007,
    city: props.N03_003,
    ward: props.N03_004 ?? null,
    displayName: label,
    path: pathD,
    color: PASTEL_COLORS[index % PASTEL_COLORS.length],
    labelX: bounds.cx,
    labelY: bounds.cy,
    fontSize: 9,
    showLabel: false,
    area,
  };
});

const labelGroups = new Map();
for (const municipality of municipalities) {
  const group = labelGroups.get(municipality.displayName) ?? [];
  group.push(municipality);
  labelGroups.set(municipality.displayName, group);
}

for (const group of labelGroups.values()) {
  const anchor = group.sort((a, b) => b.area - a.area)[0];
  const labelX = group.reduce((sum, m) => sum + m.labelX, 0) / group.length;
  const labelY = group.reduce((sum, m) => sum + m.labelY, 0) / group.length;
  anchor.labelX = labelX;
  anchor.labelY = labelY;
  anchor.showLabel = true;
  anchor.fontSize =
    group.length > 6 ? 10 : group.length > 1 ? 9 : anchor.area > 2500 ? 9 : 8;
}

for (const municipality of municipalities) {
  delete municipality.area;
}

const pinPositions = Object.fromEntries(
  CREMATORIUM_COORDS.map((pin) => {
    const [x, y] = projection([pin.lng, pin.lat]);
    return [
      pin.id,
      {
        x: Math.min(96, Math.max(4, (x / WIDTH) * 100)),
        y: Math.min(94, Math.max(6, (y / HEIGHT) * 100)),
      },
    ];
  }),
);

const output = {
  viewBox: { width: WIDTH, height: HEIGHT },
  attribution:
    "境界データ: 国土数値情報 / smartnews-smri/japan-topography（簡素化1%）",
  municipalities,
  pinPositions,
};

const outDir = join(root, "src/lib/constants");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "kanagawa-municipality-map.json");
writeFileSync(outPath, JSON.stringify(output));
console.log(`Wrote ${municipalities.length} municipalities to ${outPath}`);
