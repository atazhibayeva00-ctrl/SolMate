from fastapi import APIRouter, HTTPException
import httpx
import os

router = APIRouter()

# You can get a free API key from https://openweathermap.org/api
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "")
WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather"
UV_API_URL = "https://api.openweathermap.org/data/2.5/uvi"

def calculate_sunshine_index(uv_index: float, cloud_coverage: int) -> float:
    """
    Calculate sunshine index (0-100) based on UV index and cloud coverage
    Higher UV index and lower cloud coverage = higher sunshine index
    """
    # Normalize UV index (typically 0-11, scale to 0-50)
    uv_component = min(uv_index * 4.5, 50)
    
    # Cloud coverage affects sunshine (0% clouds = full sunshine, 100% = no sunshine)
    cloud_component = (100 - cloud_coverage) * 0.5
    
    # Combine components
    sunshine_index = uv_component + cloud_component
    
    # Ensure it's between 0 and 100
    return round(max(0, min(100, sunshine_index)), 2)

@router.get("/{city}")
async def get_weather(city: str):
    """
    Fetch weather data for a given city including sunshine index
    """
    if not WEATHER_API_KEY:
        return {
            "city": city,
            "message": "Weather API key not configured. Set WEATHER_API_KEY in .env file",
            "note": "Get a free key from https://openweathermap.org/api"
        }
    
    try:
        async with httpx.AsyncClient() as client:
            # Fetch current weather
            weather_response = await client.get(
                WEATHER_API_URL,
                params={
                    "q": city,
                    "appid": WEATHER_API_KEY,
                    "units": "metric"
                }
            )
            
            if weather_response.status_code == 404:
                raise HTTPException(status_code=404, detail="City not found")
            
            weather_response.raise_for_status()
            weather_data = weather_response.json()
            
            # Get coordinates for UV index
            lat = weather_data["coord"]["lat"]
            lon = weather_data["coord"]["lon"]
            
            # Fetch UV index
            uv_response = await client.get(
                UV_API_URL,
                params={
                    "lat": lat,
                    "lon": lon,
                    "appid": WEATHER_API_KEY
                }
            )
            
            uv_index = 0.0
            if uv_response.status_code == 200:
                uv_data = uv_response.json()
                uv_index = uv_data.get("value", 0.0)
            
            # Calculate sunshine index
            cloud_coverage = weather_data.get("clouds", {}).get("all", 0)
            sunshine_index = calculate_sunshine_index(uv_index, cloud_coverage)
            
            return {
                "city": weather_data["name"],
                "country": weather_data["sys"]["country"],
                "temperature": weather_data["main"]["temp"],
                "feels_like": weather_data["main"]["feels_like"],
                "description": weather_data["weather"][0]["description"],
                "humidity": weather_data["main"]["humidity"],
                "wind_speed": weather_data["wind"]["speed"],
                "uv_index": round(uv_index, 2),
                "cloud_coverage": cloud_coverage,
                "sunshine_index": sunshine_index
            }
            
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Error fetching weather data: {str(e)}")

