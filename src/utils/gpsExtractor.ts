/**
 * GPS Extraction Utility
 * Extracts GPS coordinates from image EXIF metadata client-side
 */

interface GPSCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Convert GPS DMS (Degrees, Minutes, Seconds) to decimal degrees
 */
function convertDMSToDecimal(
  degrees: number,
  minutes: number,
  seconds: number,
  ref: string
): number {
  let decimal = degrees + minutes / 60 + seconds / 3600;
  if (ref === "S" || ref === "W") {
    decimal = -decimal;
  }
  return decimal;
}

/**
 * Extract GPS coordinates from EXIF data
 */
export async function extractGPSFromImage(file: File): Promise<GPSCoordinates | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const view = new DataView(e.target?.result as ArrayBuffer);
      
      if (view.getUint16(0, false) !== 0xFFD8) {
        resolve(null);
        return;
      }
      
      let offset = 2;
      let gpsLatitude: number | null = null;
      let gpsLongitude: number | null = null;
      
      while (offset < view.byteLength) {
        if (view.getUint8(offset) !== 0xFF) {
          offset++;
          continue;
        }
        
        const marker = view.getUint8(offset + 1);
        
        // End of image
        if (marker === 0xD9) break;
        
        // Start of image
        if (marker === 0xD8) {
          offset += 2;
          continue;
        }
        
        const length = view.getUint16(offset + 2);
        
        // APP1 marker (EXIF)
        if (marker === 0xE1 && length > 8) {
          const exifHeader = "EXIF\x00\x00";
          const headerBytes = new Uint8Array(e.target?.result as ArrayBuffer, offset + 4, 6);
          const headerStr = String.fromCharCode(...headerBytes);
          
          if (headerStr === exifHeader) {
            const littleEndian = view.getUint16(offset + 10, true) === 0x4949;
            const ifdOffset = view.getUint32(offset + 14, littleEndian);
            
            // Search for GPS IFD
            const tags = offset + 20;
            const tagCount = view.getUint16(tags, littleEndian);
            
            for (let i = 0; i < tagCount; i++) {
              const tagOffset = tags + 2 + i * 12;
              const tag = view.getUint16(tagOffset, littleEndian);
              
              if (tag === 0x8825) { // GPS IFD offset
                const gpsOffset = offset + view.getUint32(tagOffset + 8, littleEndian);
                const gpsTagCount = view.getUint16(gpsOffset, littleEndian);
                
                let latRef = "N";
                let lonRef = "E";
                let latValues: number[] = [];
                let lonValues: number[] = [];
                
                for (let j = 0; j < gpsTagCount; j++) {
                  const gpsTagOffset = gpsOffset + 2 + j * 12;
                  const gpsTag = view.getUint16(gpsTagOffset, littleEndian);
                  const gpsType = view.getUint16(gpsTagOffset + 2, littleEndian);
                  const gpsCount = view.getUint32(gpsTagOffset + 4, littleEndian);
                  const gpsValueOffset = gpsTagOffset + 8;
                  
                  if (gpsTag === 1) { // GPSLatitudeRef
                    latRef = String.fromCharCode(view.getUint8(gpsValueOffset));
                  } else if (gpsTag === 2) { // GPSLatitude
                    for (let k = 0; k < 3; k++) {
                      const num = view.getUint32(gpsValueOffset + k * 8, littleEndian);
                      const den = view.getUint32(gpsValueOffset + k * 8 + 4, littleEndian);
                      latValues.push(num / den);
                    }
                  } else if (gpsTag === 3) { // GPSLongitudeRef
                    lonRef = String.fromCharCode(view.getUint8(gpsValueOffset));
                  } else if (gpsTag === 4) { // GPSLongitude
                    for (let k = 0; k < 3; k++) {
                      const num = view.getUint32(gpsValueOffset + k * 8, littleEndian);
                      const den = view.getUint32(gpsValueOffset + k * 8 + 4, littleEndian);
                      lonValues.push(num / den);
                    }
                  }
                }
                
                if (latValues.length === 3 && lonValues.length === 3) {
                  gpsLatitude = convertDMSToDecimal(latValues[0], latValues[1], latValues[2], latRef);
                  gpsLongitude = convertDMSToDecimal(lonValues[0], lonValues[1], lonValues[2], lonRef);
                }
              }
            }
          }
        }
        
        offset += 2 + length;
      }
      
      if (gpsLatitude !== null && gpsLongitude !== null) {
        resolve({ latitude: gpsLatitude, longitude: gpsLongitude });
      } else {
        resolve(null);
      }
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Check if image has GPS data (quick check)
 */
export async function hasGPSData(file: File): Promise<boolean> {
  const gps = await extractGPSFromImage(file);
  return gps !== null;
}

