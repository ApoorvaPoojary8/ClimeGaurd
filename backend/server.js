// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { computeRisks } = require('./riskEvaluator');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5001;
const NASA_KEY = process.env.NASA_API_KEY;
if (!NASA_KEY) {
  console.warn("⚠️ NASA_API_KEY not set. Proceeding without it.");
}

// ===== Helper: Fetch NASA POWER data =====
async function fetchNasaData(lat, lon, dateStr) {
  const date = dateStr ? dateStr.replace(/-/g, '') : new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const url = 'https://power.larc.nasa.gov/api/temporal/daily/point';
  const params = {
    parameters: "T2M,WS50M,PRECTOTCORR",
    community: "ag",
    latitude: lat,
    longitude: lon,
    start: date,
    end: date,
    format: "JSON"
  };
  if (NASA_KEY) params.apikey = NASA_KEY;

  const res = await axios.get(url, { params, timeout: 15000 });
  return res.data;
}

// Helper: Fetch Open-Meteo realtime for current day (temperature, wind, precipitation)
async function fetchRealtime(lat, lon) {
  const url = 'https://api.open-meteo.com/v1/forecast';
  const params = {
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,wind_speed_10m,precipitation'
  };
  const res = await axios.get(url, { params, timeout: 10000 });
  return res.data?.current || {};
}

// ===== POST /getRisk =====
// Accepts { city: "Mangalore", date: "YYYY-MM-DD" }
app.post('/getRisk', async (req, res) => {
  try {
    const { city, date, event } = req.body;
    if (!city) {
      return res.status(400).json({ error: 'missing_city', message: 'City is required' });
    }

    // Convert city -> lat/lon
    const geoRes = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );
    if (!geoRes.data.results || geoRes.data.results.length === 0) {
      return res.status(400).json({ error: 'city_not_found', message: 'City not found' });
    }
    const lat = geoRes.data.results[0].latitude;
    const lon = geoRes.data.results[0].longitude;

    // Date setup
    const dateStr = date || new Date().toISOString().slice(0, 10);
    const key = dateStr.replace(/-/g, '');

    // Fetch NASA data
    const nasaData = await fetchNasaData(lat, lon, dateStr);
    const daily = nasaData?.properties?.parameter;
    if (!daily) {
      return res.status(502).json({ error: 'nasa_api_error', message: 'NASA data not available' });
    }
    // Guard: ensure expected parameter blocks exist
    const paramsExist = daily.T2M && daily.WS50M && daily.PRECTOTCORR;
    if (!paramsExist) {
      return res.status(502).json({
        error: 'nasa_data_unavailable',
        message: 'NASA response missing expected parameters for this location/date'
      });
    }
    const today = new Date().toISOString().slice(0,10);
if (dateStr > today) {
  return res.status(400).json({
    error: 'future_date',
    message: 'Weather forecast for future dates is not available'
  });
}
    
    // Extract values
    const missingForDate = (
      daily.T2M[key] === undefined ||
      daily.WS50M[key] === undefined ||
      daily.PRECTOTCORR[key] === undefined
    );
    if (missingForDate) {
      return res.status(502).json({
        error: 'nasa_data_unavailable_for_date',
        message: 'No NASA data available for the requested date at this location'
      });
    }

    let tempC = daily.T2M[key];
    let windMs = daily.WS50M[key];
    let rain = daily.PRECTOTCORR[key];

    // Normalize missing flags (-999) to null
    tempC = (tempC === -999 || tempC === undefined) ? null : tempC;
    windMs = (windMs === -999 || windMs === undefined) ? null : windMs;
    rain = (rain === -999 || rain === undefined) ? null : rain;

    // Realtime fallback for today when values are missing
    const isToday = dateStr === new Date().toISOString().slice(0,10);
    if (isToday && (tempC == null || windMs == null || rain == null)) {
      try {
        const current = await fetchRealtime(lat, lon);
        if (tempC == null && typeof current.temperature_2m === 'number') tempC = current.temperature_2m;
        if (windMs == null && typeof current.wind_speed_10m === 'number') windMs = current.wind_speed_10m / 3.6; // convert kph -> m/s if needed
        if (rain == null && typeof current.precipitation === 'number') rain = current.precipitation; // mm
      } catch (e) {
        console.warn('⚠️ Realtime fallback failed:', e.message);
      }
    }

    const windKph = windMs != null ? windMs * 3.6 : null;

    // Compute risks (event-aware)
    const risks = computeRisks(tempC, null, windKph, rain, event);

    // Risk label (tune thresholds slightly by event) and category-based escalation
    const eventType = (event || 'general').toLowerCase();
    let high = 0.7, mid = 0.4;
    if (eventType === 'sports') { high = 0.65; mid = 0.35; }
    if (eventType === 'festival') { high = 0.6; mid = 0.35; }

    let label = 'Safe';
    if (risks.combined_risk >= high) label = 'Not Recommended';
    else if (risks.combined_risk >= mid) label = 'Warning';

    // Escalate based on simple categories from your idea
    if (risks.badCount >= 2) label = 'Not Recommended';
    else if (risks.badCount === 1) label = label === 'Safe' ? 'Warning' : label;

    // Send response
    return res.json({
      city,
      requested_date: dateStr,
      sample: {
        temp_c: tempC,
        wind_kph: windKph != null ? Math.round(windKph * 100) / 100 : null,
        rain_mm: rain
      },
      risks,
      event: eventType,
      advice: label
    });

  } catch (err) {
    const isAxios = !!(err && err.isAxiosError);
    if (isAxios) {
      const url = err.config?.url || '';
      const upstreamStatus = err.response?.status;
      const upstreamMsg = err.response?.data?.message || err.message;

      if (url.includes('geocoding-api.open-meteo.com')) {
        console.error('❌ Geocoding error:', upstreamStatus, upstreamMsg);
        return res.status(502).json({ error: 'geocoding_error', message: 'Failed to resolve city location' });
      }
      if (url.includes('power.larc.nasa.gov')) {
        console.error('❌ NASA POWER error:', upstreamStatus, upstreamMsg);
        return res.status(502).json({ error: 'nasa_api_error', message: 'Failed to fetch NASA weather data' });
      }
      console.error('❌ Upstream error:', upstreamStatus, upstreamMsg);
      return res.status(502).json({ error: 'upstream_error', message: 'Upstream service error' });
    }

    console.error("❌ Server error details:", err.message);
    return res.status(500).json({ error: 'server_error', message: 'Internal server error' });
  }
});

// ===== Dummy Auth Endpoints =====
app.post('/auth/login', (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ msg: 'Email required' });
  return res.json({ token: 'demo-token', user: { email, name: email.split('@')[0] } });
});

app.post('/auth/signup', (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email) return res.status(400).json({ msg: 'Name and email required' });
  return res.json({ token: 'demo-token', user: { email, name } });
});

// ===== Health Check =====
app.get('/', (req, res) => res.send('ClimeGuard NASA backend is up 🚀'));

// ===== Start Server =====
app.listen(PORT, () => console.log(`✅ Server listening on port ${PORT}`));
