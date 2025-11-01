# SolMate Backend

## Setup

1. Create virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file (optional - for weather API):
```bash
WEATHER_API_KEY=your_api_key_here
```
Get a free API key from: https://openweathermap.org/api

4. Run the server:
```bash
python main.py
```

## API Endpoints

- `GET /` - Root endpoint
- `GET /api/weather/{city}` - Get weather for a city

## API Documentation

Visit http://localhost:8000/docs for interactive API documentation.

