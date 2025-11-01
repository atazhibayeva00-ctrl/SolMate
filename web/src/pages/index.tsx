import { useState } from 'react'
import { useRouter } from 'next/router'
import { getWeatherByCity, WeatherResponse } from '@/lib/weatherApi'
import styles from '../styles/SolarHome.module.css'

export default function SolarHome() {
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!city.trim()) return

    setLoading(true)
    setError(null)
    
    try {
      const data = await getWeatherByCity(city.trim())
      setWeatherData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data')
      setWeatherData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      {/* Animated Background */}
      <div className={styles.background}>
        {/* Sun */}
        <div className={styles.sun}>
          <div className={styles.sunCore}></div>
          <div className={styles.ray} style={{ '--delay': '0s' } as React.CSSProperties}></div>
          <div className={styles.ray} style={{ '--delay': '0.2s' } as React.CSSProperties}></div>
          <div className={styles.ray} style={{ '--delay': '0.4s' } as React.CSSProperties}></div>
          <div className={styles.ray} style={{ '--delay': '0.6s' } as React.CSSProperties}></div>
          <div className={styles.ray} style={{ '--delay': '0.8s' } as React.CSSProperties}></div>
          <div className={styles.ray} style={{ '--delay': '1s' } as React.CSSProperties}></div>
          <div className={styles.ray} style={{ '--delay': '1.2s' } as React.CSSProperties}></div>
          <div className={styles.ray} style={{ '--delay': '1.4s' } as React.CSSProperties}></div>
        </div>

        {/* Energy Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              '--delay': `${i * 0.3}s`,
              '--x': `${Math.random() * 100}%`,
              '--duration': `${15 + Math.random() * 10}s`
            } as React.CSSProperties}
          ></div>
        ))}

        {/* Solar Panel Grid */}
        <div className={styles.solarGrid}>
          {[...Array(12)].map((_, i) => (
            <div key={i} className={styles.solarPanel}>
              <div className={styles.panelCell}></div>
              <div className={styles.panelCell}></div>
              <div className={styles.panelCell}></div>
              <div className={styles.panelCell}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>☀️</span>
            SolMate
          </h1>
          <p className={styles.tagline}>Harness the Power of Solar Energy</p>
        </header>

        {/* Main Search Section */}
        <section className={styles.searchSection}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name (e.g., London, Dubai, Tokyo)"
                className={styles.cityInput}
                disabled={loading}
              />
              <button 
                type="submit" 
                className={styles.searchButton}
                disabled={loading || !city.trim()}
              >
                {loading ? (
                  <span className={styles.spinner}>⚡</span>
                ) : (
                  <span>🔍</span>
                )}
              </button>
            </div>
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}
          </form>

          {/* Weather Results */}
          {weatherData && (
            <div className={styles.weatherCard}>
              <div className={styles.weatherHeader}>
                <h2>{weatherData.city}, {weatherData.country}</h2>
                <div className={styles.weatherTemp}>
                  {weatherData.temperature.toFixed(1)}°C
                </div>
              </div>

              <div className={styles.weatherInfo}>
                <div className={styles.weatherDesc}>
                  <span className={styles.weatherIcon}>🌤️</span>
                  {weatherData.description}
                </div>
              </div>

              <div className={styles.metricsGrid}>
                <div className={styles.metric}>
                  <div className={styles.metricIcon}>☀️</div>
                  <div className={styles.metricLabel}>UV Index</div>
                  <div className={styles.metricValue}>{weatherData.uv_index}</div>
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricIcon}>☁️</div>
                  <div className={styles.metricLabel}>Cloud Coverage</div>
                  <div className={styles.metricValue}>{weatherData.cloud_coverage}%</div>
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricIcon}>✨</div>
                  <div className={styles.metricLabel}>Sunshine Index</div>
                  <div className={styles.metricValue}>{weatherData.sunshine_index}</div>
                </div>
              </div>

              {/* Solar Energy Section */}
              <div className={styles.solarEnergySection}>
                <h3 className={styles.solarTitle}>
                  <span>⚡</span> Solar Energy Potential
                </h3>
                <div className={styles.solarStats}>
                  <div className={styles.solarStat}>
                    <div className={styles.solarStatValue}>
                      {weatherData.solar_energy.hourly_kwh.toFixed(4)}
                    </div>
                    <div className={styles.solarStatLabel}>kWh per hour</div>
                  </div>
                  <div className={styles.solarStat}>
                    <div className={styles.solarStatValue}>
                      {weatherData.solar_energy.daily_kwh.toFixed(4)}
                    </div>
                    <div className={styles.solarStatLabel}>kWh per day</div>
                  </div>
                  <div className={styles.solarStat}>
                    <div className={styles.solarStatValue}>
                      {weatherData.solar_energy.power_watts.toFixed(1)}
                    </div>
                    <div className={styles.solarStatLabel}>Watts</div>
                  </div>
                </div>
                <div className={styles.solarDetails}>
                  <div className={styles.solarDetail}>
                    <span>Panel Size:</span> {weatherData.solar_energy.panel_area_m2} m²
                  </div>
                  <div className={styles.solarDetail}>
                    <span>Efficiency:</span> {(weatherData.solar_energy.panel_efficiency * 100).toFixed(0)}%
                  </div>
                  <div className={styles.solarDetail}>
                    <span>Irradiance:</span> {weatherData.solar_energy.adjusted_irradiance_w_per_m2} W/m²
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Navigation */}
        <nav className={styles.nav}>
          <button 
            onClick={() => router.push('/')}
            className={styles.navButton}
            style={{ display: 'none' }}
          >
            Go to Marketplace →
          </button>
        </nav>
      </div>
    </div>
  )
}
