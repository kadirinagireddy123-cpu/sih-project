import express from 'express';
import https from 'https';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
// @ts-ignore
import selfsigned from 'selfsigned';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory persistent state during server runtime
let citizenReports = [
  {
    id: 'rep-001',
    districtId: 'dist-north-sikkim',
    districtName: 'North Sikkim (Mangan / Chungthang)',
    hazardType: 'slope_crack',
    severity: 'critical',
    description: 'Fresh 15-meter longitudinal fissure detected across the road embankment near Singhik bend. Seeping muddy water observed.',
    reporterName: 'Subedar T. Lepcha',
    reporterRole: 'bro_engineer',
    lat: 27.5210,
    lng: 88.5480,
    timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    status: 'verified',
  },
  {
    id: 'rep-002',
    districtId: 'dist-dima-hasao',
    districtName: 'Dima Hasao (Haflong / Jatinga)',
    hazardType: 'soil_subsidence',
    severity: 'high',
    description: 'Gradual track settlement of ~18cm along the Lumding-Badarpur railway cutting following continuous overnight downpour.',
    reporterName: 'Amitava Choudhury',
    reporterRole: 'disaster_mgmt_officer',
    lat: 25.1742,
    lng: 93.0238,
    timestamp: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    status: 'verified',
  },
];

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OPERATIONAL',
    system: 'Project TRISHUL Early Warning Gateway',
    team: 'Tech Trojans (Team ID 119478)',
    monitored_region: 'North Eastern Region (NER)',
    version: '1.0.0-SIH2026',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/weather', async (req, res) => {
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : 27.3389;
  const lng = req.query.lng ? parseFloat(req.query.lng as string) : 88.6065;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=precipitation,rain,relative_humidity_2m&hourly=precipitation,rain,soil_moisture_0_to_1cm&forecast_days=3`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Weather fetch failed with status ${response.status}`);
    const data = await response.json();
    res.json({ source: 'live_api', provider: 'Open-Meteo', data });
  } catch (err: any) {
    res.json({
      source: 'offline_fallback',
      message: err.message,
      data: {
        rainfall_24h_mm: 58.4,
        rainfall_72h_mm: 135.2,
        soil_moisture_pct: 76,
      },
    });
  }
});

app.get('/api/seismic', async (_req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${sevenDaysAgo}&minmagnitude=2.5&latitude=26.5&longitude=92.5&maxradiuskm=1200`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`USGS fetch failed with status ${response.status}`);
    const data = await response.json();
    res.json({ source: 'live_api', provider: 'USGS Earthquake Hazards', data });
  } catch (err: any) {
    res.json({
      source: 'offline_fallback',
      message: err.message,
      events: [
        { id: 'eq-01', place: 'North Sikkim (M3.8)', mag: 3.8, depthKm: 12.4 },
        { id: 'eq-02', place: 'Upper Siang (M4.2)', mag: 4.2, depthKm: 10.0 },
      ],
    });
  }
});

app.get('/api/reports', (_req, res) => {
  res.json(citizenReports);
});

app.post('/api/reports', (req, res) => {
  const report = req.body;
  const newReport = {
    ...report,
    id: `rep-${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    status: 'under_review',
  };
  citizenReports.unshift(newReport);
  res.status(201).json(newReport);
});

// Mount Vite or static server
async function startServer() {
  // Generate self-signed certificate for HTTPS
  const attrs = [{ name: 'commonName', value: 'localhost' }];
  const pems = await selfsigned.generate(attrs, {
    days: 365,
    extensions: [
      { name: 'subjectAltName', altNames: [
        { type: 2, value: 'localhost' },
        { type: 7, ip: '0.0.0.0' },
        { type: 7, ip: '127.0.0.1' },
        { type: 7, ip: '10.127.26.253' },
      ]},
    ],
  } as any);

  const sslOptions = { key: pems.private, cert: pems.cert };

  if (!isProd) {
    // Development mode: mount Vite dev middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, https: sslOptions },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built static files from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  // Redirect HTTP → HTTPS
  const HTTP_PORT = PORT + 1;
  http.createServer((_req, res) => {
    res.writeHead(301, { Location: `https://${_req.headers.host?.replace(String(HTTP_PORT), String(PORT))}${_req.url}` });
    res.end();
  }).listen(HTTP_PORT, '0.0.0.0');

  https.createServer(sslOptions, app).listen(PORT, '0.0.0.0', () => {
    console.log(`[TRISHUL] HTTPS Server running on https://0.0.0.0:${PORT}`);
    console.log(`[TRISHUL] Network URL: https://10.127.26.253:${PORT}`);
    console.log(`[TRISHUL] Project TRISHUL — AI Early Warning & Landslide/GLOF Risk System`);
  });
}

startServer();
