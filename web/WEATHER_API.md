# Weather API Integration Guide

This guide explains how the TypeScript frontend connects to the Python FastAPI backend for weather data.

## Setup

### 1. Environment Variables

Create a `.env.local` file in the `web` directory:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

For production, update this to your backend URL.

### 2. API Service

The frontend uses `src/lib/weatherApi.ts` to communicate with the backend:

```typescript
import { getWeatherByCity } from '@/lib/weatherApi'

// Fetch weather for a city
const weatherData = await getWeatherByCity('London')
```

## How It Works

### Request Flow

1. **Frontend** calls `getWeatherByCity('London')`
2. **weatherApi.ts** sends HTTP request to `http://localhost:8000/api/weather/London`
3. **Backend** (Python) fetches weather data from OpenWeatherMap
4. **Backend** calculates UV index, sunshine index, and solar energy (kWh)
5. **Backend** returns structured JSON response
6. **Frontend** receives and displays the data

### Response Structure

```typescript
{
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
```

## Usage Example

```typescript
import { getWeatherByCity, WeatherResponse } from '@/lib/weatherApi'

async function fetchWeather() {
  try {
    const data: WeatherResponse = await getWeatherByCity('Dubai')
    
    console.log('City:', data.city)
    console.log('UV Index:', data.uv_index)
    console.log('Sunshine Index:', data.sunshine_index)
    console.log('Daily Solar Energy:', data.solar_energy.daily_kwh, 'kWh')
  } catch (error) {
    console.error('Failed to fetch weather:', error)
  }
}
```

## Error Handling

The API service includes error handling:
- 404 errors: City not found
- Network errors: Connection issues
- Fallback: If backend is unavailable, can fallback to direct OpenWeatherMap API

## CORS Configuration

The backend is configured to allow requests from:
- `http://localhost:3000` (Next.js default)
- `*` (all origins in development)

For production, update CORS settings in `backend/main.py`.

