# Map Embed TODO

## Objective
Add OpenStreetMap embed to LocationCard component with real-time GPS extraction from uploaded images

## Plan
1. Add OpenStreetMap iframe to LocationCard component
2. Style the map container appropriately
3. Display coordinates below the map
4. Implement real-time GPS extraction from image EXIF metadata

## Changes
- [x] Add iframe map embed to LocationCard.tsx
- [x] Style map container with proper dimensions and border
- [x] Add coordinates display below map
- [x] Fix accessibility warning (added title attribute to iframe)
- [x] Create GPS extraction utility (`src/utils/gpsExtractor.ts`)
- [x] Update App.tsx to extract GPS from uploaded image
- [x] Update ProcessingSteps to show GPS extraction status

## Implementation Complete
The LocationCard component now includes:
- OpenStreetMap iframe showing location on map
- Marker centered on the GPS coordinates
- Coordinates display with proper N/E/W direction
- Dark-themed styling matching the OSINT dashboard
- Accessible iframe with title attribute

## Real-Time GPS Extraction
- Client-side EXIF metadata parsing
- Extracts GPS coordinates from image without server roundtrip
- Shows live GPS extraction status during processing
- Falls back to default location if no GPS found

## Backend API Status
- Running on http://localhost:8000
- API endpoint `/verify-location` working
- Returns: `{ city, altitude, accuracy }`
- Note: City shows "Unknown location" due to SSL cert verification issue with Nominatim (geopy)

## Frontend Status
- Running on http://localhost:5173
- LocationCard component integrated with OpenStreetMap embed
- Real-time GPS extraction from uploaded images


