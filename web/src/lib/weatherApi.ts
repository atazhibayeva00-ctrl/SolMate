/**
 * Weather API Service
 * Connects to the Python FastAPI backend to fetch weather data
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export interface WeatherResponse {
  city: string;
  country: string;
  temperature: number;
  feels_like: number;
  description: string;
  humidity: number;
  wind_speed: number;
  uv_index: number;
  cloud_coverage: number;
  sunshine_index: number;
  solar_energy: {
    solar_irradiance_w_per_m2: number;
    adjusted_irradiance_w_per_m2: number;
    power_watts: number;
    hourly_kwh: number;
    daily_kwh: number;
    panel_area_m2: number;
    panel_efficiency: number;
    daylight_hours: number;
  };
}

/**
 * Fetch weather data for a given city
 * @param city - City name (e.g., "London", "New York")
 * @returns Weather data including UV index, sunshine index, and solar energy calculations
 */
export async function getWeatherByCity(city: string): Promise<WeatherResponse> {
  const response = await fetch(`${BACKEND_URL}/api/weather/${encodeURIComponent(city)}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`City "${city}" not found`);
    }
    throw new Error(`Failed to fetch weather: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

/**
 * Fetch weather data using latitude and longitude
 * Note: The backend currently uses city names. This is a helper that could be extended.
 * For now, you'd need to reverse geocode to get the city name first.
 */
export async function getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherResponse> {
  // For now, you'd need to reverse geocode first or extend the backend
  // This is a placeholder - you can implement reverse geocoding or extend the backend API
  throw new Error('Coordinate lookup not yet implemented. Please use city name.');
}

