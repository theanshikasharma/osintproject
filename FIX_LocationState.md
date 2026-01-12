# Location Update Bug Fix

## Bug Summary
- `extractedGps` state is referenced in `App.tsx` but never defined
- `handleReset` calls `setExtractedGps(null)` which doesn't exist
- ResultsDashboard expects `extractedGps` prop but receives undefined

## Tasks
- [x] 1. Add `extractedGps` state to App.tsx
- [x] 2. Update `handleImageUpload` to set `extractedGps` when GPS is extracted
- [x] 3. Fix `handleReset` to properly reset all state including `extractedGps`
- [x] 4. Verify the fix works

## Changes to make in App.tsx

### Step 1: Add extractedGps state
```tsx
const [extractedGps, setExtractedGps] = useState<{
  latitude: number;
  longitude: number;
} | null>(null);
```

### Step 2: Update handleImageUpload to set extractedGps
After setting latitude/longitude, also:
```tsx
if (gps) {
  setLatitude(gps.latitude);
  setLongitude(gps.longitude);
  setExtractedGps({ latitude: gps.latitude, longitude: gps.longitude });
} else {
  setLatitude(28.6139);
  setLongitude(77.2090);
  setExtractedGps(null);
}
```

### Step 3: Fix handleReset
```tsx
const handleReset = () => {
  setUploadedImage(null);
  setIsProcessing(false);
  setShowResults(false);
  setExtractedGps(null);
  setLatitude(null);
  setLongitude(null);
};
```

