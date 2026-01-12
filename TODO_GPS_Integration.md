# TODO: GPS Location Integration

## Backend Setup
- [x] Backend has `/api/location` endpoint in `main.py`
- [x] Backend has reverse geocoding using geopy/Nominatim
- [x] Backend requirements include: fastapi, uvicorn, geopy, Pillow, exifread

## Frontend API Integration
- [x] `src/api/location.ts` has `verifyLocation()` function
- [x] Function calls `/api/location` with POST and JSON body
- [x] Returns `{ verified, address }` format

## Frontend Component Integration
- [x] `LocationCard.tsx` imports and uses `verifyLocation()`
- [x] Uses useEffect to fetch location when latitude/longitude props change
- [x] Shows loading, error, and success states
- [x] Displays address or coordinates fallback

## Dashboard Integration
- [x] `ResultsDashboard.tsx` receives `extractedGps` prop
- [x] Passes latitude/longitude to LocationCard
- [x] Uses default coordinates (Delhi) if no GPS extracted

## Testing Commands
```bash
# Step 1: Start backend (in backend folder)
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000

# Step 2: Test API with curl
curl -X POST http://localhost:8000/api/location \
  -H "Content-Type: application/json" \
  -d '{"latitude": 19.0760, "longitude": 72.8777}'

# Expected response: {"address": "Mumbai, Maharashtra, India, ..."}
```

## Notes
- Backend must be running for frontend location features to work
- Frontend uses relative URL `/api/location` - ensure Vite proxy is configured
- Nominatim has rate limits - consider caching for production

