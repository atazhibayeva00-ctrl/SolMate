"""
Solar Energy Service
Converts weather parameters (UV index, cloud coverage) to solar energy potential in kWh
"""


def calculate_kwh(
    uv_index: float,
    cloud_coverage: int,
    panel_area_m2: float = 1.0,
    panel_efficiency: float = 0.20,
    daylight_hours: float = 12.0
) -> dict:
    """
    Convert UV index and cloud coverage to solar energy potential in kWh
    
    This service takes weather parameters and calculates:
    - Solar irradiance (W/m²)
    - Power generation (Watts)
    - Energy generation (kWh)
    
    Formula:
    - GHI (Global Horizontal Irradiance) = UV Index / 0.077 (W/m²)
    - Apply cloud coverage reduction (up to 70% reduction)
    - Calculate power = Adjusted GHI × Efficiency × Area
    - Convert to kWh = (Power × Hours) / 1000
    
    Args:
        uv_index: UV index value from weather API (0-11 typically)
        cloud_coverage: Cloud coverage percentage (0-100)
        panel_area_m2: Solar panel area in square meters (default: 1 m²)
        panel_efficiency: Solar panel efficiency as decimal (default: 0.20 = 20%)
        daylight_hours: Average daylight hours per day (default: 12 hours)
    
    Returns:
        Dictionary containing:
        - solar_irradiance_w_per_m2: Raw solar irradiance from UV index
        - adjusted_irradiance_w_per_m2: Irradiance after cloud reduction
        - power_watts: Current power generation capacity
        - hourly_kwh: Energy generation per hour
        - daily_kwh: Energy generation per day
        - panel_area_m2: Panel area used in calculation
        - panel_efficiency: Efficiency percentage used
        - daylight_hours: Daylight hours used
    
    Example:
        >>> result = calculate_kwh(uv_index=6.88, cloud_coverage=0)
        >>> print(result['daily_kwh'])
        0.214
    """
    # Step 1: Convert UV index to Global Horizontal Irradiance (GHI) in W/m²
    # Formula: GHI ≈ UV Index / 0.077
    # The constant 0.077 comes from the relationship: UV Index ≈ 77 × I(310nm)
    ghi_w_per_m2 = uv_index / 0.077 if uv_index > 0 else 0
    
    # Step 2: Apply cloud coverage reduction factor
    # Clouds can reduce solar irradiance by up to 70%
    # Formula: Adjusted GHI = GHI × (1 - (cloud_coverage/100) × 0.7)
    cloud_reduction_factor = 1 - (cloud_coverage / 100) * 0.7
    adjusted_ghi = ghi_w_per_m2 * cloud_reduction_factor
    
    # Step 3: Calculate power generation
    # Power (Watts) = Irradiance × Efficiency × Area
    power_watts = adjusted_ghi * panel_efficiency * panel_area_m2
    
    # Step 4: Convert to energy (kWh)
    # Energy = Power × Time
    # Hourly: kWh/hour = Power (W) / 1000
    hourly_kwh = power_watts / 1000
    
    # Daily: kWh/day = (Power (W) × Hours) / 1000
    daily_kwh = (power_watts * daylight_hours) / 1000
    
    return {
        "solar_irradiance_w_per_m2": round(ghi_w_per_m2, 2),
        "adjusted_irradiance_w_per_m2": round(adjusted_ghi, 2),
        "power_watts": round(power_watts, 2),
        "hourly_kwh": round(hourly_kwh, 4),
        "daily_kwh": round(daily_kwh, 4),
        "panel_area_m2": panel_area_m2,
        "panel_efficiency": panel_efficiency,
        "daylight_hours": daylight_hours
    }

