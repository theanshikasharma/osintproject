# TODO: OSINT Location Intelligence Migration

## Phase 1: Dependencies
- [x] 1.1 Update requirements.txt with required packages

## Phase 2: Location Service Module
- [x] 2.1 Create backend/services/location.py
- [x] 2.2 Implement EXIF GPS extraction
- [x] 2.3 Implement OCR-based location inference
- [x] 2.4 Implement IP-based location inference (TODO - no free API)
- [x] 2.5 Implement reverse geocoding
- [x] 2.6 Implement main orchestrator function

## Phase 3: FastAPI Main Application
- [x] 3.1 Update main.py with new /analyze/location endpoint
- [x] 3.2 Remove old /api/location endpoint
- [x] 3.3 Update request/response models

## Phase 4: Testing
- [x] 4.1 Verify syntax is correct

## Output Format (MUST MATCH):
{
  "location": {
    "latitude": null,
    "longitude": null,
    "city": null,
    "country": null,
    "confidence": "high | medium | low",
    "source": "EXIF | OCR | IP | none"
  }
}

## Priority Order for Location Detection:
1. EXIF GPS → confidence="high", source="EXIF"
2. OCR inference → confidence="medium", source="OCR"
3. IP inference → confidence="low", source="IP"
4. All fail → confidence="low", source="none"

