# Location Card Update - TODO List

## Objective
Update the LocationCard component and backend to display city, altitude, and accuracy information from GPS coordinates.

## Tasks

### Backend Updates
- [x] 1. Update `/api/location` endpoint in `backend/main.py` to return city, altitude, and accuracy
- [x] 2. Add altitude calculation using elevation API or GPS data
- [x] 3. Add accuracy field to response

### Frontend Updates
- [x] 4. Update `src/api/location.ts` interface and API call
- [x] 5. Update `src/components/analysis/LocationCard.tsx` to display city, altitude, accuracy
- [x] 6. Enhance UI with proper styling and loading states

## Implementation Order
1. [x] Update backend API response format
2. [x] Update TypeScript API layer
3. [x] Update React component UI

## Status
- [x] Plan created
- [x] Implementation completed
- [ ] Testing (run the app to verify)

## Changes Made

### Backend (`backend/main.py`)
- Changed response model from `AddressResponse` to `LocationInfoResponse`
- New response format: `{ city, altitude, accuracy }`
- Added city extraction from Nominatim reverse geocoding
- Added altitude estimation based on coordinates
- Added accuracy determination based on geocoding success

### Frontend API (`src/api/location.ts`)
- Updated `LocationApiResult` interface with city, altitude, accuracy fields
- Updated API call to handle new response format

### Frontend Component (`src/components/analysis/LocationCard.tsx`)
- Added `LocationInfo` interface with city, altitude, accuracy
- Enhanced UI to display three separate info sections:
  - Location with MapPin icon
  - Altitude with TrendingUp icon
  - Accuracy with Crosshair icon
- Added coordinates display at bottom
- Added loading, error, and no-data states

