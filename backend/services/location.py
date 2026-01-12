"""
OSINT Location Intelligence Module
FastAPI backend for location detection from images, OCR text, and IP addresses

LOCATION LOGIC PRIORITY:
1. EXIF GPS coordinates → confidence="high", source="EXIF"
2. OCR text inference → confidence="medium", source="OCR"
3. IP-based inference → confidence="low", source="IP"
4. All fail → confidence="low", source="none"

No ML models used - deterministic, conservative approach.
"""

import re
from io import BytesIO
from typing import Optional, Tuple
from PIL import Image

# Try to import exifread, handle gracefully if not available
try:
    import exifread
    EXIFREAD_AVAILABLE = True
except ImportError:
    EXIFREAD_AVAILABLE = False

# Try to import geopy, handle gracefully if not available
try:
    from geopy.geocoders import Nominatim
    from geopy.exc import GeocoderTimedOut, GeocoderServiceError
    GEOPY_AVAILABLE = True
except ImportError:
    GEOPY_AVAILABLE = False

# Common place names for OCR-based inference (no ML - simple keyword matching)
# Indian cities and landmarks for OSINT inference
KNOWN_PLACES = {
    # Major Indian cities
    "delhi": {"city": "Delhi", "country": "India", "lat": 28.6139, "lon": 77.2090},
    "mumbai": {"city": "Mumbai", "country": "India", "lat": 19.0760, "lon": 72.8777},
    "bangalore": {"city": "Bengaluru", "country": "India", "lat": 12.9716, "lon": 77.5946},
    "bengaluru": {"city": "Bengaluru", "country": "India", "lat": 12.9716, "lon": 77.5946},
    "chennai": {"city": "Chennai", "country": "India", "lat": 13.0827, "lon": 80.2707},
    "hyderabad": {"city": "Hyderabad", "country": "India", "lat": 17.3850, "lon": 78.4867},
    "kolkata": {"city": "Kolkata", "country": "India", "lat": 22.5726, "lon": 88.3639},
    "calcutta": {"city": "Kolkata", "country": "India", "lat": 22.5726, "lon": 88.3639},
    "pune": {"city": "Pune", "country": "India", "lat": 18.5204, "lon": 73.8567},
    "jaipur": {"city": "Jaipur", "country": "India", "lat": 26.9124, "lon": 75.7873},
    "ahmedabad": {"city": "Ahmedabad", "country": "India", "lat": 23.0225, "lon": 72.5714},
    "chandigarh": {"city": "Chandigarh", "country": "India", "lat": 30.7333, "lon": 76.7794},
    "lucknow": {"city": "Lucknow", "country": "India", "lat": 26.8467, "lon": 80.9462},
    "kanpur": {"city": "Kanpur", "country": "India", "lat": 26.4499, "lon": 80.3319},
    "nagpur": {"city": "Nagpur", "country": "India", "lat": 21.1458, "lon": 79.0882},
    "indore": {"city": "Indore", "country": "India", "lat": 22.7196, "lon": 75.8577},
    "bhopal": {"city": "Bhopal", "country": "India", "lat": 23.2599, "lon": 77.4126},
    "visakhapatnam": {"city": "Visakhapatnam", "country": "India", "lat": 17.6868, "lon": 83.2185},
    "patna": {"city": "Patna", "country": "India", "lat": 25.5941, "lon": 85.1376},
    "surat": {"city": "Surat", "country": "India", "lat": 21.1702, "lon": 72.8311},
    
    # International cities (common in OSINT)
    "new york": {"city": "New York", "country": "USA", "lat": 40.7128, "lon": -74.0060},
    "los angeles": {"city": "Los Angeles", "country": "USA", "lat": 34.0522, "lon": -118.2437},
    "london": {"city": "London", "country": "UK", "lat": 51.5074, "lon": -0.1278},
    "paris": {"city": "Paris", "country": "France", "lat": 48.8566, "lon": 2.3522},
    "tokyo": {"city": "Tokyo", "country": "Japan", "lat": 35.6762, "lon": 139.6503},
    "sydney": {"city": "Sydney", "country": "Australia", "lat": -33.8688, "lon": 151.2093},
    "dubai": {"city": "Dubai", "country": "UAE", "lat": 25.2048, "lon": 55.2708},
    "singapore": {"city": "Singapore", "country": "Singapore", "lat": 1.3521, "lon": 103.8198},
    "hong kong": {"city": "Hong Kong", "country": "China", "lat": 22.3193, "lon": 114.1694},
    "beijing": {"city": "Beijing", "country": "China", "lat": 39.9042, "lon": 116.4074},
    "moscow": {"city": "Moscow", "country": "Russia", "lat": 55.7558, "lon": 37.6173},
    "berlin": {"city": "Berlin", "country": "Germany", "lat": 52.5200, "lon": 13.4050},
    
    # Landmarks
    "taj mahal": {"city": "Agra", "country": "India", "lat": 27.1751, "lon": 78.0421},
    "india gate": {"city": "Delhi", "country": "India", "lat": 28.6129, "lon": 77.2295},
    "lotus temple": {"city": "Delhi", "country": "India", "lat": 28.5535, "lon": 77.2588},
    "gateway of india": {"city": "Mumbai", "country": "India", "lat": 18.9218, "lon": 72.8347},
    "eiffel tower": {"city": "Paris", "country": "France", "lat": 48.8584, "lon": 2.2945},
    "statue of liberty": {"city": "New York", "country": "USA", "lat": 40.6892, "lon": -74.0445},
    "big ben": {"city": "London", "country": "UK", "lat": 51.5007, "lon": -0.1246},
}


def extract_exif_coordinates(image_file) -> Tuple[Optional[float], Optional[float]]:
    """
    Extract GPS coordinates from image EXIF metadata.
    
    Priority 1: EXIF GPS → confidence="high", source="EXIF"
    
    Args:
        image_file: Uploaded file object
        
    Returns:
        Tuple of (latitude, longitude) or (None, None) if not found
    """
    try:
        # Reset file pointer to beginning
        image_file.seek(0)
        
        # Read image using Pillow
        image = Image.open(image_file)
        
        # Try using exifread for more reliable EXIF extraction
        if EXIFREAD_AVAILABLE:
            image_file.seek(0)
            tags = exifread.process_file(image_file)
            
            # GPS tags to look for
            gps_lat = None
            gps_lon = None
            
            # GPSLatitude
            if 'GPSLatitude' in tags:
                lat_ref = tags.get('GPSLatitudeRef', '').values
                lat_values = tags.get('GPSLatitude', '').values
                
                if lat_values and len(lat_values) == 3:
                    # Convert DMS to decimal degrees
                    lat_deg = lat_values[0].num / lat_values[0].den
                    lat_min = lat_values[1].num / lat_values[1].den
                    lat_sec = lat_values[2].num / lat_values[2].den
                    
                    lat_decimal = lat_deg + lat_min/60 + lat_sec/3600
                    
                    # Apply direction (N or S)
                    if str(lat_ref) == 'S':
                        lat_decimal = -lat_decimal
                    
                    gps_lat = lat_decimal
            
            # GPSLongitude
            if 'GPSLongitude' in tags:
                lon_ref = tags.get('GPSLongitudeRef', '').values
                lon_values = tags.get('GPSLongitude', '').values
                
                if lon_values and len(lon_values) == 3:
                    # Convert DMS to decimal degrees
                    lon_deg = lon_values[0].num / lon_values[0].den
                    lon_min = lon_values[1].num / lon_values[1].den
                    lon_sec = lon_values[2].num / lon_values[2].den
                    
                    lon_decimal = lon_deg + lon_min/60 + lon_sec/3600
                    
                    # Apply direction (E or W)
                    if str(lon_ref) == 'W':
                        lon_decimal = -lon_decimal
                    
                    gps_lon = lon_decimal
            
            if gps_lat is not None and gps_lon is not None:
                return (gps_lat, gps_lon)
        
        # Fallback: Try using Pillow's _getexif() method
        # Note: This is less reliable, but as a backup
        try:
            exif_data = image._getexif()
            if exif_data is not None:
                # GPSInfo tag ID is 34853
                gps_info = exif_data.get(34853)
                if gps_info:
                    # Extract GPS data using Pillow's conversion
                    # This is complex and varies by camera, so we use exifread as primary
                    pass
        except Exception:
            pass
        
        return (None, None)
        
    except Exception as e:
        # Log error in development, but fail gracefully
        # In production, use proper logging
        print(f"EXIF extraction error: {e}")
        return (None, None)


def infer_from_ocr(ocr_text: str) -> Tuple[Optional[float], Optional[float], Optional[str], Optional[str]]:
    """
    Infer location from OCR text by matching known place names.
    
    Priority 2: OCR inference → confidence="medium", source="OCR"
    
    Args:
        ocr_text: Text extracted from image via OCR
        
    Returns:
        Tuple of (latitude, longitude, city, country) or all None if not found
    """
    if not ocr_text or not ocr_text.strip():
        return (None, None, None, None)
    
    # Normalize text for matching
    text_lower = ocr_text.lower()
    
    # Try exact and partial matches for known places
    # Longer matches first to avoid partial matches (e.g., "Delhi" before "Del")
    sorted_places = sorted(KNOWN_PLACES.keys(), key=len, reverse=True)
    
    for place_name in sorted_places:
        # Use word boundary matching for better accuracy
        # This prevents "delhi" matching inside "delhi's"
        pattern = r'\b' + re.escape(place_name) + r'\b?'
        if re.search(pattern, text_lower, re.IGNORECASE):
            place_info = KNOWN_PLACES[place_name]
            return (
                place_info["lat"],
                place_info["lon"],
                place_info["city"],
                place_info["country"]
            )
    
    # Also try to find common location patterns
    # E.g., "Address: 123 Main St, Mumbai" or "Location - New York"
    
    # Look for city/state patterns
    location_patterns = [
        r'(?:city|town|village|located at|located in|location[:\s]+)([a-zA-Z\s]+?)(?:\s*,|\s*\n|$)',
        r'([a-zA-Z]+),\s*([a-zA-Z]{2,})\s*\d{5}',  # City, State ZIP pattern
    ]
    
    for pattern in location_patterns:
        match = re.search(pattern, text_lower)
        if match:
            potential_city = match.group(1).strip()
            if potential_city.lower() in KNOWN_PLACES:
                place_info = KNOWN_PLACES[potential_city.lower()]
                return (
                    place_info["lat"],
                    place_info["lon"],
                    place_info["city"],
                    place_info["country"]
                )
    
    return (None, None, None, None)


def infer_from_ip(ip_address: str) -> Tuple[Optional[float], Optional[float], Optional[str], Optional[str]]:
    """
    Infer location from IP address.
    
    Priority 3: IP inference → confidence="low", source="IP"
    
    Note: No free IP geolocation API is used due to reliability concerns.
    This function returns None for all values with a TODO comment.
    For production use, integrate a service like ipapi, ipinfo.io, or MaxMind GeoIP.
    
    Args:
        ip_address: IP address string
        
    Returns:
        Tuple of (latitude, longitude, city, country) or all None if not found
    """
    if not ip_address or not ip_address.strip():
        return (None, None, None, None)
    
    # TODO: Implement IP-based geolocation
    # Free options for production:
    # - ipapi (requires API key for accuracy)
    # - ipinfo.io (limited free tier)
    # - MaxMind GeoIP database (offline, requires database file)
    # - IP-API.com (limited requests)
    #
    # Example implementation with ipapi:
    # import requests
    # response = requests.get(f"https://ipapi.co/{ip_address}/json/")
    # data = response.json()
    # return (data.get("latitude"), data.get("longitude"), 
    #         data.get("city"), data.get("country_name"))
    
    # For now, return None for all values
    return (None, None, None, None)


def reverse_geocode(lat: float, lon: float) -> Tuple[Optional[str], Optional[str]]:
    """
    Convert GPS coordinates to city and country names using Nominatim.
    
    Args:
        lat: Latitude
        lon: Longitude
        
    Returns:
        Tuple of (city, country) or (None, None) if geocoding fails
    """
    if lat is None or lon is None:
        return (None, None)
    
    if not GEOPY_AVAILABLE:
        return (None, None)
    
    try:
        geolocator = Nominatim(user_agent="osint_dashboard_v1", timeout=5)
        location = geolocator.reverse((lat, lon), exactly_one=True)
        
        if location:
            address = location.raw.get("address", {})
            city = address.get("city") or address.get("town") or address.get("village") or address.get("county")
            country = address.get("country")
            return (city, country)
        
    except (GeocoderTimedOut, GeocoderServiceError) as e:
        print(f"Geocoding service error: {e}")
    except Exception as e:
        print(f"Geocoding error: {e}")
    
    return (None, None)


def analyze_location(
    image_file,
    ocr_text: Optional[str] = None,
    ip_address: Optional[str] = None
) -> dict:
    """
    Main orchestrator function for location intelligence.
    
    Implements the strict priority order for location detection:
    1. EXIF GPS → confidence="high", source="EXIF"
    2. OCR inference → confidence="medium", source="OCR"
    3. IP inference → confidence="low", source="IP"
    4. All fail → confidence="low", source="none"
    
    Args:
        image_file: Uploaded image file
        ocr_text: Optional OCR text from image
        ip_address: Optional IP address
        
    Returns:
        Dictionary with location data matching required output format
    """
    # Default fail-safe response
    fail_safe = {
        "location": {
            "latitude": None,
            "longitude": None,
            "city": None,
            "country": None,
            "confidence": "low",
            "source": "none"
        }
    }
    
    # Priority 1: Extract GPS from EXIF
    if image_file:
        exif_lat, exif_lon = extract_exif_coordinates(image_file)
        if exif_lat is not None and exif_lon is not None:
            # Got valid EXIF coordinates
            city, country = reverse_geocode(exif_lat, exif_lon)
            
            return {
                "location": {
                    "latitude": exif_lat,
                    "longitude": exif_lon,
                    "city": city,
                    "country": country,
                    "confidence": "high",
                    "source": "EXIF"
                }
            }
    
    # Priority 2: Infer from OCR text
    if ocr_text:
        ocr_lat, ocr_lon, ocr_city, ocr_country = infer_from_ocr(ocr_text)
        if ocr_lat is not None and ocr_lon is not None:
            return {
                "location": {
                    "latitude": ocr_lat,
                    "longitude": ocr_lon,
                    "city": ocr_city,
                    "country": ocr_country,
                    "confidence": "medium",
                    "source": "OCR"
                }
            }
    
    # Priority 3: Infer from IP address
    if ip_address:
        ip_lat, ip_lon, ip_city, ip_country = infer_from_ip(ip_address)
        if ip_lat is not None and ip_lon is not None:
            return {
                "location": {
                    "latitude": ip_lat,
                    "longitude": ip_lon,
                    "city": ip_city,
                    "country": ip_country,
                    "confidence": "low",
                    "source": "IP"
                }
            }
    
    # Priority 4: All methods failed
    return fail_safe

