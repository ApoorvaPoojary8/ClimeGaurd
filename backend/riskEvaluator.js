// riskEvaluator.js

/**
 * Computes risk levels based on weather data and event type.
 * @param {number|null} tempC - Temperature in Celsius
 * @param {number|null} humidity - Humidity percentage (not used currently)
 * @param {number|null} windKph - Wind speed in km/h
 * @param {number|null} rainMm - Rainfall in mm
 * @param {string} eventType - one of: 'general' | 'sports' | 'outdoor' | 'festival'
 * @returns {object} risk scores (0–1 scale) and combined_risk
 */
function computeRisks(tempC, humidity, windKph, rainMm, eventType = 'general') {
  // Normalize each factor to 0..1
  const temp_risk = tempC != null ? Math.min(1, Math.max(0, (Math.abs(tempC - 22)) / 20)) : 0;
  // Above uses comfort band centered ~22°C, 20°C span → hot/cold raise risk
  const wind_risk = windKph != null ? Math.min(1, windKph / 80) : 0; // 80 km/h ~ max risk for events
  const rain_risk = rainMm != null ? Math.min(1, rainMm / 30) : 0; // 30mm ~ heavy rain

  // Event-specific weights
  let weights = { temp: 0.33, wind: 0.33, rain: 0.34 };
  switch ((eventType || 'general').toLowerCase()) {
    case 'sports':
      weights = { temp: 0.30, wind: 0.45, rain: 0.25 };
      break;
    case 'outdoor':
      weights = { temp: 0.35, wind: 0.30, rain: 0.35 };
      break;
    case 'festival':
      weights = { temp: 0.25, wind: 0.20, rain: 0.55 };
      break;
    default:
      weights = { temp: 0.33, wind: 0.33, rain: 0.34 };
  }

  const combined_risk = Math.min(
    1,
    (temp_risk * weights.temp) + (wind_risk * weights.wind) + (rain_risk * weights.rain)
  );

  // Rule-based categories (simple, readable)
  const categories = [];
  if (tempC != null && tempC > 35) categories.push('Very Hot');
  if (tempC != null && tempC < 10) categories.push('Very Cold');
  if (windKph != null && windKph > 40) categories.push('Very Windy');
  if (rainMm != null && rainMm > 10) categories.push('Very Wet'); // proxy for high rain chance

  // If multiple adverse conditions → Very Uncomfortable
  const badCount = categories.length;
  if (badCount >= 2) categories.push('Very Uncomfortable');

  return {
    temp_risk,
    wind_risk,
    rain_risk,
    weights,
    combined_risk,
    categories,
    badCount
  };
}

module.exports = { computeRisks };
